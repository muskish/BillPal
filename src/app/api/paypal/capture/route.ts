import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token"); // PayPal order ID
  const milestoneId = searchParams.get("milestoneId");

  if (!token) {
    return NextResponse.redirect(
      new URL("/payments?error=missing_token", req.url)
    );
  }

  try {
    const result = await capturePayPalOrder(token, milestoneId || undefined);

    return NextResponse.redirect(
      new URL(
        `/payments?success=true&captureId=${result.captureId}&orderId=${token}`,
        req.url
      )
    );
  } catch (error: any) {
    console.error("Error capturing PayPal order:", error);
    return NextResponse.redirect(
      new URL(
        `/payments?error=${encodeURIComponent(error.message || "capture_failed")}`,
        req.url
      )
    );
  }
}

