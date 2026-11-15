import { prisma } from "../src/lib/prisma";

async function main() {
  const events = await prisma.webhookEvent.findMany({
    orderBy: { receivedAt: "desc" },
    take: 5,
  });
  console.log("EVENTS_COUNT:", events.length);
  for (const e of events) {
    console.log(`- [${e.processingStatus}] ID: ${e.paypalEventId} | Type: ${e.eventType} | Time: ${e.receivedAt.toISOString()}`);
  }
}

main().finally(() => prisma.$disconnect());

