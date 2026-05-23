"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Star, Sparkles,
  Code2, Brain, BarChart2, TrendingUp, Activity,
  Package, Layers, Megaphone, Target, Briefcase,
  Scale, Users, ShoppingCart, Cpu, Cog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Template {
  id: string;
  industry: string;
  Icon: LucideIcon;
  title: string;
  roles: string[];
  tags: string[];
  color: string;
  iconBg: string;
  badge?: string;
  animationType?: "spin" | "bounce" | "pulse" | "wiggle";
}

const TEMPLATES: Template[] = [
  {
    id: "it",
    industry: "IT & Software Engineering",
    Icon: Code2,
    title: "Software Engineer",
    roles: ["Frontend Developer", "Backend Engineer", "Full Stack Dev", "DevOps Engineer"],
    tags: ["React", "Node.js", "AWS", "CI/CD", "Agile"],
    color: "text-[#91ADC8] dark:text-[#647FBC]",
    iconBg: "bg-[#647FBC]/10 dark:bg-[#647FBC]/10",
    badge: "Most Popular",
    animationType: "wiggle",
  },
  {
    id: "ai_ml",
    industry: "AI & Machine Learning",
    Icon: Brain,
    title: "ML Engineer",
    roles: ["Data Scientist", "ML Engineer", "AI Researcher", "NLP Engineer"],
    tags: ["Python", "PyTorch", "TensorFlow", "MLOps", "LLMs"],
    color: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-50 dark:bg-purple-500/10",
    badge: "Trending",
    animationType: "pulse",
  },
  {
    id: "data_science",
    industry: "Data Science & Analytics",
    Icon: BarChart2,
    title: "Data Analyst",
    roles: ["Data Analyst", "Business Intelligence", "Analytics Engineer", "BI Developer"],
    tags: ["SQL", "Python", "Power BI", "Tableau", "ETL"],
    color: "text-[#AED6CF] dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    animationType: "bounce",
  },
  {
    id: "finance",
    industry: "Finance & Banking",
    Icon: TrendingUp,
    title: "Financial Analyst",
    roles: ["Financial Analyst", "Investment Banking", "Risk Manager", "Portfolio Manager"],
    tags: ["Financial Modeling", "Excel", "Bloomberg", "P&L", "GAAP"],
    color: "text-[#AED6CF] dark:text-[#AED6CF]",
    iconBg: "bg-[#AED6CF]/10",
    animationType: "bounce",
  },
  {
    id: "healthcare",
    industry: "Healthcare & Medical",
    Icon: Activity,
    title: "Healthcare Professional",
    roles: ["Clinical Data Analyst", "Health Informatics", "Care Coordinator", "Clinical Manager"],
    tags: ["HIPAA", "EMR", "Clinical Workflows", "HL7", "FHIR"],
    color: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-50 dark:bg-rose-500/10",
    animationType: "pulse",
  },
  {
    id: "supply_chain",
    industry: "Supply Chain & Logistics",
    Icon: Package,
    title: "Supply Chain Manager",
    roles: ["Supply Chain Analyst", "Logistics Manager", "Procurement Manager", "Demand Planner"],
    tags: ["SAP", "ERP", "Demand Planning", "Procurement", "Lean"],
    color: "text-[#91ADC8] dark:text-[#647FBC]",
    iconBg: "bg-[#647FBC]/10 dark:bg-[#647FBC]/10",
    animationType: "wiggle",
  },
  {
    id: "product",
    industry: "Product Management",
    Icon: Layers,
    title: "Product Manager",
    roles: ["Product Manager", "Product Owner", "Growth PM", "Technical PM"],
    tags: ["Roadmap", "OKRs", "Agile", "User Research", "Go-to-Market"],
    color: "text-cyan-600 dark:text-cyan-400",
    iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
    animationType: "bounce",
  },
  {
    id: "marketing",
    industry: "Marketing & Growth",
    Icon: Megaphone,
    title: "Marketing Manager",
    roles: ["Growth Manager", "Digital Marketer", "Content Strategist", "SEO Specialist"],
    tags: ["SEO", "Google Ads", "HubSpot", "A/B Testing", "CRO"],
    color: "text-[#91ADC8] dark:text-[#647FBC]",
    iconBg: "bg-[#647FBC]/10 dark:bg-[#647FBC]/10",
    animationType: "wiggle",
  },
  {
    id: "sales",
    industry: "Sales & Business Development",
    Icon: Target,
    title: "Sales Manager",
    roles: ["Account Executive", "Sales Manager", "BizDev Manager", "SDR"],
    tags: ["Salesforce", "Pipeline", "Quota", "CRM", "Prospecting"],
    color: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-50 dark:bg-green-500/10",
    animationType: "pulse",
  },
  {
    id: "consulting",
    industry: "Consulting & Strategy",
    Icon: Briefcase,
    title: "Strategy Consultant",
    roles: ["Management Consultant", "Strategy Lead", "Business Analyst", "Change Manager"],
    tags: ["Strategy", "Frameworks", "Stakeholder Mgmt", "Excel", "PowerPoint"],
    color: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-50 dark:bg-purple-500/10",
    animationType: "bounce",
  },
  {
    id: "legal",
    industry: "Legal & Compliance",
    Icon: Scale,
    title: "Legal Counsel",
    roles: ["Corporate Lawyer", "Compliance Officer", "Legal Analyst", "Contract Manager"],
    tags: ["Contract Law", "Due Diligence", "GDPR", "Regulatory", "M&A"],
    color: "text-slate-600 dark:text-slate-400",
    iconBg: "bg-slate-50 dark:bg-slate-500/10",
    animationType: "wiggle",
  },
  {
    id: "hr",
    industry: "Human Resources",
    Icon: Users,
    title: "HR Manager",
    roles: ["HR Business Partner", "Talent Acquisition", "People Ops", "L&D Manager"],
    tags: ["HRIS", "Talent Acquisition", "Performance Mgmt", "DEI", "Onboarding"],
    color: "text-pink-600 dark:text-pink-400",
    iconBg: "bg-pink-50 dark:bg-pink-500/10",
    animationType: "pulse",
  },
];

