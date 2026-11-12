import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding BillPal demo dataset for Priya...");

  // Clean existing tables in reverse dependency order
  await prisma.scheduleProposal.deleteMany();
  await prisma.task.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.cashAccount.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.freelancer.deleteMany();

  // 1. Freelancer Profile: Priya Sharma
  const priya = await prisma.freelancer.create({
    data: {
      name: "Priya Sharma",
      email: "priya@cashpilot-demo.com",
      role: "Senior Product Designer & UX Consultant",
    },
  });

  // 2. Starting Cash Account: $4,500.00 (450,000 cents)
  const cashAccount = await prisma.cashAccount.create({
    data: {
      label: "Primary Operating Account",
      openingBalance: 450000,
      currency: "USD",
    },
  });

  // Reference dates based on current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // 3. Operating Expenses: Rent due on the 25th ($2,200), SaaS tooling ($350)
  const rentDate = new Date(year, month, 25);
  const saasDate = new Date(year, month, 18);

  await prisma.expense.createMany({
    data: [
      {
        description: "Studio Rent & Coworking Space",
        amount: 220000, // $2,200.00
        dueDate: rentDate,
        category: "rent",
        isSeeded: true,
      },
      {
        description: "Cloud Software & Design Tools (Figma, Adobe, Linear)",
        amount: 35000, // $350.00
        dueDate: saasDate,
        category: "software",
        isSeeded: true,
      },
    ],
  });

  // 4. Clients
  // Client A: Acme Corp
  const clientA = await prisma.client.create({
    data: {
      name: "Sarah Lin",
      email: "sarah@acmecorp.com",
      company: "Acme Corporation",
    },
  });

  // Client B: NovaTech Labs
  const clientB = await prisma.client.create({
    data: {
      name: "Marcus Vance",
      email: "marcus@novatech.io",
      company: "NovaTech Labs",
    },
  });

  // Client C: Zenith Studio
  const clientC = await prisma.client.create({
    data: {
      name: "Elena Rostova",
      email: "elena@zenith.design",
      company: "Zenith Studio",
    },
  });

  // 5. Projects & Milestones
  // Project A (Acme Corp): $7,000 total
  const projectA = await prisma.project.create({
    data: {
      clientId: clientA.id,
      name: "Mobile App Design System",
      description: "Complete design token architecture, mobile component library, and interactive prototypes.",
      totalAmount: 700000, // $7,000.00
      currency: "USD",
      status: "active",
      startDate: new Date(year, month - 1, 15),
      endDate: new Date(year, month + 1, 15),
    },
  });

  // Milestone A1: $3,500 - Ready for PayPal Sandbox checkout test
  const milestoneA1 = await prisma.milestone.create({
    data: {
      projectId: projectA.id,
      name: "Milestone 1: UX Wireframes & Specs",
      amount: 350000, // $3,500.00
      dueDate: new Date(year, month, 15),
      status: "payment_pending",
    },
  });

  // Milestone A2: $3,500 - Planned for next month
  await prisma.milestone.create({
    data: {
      projectId: projectA.id,
      name: "Milestone 2: Design Tokens & UI Kit Delivery",
      amount: 350000, // $3,500.00
      dueDate: new Date(year, month + 1, 10),
      status: "planned",
    },
  });

  // Project B (NovaTech Labs): $8,000 total
  const projectB = await prisma.project.create({
    data: {
      clientId: clientB.id,
      name: "Cloud Platform UX Audit & Rebrand",
      description: "Full heuristic evaluation, information architecture redesign, and rebrand design system.",
      totalAmount: 800000, // $8,000.00
      currency: "USD",
      status: "active",
      startDate: new Date(year, month - 1, 20),
      endDate: new Date(year, month + 1, 25),
    },
  });

  // Milestone B1: $4,000 - Due on the 20th (Crucial: arrives before rent on the 25th!)
  const milestoneB1 = await prisma.milestone.create({
    data: {
      projectId: projectB.id,
      name: "Milestone 1: Architecture UX Audit Report",
      amount: 400000, // $4,000.00
      dueDate: new Date(year, month, 20),
      status: "payment_pending",
    },
  });

  // Milestone B2: $4,000 - Planned
  await prisma.milestone.create({
    data: {
      projectId: projectB.id,
      name: "Milestone 2: Brand Component Library",
      amount: 400000, // $4,000.00
      dueDate: new Date(year, month + 1, 20),
      status: "planned",
    },
  });

  // Project C (Zenith Studio): $1,800 Retainer
  const projectC = await prisma.project.create({
    data: {
      clientId: clientC.id,
      name: "Design Advisory Retainer",
      description: "Bi-weekly design reviews and strategic UX consulting sessions.",
      totalAmount: 180000, // $1,800.00
      currency: "USD",
      status: "active",
      startDate: new Date(year, month, 1),
      endDate: new Date(year, month + 2, 1),
    },
  });

  // Milestone C1: $1,800 - Already PAID
  const milestoneC1 = await prisma.milestone.create({
    data: {
      projectId: projectC.id,
      name: "Monthly Advisory Retainer (Current Month)",
      amount: 180000, // $1,800.00
      dueDate: new Date(year, month, 5),
      status: "paid",
    },
  });

  // Recorded payment for C1
  await prisma.payment.create({
    data: {
      clientId: clientC.id,
      projectId: projectC.id,
      milestoneId: milestoneC1.id,
      paypalOrderId: "DEMO-CAPTURE-ZENITH-01",
      paypalCaptureId: "CAP-ZENITH-88392",
      amount: 180000,
      currency: "USD",
      status: "COMPLETED",
      paidAt: new Date(year, month, 5),
    },
  });

  // 6. Project Tasks
  await prisma.task.createMany({
    data: [
      {
        projectId: projectA.id,
        milestoneId: milestoneA1.id,
        title: "Deliver Acme Wireframes & Interactive Prototypes",
        startDate: new Date(year, month, 2),
        endDate: new Date(year, month, 14),
        priority: "high",
        status: "completed",
        isPaymentDependent: false,
      },
      {
        projectId: projectB.id,
        milestoneId: milestoneB1.id,
        title: "Conduct NovaTech Stakeholder UX Interviews",
        startDate: new Date(year, month, 5),
        endDate: new Date(year, month, 12),
        priority: "high",
        status: "completed",
        isPaymentDependent: false,
      },
      {
        projectId: projectB.id,
        milestoneId: milestoneB1.id,
        title: "Synthesize Heuristic Evaluation & Audit Findings",
        startDate: new Date(year, month, 13),
        endDate: new Date(year, month, 19),
        priority: "high",
        status: "in_progress",
        isPaymentDependent: false,
      },
      {
        projectId: projectB.id,
        milestoneId: milestoneB1.id,
        title: "Phase 2 Implementation: Brand Guidelines & Design Tokens",
        startDate: new Date(year, month, 22),
        endDate: new Date(year, month + 1, 10),
        priority: "high",
        status: "todo",
        isPaymentDependent: true, // Crucial: dependent on Milestone B1 payment!
      },
      {
        projectId: projectA.id,
        milestoneId: milestoneA1.id,
        title: "Export Figma Design Tokens & Component Sync",
        startDate: new Date(year, month, 20),
        endDate: new Date(year, month + 1, 5),
        priority: "medium",
        status: "todo",
        isPaymentDependent: true,
      },
    ],
  });

  console.log("Successfully seeded BillPal database on Neon!");
  console.log(`- Freelancer: ${priya.name}`);
  console.log(`- Opening Balance: $${cashAccount.openingBalance / 100}`);
  console.log(`- Operating Rent Expense: $2,200 due on the 25th`);
  console.log(`- Clients: Acme Corp, NovaTech Labs, Zenith Studio`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

