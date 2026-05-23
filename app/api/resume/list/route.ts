import { NextResponse } from "next/server";

export async function GET() {
  // DB not required for local testing
  try {
    const { prisma } = await import("@/lib/db/prisma");
    const resumes = await prisma.resume.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        atsScore: true,
        keywordMatch: true,
        isOptimized: true,
        createdAt: true,
        updatedAt: true,
        resumeData: true,
        jdText: true,
      },
    });
    return NextResponse.json({ resumes });
  } catch {
    return NextResponse.json({ resumes: [] });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("id");
    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID required" }, { status: 400 });
    }
    const { prisma } = await import("@/lib/db/prisma");
    await prisma.resume.deleteMany({ where: { id: resumeId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
