import { NextRequest, NextResponse } from "next/server";
import { generateResumePDF } from "@/lib/pdf/generator";
import { ResumeData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resumeData = body.resumeData as ResumeData;

    if (!resumeData?.personalInfo?.name) {
      return NextResponse.json({ error: "Invalid resume data" }, { status: 400 });
    }

    const pdfBuffer = await generateResumePDF(resumeData);
    const filename = `${resumeData.personalInfo.name.replace(/\s+/g, "_")}_Resume.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[EXPORT]", error);
    return NextResponse.json({ error: "PDF export failed." }, { status: 500 });
  }
}
