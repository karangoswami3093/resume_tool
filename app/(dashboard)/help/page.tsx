"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Zap, Target, FileText, Star, BarChart2, Upload, Wand2 } from "lucide-react";

const section = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "How does the ATS score work?",
    a: "The ATS score is calculated across 5 dimensions: keyword match (how many job description keywords appear in your resume), skills match (overlap between your listed skills and required skills), format score (structure and section completeness), readability (sentence clarity and length), and completeness (how thoroughly each section is filled). The weighted average produces the overall score out of 100.",
  },
  {
    q: "What is the difference between Aggressive ATS and Standard mode?",
    a: "Standard mode balances natural language with keyword optimization. Aggressive ATS mode prioritizes maximum keyword density and will rewrite bullets more heavily to include every required and preferred skill from the job description. Use Aggressive for roles where you're underqualified on paper; use Standard when you're a strong match.",
  },
  {
    q: "Why should I paste the full job description?",
    a: "The AI extracts required skills, preferred skills, tools, technologies, and domain keywords directly from the job description. The more complete the JD, the more precisely your resume gets tailored. Even internal 'about the role' paragraphs help.",
  },
  {
    q: "Will the AI change my actual experience?",
    a: "No. The AI rewrites how your experience is described, not what it was. Companies, roles, dates, and projects remain exactly as you provide them. Only the phrasing of bullet points is optimized to better reflect the JD's language.",
  },
  {
    q: "What does S.T.A.R bullet format mean?",
    a: "S.T.A.R stands for Situation, Task, Action, Result. Each experience bullet is compressed into a single sentence that provides context (situation + task), describes what you specifically did (action), and ends with a measurable outcome (result). Example: 'Reduced API latency by 40% by refactoring the caching layer after identifying a bottleneck in production traffic logs.'",
  },
  {
    q: "Is my resume data stored on a server?",
    a: "No. All resume history is stored in your browser's localStorage. Nothing is sent to a server except the content you submit for AI optimization. Clearing your browser data or using incognito mode will erase your history.",
  },
  {
    q: "Can I use a template and then paste my own job description?",
    a: "Yes. Templates pre-populate the industry focus setting and generate a base resume structure tuned for that field. You can then paste any job description and run optimization on top of the template result.",
  },
];

