"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus, FileText, Trash2, Loader2,
  TrendingUp, Sparkles, Target, BarChart3,
  ChevronRight, Calendar, ArrowUpRight, MoreHorizontal,
  Zap, Upload,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { SavedResume } from "@/types";
import { getLocalHistory, deleteFromLocalHistory, LocalResume } from "@/lib/localHistory";
import toast from "react-hot-toast";

function mergeResumes(api: SavedResume[], local: LocalResume[]): SavedResume[] {
  const apiIds = new Set(api.map((r) => r.id));
  const localOnly = local
    .filter((r) => !apiIds.has(r.id))
    .map((r) => ({ ...r } as unknown as SavedResume));
  return [...api, ...localOnly].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function CountUp({ to, duration = 1000 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = to / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(Math.round(start));
      if (start >= to) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [to, duration]);
  return <>{val}</>;
}

const SCORE_COLOR = (s: number) =>
  s >= 80 ? "#5DF8D8" : s >= 60 ? "#6FD1D7" : s >= 40 ? "#3B7597" : "#ef4444";

const ORANGE = "#5DF8D8";
const BLUE = "#6FD1D7";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

// Custom tooltip styled like Circlow
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#093C5D] border border-gray-100 dark:border-[#3B7597]/30 rounded-xl shadow-xl px-3.5 py-2.5 text-xs">
      <p className="text-gray-400 dark:text-white/40 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 font-semibold" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: {p.value}{p.name === "ATS Score" || p.name === "Keywords" ? "" : ""}
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [chartView, setChartView] = useState<"all" | "recent">("all");

  useEffect(() => {
    const local = getLocalHistory();
    fetch("/api/resume/list")
      .then((r) => r.json())
      .then((d) => setResumes(mergeResumes(d.resumes || [], local)))
      .catch(() => setResumes(local as unknown as SavedResume[]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resume?")) return;
    setDeleting(id);
    try {
      deleteFromLocalHistory(id);
      await fetch(`/api/resume/list?id=${id}`, { method: "DELETE" }).catch(() => {});
      setResumes((r) => r.filter((resume) => resume.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const scored = resumes.filter((r) => r.atsScore != null);
  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((a, r) => a + (r.atsScore || 0), 0) / scored.length)
    : 0;
  const bestScore = scored.length > 0 ? Math.max(...scored.map((r) => r.atsScore || 0)) : 0;
  const optimizedCount = resumes.filter((r) => r.isOptimized).length;

  // Area chart data — ATS score over time
  const visibleResumes = chartView === "recent"
    ? resumes.filter((r) => r.atsScore != null).slice(0, 5)
    : resumes.filter((r) => r.atsScore != null).slice(0, 10);

  const areaData = visibleResumes.reverse().map((r, i) => ({
    name: new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: r.atsScore || 0,
    keywords: Math.round((r as any).keywordMatch || 0),
    label: r.title.split(" ").slice(0, 2).join(" "),
  }));

  // Grouped bar chart data (right panel)
  const barData = resumes
    .filter((r) => r.atsScore != null)
    .slice(0, 6)
    .reverse()
    .map((r) => ({
      name: new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      ats: r.atsScore || 0,
      kw: Math.round((r as any).keywordMatch || 0),
    }));

  // Score distribution
  const dist = [
    { label: "Excellent", range: "80+", count: scored.filter(r => (r.atsScore || 0) >= 80).length, color: BLUE },
    { label: "Good", range: "60-79", count: scored.filter(r => (r.atsScore || 0) >= 60 && (r.atsScore || 0) < 80).length, color: ORANGE },
    { label: "Fair", range: "40-59", count: scored.filter(r => (r.atsScore || 0) >= 40 && (r.atsScore || 0) < 60).length, color: "#f59e0b" },
    { label: "Low", range: "<40", count: scored.filter(r => (r.atsScore || 0) < 40).length, color: "#ef4444" },
  ];

  return (
    <div className="h-screen overflow-y-auto bg-white dark:bg-[#093C5D]">
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5">
              Track your resume performance with full AI insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#093C5D] border border-gray-200 dark:border-[#3B7597]/30 rounded-xl text-sm text-gray-500 dark:text-white/50 shadow-sm">
              <Calendar className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
            <Link
              href="/history"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#093C5D] border border-gray-200 dark:border-[#3B7597]/30 rounded-xl text-sm text-gray-600 dark:text-white/60 font-medium shadow-sm hover:border-gray-300 dark:hover:border-[#3B7597]/40 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              Export
            </Link>
            <Link
              href="/builder"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#5DF8D8] hover:bg-[#6FD1D7] text-[#093C5D] text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#5DF8D8]/25 hover:shadow-[#5DF8D8]/25 hover:scale-[1.02]"
            >
              <Zap className="w-3.5 h-3.5" />
              AI Optimize
            </Link>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-12 gap-5">

          {/* ── LEFT COLUMN (8/12) ── */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">

            {/* Best Score card — like "Total Revenue" */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-white dark:bg-[#093C5D]/60 border border-gray-100 dark:border-[#3B7597]/25 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-white/50">Best ATS Score</p>
                  <div className="flex items-end gap-3 mt-1">
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      {isLoading ? <span className="animate-pulse text-gray-200">--</span> : <CountUp to={bestScore} />}
                      <span className="text-lg font-normal text-gray-300 dark:text-white/20">/100</span>
                    </p>
                    {avgScore > 0 && (
                      <span className="flex items-center gap-1 text-sm font-semibold text-[#3B7597] mb-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        avg {avgScore}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 dark:text-white/30">Target</p>
                    <p className="text-sm font-bold text-[#6FD1D7]">95 / 100</p>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-gray-300 dark:text-white/20" />
                </div>
              </div>

              {/* Dual progress bars */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2.5 bg-gray-100 dark:bg-[#3B7597]/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#5DF8D8]"
                      initial={{ width: 0 }}
                      animate={{ width: `${bestScore}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 dark:text-white/30 w-8 text-right">{bestScore}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2.5 bg-gray-100 dark:bg-[#3B7597]/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#3B7597]"
                      initial={{ width: 0 }}
                      animate={{ width: `${avgScore}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.35 }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 dark:text-white/30 w-8 text-right">{avgScore}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-[#3B7597]/25">
                <p className="text-xs text-gray-400 dark:text-white/30">
                  Next target to achieve
                </p>
                <p className="text-xs font-semibold text-gray-600 dark:text-white/50">95 / 100</p>
              </div>
            </motion.div>

            {/* ATS Score Trend — like "Monthly Sales" area chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="bg-white dark:bg-[#093C5D]/60 border border-gray-100 dark:border-[#3B7597]/25 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">ATS Score Trend</h3>
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">Score per optimized resume</p>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-[#3B7597]/20 rounded-xl">
                  {(["all", "recent"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setChartView(v)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${
                        chartView === v
                          ? "bg-white dark:bg-[#3B7597]/20 text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60"
                      }`}
                    >
                      {v === "all" ? "All" : "Recent"}
                    </button>
                  ))}
                </div>
              </div>

              {areaData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-44 gap-3">
                  <BarChart3 className="w-10 h-10 text-gray-100 dark:text-white/10" />
                  <p className="text-sm text-gray-400 dark:text-white/30">Optimize a resume to see your trend</p>
                  <Link href="/builder" className="text-xs text-[#6FD1D7] font-semibold hover:text-[#6FD1D7] transition-colors">
                    Go to Builder
                  </Link>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={ORANGE} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="kwGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={BLUE} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      name="ATS Score"
                      stroke={ORANGE}
                      strokeWidth={2.5}
                      fill="url(#scoreGrad)"
                      dot={{ fill: ORANGE, strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 6, fill: "#093C5D", stroke: ORANGE, strokeWidth: 2.5 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="keywords"
                      name="Keywords"
                      stroke={BLUE}
                      strokeWidth={2}
                      fill="url(#kwGrad)"
                      dot={false}
                      activeDot={{ r: 5, fill: "#093C5D", stroke: BLUE, strokeWidth: 2 }}
                      strokeDasharray="5 3"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {/* Legend */}
              {areaData.length > 0 && (
                <div className="flex items-center gap-5 mt-3 pt-3 border-t border-gray-50 dark:border-[#3B7597]/25">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/40">
                    <span className="w-3 h-0.5 rounded-full bg-[#5DF8D8] inline-block" />
                    ATS Score
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/40">
                    <span className="w-3 h-0.5 rounded-full bg-[#3B7597] inline-block border-dashed" />
                    Keyword Match
                  </span>
                </div>
              )}
            </motion.div>

            {/* Recent Resumes — like "Best Deals Company" */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="bg-white dark:bg-[#093C5D]/60 border border-gray-100 dark:border-[#3B7597]/25 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-[#3B7597]/25">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent Resumes</h3>
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">Your AI-optimized resume history</p>
                </div>
                <Link href="/history" className="flex items-center gap-1 text-xs text-[#6FD1D7] font-semibold hover:text-[#6FD1D7] transition-colors">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-gray-200 dark:text-white/20 animate-spin" />
                </div>
              ) : resumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#5DF8D8]/10 dark:bg-[#5DF8D8]/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#5DF8D8]" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-500 dark:text-white/40">No resumes yet</p>
                    <p className="text-sm text-gray-400 dark:text-white/25 mt-0.5">Create your first AI-optimized resume</p>
                  </div>
                  <Link href="/builder" className="flex items-center gap-2 px-4 py-2 bg-[#5DF8D8] hover:bg-[#6FD1D7] text-[#093C5D] text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#5DF8D8]/25">
                    <Sparkles className="w-3.5 h-3.5" />
                    Start Building
                  </Link>
                </div>
              ) : (
                <div>
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-4 px-5 py-2.5 bg-gray-50 dark:bg-[#3B7597]/10">
                    <p className="col-span-5 text-[10px] font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">Resume</p>
                    <p className="col-span-2 text-[10px] font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">Date</p>
                    <p className="col-span-2 text-[10px] font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">ATS</p>
                    <p className="col-span-2 text-[10px] font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">Keywords</p>
                    <p className="col-span-1" />
                  </div>

                  {resumes.slice(0, 7).map((resume, i) => (
                    <motion.div
                      key={resume.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 + i * 0.04 }}
                      className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-gray-50 dark:border-[#3B7597]/25 last:border-0 hover:bg-[#5DF8D8]/10/30 dark:hover:bg-white/[0.02] group transition-colors"
                    >
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#5DF8D8]/10 dark:bg-[#5DF8D8]/10 border border-[#6FD1D7]/20 dark:border-[#5DF8D8]/20 flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5 text-[#6FD1D7]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{resume.title}</p>
                          {resume.isOptimized && (
                            <p className="text-[10px] text-[#6FD1D7] font-medium flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> AI Optimized
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center">
                        <span className="text-xs text-gray-400 dark:text-white/30 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(resume.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <div className="col-span-2 flex items-center">
                        {resume.atsScore != null ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: SCORE_COLOR(resume.atsScore) }}>
                              {resume.atsScore}
                            </span>
                            <div className="w-10 h-1.5 bg-gray-100 dark:bg-[#3B7597]/20 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${resume.atsScore}%`, backgroundColor: SCORE_COLOR(resume.atsScore) }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-200 dark:text-white/20">-</span>
                        )}
                      </div>

                      <div className="col-span-2 flex items-center">
                        {(resume as any).keywordMatch != null ? (
                          <span className="text-sm font-semibold text-gray-600 dark:text-white/50">
                            {Math.round((resume as any).keywordMatch)}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-200 dark:text-white/20">-</span>
                        )}
                      </div>

                      <div className="col-span-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/builder?id=${resume.id}`}
                          className="p-1.5 rounded-lg hover:bg-[#6FD1D7]/15 dark:hover:bg-[#5DF8D8]/10 text-gray-300 dark:text-white/30 hover:text-[#6FD1D7] transition-colors"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(resume.id)}
                          disabled={deleting === resume.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-300 dark:text-white/30 hover:text-red-400 transition-colors"
                        >
                          {deleting === resume.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN (4/12) ── */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">

            {/* Stats cards — 2x2 grid */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-3"
            >
              {[
                { label: "Total Resumes", value: resumes.length, icon: FileText, color: "text-[#6FD1D7]", bg: "bg-[#5DF8D8]/10 dark:bg-[#5DF8D8]/10" },
                { label: "Avg Score", value: avgScore, icon: BarChart3, suffix: "%", color: "text-[#3B7597]", bg: "bg-[#3B7597]/10 dark:bg-[#3B7597]/10" },
                { label: "Best Score", value: bestScore, icon: TrendingUp, suffix: "%", color: "text-[#3B7597]", bg: "bg-[#3B7597]/10 dark:bg-[#3B7597]/10" },
                { label: "AI Optimized", value: optimizedCount, icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-white dark:bg-[#093C5D]/60 border border-gray-100 dark:border-[#3B7597]/25 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <motion.div
                    className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-3`}
                    whileHover={{ scale: 1.12 }}
                    transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  >
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                      transition={{ duration: 0.4 }}
                    >
                      <s.icon className={`w-4 h-4 ${s.color}`} strokeWidth={1.8} />
                    </motion.div>
                  </motion.div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                    {isLoading ? <span className="animate-pulse text-gray-200">-</span> : <CountUp to={s.value} />}
                    {s.suffix && <span className="text-xs font-normal text-gray-300 dark:text-white/20 ml-0.5">{s.suffix}</span>}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-1 font-medium">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Score Overview — like "Sales Overview" bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="bg-white dark:bg-[#093C5D]/60 border border-gray-100 dark:border-[#3B7597]/25 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Score Overview</h3>
                <MoreHorizontal className="w-4 h-4 text-gray-300 dark:text-white/20" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {isLoading ? "--" : bestScore}
                <span className="text-sm font-normal text-[#3B7597] ml-2 text-base">
                  {avgScore > 0 ? `avg ${avgScore}` : ""}
                </span>
              </p>

              {barData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <Target className="w-7 h-7 text-gray-100 dark:text-white/10" />
                  <p className="text-xs text-gray-400 dark:text-white/30">No data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={barData} barSize={8} barGap={2} margin={{ top: 8, right: 0, left: -30, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="ats" name="ATS Score" fill={ORANGE} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="kw" name="Keywords" fill={BLUE} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Legend */}
              <div className="mt-3 space-y-2.5 border-t border-gray-50 dark:border-[#3B7597]/25 pt-3">
                {[
                  { label: "ATS Score", color: ORANGE, val: bestScore > 0 ? `${bestScore}` : "-" },
                  { label: "Keyword Match", color: BLUE, val: scored.length > 0 ? `${Math.round(scored.reduce((a, r) => a + ((r as any).keywordMatch || 0), 0) / scored.length)}%` : "-" },
                  { label: "Optimized", color: "#8b5cf6", val: `${optimizedCount}` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                      <span className="text-xs text-gray-500 dark:text-white/40">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-white/60">{item.val}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Score Distribution — like "Returning Visits" */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25 }}
              className="bg-white dark:bg-[#093C5D]/60 border border-gray-100 dark:border-[#3B7597]/25 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Score Distribution</h3>
                <MoreHorizontal className="w-4 h-4 text-gray-300 dark:text-white/20" />
              </div>

              {scored.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2">
                  <p className="text-xs text-gray-400 dark:text-white/30">No scores yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dist.filter(d => d.count > 0).map((d, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-gray-700 dark:text-white/70">{d.label}</p>
                        <p className="text-sm font-bold" style={{ color: d.color }}>
                          {Math.round((d.count / scored.length) * 100)}%
                        </p>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-[#3B7597]/20 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: d.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(d.count / scored.length) * 100}%` }}
                          transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 + i * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link
                href="/history"
                className="mt-4 w-full flex items-center justify-center py-2 border border-gray-200 dark:border-[#3B7597]/30 rounded-xl text-xs font-semibold text-gray-500 dark:text-white/40 hover:border-[#6FD1D7] dark:hover:border-[#5DF8D8]/30 hover:text-[#6FD1D7] transition-all"
              >
                See All Resumes
              </Link>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
