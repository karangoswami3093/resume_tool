"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Target, FileDown, Brain, CheckCircle2, Star, Sparkles, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Optimization",
    description:
      "Claude AI analyzes your JD and rewrites every bullet point with strong action verbs, natural keyword integration, and measurable impact.",
    color: "text-[#3B7597] dark:text-[#3B7597]",
    bg: "bg-[#3B7597]/10",
    border: "border-[#3B7597]/20",
  },
  {
    icon: Target,
    title: "Real ATS Score",
    description:
      "Get a live ATS compatibility score out of 100 with keyword match %, missing keywords, and specific actionable suggestions.",
    color: "text-[#6FD1D7] dark:text-[#5DF8D8]",
    bg: "bg-[#5DF8D8]/10 dark:bg-[#5DF8D8]/10",
    border: "border-[#6FD1D7]/20 dark:border-[#5DF8D8]/20",
  },
  {
    icon: FileDown,
    title: "One-Click PDF Export",
    description:
      "Download a pixel-perfect, ATS-safe PDF that matches the exact formatting structure of professionally crafted resumes.",
    color: "text-[#3B7597] dark:text-[#3B7597]",
    bg: "bg-[#3B7597]/10",
    border: "border-[#3B7597]/20",
  },
  {
    icon: Zap,
    title: "JD Intelligence Engine",
    description:
      "Extracts priority keywords, required skills, tools, domain terms, and experience requirements from any job description automatically.",
    color: "text-[#6FD1D7] dark:text-[#5DF8D8]",
    bg: "bg-[#5DF8D8]/10 dark:bg-[#5DF8D8]/10",
    border: "border-[#6FD1D7]/20 dark:border-[#5DF8D8]/25",
  },
];

const stats = [
  { value: "2x", label: "More interview callbacks" },
  { value: "94%", label: "Average ATS score" },
  { value: "< 30s", label: "Optimization time" },
  { value: "7", label: "Generation modes" },
];

const steps = [
  { num: "01", title: "Upload Resume", desc: "Drop your existing resume (PDF, DOCX, or paste text)" },
  { num: "02", title: "Paste Job Description", desc: "Copy any JD from LinkedIn, Greenhouse, Workday, etc." },
  { num: "03", title: "Optimize with AI", desc: "Claude AI rewrites and tailors your resume in seconds" },
  { num: "04", title: "Download PDF", desc: "Get your ATS-optimized resume ready to apply" },
];

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#093C5D] text-slate-900 dark:text-white transition-colors">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 dark:border-[#3B7597]/25 bg-white/90 dark:bg-[#093C5D]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#5DF8D8] flex items-center justify-center shadow-lg shadow-[#5DF8D8]/25">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              Resume<span className="text-[#6FD1D7]">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <Link href="/sign-in" className="text-sm text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-1.5 bg-[#5DF8D8] hover:bg-[#6FD1D7] text-[#093C5D] text-sm font-semibold rounded-lg transition-all hover:scale-105 shadow-md shadow-[#5DF8D8]/25"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 hero-glow pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#6FD1D7]/10 dark:bg-[#5DF8D8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5DF8D8]/10 dark:bg-[#5DF8D8]/10 border border-[#6FD1D7]/40 dark:border-[#5DF8D8]/20 text-[#6FD1D7] dark:text-[#5DF8D8] text-xs font-semibold mb-6 shadow-sm">
              <Star className="w-3 h-3" />
              Powered by Claude AI · ATS-Safe Every Time
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight mb-6 text-slate-900 dark:text-white">
              Your resume,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5DF8D8] to-[#5DF8D8]">
                ATS-optimized
              </span>
              <br />
              for every job
            </h1>
            <p className="text-lg text-slate-500 dark:text-white/50 leading-relaxed mb-10 max-w-2xl mx-auto">
              Upload your resume, paste a job description, and watch AI rewrite your resume with the exact
              keywords, tone, and structure that beats ATS systems and impresses hiring managers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/sign-up"
                className="flex items-center gap-2 px-7 py-3.5 bg-[#5DF8D8] hover:bg-[#6FD1D7] text-[#093C5D] font-semibold rounded-xl transition-all hover:scale-105 shadow-xl shadow-[#5DF8D8]/25"
              >
                <Sparkles className="w-4 h-4" />
                Start optimizing for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sign-in"
                className="px-6 py-3 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors"
              >
                Already have an account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-100 dark:border-[#3B7597]/25 bg-slate-50 dark:bg-[#093C5D]/30">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-slate-400 dark:text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">How it works</h2>
            <p className="text-slate-400 dark:text-white/40 text-sm">Four steps from upload to ATS-ready</p>
          </div>
          <div className="grid sm:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-4xl font-bold text-slate-100 dark:text-white/5 mb-2">{step.num}</div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-white/40 leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-5 right-0 translate-x-1/2 text-slate-200 dark:text-white/10 text-lg">
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-[#093C5D]/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">Everything you need to get hired</h2>
            <p className="text-slate-400 dark:text-white/40 text-sm">Built for professionals who want to stand out</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-5 bg-white dark:bg-[#3B7597]/15 border ${feature.border} rounded-2xl hover:shadow-md transition-all`}
              >
                <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's optimized */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">What AI optimizes</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-left">
            {[
              "Professional summary tailored to the role",
              "Skills reordered by JD relevance",
              "Bullet points with strong action verbs",
              "Quantified metrics added naturally",
              "Priority keywords embedded in context",
              "ATS-safe single-column formatting",
              "Achievement-focused language throughout",
              "Recruiter-readable structure preserved",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#6FD1D7] shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600 dark:text-white/60">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-slate-100 dark:border-[#3B7597]/25">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5DF8D8]/10 dark:bg-[#5DF8D8]/10 border border-[#6FD1D7]/40 dark:border-[#5DF8D8]/20 text-[#6FD1D7] dark:text-[#5DF8D8] text-xs font-semibold mb-6">
            <Sparkles className="w-3 h-3" />
            Join thousands of job seekers
          </div>
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Ready to land more interviews?</h2>
          <p className="text-slate-400 dark:text-white/40 mb-8">
            Tailor your resume for every application with AI in seconds.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#5DF8D8] hover:bg-[#6FD1D7] text-[#093C5D] font-semibold rounded-xl transition-all hover:scale-105 shadow-xl shadow-[#5DF8D8]/25"
          >
            <Sparkles className="w-4 h-4" />
            Get started for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-8 border-t border-slate-100 dark:border-[#3B7597]/25 text-center text-xs text-slate-400 dark:text-white/20">
        © {new Date().getFullYear()} ResumeAI. Built with Claude AI.
      </footer>
    </div>
  );
}
