import { NextRequest, NextResponse } from "next/server";
import { extractProjectFromBrief } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brief, saveToDb } = body;

    if (!brief || typeof brief !== "string") {
      return NextResponse.json(
        { error: "A client brief string is required." },
        { status: 400 }
      );
    }

    // Call Gemini AI Extraction (with fallback)
    const extracted = await extractProjectFromBrief(brief);

    // If user requested to save directly into database
    if (saveToDb) {
      // Find or create default client
      let client = await prisma.client.findFirst({
        where: { name: extracted.clientName || "New Inbound Client" },
      });

      if (!client) {
        client = await prisma.client.create({
          data: {
            name: extracted.clientName || "Apex Innovations",
            email: "contact@apexinnovations.example.com",
            company: extracted.clientName || "Apex Innovations",
          },
        });
      }

      const today = new Date();
      const project = await prisma.project.create({
        data: {
          clientId: client.id,
          name: extracted.projectName,
          description: extracted.deliverables.join(", "),
          totalAmount: extracted.totalAmountCents,
          currency: "USD",
          status: "active",
          startDate: today,
          endDate: new Date(today.getTime() + 45 * 86400000),
          milestones: {
            create: extracted.milestones.map((m) => ({
              name: m.name,
              amount: m.amountCents,
              dueDate: new Date(m.suggestedDueDate),
              status: "planned",
            })),
          },
        },
        include: { milestones: true },
      });

      return NextResponse.json({
        extracted,
        savedProject: project,
      });
    }

    return NextResponse.json({ extracted });
  } catch (error: any) {
    console.error("Error extracting brief:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract project brief." },
      { status: 500 }
    );
  }
}