const animations = {
  wiggle: { rotate: [0, -12, 12, -8, 8, 0], scale: [1, 1.1, 1.1, 1.05, 1.05, 1] },
  bounce: { y: [0, -6, 0, -3, 0], scale: [1, 1.05, 1, 1.02, 1] },
  pulse: { scale: [1, 1.2, 1, 1.1, 1] },
  spin: { rotate: [0, 180, 360] },
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const filtered = TEMPLATES.filter(
    (t) =>
      t.industry.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.roles.some((r) => r.toLowerCase().includes(search.toLowerCase())) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-screen overflow-y-auto bg-[#FAFDD6] dark:bg-[#1e2a5e]">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1e2a5e] dark:text-white">Resume Templates</h1>
          <p className="text-sm text-slate-400 dark:text-white/40 mt-1">
            Start from an industry-specific template. Each is pre-optimized for ATS with the right keywords and structure.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by industry, role, or skill..."
            className="w-full px-4 py-2.5 pl-10 bg-white dark:bg-[#1e2a5e]/60 border border-slate-200 dark:border-[#AED6CF]/30 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-[#91ADC8] dark:focus:border-[#647FBC]/50 transition-colors shadow-sm"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((tpl) => (
            <motion.div
              key={tpl.id}
              variants={item}
              className="group bg-white dark:bg-[#1e2a5e]/60 border border-slate-200 dark:border-[#AED6CF]/25 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-[#91ADC8]/40 dark:hover:border-[#647FBC]/20 transition-all"
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <motion.div
                  className={`w-11 h-11 rounded-xl ${tpl.iconBg} flex items-center justify-center cursor-pointer`}
                  onHoverStart={() => setHoveredIcon(tpl.id)}
                  onHoverEnd={() => setHoveredIcon(null)}
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                >
                  <motion.div
                    animate={
                      hoveredIcon === tpl.id
                        ? { ...animations[tpl.animationType || "wiggle"] }
                        : {}
                    }
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <tpl.Icon className={`w-5 h-5 ${tpl.color}`} strokeWidth={1.8} />
                  </motion.div>
                </motion.div>

                {tpl.badge && (
                  <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 px-2 py-0.5 bg-[#647FBC]/10 dark:bg-[#647FBC]/10 text-[#91ADC8] dark:text-[#647FBC] rounded-full text-[10px] font-semibold border border-[#91ADC8]/40 dark:border-[#647FBC]/25"
                  >
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Star className="w-2.5 h-2.5" />
                    </motion.div>
                    {tpl.badge}
                  </motion.span>
                )}
              </div>

              {/* Industry */}
              <p className={`text-xs font-semibold ${tpl.color} mb-1`}>{tpl.industry}</p>
              <h3 className="font-bold text-[#1e2a5e] dark:text-white mb-2">{tpl.title}</h3>

              {/* Roles */}
              <div className="mb-3">
                <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-wider font-semibold mb-1.5">Suitable for</p>
                <div className="flex flex-wrap gap-1">
                  {tpl.roles.slice(0, 3).map((role) => (
                    <span key={role} className="px-2 py-0.5 bg-slate-50 dark:bg-[#AED6CF]/20 text-slate-600 dark:text-white/50 rounded-lg text-[10px] border border-slate-100 dark:border-[#AED6CF]/25">
                      {role}
                    </span>
                  ))}
                  {tpl.roles.length > 3 && (
                    <span className="px-2 py-0.5 text-slate-400 dark:text-white/30 text-[10px]">+{tpl.roles.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {tpl.tags.map((tag) => (
                  <span key={tag} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${tpl.iconBg} ${tpl.color} border border-current/10`}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={`/builder?industry=${tpl.id}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1e2a5e] dark:bg-white hover:bg-[#1e2a5e]/80 dark:hover:bg-white/90 text-white dark:text-slate-900 text-sm font-semibold rounded-xl transition-all group-hover:bg-[#647FBC] dark:group-hover:bg-[#647FBC] group-hover:text-white dark:group-hover:text-white shadow-sm"
              >
                <motion.div
                  whileHover={{ rotate: 20, scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </motion.div>
                Use this template
                <motion.div
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 dark:text-white/30 text-sm">No templates match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
