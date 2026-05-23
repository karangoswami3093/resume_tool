import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetter, analyzeJD } from "@/lib/ai/claude";
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
    const coverLetter = await generateCoverLetter(
      resumeData as ResumeData,
      jdAnalysis,
      jdText
    );

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("[COVER_LETTER]", error);
    return NextResponse.json({ error: "Cover letter generation failed" }, { status: 500 });
  }
}
