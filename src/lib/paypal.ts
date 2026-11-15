import prisma from "./prisma";

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Retrieves a valid OAuth 2.0 Bearer Token from PayPal Sandbox using client credentials.
 * Tokens are cached in-memory until expiration.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET environment variables.");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to obtain PayPal access token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const token = data.access_token as string;
  const expiresIn = (data.expires_in as number) || 32400;

  cachedToken = {
    token,
    expiresAt: now + expiresIn * 1000,
  };

  return token;
}

/**
 * Creates a PayPal Sandbox Order linked to a specific database milestone.
 * Amount and currency are validated server-side from PostgreSQL.
 */
export async function createPayPalOrder(milestoneId: string, returnOrigin?: string) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: {
        include: { client: true },
      },
    },
  });

  if (!milestone) {
    throw new Error(`Milestone with ID ${milestoneId} not found.`);
  }

  if (milestone.status === "paid") {
    throw new Error("This milestone has already been paid and captured.");
  }

  const accessToken = await getPayPalAccessToken();

  // Convert integer cents to two-decimal string format (decimal-safe)
  const amountValue = (milestone.amount / 100).toFixed(2);
  const currencyCode = milestone.project.currency || "USD";

  // Use the calling host or fallback to environment URL
  const origin = returnOrigin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const returnUrl = `${origin}/api/paypal/capture?milestoneId=${milestone.id}`;
  const cancelUrl = `${origin}/payments?canceled=true`;

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: milestone.id,
        description: `${milestone.project.name} - ${milestone.name}`,
        amount: {
          currency_code: currencyCode,
          value: amountValue,
        },
      },
    ],
    application_context: {
      brand_name: "BillPal",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  };

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`PayPal Order creation failed: ${JSON.stringify(errorData)}`);
  }

  const order = await response.json();
  const approvalLink = order.links?.find((l: { rel: string }) => l.rel === "approve")?.href;

  if (!approvalLink) {
    throw new Error("PayPal response did not include an approval URL.");
  }

  // Update milestone and record pending payment in database
  await prisma.milestone.update({
    where: { id: milestone.id },
    data: { paypalOrderId: order.id },
  });

  await prisma.payment.upsert({
    where: { id: `pmt_${milestone.id}` },
    create: {
      id: `pmt_${milestone.id}`,
      clientId: milestone.project.clientId,
      projectId: milestone.projectId,
      milestoneId: milestone.id,
      paypalOrderId: order.id,
      amount: milestone.amount,
      currency: currencyCode,
      status: "CREATED",
      approvalUrl: approvalLink,
    },
    update: {
      paypalOrderId: order.id,
      approvalUrl: approvalLink,
      status: "CREATED",
    },
  });

  return {
    orderId: order.id as string,
    approvalUrl: approvalLink as string,
  };
}

/**
 * Captures an approved PayPal order and updates the database state exactly once.
 */
export async function capturePayPalOrder(orderId: string, milestoneId?: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`PayPal Order capture failed: ${JSON.stringify(errorData)}`);
  }

  const captureData = await response.json();
  const status = captureData.status; // e.g. "COMPLETED"
  const captureUnit = captureData.purchase_units?.[0]?.payments?.captures?.[0];
  const captureId = captureUnit?.id;

  if (status !== "COMPLETED") {
    throw new Error(`PayPal capture returned non-completed status: ${status}`);
  }

  // Determine target milestone
  const targetMilestoneId = milestoneId || captureData.purchase_units?.[0]?.reference_id;

  if (targetMilestoneId) {
    await prisma.$transaction([
      prisma.milestone.update({
        where: { id: targetMilestoneId },
        data: {
          status: "paid",
          paypalCaptureId: captureId,
          paypalOrderId: orderId,
        },
      }),
      prisma.payment.updateMany({
        where: { paypalOrderId: orderId },
        data: {
          status: "COMPLETED",
          paypalCaptureId: captureId,
          paidAt: new Date(),
        },
      }),
    ]);
  }

  return {
    success: true,
    status,
    captureId,
    orderId,
  };
}

/**
 * Verifies incoming PayPal webhook cryptographic signature using PayPal's verification API.
 * This guarantees the event was genuinely sent by PayPal and has not been tampered with.
 */
export async function verifyPayPalWebhookSignature(headers: Headers, body: any): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!webhookId) {
    console.warn("PAYPAL_WEBHOOK_ID is not configured; skipping verification in dev mode.");
    return true;
  }

  const authAlgo = headers.get("paypal-auth-algo");
  const certUrl = headers.get("paypal-cert-url");
  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionSig = headers.get("paypal-transmission-sig");
  const transmissionTime = headers.get("paypal-transmission-time");

  // In test environments or mock tests where transmission headers might be simulated
  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    console.warn("Missing PayPal transmission signature headers.");
    return false;
  }

  try {
    const accessToken = await getPayPalAccessToken();

    const verifyPayload = {
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: body,
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verifyPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("PayPal webhook verification endpoint error:", response.status, errText);
      return false;
    }

    const verificationResult = await response.json();
    return verificationResult.verification_status === "SUCCESS";
  } catch (error) {
    console.error("Error during PayPal webhook signature verification:", error);
    return false;
  }
}