function FAQ({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 dark:border-[#AED6CF]/25 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-sm font-medium text-slate-800 dark:text-white">{item.q}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 dark:text-white/30 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-slate-500 dark:text-white/45 leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const STEPS = [
  {
    icon: Upload,
    color: "text-[#91ADC8] dark:text-[#647FBC]",
    bg: "bg-[#647FBC]/10 dark:bg-[#647FBC]/10",
    title: "Upload or Paste Resume",
    desc: "Upload a PDF or paste your existing resume text in the Builder. The parser extracts your experience, education, and skills automatically.",
  },
  {
    icon: FileText,
    color: "text-[#91ADC8] dark:text-[#647FBC]",
    bg: "bg-[#647FBC]/10 dark:bg-[#647FBC]/10",
    title: "Paste the Job Description",
    desc: "Copy the full job posting and paste it into the JD panel. The AI reads required skills, preferred qualifications, and company context.",
  },
  {
    icon: Wand2,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-500/10",
    title: "Choose Options",
    desc: "Pick your industry focus, generation mode (Standard, Aggressive, STAR), and target page count. Each setting shapes how the AI rewrites your resume.",
  },
  {
    icon: Zap,
    color: "text-[#AED6CF] dark:text-[#AED6CF]",
    bg: "bg-[#AED6CF]/10",
    title: "Optimize & Download",
    desc: "Hit Optimize. The AI tailors your resume, shows an ATS score with a breakdown, highlights matched and missing keywords, and exports a clean PDF.",
  },
];

const SCORE_TIPS = [
  { range: "80-100", label: "Excellent", color: "text-[#AED6CF]", tip: "Your resume is well-aligned. Focus on polishing language and quantifying more results." },
  { range: "60-79", label: "Good", color: "text-[#91ADC8] dark:text-[#647FBC]", tip: "Solid match. Add missing keywords from the JD into your skills or bullets." },
  { range: "40-59", label: "Fair", color: "text-[#91ADC8] dark:text-[#647FBC]", tip: "Use Aggressive ATS mode and ensure your skills section explicitly lists required tools." },
  { range: "0-39", label: "Low", color: "text-red-500", tip: "The JD may require skills not yet in your resume, or the format needs restructuring." },
];

export default function HelpPage() {
  return (
    <div className="h-screen overflow-y-auto bg-[#FAFDD6] dark:bg-[#1e2a5e]">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Help & Documentation</h1>
          <p className="text-sm text-slate-400 dark:text-white/40 mt-1">
            Everything you need to get the best results from ResumeAI.
          </p>
        </div>

        {/* Getting Started */}
        <motion.div variants={section} initial="hidden" animate="show" className="mb-6">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-white/30 uppercase tracking-widest mb-3">Getting Started</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#1e2a5e]/60 border border-slate-200 dark:border-[#AED6CF]/25 rounded-2xl p-4 shadow-sm"
              >
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-xs font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1">Step {i + 1}</p>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 dark:text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ATS Score Guide */}
        <motion.div variants={section} initial="hidden" animate="show" transition={{ delay: 0.05 }} className="mb-6">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-white/30 uppercase tracking-widest mb-3">Understanding Your ATS Score</h2>
          <div className="bg-white dark:bg-[#1e2a5e]/60 border border-slate-200 dark:border-[#AED6CF]/25 rounded-2xl p-5 shadow-sm mb-3">
            <div className="grid sm:grid-cols-5 gap-3 mb-4">
              {[
                { label: "Keyword Match", pct: "30%", desc: "JD keywords found in resume" },
                { label: "Skills Match", pct: "25%", desc: "Required skills present" },
                { label: "Format", pct: "20%", desc: "Sections and structure" },
                { label: "Readability", pct: "15%", desc: "Clarity and bullet length" },
                { label: "Completeness", pct: "10%", desc: "All sections filled" },
              ].map((c) => (
                <div key={c.label} className="text-center">
                  <div className="text-lg font-bold text-[#91ADC8] dark:text-[#647FBC]">{c.pct}</div>
                  <div className="text-[10px] font-semibold text-slate-600 dark:text-white/60">{c.label}</div>
                  <div className="text-[10px] text-slate-400 dark:text-white/25 mt-0.5">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {SCORE_TIPS.map((t) => (
              <div
                key={t.range}
                className="bg-white dark:bg-[#1e2a5e]/60 border border-slate-200 dark:border-[#AED6CF]/25 rounded-xl p-4 shadow-sm flex gap-3"
              >
                <div className={`text-sm font-bold ${t.color} shrink-0 w-14`}>{t.range}</div>
                <div>
                  <p className={`text-xs font-semibold ${t.color} mb-0.5`}>{t.label}</p>
                  <p className="text-[11px] text-slate-500 dark:text-white/40 leading-relaxed">{t.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Generation Modes */}
        <motion.div variants={section} initial="hidden" animate="show" transition={{ delay: 0.1 }} className="mb-6">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-white/30 uppercase tracking-widest mb-3">Generation Modes</h2>
          <div className="bg-white dark:bg-[#1e2a5e]/60 border border-slate-200 dark:border-[#AED6CF]/25 rounded-2xl p-5 shadow-sm space-y-4">
            {[
              { icon: Star, label: "Standard", color: "text-[#91ADC8]", desc: "Balanced optimization. Rewrites bullets for clarity and keyword inclusion without sounding robotic. Best for most applications." },
              { icon: Target, label: "Aggressive ATS", color: "text-red-500", desc: "Maximizes keyword density. Every required and preferred skill gets worked into the resume. Ideal when you're borderline-qualified." },
              { icon: BarChart2, label: "STAR Bullets", color: "text-[#AED6CF]", desc: "Structures each bullet as a compressed Situation, Task, Action, Result story. Great for consulting, product management, and strategy roles." },
              { icon: FileText, label: "Conservative", color: "text-slate-400", desc: "Minimal rewrites. Only adds keywords where they fit naturally. Best when your resume is already strong and you don't want heavy changes." },
            ].map((m) => (
              <div key={m.label} className="flex gap-3 items-start">
                <m.icon className={`w-4 h-4 ${m.color} mt-0.5 shrink-0`} />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{m.label}</p>
                  <p className="text-xs text-slate-500 dark:text-white/40 mt-0.5 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div variants={section} initial="hidden" animate="show" transition={{ delay: 0.15 }}>
          <h2 className="text-xs font-semibold text-slate-400 dark:text-white/30 uppercase tracking-widest mb-3">Frequently Asked Questions</h2>
          <div className="bg-white dark:bg-[#1e2a5e]/60 border border-slate-200 dark:border-[#AED6CF]/25 rounded-2xl px-5 shadow-sm">
            {FAQS.map((faq, i) => (
              <FAQ key={i} item={faq} />
            ))}
          </div>
        </motion.div>

        <p className="text-center text-[11px] text-slate-300 dark:text-white/20 mt-8 pb-4">
          Still have questions? Reach out via the feedback form.
        </p>
      </div>
    </div>
  );
}
