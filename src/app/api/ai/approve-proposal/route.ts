import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proposalId, action } = body;

    if (!proposalId || !action) {
      return NextResponse.json(
        { error: "proposalId and action ('approve' | 'reject') are required." },
        { status: 400 }
      );
    }

    const proposal = await prisma.scheduleProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found." },
        { status: 404 }
      );
    }

    if (action === "reject") {
      await prisma.scheduleProposal.update({
        where: { id: proposalId },
        data: { status: "rejected" },
      });

      return NextResponse.json({ success: true, status: "rejected" });
    }

    // Parse proposal payload
    const parsed = JSON.parse(proposal.proposalJson);
    const tasksToDelay = parsed.tasksToDelay || [];

    // Execute atomic update across tasks and proposal record
    await prisma.$transaction(async (tx) => {
      // Update each delayed task
      for (const item of tasksToDelay) {
        if (item.taskId) {
          const existingTask = await tx.task.findUnique({
            where: { id: item.taskId },
          });

          if (existingTask) {
            const days = item.daysShifted || 14;
            const newStart = new Date(existingTask.startDate.getTime() + days * 86400000);
            const newEnd = new Date(existingTask.endDate.getTime() + days * 86400000);

            await tx.task.update({
              where: { id: item.taskId },
              data: {
                startDate: newStart,
                endDate: newEnd,
                status: "delayed",
              },
            });
          }
        }
      }

      // Mark proposal as approved
      await tx.scheduleProposal.update({
        where: { id: proposalId },
        data: {
          status: "approved",
          approvedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      success: true,
      status: "approved",
      tasksUpdated: tasksToDelay.length,
    });
  } catch (error: any) {
    console.error("Error approving schedule proposal:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve proposal." },
      { status: 500 }
    );
  }
}

