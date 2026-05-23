import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeJD, optimizeResume } from "@/lib/ai/claude";
import { calculateATSScore } from "@/lib/ats/scorer";
import { ResumeData } from "@/types";

const guidanceSchema = z.object({
  summaryGuidance: z.string().nullable().optional(),
  mustIncludeSkills: z.array(z.string()).nullable().optional(),
  generalInstructions: z.string().nullable().optional(),
  pageCount: z.enum(["1", "2", "auto"]).optional().default("1"),
  mode: z.enum(["balanced", "ats_heavy", "recruiter", "industry_switch", "leadership", "concise", "star"]).optional().default("balanced"),
  starMethod: z.boolean().optional().default(false),
  industry: z.string().optional(),
}).optional();

const schema = z.object({
  resumeData: z.record(z.unknown()),
  jdText: z.string().min(50, "Job description is too short"),
  originalText: z.string().optional().default(""),
  resumeId: z.string().nullable().optional(),
  guidance: guidanceSchema,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeData, jdText, originalText, guidance } = schema.parse(body);

    if (!resumeData || Object.keys(resumeData).length === 0) {
      return NextResponse.json(
        { error: "Please upload your resume before optimizing." },
        { status: 400 }
      );
    }

    const jdAnalysis = await analyzeJD(jdText);
    const optimizedResume = await optimizeResume(
      resumeData as unknown as ResumeData,
      jdAnalysis,
      originalText,
      guidance ?? {}
    );
    const atsScore = calculateATSScore(optimizedResume, jdAnalysis);

    let savedResumeId: string | undefined;
    try {
      const { prisma } = await import("@/lib/db/prisma");
      const saved = await prisma.resume.create({
        data: {
          userId: "local-test-user",
          title: `${jdAnalysis.jobTitle} – ${new Date().toLocaleDateString()}`,
          resumeData: optimizedResume as object,
          jdText,
          jdAnalysis: jdAnalysis as object,
          atsScore: atsScore.overall,
          keywordMatch: atsScore.keywordMatchPercentage,
          isOptimized: true,
        },
      });
      savedResumeId = saved.id;
    } catch {
      // DB not configured — fine for local testing
    }

    return NextResponse.json({
      resumeData: optimizedResume,
      atsScore,
      jdAnalysis,
      resumeId: savedResumeId,
    });
  } catch (error) {
    console.error("[OPTIMIZE]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Optimization failed. Please try again." },
      { status: 500 }
    );
  }
}
