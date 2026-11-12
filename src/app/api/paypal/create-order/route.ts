import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { milestoneId } = body;

    if (!milestoneId) {
      return NextResponse.json(
        { error: "milestoneId is required." },
        { status: 400 }
      );
    }

    // Determine request origin for redirect URLs
    const origin = req.nextUrl.origin;

    const result = await createPayPalOrder(milestoneId, origin);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating PayPal order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create PayPal order." },
      { status: 500 }
    );
  }
}

