import { NextRequest, NextResponse } from "next/server";
import { parseResumeFile, textToResumeData } from "@/lib/ai/parsers";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;

    if (text) {
      const resumeData = textToResumeData(text);
      return NextResponse.json({ resumeData, rawText: text });
    }

    if (!file) {
      return NextResponse.json({ error: "No file or text provided" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await parseResumeFile(buffer, file.type);
    const resumeData = textToResumeData(rawText);

    return NextResponse.json({ resumeData, rawText });
  } catch (error) {
    console.error("[PARSE]", error);
    return NextResponse.json(
      { error: "Failed to parse resume. Please try pasting as text instead." },
      { status: 500 }
    );
  }
}
