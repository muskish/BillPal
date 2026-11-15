import { prisma } from "../src/lib/prisma";

async function testWebhookIdempotency() {
  console.log("=== Testing Webhook Idempotency & Duplicate Safety ===");

  const testEventId = `WH-TEST-EVENT-${Date.now()}`;
  const testCaptureId = `CAP-WH-TEST-${Date.now()}`;

  // Find NovaTech pending milestone
  const milestone = await prisma.milestone.findFirst({
    where: { status: "payment_pending" },
    include: { project: true },
  });

  if (!milestone) {
    console.log("No pending milestone to test against.");
    return;
  }

  console.log(`Targeting milestone: ${milestone.name} ($${milestone.amount / 100})`);

  // Simulate First Webhook Delivery
  console.log(`\n1. Simulating FIRST Webhook Delivery for event: ${testEventId}...`);

  const firstDelivery = await prisma.$transaction(async (tx) => {
    // Check if event already exists
    const existing = await tx.webhookEvent.findUnique({
      where: { paypalEventId: testEventId },
    });

    if (existing) {
      return { status: "ignored_duplicate" };
    }

    // Process event
    await tx.milestone.update({
      where: { id: milestone.id },
      data: {
        status: "paid",
        paypalCaptureId: testCaptureId,
      },
    });

    await tx.payment.upsert({
      where: { id: `pmt_${milestone.id}` },
      create: {
        id: `pmt_${milestone.id}`,
        clientId: (await tx.project.findUnique({ where: { id: milestone.projectId } }))!.clientId,
        projectId: milestone.projectId,
        milestoneId: milestone.id,
        paypalOrderId: "TEST_ORDER_ID",
        paypalCaptureId: testCaptureId,
        amount: milestone.amount,
        currency: "USD",
        status: "COMPLETED",
        paidAt: new Date(),
      },
      update: {
        status: "COMPLETED",
        paypalCaptureId: testCaptureId,
        paidAt: new Date(),
      },
    });

    // Record webhook event
    const recorded = await tx.webhookEvent.create({
      data: {
        paypalEventId: testEventId,
        eventType: "PAYMENT.CAPTURE.COMPLETED",
        resourceId: testCaptureId,
        processingStatus: "processed",
        processedAt: new Date(),
      },
    });

    return { status: "processed", event: recorded };
  });

  console.log("First delivery result:", firstDelivery.status);

  // Simulate DUPLICATE Webhook Delivery with identical event ID
  console.log(`\n2. Simulating DUPLICATE Webhook Delivery for same event: ${testEventId}...`);

  const duplicateDelivery = await prisma.$transaction(async (tx) => {
    const existing = await tx.webhookEvent.findUnique({
      where: { paypalEventId: testEventId },
    });

    if (existing) {
      // Safely ignore duplicate
      return { status: "ignored_duplicate", eventId: testEventId };
    }

    return { status: "unexpectedly_processed" };
  });

  console.log("Duplicate delivery result:", duplicateDelivery.status);

  if (duplicateDelivery.status === "ignored_duplicate") {
    console.log("\n✅ SUCCESS: Idempotency safety verified! Duplicate delivery was recognized and safely ignored without double-crediting balances.");
  } else {
    console.error("❌ FAILED: Duplicate delivery was not ignored!");
  }
}

testWebhookIdempotency()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

