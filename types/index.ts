export interface PersonalInfo {
  name: string;
  location: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface Experience {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  coursework?: string[];
}

export interface Project {
  name: string;
  organization?: string;
  description?: string;
  bullets: string[];
}

export interface Certification {
  name: string;
  issuer?: string;
  date?: string;
  status?: "pursuing" | "completed";
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  skills: SkillCategory[];
  experience: Experience[];
  education: Education[];
  projects?: Project[];
  certifications?: Certification[];
}

export interface JDAnalysis {
  jobTitle: string;
  company?: string;
  industry: string;
  experienceLevel: string;
  requiredSkills: string[];
  preferredSkills: string[];
  tools: string[];
  technologies: string[];
  domainKeywords: string[];
  softSkills: string[];
  priorityKeywords: string[];
  responsibilities: string[];
  industryContext?: string;
}

export interface ATSScoreBreakdown {
  keywordMatch: number;
  skillsMatch: number;
  formatScore: number;
  readability: number;
  completeness: number;
}

export interface ATSScore {
  overall: number;
  breakdown: ATSScoreBreakdown;
  keywordMatchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  strengths: string[];
}

export interface OptimizationResult {
  resumeData: ResumeData;
  atsScore: ATSScore;
  jdAnalysis: JDAnalysis;
}

export interface SavedResume {
  id: string;
  title: string;
  resumeData: ResumeData;
  jdText?: string;
  atsScore?: number;
  keywordMatch?: number;
  isOptimized: boolean;
  createdAt: string;
  updatedAt: string;
}
