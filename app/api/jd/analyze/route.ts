import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeJD } from "@/lib/ai/claude";

const schema = z.object({
  jdText: z.string().min(50, "Job description is too short"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jdText } = schema.parse(body);
    const analysis = await analyzeJD(jdText);
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("[JD_ANALYZE]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
