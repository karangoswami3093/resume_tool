"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, ChevronDown, ChevronUp, FileText,
  MessageSquare, RefreshCw, Copy, Check, Settings2,
  Plus, X, FileDown,
} from "lucide-react";
import ResumeUpload from "@/components/upload/ResumeUpload";
import ResumePreview from "@/components/resume/ResumePreview";
import ATSScorePanel from "@/components/ats/ATSScorePanel";
import JDInputPanel from "@/components/jd/JDInputPanel";
import { ResumeData, ATSScore, JDAnalysis } from "@/types";
import { saveToLocalHistory, generateId } from "@/lib/localHistory";
import toast from "react-hot-toast";

type Tab = "resume" | "jd" | "guide";
type BonusTab = "cover" | "interview";
type PageCount = "1" | "2" | "auto";
type GenerationMode = "balanced" | "ats_heavy" | "recruiter" | "industry_switch" | "leadership" | "concise" | "star";
type Industry = "" | "it" | "healthcare" | "supply_chain" | "finance" | "ai_ml" | "marketing" | "data_science" | "sales" | "product" | "legal" | "hr" | "consulting" | "engineering" | "ecommerce";

export default function BuilderPage() {
  // Core state
  const [activeTab, setActiveTab] = useState<Tab>("resume");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [rawText, setRawText] = useState("");
  const [jdText, setJdText] = useState("");
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [jdAnalysis, setJdAnalysis] = useState<JDAnalysis | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);

  // Guidance state (new)
  const [summaryGuidance, setSummaryGuidance] = useState("");
  const [mustIncludeSkills, setMustIncludeSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [generalInstructions, setGeneralInstructions] = useState("");
  const [pageCount, setPageCount] = useState<PageCount>("1");
  const [mode, setMode] = useState<GenerationMode>("balanced");
  const [starMethod, setStarMethod] = useState(false);
  const [industry, setIndustry] = useState<Industry>("");

  // Bonus tools
  const [bonusTab, setBonusTab] = useState<BonusTab | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [interviewQ, setInterviewQ] = useState<
    Array<{ question: string; category: string; whyAsked: string; tipToAnswer: string }>
  >([]);
  const [isGeneratingBonus, setIsGeneratingBonus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBonusPanel, setShowBonusPanel] = useState(false);

  const handleResumeParsed = useCallback((data: ResumeData, text: string) => {
    setResumeData(data);
    setRawText(text);
    setActiveTab("jd");
    toast.success("Resume loaded! Now paste the job description.");
  }, []);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !mustIncludeSkills.includes(trimmed)) {
      setMustIncludeSkills((prev) => [...prev, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setMustIncludeSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleOptimize = async () => {
    if (!resumeData && rawText.length < 50) {
      toast.error("Please upload your resume first");
      setActiveTab("resume");
      return;
    }
    if (!jdText.trim() || jdText.trim().length < 50) {
      toast.error("Please paste a job description first");
      setActiveTab("jd");
      return;
    }

    setIsOptimizing(true);
    setOptimizedResume(null);
    setAtsScore(null);
    setJdAnalysis(null);

    try {
      const res = await fetch("/api/resume/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: resumeData || {},
          jdText,
          originalText: rawText,
          ...(resumeId ? { resumeId } : {}),
          guidance: {
            summaryGuidance: summaryGuidance.trim() || null,
            mustIncludeSkills: mustIncludeSkills.length > 0 ? mustIncludeSkills : null,
            generalInstructions: generalInstructions.trim() || null,
            pageCount,
            mode,
            starMethod,
            industry: industry || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = typeof data.error === "string"
          ? data.error
          : Array.isArray(data.error)
          ? data.error[0]?.message || "Validation failed"
          : "Optimization failed";
        throw new Error(msg);
      }

      setOptimizedResume(data.resumeData);
      setAtsScore(data.atsScore);
      setJdAnalysis(data.jdAnalysis);
      const savedId = data.resumeId || resumeId || generateId();
      if (data.resumeId) setResumeId(data.resumeId);
      // Save to localStorage so dashboard/history always show data
      const now = new Date().toISOString();
      saveToLocalHistory({
        id: savedId,
        title: `${data.jdAnalysis.jobTitle} - ${new Date().toLocaleDateString()}`,
        atsScore: data.atsScore.overall,
        keywordMatch: data.atsScore.keywordMatchPercentage,
        isOptimized: true,
        createdAt: now,
        updatedAt: now,
        resumeData: data.resumeData as object,
        jdText,
      });
      toast.success(`Optimized! ATS Score: ${data.atsScore.overall}/100`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Optimization failed. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!optimizedResume || !jdText) return;
    setIsGeneratingBonus(true);
    try {
      const res = await fetch("/api/resume/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: optimizedResume, jdText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCoverLetter(data.coverLetter);
      setBonusTab("cover");
    } catch {
      toast.error("Cover letter generation failed");
    } finally {
      setIsGeneratingBonus(false);
    }
  };

  const handleGenerateInterviewQ = async () => {
    if (!optimizedResume || !jdText) return;
    setIsGeneratingBonus(true);
    try {
      const res = await fetch("/api/resume/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: optimizedResume, jdText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInterviewQ(data.questions);
      setBonusTab("interview");
    } catch {
      toast.error("Interview questions generation failed");
    } finally {
      setIsGeneratingBonus(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  const canOptimize = (!!resumeData || rawText.length > 50) && jdText.length > 50;
  const hasGuidance = summaryGuidance || mustIncludeSkills.length > 0 || generalInstructions || pageCount !== "1" || mode !== "balanced" || starMethod || !!industry;

  const tabs: { id: Tab; label: string; dot?: boolean }[] = [
    { id: "resume", label: "Resume" },
    { id: "jd", label: "Job Description" },
    { id: "guide", label: "Guidance", dot: !!hasGuidance },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#FAFDD6] dark:bg-[#1e2a5e] overflow-hidden">

      {/* Top Bar */}
      <div className="shrink-0 border-b border-slate-200 dark:border-[#AED6CF]/25 bg-white/80 dark:bg-[#1e2a5e]/50 backdrop-blur px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-600 dark:text-white/70">ATS Resume Builder</span>
          {jdAnalysis && (
            <span className="px-2 py-0.5 bg-[#647FBC]/10 dark:bg-[#647FBC]/15 text-[#91ADC8] dark:text-[#647FBC] rounded-full text-xs border border-[#91ADC8]/40 dark:border-[#647FBC]/20">
              {jdAnalysis.jobTitle}
            </span>
          )}
          {hasGuidance && (
            <span className="px-2 py-0.5 bg-[#647FBC]/10 dark:bg-[#647FBC]/15 text-[#91ADC8] dark:text-[#647FBC] rounded-full text-xs border border-[#91ADC8]/40 dark:border-[#647FBC]/25 flex items-center gap-1">
              <Settings2 className="w-3 h-3" />
              Custom guidance active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {optimizedResume && (
            <>
              <button
                onClick={() => setShowBonusPanel(!showBonusPanel)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#AED6CF]/30 hover:border-slate-300 dark:hover:border-[#AED6CF]/40 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Bonus Tools
                {showBonusPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#AED6CF]/30 hover:border-slate-300 dark:hover:border-[#AED6CF]/40 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-optimize
              </button>
            </>
          )}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleOptimize}
            disabled={isOptimizing || !canOptimize}
            className="flex items-center gap-2 px-5 py-2 bg-[#647FBC] hover:bg-[#91ADC8] disabled:opacity-40 disabled:cursor-not-allowed text-[#1e2a5e] text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-[#647FBC]/25"
          >
            {isOptimizing ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Optimizing...</>
            ) : (
              <><Sparkles className="w-4 h-4" />Optimize with AI</>
            )}
          </motion.button>
        </div>
      </div>

      {/* Bonus Panel */}
      <AnimatePresence>
        {showBonusPanel && optimizedResume && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 border-b border-slate-200 dark:border-[#AED6CF]/25 bg-slate-50 dark:bg-[#1e2a5e]/30 overflow-hidden"
          >
            <div className="px-4 py-3 flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 dark:text-white/40 uppercase tracking-wider">Generate:</span>
              <button
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingBonus}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#AED6CF]/20 hover:bg-slate-200 dark:hover:bg-[#AED6CF]/30 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white text-xs font-medium rounded-lg transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Cover Letter
              </button>
              <button
                onClick={handleGenerateInterviewQ}
                disabled={isGeneratingBonus}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#AED6CF]/20 hover:bg-slate-200 dark:hover:bg-[#AED6CF]/30 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white text-xs font-medium rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Interview Questions
              </button>
              {isGeneratingBonus && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/30">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />Generating...
                </span>
              )}
            </div>
            {bonusTab === "cover" && coverLetter && (
              <div className="px-4 pb-4">
                <div className="relative bg-slate-50 dark:bg-[#AED6CF]/10 rounded-xl p-4 border border-slate-200 dark:border-[#AED6CF]/25">
                  <button
                    onClick={() => handleCopy(coverLetter)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 dark:text-white/30 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#AED6CF]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <p className="text-sm text-slate-600 dark:text-white/70 leading-relaxed whitespace-pre-line pr-8">{coverLetter}</p>
                </div>
              </div>
            )}
            {bonusTab === "interview" && interviewQ.length > 0 && (
              <div className="px-4 pb-4 max-h-60 overflow-y-auto space-y-2">
                {interviewQ.map((q, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-[#AED6CF]/10 rounded-xl p-3 border border-slate-200 dark:border-[#AED6CF]/25">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xs font-bold text-[#91ADC8] dark:text-[#647FBC] shrink-0 mt-0.5">Q{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{q.question}</p>
                        <p className="text-xs text-slate-400 dark:text-white/30 mt-1">
                          <span className="text-[#91ADC8] dark:text-[#647FBC]">{q.category}</span> · {q.tipToAnswer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout */}
      <div className="flex-1 flex min-h-0">

        {/* Left Panel */}
        <div className="w-72 shrink-0 border-r border-slate-200 dark:border-[#AED6CF]/25 bg-white dark:bg-[#1e2a5e]/30 flex flex-col overflow-hidden">

          {/* Tabs */}
          <div className="shrink-0 flex border-b border-slate-200 dark:border-[#AED6CF]/25">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-2.5 text-[11px] font-semibold transition-colors relative ${
                  activeTab === t.id ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60"
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  {t.label}
                  {t.dot && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#91ADC8]" />
                  )}
                </span>
                {activeTab === t.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#647FBC]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-transparent">
            <AnimatePresence mode="wait">

              {/* RESUME TAB */}
              {activeTab === "resume" && (
                <motion.div key="resume" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-xs text-slate-500 dark:text-white/40 mb-3 leading-relaxed">
                    Upload your resume (PDF, DOCX, TXT) or paste the text.
                  </p>
                  <ResumeUpload onResumeParsed={handleResumeParsed} />
                  {resumeData && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-[#AED6CF]/10 rounded-xl border border-[#AED6CF]/20"
                    >
                      <p className="text-xs font-semibold text-[#AED6CF] mb-0.5">Resume loaded</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{resumeData.personalInfo.name}</p>
                      <p className="text-xs text-slate-400 dark:text-white/30">{resumeData.personalInfo.email}</p>
                      <div className="mt-1.5 flex gap-3 text-xs text-slate-400 dark:text-white/30">
                        <span>{resumeData.experience.length} roles</span>
                        <span>{resumeData.skills.length} skill categories</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* JD TAB */}
              {activeTab === "jd" && (
                <motion.div key="jd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-xs text-slate-500 dark:text-white/40 mb-3 leading-relaxed">
                    Paste the full job description from LinkedIn, Workday, Greenhouse, etc.
                  </p>
                  <JDInputPanel value={jdText} onChange={setJdText} jdAnalysis={jdAnalysis} />
                </motion.div>
              )}

              {/* GUIDANCE TAB */}
              {activeTab === "guide" && (
                <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">

                  <p className="text-xs text-slate-500 dark:text-white/40 leading-relaxed">
                    All fields are optional. Add specific instructions to improve the AI output.
                  </p>

                  {/* Summary Guidance */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-white/60 mb-1.5 uppercase tracking-wider">
                      Summary Instructions
                    </label>
                    <p className="text-[11px] text-slate-400 dark:text-white/30 mb-2 leading-relaxed">
                      Tell AI how to write your summary. E.g. "Focus on healthcare analytics and Python. Mention 5 years experience. Keep it under 3 lines."
                    </p>
                    <textarea
                      value={summaryGuidance}
                      onChange={(e) => setSummaryGuidance(e.target.value)}
                      placeholder="e.g. Lead with my healthcare data background. Mention Python and SQL. Keep tone confident but not arrogant. Don't mention soft skills."
                      className="w-full h-24 px-3 py-2 bg-slate-50 dark:bg-[#AED6CF]/10 border border-slate-200 dark:border-[#AED6CF]/30 rounded-xl text-xs text-slate-800 dark:text-white/80 placeholder-slate-300 dark:placeholder-white/20 resize-none focus:outline-none focus:border-[#91ADC8] dark:focus:border-[#647FBC]/50 transition-colors"
                    />
                  </div>

                  {/* Must-Include Skills */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-white/60 mb-1.5 uppercase tracking-wider">
                      Must-Include Skills
                    </label>
                    <p className="text-[11px] text-slate-400 dark:text-white/30 mb-2 leading-relaxed">
                      Skills that must appear in the final resume, even if not in the JD.
                    </p>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSkill()}
                        placeholder="Type skill + Enter"
                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-[#AED6CF]/10 border border-slate-200 dark:border-[#AED6CF]/30 rounded-lg text-xs text-slate-800 dark:text-white/80 placeholder-slate-300 dark:placeholder-white/20 focus:outline-none focus:border-[#91ADC8] dark:focus:border-[#647FBC]/50 transition-colors"
                      />
                      <button
                        onClick={addSkill}
                        className="px-2.5 py-1.5 bg-[#647FBC] hover:bg-[#91ADC8] rounded-lg text-[#1e2a5e] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {mustIncludeSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {mustIncludeSkills.map((skill) => (
                          <span
                            key={skill}
                            className="flex items-center gap-1 px-2 py-0.5 bg-[#647FBC]/10 dark:bg-[#647FBC]/15 text-[#1e2a5e] dark:text-[#647FBC] rounded-full text-[10px] border border-[#91ADC8]/40 dark:border-[#647FBC]/20"
                          >
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="hover:text-white">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* General Instructions */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-white/60 mb-1.5 uppercase tracking-wider">
                      Additional Instructions
                    </label>
                    <p className="text-[11px] text-slate-400 dark:text-white/30 mb-2 leading-relaxed">
                      Anything specific to include, exclude, or change. E.g. "Remove the freelance project. Don't mention Java. Add more detail to the Mphasis role."
                    </p>
                    <textarea
                      value={generalInstructions}
                      onChange={(e) => setGeneralInstructions(e.target.value)}
                      placeholder="e.g. Remove the 2019 internship. Don't mention R or MATLAB. Add more bullets to my current role. Keep education section short."
                      className="w-full h-28 px-3 py-2 bg-slate-50 dark:bg-[#AED6CF]/10 border border-slate-200 dark:border-[#AED6CF]/30 rounded-xl text-xs text-slate-800 dark:text-white/80 placeholder-slate-300 dark:placeholder-white/20 resize-none focus:outline-none focus:border-[#91ADC8] dark:focus:border-[#647FBC]/50 transition-colors"
                    />
                  </div>

                  {/* Page Count */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-white/60 mb-1.5 uppercase tracking-wider">
                      Resume Length
                    </label>
                    <p className="text-[11px] text-slate-400 dark:text-white/30 mb-2 leading-relaxed">
                      How many pages should the final resume be?
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { val: "1", label: "1 Page", desc: "Compact" },
                        { val: "2", label: "2 Pages", desc: "Detailed" },
                        { val: "auto", label: "Auto", desc: "AI decides" },
                      ] as { val: PageCount; label: string; desc: string }[]).map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => setPageCount(opt.val)}
                          className={`flex flex-col items-center py-2.5 rounded-xl border text-center transition-all ${
                            pageCount === opt.val
                              ? "border-[#647FBC] bg-[#647FBC]/10 dark:bg-[#647FBC]/15 text-[#1e2a5e] dark:text-white"
                              : "border-slate-200 dark:border-[#AED6CF]/30 bg-white dark:bg-[#AED6CF]/10 text-slate-400 dark:text-white/40 hover:border-[#91ADC8] dark:hover:border-[#AED6CF]/40 hover:text-slate-700 dark:hover:text-white/60"
                          }`}
                        >
                          <span className="text-xs font-bold">{opt.label}</span>
                          <span className="text-[10px] mt-0.5 opacity-60">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                    {pageCount === "1" && (
                      <p className="text-[11px] text-[#91ADC8] dark:text-[#647FBC]/60 mt-2">
                        AI will keep content tight and prioritize the most relevant experience.
                      </p>
                    )}
                    {pageCount === "2" && (
                      <p className="text-[11px] text-[#91ADC8] dark:text-[#647FBC]/60 mt-2">
                        AI will expand bullets and include more detail across all roles.
                      </p>
                    )}
                  </div>

                  {/* Industry Focus */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-white/60 mb-1.5 uppercase tracking-wider">
                      Industry Focus
                    </label>
                    <p className="text-[11px] text-slate-400 dark:text-white/30 mb-2.5 leading-relaxed">
                      Select your target industry for tailored language and keywords.
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {([
                        { val: "it", label: "IT & Software", icon: "💻" },
                        { val: "healthcare", label: "Healthcare", icon: "🏥" },
                        { val: "supply_chain", label: "Supply Chain", icon: "📦" },
                        { val: "finance", label: "Finance", icon: "💰" },
                        { val: "ai_ml", label: "AI & ML", icon: "🤖" },
                        { val: "marketing", label: "Marketing", icon: "📈" },
                        { val: "data_science", label: "Data Science", icon: "📊" },
                        { val: "sales", label: "Sales & BizDev", icon: "🎯" },
                        { val: "product", label: "Product Mgmt", icon: "🗂️" },
                        { val: "legal", label: "Legal", icon: "⚖️" },
                        { val: "hr", label: "Human Resources", icon: "👥" },
                        { val: "consulting", label: "Consulting", icon: "🎓" },
                        { val: "engineering", label: "Engineering", icon: "⚙️" },
                        { val: "ecommerce", label: "E-commerce", icon: "🛍️" },
                      ] as { val: Industry; label: string; icon: string }[]).map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => setIndustry(industry === opt.val ? "" : opt.val)}
                          className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-all text-xs ${
                            industry === opt.val
                              ? "border-[#647FBC] bg-[#647FBC]/10 dark:bg-[#647FBC]/15 text-[#1e2a5e] dark:text-white font-semibold"
                              : "border-slate-200 dark:border-[#AED6CF]/30 bg-white dark:bg-[#AED6CF]/10 text-slate-500 dark:text-white/40 hover:border-[#91ADC8] dark:hover:border-[#AED6CF]/40 hover:text-slate-700 dark:hover:text-white/60"
                          }`}
                        >
                          <span className="text-base leading-none">{opt.icon}</span>
                          <span className="truncate">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                    {industry && (
                      <p className="text-[11px] text-[#91ADC8] dark:text-[#647FBC]/80 mt-2">
                        Industry-specific terminology and keywords will be applied.
                      </p>
                    )}
                  </div>

                  {/* Generation Mode */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-white/60 mb-1.5 uppercase tracking-wider">
                      Generation Mode
                    </label>
                    <p className="text-[11px] text-slate-400 dark:text-white/30 mb-2 leading-relaxed">
                      Controls how the AI writes your resume.
                    </p>
                    <div className="space-y-1.5">
                      {([
                        { val: "balanced", label: "Balanced", desc: "ATS + human readable" },
                        { val: "ats_heavy", label: "ATS Heavy", desc: "Max keyword coverage" },
                        { val: "recruiter", label: "Recruiter First", desc: "Clean, human-first" },
                        { val: "industry_switch", label: "Industry Switch", desc: "Reframe for new field" },
                        { val: "leadership", label: "Leadership", desc: "Senior ownership signals" },
                        { val: "concise", label: "Concise", desc: "Tight one-page" },
                        { val: "star", label: "STAR Method", desc: "Situation/Action/Result" },
                      ] as { val: GenerationMode; label: string; desc: string }[]).map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => setMode(opt.val)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all ${
                            mode === opt.val
                              ? "border-[#647FBC] bg-[#647FBC]/10 dark:bg-[#647FBC]/15 text-[#1e2a5e] dark:text-white"
                              : "border-slate-200 dark:border-[#AED6CF]/30 bg-white dark:bg-[#AED6CF]/10 text-slate-400 dark:text-white/40 hover:border-[#91ADC8] dark:hover:border-[#AED6CF]/40 hover:text-slate-700 dark:hover:text-white/60"
                          }`}
                        >
                          <span className="text-xs font-semibold">{opt.label}</span>
                          <span className="text-[10px] opacity-60">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* STAR Method Toggle */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-white/60 mb-1.5 uppercase tracking-wider">
                      S.T.A.R. Bullet Format
                    </label>
                    <p className="text-[11px] text-slate-400 dark:text-white/30 mb-2 leading-relaxed">
                      Structures every bullet as a compressed S.T.A.R story: context, what you did, and the measurable result.
                    </p>
                    <button
                      onClick={() => setStarMethod((prev) => !prev)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                        starMethod
                          ? "border-[#647FBC] bg-[#647FBC]/10 dark:bg-[#647FBC]/15 text-[#1e2a5e] dark:text-[#647FBC]"
                          : "border-slate-200 dark:border-[#AED6CF]/30 bg-white dark:bg-[#AED6CF]/10 text-slate-400 dark:text-white/40 hover:border-[#91ADC8] dark:hover:border-[#AED6CF]/40 hover:text-slate-600 dark:hover:text-white/60"
                      }`}
                    >
                      <span className="text-xs font-semibold">
                        {starMethod ? "STAR bullets ON" : "STAR bullets OFF"}
                      </span>
                      <div className={`w-8 h-4 rounded-full transition-colors relative ${starMethod ? "bg-[#647FBC]" : "bg-[#AED6CF]"}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${starMethod ? "left-4" : "left-0.5"}`} />
                      </div>
                    </button>
                    {starMethod && mode !== "star" && (
                      <p className="text-[11px] text-[#91ADC8] dark:text-[#647FBC]/60 mt-1.5">
                        STAR bullets will be applied on top of the selected mode.
                      </p>
                    )}
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Optimize Button */}
          <div className="shrink-0 p-4 border-t border-slate-200 dark:border-[#AED6CF]/25 bg-white dark:bg-transparent">
            <button
              onClick={handleOptimize}
              disabled={isOptimizing || !canOptimize}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#647FBC] hover:bg-[#91ADC8] disabled:opacity-40 disabled:cursor-not-allowed text-[#1e2a5e] text-sm font-semibold rounded-xl transition-colors"
            >
              {isOptimizing ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Optimizing...</>
              ) : (
                <><Sparkles className="w-4 h-4" />Optimize with AI</>
              )}
            </button>
            {!canOptimize && (
              <p className="text-center text-[10px] text-slate-400 dark:text-white/25 mt-2">
                {!resumeData && rawText.length < 50 ? "Upload resume first" : jdText.length < 50 ? "Paste job description" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Center - Resume Preview */}
        <div className="flex-1 min-w-0 flex flex-col border-r border-slate-200 dark:border-[#AED6CF]/25">
          <ResumePreview
            resumeData={optimizedResume}
            isOptimizing={isOptimizing}
            pageCount={pageCount}
          />
        </div>

        {/* Right - ATS Score */}
        <div className="w-72 shrink-0 overflow-y-auto bg-white dark:bg-[#1e2a5e]">
          <ATSScorePanel score={atsScore} jdAnalysis={jdAnalysis} isLoading={isOptimizing} />
        </div>

      </div>
    </div>
  );
}
