import { ResumeData, JDAnalysis, ATSScore } from "@/types";

// Semantic equivalence map — pairs of concepts that mean the same thing
const SEMANTIC_EQUIVALENTS: [string, string][] = [
  ["etl pipelines", "data pipelines"],
  ["etl", "data pipeline"],
  ["kpi dashboards", "kpi reporting"],
  ["kpi dashboard", "performance dashboard"],
  ["risk stratification", "risk modeling"],
  ["claims processing", "transaction processing"],
  ["claims data", "transactional data"],
  ["patient data", "user data"],
  ["clinical analytics", "operational analytics"],
  ["hipaa", "regulatory compliance"],
  ["hipaa compliance", "data compliance"],
  ["emr", "electronic health records"],
  ["ehr", "electronic health records"],
  ["population health", "user behavior analytics"],
  ["care gaps", "performance gaps"],
  ["readmission", "churn"],
  ["inventory forecasting", "demand forecasting"],
  ["fraud detection", "anomaly detection"],
  ["customer analytics", "user analytics"],
  ["supply chain", "operational logistics"],
  ["workforce analytics", "hr analytics"],
  ["business intelligence", "bi"],
  ["power bi", "powerbi"],
  ["machine learning", "ml"],
  ["natural language processing", "nlp"],
  ["deep learning", "neural networks"],
  ["ci/cd", "continuous integration"],
  ["rest api", "restful api"],
  ["aws", "amazon web services"],
  ["gcp", "google cloud"],
  ["azure", "microsoft azure"],
  ["postgresql", "postgres"],
  ["js", "javascript"],
  ["ts", "typescript"],
  ["react.js", "react"],
  ["node.js", "node"],
];

const STRONG_ACTION_VERBS = new Set([
  "architected", "engineered", "built", "developed", "designed", "created",
  "implemented", "deployed", "automated", "streamlined", "optimized",
  "analyzed", "delivered", "improved", "reduced", "increased", "generated",
  "established", "collaborated", "integrated", "migrated", "maintained",
  "enhanced", "led", "managed", "launched", "wrote", "defined", "scaled",
  "consolidated", "standardized", "modernized", "refactored", "structured",
  "configured", "monitored", "tracked", "reported", "supported", "partnered",
]);

const WEAK_PHRASES = [
  "responsible for",
  "helped with",
  "assisted in",
  "worked on",
  "was involved in",
  "duties included",
  "participated in",
  "tasked with",
];

export function calculateATSScore(
  resumeData: ResumeData,
  jdAnalysis: JDAnalysis
): ATSScore {
  const resumeText = resumeToText(resumeData).toLowerCase();

  const keywordScore = calculateKeywordScore(resumeText, jdAnalysis);
  const skillsScore = calculateSkillsScore(resumeData, jdAnalysis);
  const formatScore = calculateFormatScore(resumeData);
  const readabilityScore = calculateReadabilityScore(resumeData);
  const completenessScore = calculateCompletenessScore(resumeData);

  const overall = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        keywordScore.score +
          skillsScore.score +
          formatScore +
          readabilityScore +
          completenessScore
      )
    )
  );

  return {
    overall,
    breakdown: {
      keywordMatch: Math.round(keywordScore.score),
      skillsMatch: Math.round(skillsScore.score),
      formatScore: Math.round(formatScore),
      readability: Math.round(readabilityScore),
      completeness: Math.round(completenessScore),
    },
    keywordMatchPercentage: keywordScore.percentage,
    matchedKeywords: keywordScore.matched,
    missingKeywords: keywordScore.missing,
    suggestions: generateSuggestions(resumeData, jdAnalysis, resumeText),
    strengths: generateStrengths(resumeData, jdAnalysis, resumeText),
  };
}

function resumeToText(resumeData: ResumeData): string {
  return [
    resumeData.summary,
    ...resumeData.skills.flatMap((s) => [s.category, ...s.items]),
    ...resumeData.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...resumeData.education.flatMap((e) => [e.degree, e.institution, e.field || ""]),
    ...(resumeData.projects?.flatMap((p) => [p.name, ...p.bullets]) || []),
    ...(resumeData.certifications?.map((c) => c.name) || []),
  ]
    .join(" ")
    .toLowerCase();
}

function semanticMatch(resumeText: string, keyword: string): boolean {
  const kw = keyword.toLowerCase();

  // Direct match
  if (resumeText.includes(kw)) return true;

  // Semantic equivalence check
  for (const [a, b] of SEMANTIC_EQUIVALENTS) {
    if ((kw === a || kw.includes(a)) && resumeText.includes(b)) return true;
    if ((kw === b || kw.includes(b)) && resumeText.includes(a)) return true;
  }

  // Partial word match for compound terms (e.g. "machine learning" → "ml")
  const words = kw.split(" ");
  if (words.length > 1) {
    const abbreviation = words.map((w) => w[0]).join("");
    if (resumeText.includes(abbreviation)) return true;
  }

  return false;
}

