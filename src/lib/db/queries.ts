import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const [freelancer, cashAccount, clients, expenses, tasks, recentPayments, webhookEvents] = await Promise.all([
    prisma.freelancer.findFirst(),
    prisma.cashAccount.findFirst(),
    prisma.client.findMany({
      include: {
        projects: {
          include: {
            milestones: {
              orderBy: { dueDate: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.expense.findMany({
      orderBy: { dueDate: "asc" },
    }),
    prisma.task.findMany({
      include: {
        project: {
          select: { name: true },
        },
        milestone: {
          select: { name: true },
        },
      },
      orderBy: { startDate: "asc" },
    }),
    prisma.payment.findMany({
      include: {
        client: { select: { name: true, company: true } },
        project: { select: { name: true } },
        milestone: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.webhookEvent.findMany({
      orderBy: { receivedAt: "desc" },
      take: 6,
    }),
  ]);

  // Aggregate financial metrics (all in integer cents, decimal safe)
  const openingBalance = cashAccount?.openingBalance ?? 0;

  // Confirmed inflows (actual completed payments recorded)
  const confirmedInflows = recentPayments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  // Total scheduled expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Expected incoming payments (milestones with status payment_pending)
  const pendingMilestones = clients.flatMap((c) =>
    c.projects.flatMap((p) =>
      p.milestones.filter((m) => m.status === "payment_pending")
    )
  );

  const totalExpectedInflow = pendingMilestones.reduce((sum, m) => sum + m.amount, 0);

  // Current Actual Balance = Opening Balance + Confirmed Inflows
  const currentActualBalance = openingBalance + confirmedInflows;

  // Projected Balance = Current Actual Balance + Total Expected Inflow - Total Expenses
  const projectedBalance = currentActualBalance + totalExpectedInflow - totalExpenses;

  return {
    freelancer,
    cashAccount,
    currentActualBalance,
    confirmedInflows,
    totalExpectedInflow,
    totalExpenses,
    projectedBalance,
    clients,
    expenses,
    tasks,
    recentPayments,
    webhookEvents,
  };
}

