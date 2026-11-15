import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReplanningProposal } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const delayDays = Number(body.delayDays) || 14;

    // 1. Fetch current tasks and pending milestones from PostgreSQL
    const [tasks, pendingMilestones] = await Promise.all([
      prisma.task.findMany({
        include: { project: { select: { name: true } } },
        orderBy: { startDate: "asc" },
      }),
      prisma.milestone.findMany({
        where: { status: "payment_pending" },
        include: { project: { include: { client: true } } },
      }),
    ]);

    const context = {
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        projectName: t.project.name,
        startDate: t.startDate.toISOString().split("T")[0],
        endDate: t.endDate.toISOString().split("T")[0],
        isPaymentDependent: t.isPaymentDependent,
      })),
      pendingMilestones: pendingMilestones.map((m) => ({
        name: m.name,
        clientCompany: m.project.client.company ?? m.project.client.name,
        amountCents: m.amount,
        dueDate: m.dueDate.toISOString().split("T")[0],
      })),
      delayDays,
    };

    // 2. Generate Replanning Proposal via Gemini 2.5 Flash
    const proposal = await generateReplanningProposal(context);

    // 3. Persist proposal in database
    const savedRecord = await prisma.scheduleProposal.create({
      data: {
        id: proposal.proposalId,
        reason: proposal.triggerReason,
        proposalJson: JSON.stringify(proposal),
        status: "pending",
      },
    });

    return NextResponse.json({
      proposal,
      dbId: savedRecord.id,
    });
  } catch (error: any) {
    console.error("Error generating replanning proposal:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate replanning proposal." },
      { status: 500 }
    );
  }
}

