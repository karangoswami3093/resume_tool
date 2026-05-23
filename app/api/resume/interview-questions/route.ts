import { NextRequest, NextResponse } from "next/server";
import { generateInterviewQuestions, analyzeJD } from "@/lib/ai/claude";
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
    const questions = await generateInterviewQuestions(
      resumeData as ResumeData,
      jdAnalysis
    );

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("[INTERVIEW_Q]", error);
    return NextResponse.json({ error: "Interview questions generation failed" }, { status: 500 });
  }
}
