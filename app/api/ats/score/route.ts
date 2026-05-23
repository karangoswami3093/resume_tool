import { NextRequest, NextResponse } from "next/server";
import { calculateATSScore } from "@/lib/ats/scorer";
import { analyzeJD } from "@/lib/ai/claude";
import { ResumeData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { resumeData, jdText } = await req.json();

    if (!resumeData || !jdText) {
      return NextResponse.json(
        { error: "resumeData and jdText are required" },
        { status: 400 }
      );
    }

    const jdAnalysis = await analyzeJD(jdText);
    const score = calculateATSScore(resumeData as ResumeData, jdAnalysis);

    return NextResponse.json({ score, jdAnalysis });
  } catch (error) {
    console.error("[ATS_SCORE]", error);
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 });
  }
}
