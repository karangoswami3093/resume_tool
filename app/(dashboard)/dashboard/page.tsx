"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell, MessageSquare, LayoutGrid, Zap, ChevronRight,
  Info, TrendingUp, FileText, Target, Sparkles, Brain,
  BarChart2, Loader2, Trash2, Calendar,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { SavedResume } from "@/types";
import { getLocalHistory, deleteFromLocalHistory, LocalResume } from "@/lib/localHistory";
import toast from "react-hot-toast";

// ── helpers ────────────────────────────────────────────────────────────────
function mergeResumes(api: SavedResume[], local: LocalResume[]): SavedResume[] {
  const apiIds = new Set(api.map((r) => r.id));
  const localOnly = local
    .filter((r) => !apiIds.has(r.id))
    .map((r) => ({ ...r } as unknown as SavedResume));
  return [...api, ...localOnly].sort(
    (a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime()
  );
}

function CountUp({ to, duration = 900 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = to / (duration / 16);
    const t = setInterval(() => {
      cur = Math.min(cur + step, to);
      setVal(Math.round(cur));
      if (cur >= to) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [to, duration]);
  return <>{val}</>;
}

const PRIMARY   = "#1E5C40";
const SECONDARY = "#7ECBC4";
const SOFT      = "#3A7A62";
const LIME      = "#C8E83C";
const SACRAMENTO = "#0D3B2C";

function Badge({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded
      ${pos ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
      {pos ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

function LineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5 text-xs min-w-[130px]">
      <p className="text-gray-400 mb-1.5 font-medium uppercase tracking-wide text-[10px]">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-0.5">
          <span className="flex items-center gap-1.5" style={{ color: p.color }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-bold" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── component ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [resumes, setResumes]   = useState<SavedResume[]>([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<"line" | "bar">("line");
  const [period, setPeriod]     = useState("Last 12 Months");

  useEffect(() => {
    const local = getLocalHistory();
    fetch("/api/resume/list")
      .then((r) => r.json())
      .then((d) => setResumes(mergeResumes(d.resumes || [], local)))
      .catch(() => setResumes(local as unknown as SavedResume[]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resume?")) return;
    setDeleting(id);
    try {
      deleteFromLocalHistory(id);
      await fetch(`/api/resume/list?id=${id}`, { method: "DELETE" }).catch(() => {});
      setResumes((r) => r.filter((x) => x.id !== id));
      toast.success("Deleted");
    } finally { setDeleting(null); }
  };

  const scored = resumes.filter((r) => r.atsScore != null);
  const avgScore    = scored.length ? Math.round(scored.reduce((a, r) => a + (r.atsScore || 0), 0) / scored.length) : 0;
  const bestScore   = scored.length ? Math.max(...scored.map((r) => r.atsScore || 0)) : 0;
  const optimized   = resumes.filter((r) => r.isOptimized).length;
  const avgKeyword  = scored.length
    ? Math.round(scored.reduce((a, r) => a + ((r as any).keywordMatch || 0), 0) / scored.length)
    : 0;

  // Line chart — up to 10 most recent scored resumes, chronological
  const lineData = [...scored]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-10)
    .map((r) => ({
      name: new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      "ATS Score": r.atsScore || 0,
      "Keywords":  Math.round((r as any).keywordMatch || 0),
    }));

  // Distribution horizontal bar
  const dist = [
    { label: "Excellent (80+)", count: scored.filter(r => (r.atsScore||0) >= 80).length },
    { label: "Good (60-79)",    count: scored.filter(r => (r.atsScore||0) >= 60 && (r.atsScore||0) < 80).length },
    { label: "Fair (40-59)",    count: scored.filter(r => (r.atsScore||0) >= 40 && (r.atsScore||0) < 60).length },
    { label: "Low (<40)",       count: scored.filter(r => (r.atsScore||0) < 40).length },
  ];
  const maxDist = Math.max(...dist.map((d) => d.count), 1);

  const aiTips = [
    { icon: Target,   text: "Top-performing resume this month" },
    { icon: TrendingUp, text: "Predict your next ATS score" },
    { icon: Brain,    text: "Extract keyword gaps from JDs" },
  ];

  return (
    <div className="h-screen overflow-y-auto bg-[#F0EBD8]">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-3.5 h-3.5" />
            </button>
            <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:border-gray-300 transition-colors">
              <LayoutGrid className="w-3.5 h-3.5" />
              Custom Widget
            </button>
            <Link
              href="/builder"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: LIME, color: SACRAMENTO }}
            >
              <Zap className="w-3.5 h-3.5" />
              + Optimize Resume
            </Link>
          </div>
        </div>

        {/* ── Filter row ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {["Last 12 Months", "Jan - Dec 2025", "All Industries"].map((opt) => (
            <button
              key={opt}
              onClick={() => setPeriod(opt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
                ${period === opt
                  ? "border-[#1E5C40] bg-[#1E5C40]/10 text-[#1E5C40]"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
            >
              {opt === "Jan - Dec 2025" && <Calendar className="w-3 h-3" />}
              {opt}
              <svg className="w-3 h-3 ml-0.5 opacity-50" viewBox="0 0 12 12" fill="currentColor"><path d="M2 4l4 4 4-4"/></svg>
            </button>
          ))}
        </div>

        {/* ── 3 Big Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Resumes",
              value: resumes.length,
              sub: `+${Math.max(0, resumes.length - Math.floor(resumes.length * 0.88))} this month`,
              pct: resumes.length > 0 ? 12.4 : 0,
            },
            {
              label: "Total Optimizations",
              value: optimized,
              sub: `+${Math.max(0, optimized - Math.floor(optimized * 0.86))} this month`,
              pct: optimized > 0 ? 8.3 : 0,
            },
            {
              label: "Avg ATS Score",
              value: avgScore,
              sub: `Best: ${bestScore}/100`,
              pct: avgScore > 0 ? 3.1 : 0,
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 font-medium">{card.label}</span>
                <Info className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <p className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-300" /> : <CountUp to={card.value} />}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{card.sub}</span>
                {card.pct > 0 && <Badge value={card.pct} />}
                <Link href="/history" className="ml-auto flex items-center gap-0.5 font-semibold hover:underline" style={{ color: PRIMARY }}>
                  View details <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Statistics ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Section header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">Statistics</span>
              <Info className="w-3.5 h-3.5 text-gray-300" />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setChartMode("bar")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                  ${chartMode === "bar" ? "text-white" : "border border-gray-200 text-gray-500"}`}
                style={chartMode === "bar" ? { background: PRIMARY } : {}}
              >
                <BarChart2 className="w-3.5 h-3.5" /> Bar
              </button>
              <button
                onClick={() => setChartMode("line")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                  ${chartMode === "line" ? "text-white" : "border border-gray-200 text-gray-500"}`}
                style={chartMode === "line" ? { background: PRIMARY } : {}}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Line
              </button>
            </div>
          </div>

          {/* 4 mini metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-50">
            {[
              { dot: PRIMARY,    label: "Avg ATS Score",   val: `${avgScore}`,    pct: avgScore > 0 ? 3.4 : 0 },
              { dot: SECONDARY,  label: "Keyword Match",   val: `${avgKeyword}%`, pct: avgKeyword > 0 ? 2.5 : 0 },
              { dot: SOFT,       label: "Best Score",      val: `${bestScore}`,   pct: bestScore > 0 ? 7.2 : 0 },
              { dot: "#a78bfa",  label: "Optimized",       val: `${optimized}`,   pct: optimized > 0 ? 4.2 : 0 },
            ].map((m) => (
              <div key={m.label} className="px-5 py-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.dot }} />
                  <span className="text-xs text-gray-400">{m.label}</span>
                  <Info className="w-3 h-3 text-gray-200 ml-0.5" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">{m.val}</span>
                  {m.pct > 0 && <Badge value={m.pct} />}
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="px-2 pb-4 pt-2">
            {loading ? (
              <div className="h-52 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
              </div>
            ) : lineData.length === 0 ? (
              <div className="h-52 flex items-center justify-center">
                <p className="text-sm text-gray-300">No data yet — optimize your first resume</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                {chartMode === "line" ? (
                  <LineChart data={lineData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip content={<LineTooltip />} />
                    <Line type="monotone" dataKey="ATS Score" stroke={PRIMARY}   strokeWidth={2.5} dot={{ fill: PRIMARY,   r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Keywords"  stroke={SECONDARY} strokeWidth={2}   dot={{ fill: SECONDARY, r: 3, strokeWidth: 0 }} activeDot={{ r: 4 }} />
                  </LineChart>
                ) : (
                  <BarChart data={lineData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip content={<LineTooltip />} />
                    <Bar dataKey="ATS Score" fill={PRIMARY}   radius={[4, 4, 0, 0]} maxBarSize={24} />
                    <Bar dataKey="Keywords"  fill={SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={24} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>

          <div className="px-5 pb-4 flex items-center gap-1 text-xs text-gray-400">
            Learn more about{" "}
            <Link href="/history" className="font-semibold flex items-center gap-0.5" style={{ color: PRIMARY }}>
              Statistics <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9L9 3M9 3H5M9 3v4"/></svg>
            </Link>
          </div>
        </motion.div>

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-6">

          {/* Distribution — 2/3 width */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm">Distribution</span>
                <Info className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <Link href="/history" className="text-xs font-semibold flex items-center gap-1" style={{ color: PRIMARY }}>
                Learn more about Distribution
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9L9 3M9 3H5M9 3v4"/></svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-6">
              {/* Left — KPIs */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: PRIMARY }} />
                    <span className="text-xs text-gray-400">Excellent resumes</span>
                    <Info className="w-3 h-3 text-gray-200" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {scored.length > 0
                      ? `${Math.round((scored.filter(r => (r.atsScore||0) >= 80).length / scored.length) * 100)}%`
                      : "—"}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs text-gray-400">Low score rate</span>
                    <Info className="w-3 h-3 text-gray-200" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {scored.length > 0
                      ? `${Math.round((scored.filter(r => (r.atsScore||0) < 40).length / scored.length) * 100)}%`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Right — Horizontal bars */}
              <div className="space-y-3">
                {dist.map((d, i) => {
                  const colors = [PRIMARY, SECONDARY, SOFT, "#f87171"];
                  const pct = maxDist > 0 ? (d.count / maxDist) * 100 : 0;
                  return (
                    <div key={d.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 font-medium">{d.label}</span>
                        <span className="text-xs font-bold text-gray-700">{d.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: colors[i] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 + i * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                  <span>0</span><span>100%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Panel — 1/3 width */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${SACRAMENTO}, ${PRIMARY})` }}>
                <Sparkles className="w-7 h-7" style={{ color: LIME }} />
              </div>
            </div>

            <h3 className="text-center font-bold text-gray-900 mb-1.5 text-sm">
              Optimize Smarter with AI!
            </h3>
            <p className="text-center text-xs text-gray-400 leading-relaxed mb-5">
              Analyze your resume data in real time, highlighting patterns and predicting ATS outcomes.
            </p>

            <div className="space-y-2 flex-1">
              {aiTips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                >
                  <Link
                    href="/builder"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${PRIMARY}15` }}>
                      <tip.icon className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                    </div>
                    <span className="text-xs text-gray-600 flex-1 leading-snug">{tip.text}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <Link
              href="/builder"
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-semibold text-center transition-opacity hover:opacity-90"
              style={{ background: LIME, color: SACRAMENTO }}
            >
              Start Optimizing →
            </Link>
          </motion.div>
        </div>

        {/* ── Recent Resumes ── */}
        {resumes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-900 text-sm">Recent Resumes</span>
              </div>
              <Link href="/history" className="text-xs font-semibold" style={{ color: PRIMARY }}>View all</Link>
            </div>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-2.5 bg-gray-50 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              <div className="col-span-5">Title</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">ATS Score</div>
              <div className="col-span-2">Keywords</div>
              <div className="col-span-1" />
            </div>
            {resumes.slice(0, 5).map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 + i * 0.04 }}
                className="grid grid-cols-12 gap-4 items-center px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors group"
              >
                <div className="col-span-5 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${PRIMARY}15` }}>
                    <FileText className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{r.title}</p>
                    {r.isOptimized && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: PRIMARY }}>
                        <Sparkles className="w-2.5 h-2.5" /> AI Optimized
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                <div className="col-span-2">
                  {r.atsScore != null ? (
                    <span className="text-xs font-bold" style={{
                      color: r.atsScore >= 80 ? PRIMARY : r.atsScore >= 60 ? SECONDARY : r.atsScore >= 40 ? SOFT : "#f87171"
                    }}>{r.atsScore}<span className="text-gray-300 font-normal">/100</span></span>
                  ) : <span className="text-gray-300 text-xs">—</span>}
                </div>
                <div className="col-span-2">
                  {(r as any).keywordMatch != null ? (
                    <span className="text-xs font-medium text-gray-500">{Math.round((r as any).keywordMatch)}%</span>
                  ) : <span className="text-gray-300 text-xs">—</span>}
                </div>
                <div className="col-span-1 flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/builder?id=${r.id}`}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <Target className="w-3.5 h-3.5" />
                  </Link>
                  <button onClick={() => handleDelete(r.id)}
                    className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                    {deleting === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  );
}
