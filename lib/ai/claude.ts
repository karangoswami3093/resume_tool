import Anthropic from "@anthropic-ai/sdk";
import {
  JD_ANALYSIS_SYSTEM_PROMPT,
  RESUME_OPTIMIZATION_SYSTEM_PROMPT,
  COVER_LETTER_SYSTEM_PROMPT,
  buildJDAnalysisPrompt,
  buildResumeOptimizationPrompt,
  buildCoverLetterPrompt,
  buildInterviewQuestionsPrompt,
} from "./prompts";
import { ResumeData, JDAnalysis } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-6";

async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}

function parseJSON<T>(text: string): T {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

export async function analyzeJD(jdText: string): Promise<JDAnalysis> {
  const response = await callClaude(
    JD_ANALYSIS_SYSTEM_PROMPT,
    buildJDAnalysisPrompt(jdText),
    2048
  );
  return parseJSON<JDAnalysis>(response);
}

export async function optimizeResume(
  originalResume: ResumeData,
  jdAnalysis: JDAnalysis,
  originalText: string,
  guidance: {
    summaryGuidance?: string | null;
    mustIncludeSkills?: string[] | null;
    generalInstructions?: string | null;
    pageCount?: string;
    mode?: string;
    starMethod?: boolean;
    industry?: string;
  } = {}
): Promise<ResumeData> {
  const response = await callClaude(
    RESUME_OPTIMIZATION_SYSTEM_PROMPT,
    buildResumeOptimizationPrompt(originalResume, jdAnalysis, originalText, guidance),
    8000
  );
  const optimized = parseJSON<ResumeData>(response);

  // Safety net: restore any experience entries the AI dropped
  const optimizedCompanies = new Set(
    (optimized.experience ?? []).map((e) => e.company.trim().toLowerCase())
  );
  const missing = (originalResume.experience ?? []).filter(
    (e) => !optimizedCompanies.has(e.company.trim().toLowerCase())
  );
  if (missing.length > 0) {
    console.warn(
      `[EXPERIENCE RESTORE] AI dropped ${missing.length} experience(s): ${missing.map((e) => e.company).join(", ")}. Restoring from original.`
    );
    // Insert missing entries in chronological order (by original position)
    const originalOrder = new Map(
      (originalResume.experience ?? []).map((e, i) => [e.company.trim().toLowerCase(), i])
    );
    const merged = [...(optimized.experience ?? []), ...missing];
    merged.sort((a, b) => {
      const ai = originalOrder.get(a.company.trim().toLowerCase()) ?? 999;
      const bi = originalOrder.get(b.company.trim().toLowerCase()) ?? 999;
      return ai - bi;
    });
    optimized.experience = merged;
  }

  return optimized;
}

export async function generateCoverLetter(
  resumeData: ResumeData,
  jdAnalysis: JDAnalysis,
  jdText: string
): Promise<string> {
  return callClaude(
    COVER_LETTER_SYSTEM_PROMPT,
    buildCoverLetterPrompt(resumeData, jdAnalysis, jdText),
    1024
  );
}

export async function generateInterviewQuestions(
  resumeData: ResumeData,
  jdAnalysis: JDAnalysis
): Promise<
  Array<{
    question: string;
    category: string;
    whyAsked: string;
    tipToAnswer: string;
  }>
> {
  const response = await callClaude(
    "You are an expert technical interviewer. Return ONLY valid JSON.",
    buildInterviewQuestionsPrompt(resumeData, jdAnalysis),
    2048
  );
  return parseJSON(response);
}
