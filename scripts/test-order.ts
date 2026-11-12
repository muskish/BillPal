import prisma from "../src/lib/prisma";
import { createPayPalOrder } from "../src/lib/paypal";

async function main() {
  const milestone = await prisma.milestone.findFirst({
    where: { status: "payment_pending" },
    include: { project: true },
  });

  if (!milestone) {
    console.log("No pending milestone found");
    return;
  }

  console.log(`Creating PayPal order for: ${milestone.name} ($${milestone.amount / 100})`);
  const order = await createPayPalOrder(milestone.id, "http://localhost:3000");
  console.log("SUCCESS! Created genuine PayPal Sandbox order:");
  console.log("- Order ID:", order.orderId);
  console.log("- Approval URL:", order.approvalUrl);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

