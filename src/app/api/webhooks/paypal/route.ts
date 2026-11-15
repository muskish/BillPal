import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayPalWebhookSignature } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const eventId = body?.id;
    const eventType = body?.event_type;
    const resource = body?.resource;

    if (!eventId || !eventType) {
      return NextResponse.json(
        { error: "Missing required event fields (id, event_type)" },
        { status: 400 }
      );
    }

    // 1. Verify Cryptographic Signature with PayPal Verification API
    const isSignatureValid = await verifyPayPalWebhookSignature(req.headers, body);

    if (!isSignatureValid) {
      console.error(`[SECURITY ALERT] Rejected unverified PayPal webhook signature for event ${eventId}`);
      
      // Record failed event for audit trail
      try {
        await prisma.webhookEvent.create({
          data: {
            paypalEventId: eventId,
            eventType: eventType,
            resourceId: resource?.id ?? null,
            processingStatus: "failed_signature_verification",
            errorMessage: "Cryptographic signature failed validation against PayPal API.",
          },
        });
      } catch {
        // Ignore if already logged
      }

      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // 2. Idempotency Check (Section 5 Rule 7 & Section 6 Rule 9)
    // Check if this eventId has already been recorded
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { paypalEventId: eventId },
    });

    if (existingEvent) {
      console.log(`[IDEMPOTENCY] Event ${eventId} (${eventType}) was already processed. Safely ignoring duplicate.`);
      return NextResponse.json(
        { status: "ignored_duplicate", eventId },
        { status: 200 }
      );
    }

    // 3. Process the Event
    let processingError: string | null = null;

    try {
      if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
        const captureId = resource?.id;
        const amountCents = Math.round(parseFloat(resource?.amount?.value || "0") * 100);
        const orderId = resource?.supplementary_data?.related_ids?.order_id;
        const customId = resource?.custom_id;

        console.log(`[WEBHOOK] Processing PAYMENT.CAPTURE.COMPLETED - Capture ID: ${captureId}, Order ID: ${orderId}, Amount: ${amountCents} cents`);

        // Find linked milestone by orderId, customId, or captureId
        let milestone = null;

        if (orderId) {
          milestone = await prisma.milestone.findFirst({
            where: { paypalOrderId: orderId },
          });
        }

        if (!milestone && customId) {
          milestone = await prisma.milestone.findUnique({
            where: { id: customId },
          });
        }

        if (!milestone && captureId) {
          milestone = await prisma.milestone.findFirst({
            where: { paypalCaptureId: captureId },
          });
        }

        if (milestone) {
          // Atomic update using Prisma transaction
          await prisma.$transaction([
            prisma.milestone.update({
              where: { id: milestone.id },
              data: {
                status: "paid",
                paypalCaptureId: captureId,
                paypalOrderId: orderId || milestone.paypalOrderId,
              },
            }),
            prisma.payment.upsert({
              where: { id: `pmt_${milestone.id}` },
              create: {
                id: `pmt_${milestone.id}`,
                clientId: (await prisma.project.findUnique({ where: { id: milestone.projectId } }))!.clientId,
                projectId: milestone.projectId,
                milestoneId: milestone.id,
                paypalOrderId: orderId || "WEBHOOK_CAPTURE",
                paypalCaptureId: captureId,
                amount: milestone.amount,
                currency: resource?.amount?.currency_code || "USD",
                status: "COMPLETED",
                paidAt: new Date(),
              },
              update: {
                status: "COMPLETED",
                paypalCaptureId: captureId,
                paidAt: new Date(),
              },
            }),
          ]);

          console.log(`[WEBHOOK] Milestone ${milestone.name} successfully updated to paid via webhook.`);
        } else {
          console.warn(`[WEBHOOK] No milestone matched for capture ${captureId} (Order: ${orderId})`);
        }
      } else if (eventType === "CHECKOUT.ORDER.APPROVED") {
        const orderId = resource?.id;
        console.log(`[WEBHOOK] Order ${orderId} approved by buyer.`);

        await prisma.payment.updateMany({
          where: { paypalOrderId: orderId },
          data: { status: "APPROVED" },
        });
      }
    } catch (err: any) {
      console.error(`[WEBHOOK ERROR] Error processing event ${eventId}:`, err);
      processingError = err.message || "Failed to process event details";
    }

    // 4. Record Event in `webhook_events` table exactly once for idempotency
    await prisma.webhookEvent.create({
      data: {
        paypalEventId: eventId,
        eventType: eventType,
        resourceId: resource?.id ?? null,
        processingStatus: processingError ? "failed" : "processed",
        processedAt: new Date(),
        errorMessage: processingError,
      },
    });

    return NextResponse.json(
      {
        received: true,
        eventId,
        status: processingError ? "error" : "processed",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[WEBHOOK EXCEPTION]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