function calculateKeywordScore(
  resumeText: string,
  jdAnalysis: JDAnalysis
): { score: number; percentage: number; matched: string[]; missing: string[] } {
  const allKeywords = Array.from(
    new Set([
      ...jdAnalysis.priorityKeywords,
      ...jdAnalysis.requiredSkills,
      ...jdAnalysis.tools,
      ...jdAnalysis.domainKeywords,
    ].map((k) => k.toLowerCase()))
  );

  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of allKeywords) {
    if (semanticMatch(resumeText, keyword)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const percentage =
    allKeywords.length > 0
      ? Math.round((matched.length / allKeywords.length) * 100)
      : 0;

  return {
    score: Math.min(40, (percentage / 100) * 40),
    percentage,
    matched: matched.slice(0, 20),
    missing: missing.slice(0, 15),
  };
}

function calculateSkillsScore(
  resumeData: ResumeData,
  jdAnalysis: JDAnalysis
): { score: number } {
  const resumeSkills = resumeData.skills
    .flatMap((s) => s.items)
    .map((s) => s.toLowerCase());

  const allResumeText = resumeSkills.join(" ");

  let requiredMatches = 0;
  for (const skill of jdAnalysis.requiredSkills) {
    if (semanticMatch(allResumeText, skill)) requiredMatches++;
  }

  let preferredMatches = 0;
  for (const skill of jdAnalysis.preferredSkills) {
    if (semanticMatch(allResumeText, skill)) preferredMatches++;
  }

  const requiredScore =
    jdAnalysis.requiredSkills.length > 0
      ? (requiredMatches / jdAnalysis.requiredSkills.length) * 14
      : 14;

  const preferredScore =
    jdAnalysis.preferredSkills.length > 0
      ? (preferredMatches / jdAnalysis.preferredSkills.length) * 6
      : 6;

  return { score: Math.min(20, requiredScore + preferredScore) };
}

function calculateFormatScore(resumeData: ResumeData): number {
  let score = 20;

  if (!resumeData.personalInfo.email) score -= 3;
  if (!resumeData.personalInfo.phone) score -= 2;
  if (!resumeData.personalInfo.location) score -= 2;

  const allBullets = resumeData.experience.flatMap((e) => e.bullets);

  const hasMetrics = allBullets.some((b) =>
    /\d+%|\$\d+|\d+x|\d+\s*(hours?|days?|weeks?|months?|years?)|\d+\+/.test(b)
  );
  if (!hasMetrics) score -= 3;

  const avgBullets =
    allBullets.length / Math.max(resumeData.experience.length, 1);
  if (avgBullets < 2) score -= 4;
  if (avgBullets > 8) score -= 1;

  return Math.max(0, score);
}

function calculateReadabilityScore(resumeData: ResumeData): number {
  const allBullets = resumeData.experience.flatMap((e) => e.bullets);
  if (allBullets.length === 0) return 5;

  let strongCount = 0;
  let weakCount = 0;

  for (const bullet of allBullets) {
    const firstWord = bullet.split(" ")[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (firstWord && STRONG_ACTION_VERBS.has(firstWord)) strongCount++;

    for (const weak of WEAK_PHRASES) {
      if (bullet.toLowerCase().includes(weak)) {
        weakCount++;
        break;
      }
    }
  }

  const strongRatio = strongCount / allBullets.length;
  const score = Math.round(10 * strongRatio) - Math.min(4, weakCount);
  return Math.max(0, Math.min(10, score));
}

function calculateCompletenessScore(resumeData: ResumeData): number {
  let score = 0;
  if (resumeData.summary?.length > 50) score += 3;
  if (resumeData.experience.length > 0) score += 3;
  if (resumeData.education.length > 0) score += 2;
  if (resumeData.skills.length > 0) score += 2;
  return Math.min(10, score);
}

function generateSuggestions(
  resumeData: ResumeData,
  jdAnalysis: JDAnalysis,
  resumeText: string
): string[] {
  const suggestions: string[] = [];

  const topMissing = jdAnalysis.priorityKeywords
    .filter((k) => !semanticMatch(resumeText, k))
    .slice(0, 4);

  if (topMissing.length > 0) {
    suggestions.push(`Add these priority keywords naturally: ${topMissing.join(", ")}`);
  }

  const allBullets = resumeData.experience.flatMap((e) => e.bullets);

  const hasMetrics = allBullets.some((b) => /\d+%|\$\d+|\d+x/.test(b));
  if (!hasMetrics) {
    suggestions.push("Add quantified metrics to at least 2–3 experience bullets");
  }

  const weakBullets = allBullets.filter((b) =>
    WEAK_PHRASES.some((w) => b.toLowerCase().includes(w))
  );
  if (weakBullets.length > 0) {
    suggestions.push(`Replace weak phrases like "Responsible for" with direct action verbs`);
  }

  if (!resumeData.personalInfo.linkedin) {
    suggestions.push("Add your LinkedIn profile URL");
  }

  if (!resumeData.summary || resumeData.summary.length < 80) {
    suggestions.push(`Write a 2–3 sentence summary mentioning ${jdAnalysis.jobTitle} and your top 2 relevant skills`);
  }

  return suggestions.slice(0, 5);
}

function generateStrengths(
  resumeData: ResumeData,
  jdAnalysis: JDAnalysis,
  resumeText: string
): string[] {
  const strengths: string[] = [];

  const matchedCount = jdAnalysis.priorityKeywords.filter((k) =>
    semanticMatch(resumeText, k)
  ).length;

  if (matchedCount >= jdAnalysis.priorityKeywords.length * 0.7) {
    strengths.push("Strong keyword alignment with the job description");
  }

  if (resumeData.experience.some((e) => e.bullets.some((b) => /\d+%|\$\d+|\d+x/.test(b)))) {
    strengths.push("Quantified achievements demonstrate measurable impact");
  }

  if (resumeData.experience.length >= 2) {
    strengths.push("Progressive career trajectory shows growth");
  }

  if (resumeData.skills.length >= 3) {
    strengths.push("Well-organized skills section with clear categories");
  }

  if (resumeData.summary?.length > 100) {
    strengths.push("Professional summary establishes clear role alignment");
  }

  return strengths;
}
