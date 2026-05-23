import { ResumeData, SkillCategory, Experience, Education, Project } from "@/types";

export async function parsePDFResume(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text;
}

export async function parseDOCXResume(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function parseResumeFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    return parsePDFResume(buffer);
  }
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return parseDOCXResume(buffer);
  }
  if (mimeType === "text/plain") {
    return buffer.toString("utf-8");
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}

export function textToResumeData(text: string): ResumeData {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const firstLine = lines[0] || "Your Name";
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/[\+]?[\d\s\-().]{10,}/);
  const locationMatch = text.match(
    /([A-Z][a-z]+(?:,\s*[A-Z]{2})?(?:\s*\d{5})?)/
  );

  const personalInfo = {
    name: firstLine,
    location: locationMatch?.[1] || "",
    email: emailMatch?.[0] || "",
    phone: phoneMatch?.[0]?.trim() || "",
    linkedin: extractUrl(text, "linkedin"),
    github: extractUrl(text, "github"),
    website: undefined,
  };

  const summary = extractSection(text, ["SUMMARY", "PROFILE", "OBJECTIVE", "ABOUT"]);
  const skillsText = extractSection(text, ["SKILLS", "TECHNICAL SKILLS", "CORE COMPETENCIES"]);
  const skills = parseSkillsSection(skillsText);
  const experience = parseExperienceSection(
    extractSection(text, ["EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT"])
  );
  const education = parseEducationSection(
    extractSection(text, ["EDUCATION", "ACADEMIC BACKGROUND"])
  );
  const projects = parseProjectsSection(
    extractSection(text, ["PROJECTS", "ACADEMIC PROJECTS", "PERSONAL PROJECTS"])
  );

  return {
    personalInfo,
    summary: summary || "",
    skills,
    experience,
    education,
    projects,
    certifications: [],
  };
}

function extractUrl(text: string, platform: string): string | undefined {
  const regex = new RegExp(
    `(?:https?://)?(?:www\\.)?${platform}\\.com/[\\w/-]+`,
    "i"
  );
  return text.match(regex)?.[0];
}

function extractSection(text: string, headers: string[]): string {
  const upperText = text.toUpperCase();
  for (const header of headers) {
    const idx = upperText.indexOf(header);
    if (idx === -1) continue;

    const afterHeader = text.slice(idx + header.length);
    const nextSectionIdx = afterHeader.search(
      /\n[A-Z][A-Z\s]{3,}[:]\s*\n|\n[A-Z][A-Z\s]{3,}\n/
    );
    return nextSectionIdx > 0
      ? afterHeader.slice(0, nextSectionIdx).trim()
      : afterHeader.slice(0, 2000).trim();
  }
  return "";
}

function parseSkillsSection(text: string): SkillCategory[] {
  if (!text) return [{ category: "Skills", items: [] }];

  const lines = text.split("\n").filter((l) => l.trim());
  const categories: SkillCategory[] = [];

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0 && colonIdx < 40) {
      const category = line.slice(0, colonIdx).replace(/^[•\-*]\s*/, "").trim();
      const items = line
        .slice(colonIdx + 1)
        .split(/[,;]/)
        .map((i) => i.trim())
        .filter(Boolean);
      if (items.length > 0) {
        categories.push({ category, items });
      }
    }
  }

  if (categories.length === 0) {
    const allSkills = text
      .split(/[,;\n•\-]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2 && s.length < 40);
    return [{ category: "Technical Skills", items: allSkills.slice(0, 20) }];
  }

  return categories;
}

function parseExperienceSection(text: string): Experience[] {
  if (!text) return [];

  const experiences: Experience[] = [];
  const datePattern =
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)?\s*\d{4}\s*[-–]\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)?\s*\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*[-–]\s*(?:Current|Present|Now)/gi;

  const lines = text.split("\n").filter((l) => l.trim());
  let currentExp: Partial<Experience> | null = null;

  for (const line of lines) {
    const hasDate = datePattern.test(line);
    datePattern.lastIndex = 0;

    if (hasDate && line.length < 150) {
      if (currentExp?.company) {
        experiences.push(currentExp as Experience);
      }

      const dateMatch = line.match(datePattern);
      const dateStr = dateMatch?.[0] || "";
      const parts = dateStr.split(/[-–]/);

      currentExp = {
        company: line.replace(dateStr, "").replace(/[-–|,]/g, " ").trim(),
        role: "",
        startDate: parts[0]?.trim() || "",
        endDate: parts[1]?.trim() || "Present",
        bullets: [],
      };
    } else if (
      currentExp &&
      (line.startsWith("•") || line.startsWith("-") || line.startsWith("*"))
    ) {
      currentExp.bullets = currentExp.bullets || [];
      currentExp.bullets.push(line.replace(/^[•\-*]\s*/, "").trim());
    } else if (currentExp && !currentExp.role && line.length < 80) {
      currentExp.role = line;
    }
  }

  if (currentExp?.company) {
    experiences.push(currentExp as Experience);
  }

  return experiences.filter((e) => e.company && e.bullets.length > 0);
}

function parseEducationSection(text: string): Education[] {
  if (!text) return [];

  const education: Education[] = [];
  const lines = text.split("\n").filter((l) => l.trim());
  let currentEdu: Partial<Education> | null = null;

  for (const line of lines) {
    if (/\d{4}/.test(line) && line.length < 120) {
      if (currentEdu?.institution) {
        education.push(currentEdu as Education);
      }
      const yearMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|Present|Current)/i);
      currentEdu = {
        institution: line.replace(yearMatch?.[0] || "", "").trim(),
        degree: "",
        startDate: yearMatch?.[1] || "",
        endDate: yearMatch?.[2] || "",
      };
    } else if (currentEdu && !currentEdu.degree && line.length < 100) {
      currentEdu.degree = line;
    }
  }

  if (currentEdu?.institution) {
    education.push(currentEdu as Education);
  }

  return education;
}

function parseProjectsSection(text: string): Project[] {
  if (!text) return [];

  const projects: Project[] = [];
  const lines = text.split("\n").filter((l) => l.trim());
  let currentProject: Partial<Project> | null = null;

  for (const line of lines) {
    if (
      !line.startsWith("•") &&
      !line.startsWith("-") &&
      !line.startsWith("*") &&
      line.length < 100 &&
      !line.match(/^\d/)
    ) {
      if (currentProject?.name) {
        projects.push(currentProject as Project);
      }
      currentProject = { name: line, bullets: [] };
    } else if (
      currentProject &&
      (line.startsWith("•") || line.startsWith("-") || line.startsWith("*"))
    ) {
      currentProject.bullets = currentProject.bullets || [];
      currentProject.bullets.push(line.replace(/^[•\-*]\s*/, "").trim());
    }
  }

  if (currentProject?.name) {
    projects.push(currentProject as Project);
  }

  return projects.filter((p) => p.name);
}
