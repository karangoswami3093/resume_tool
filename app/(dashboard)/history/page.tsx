"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Calendar, TrendingUp, Sparkles, Clock, Target } from "lucide-react";
import { SavedResume } from "@/types";
import { scoreColor, scoreLabel } from "@/lib/utils";
import { getLocalHistory, LocalResume } from "@/lib/localHistory";
import Link from "next/link";
import toast from "react-hot-toast";

function mergeResumes(api: SavedResume[], local: LocalResume[]): SavedResume[] {
  const apiIds = new Set(api.map((r) => r.id));
  const localOnly = local
    .filter((r) => !apiIds.has(r.id))
    .map((r) => ({ ...r } as unknown as SavedResume));
  return [...api, ...localOnly].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function getScoreBg(score: number) {
  if (score >= 80) return "from-[#647FBC] to-[#91ADC8]";
  if (score >= 60) return "from-[#91ADC8] to-[#AED6CF]";
  if (score >= 40) return "from-[#AED6CF] to-[#1e2a5e]";
  return "from-red-500 to-red-700";
}

export default function HistoryPage() {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const local = getLocalHistory();
    fetch("/api/resume/list")
      .then((r) => r.json())
      .then((d) => setResumes(mergeResumes(d.resumes || [], local)))
      .catch(() => setResumes(local as unknown as SavedResume[]))
      .finally(() => setIsLoading(false));
  }, []);

  const bestScore = resumes.length > 0
    ? Math.max(...resumes.map((r) => r.atsScore || 0))
    : null;

  return (
    <div className="h-screen overflow-y-auto bg-[#FAFDD6] dark:bg-[#1e2a5e]">
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Optimization History</h1>
        <p className="text-sm text-slate-500 dark:text-white/40 mt-1">
          Track your resume ATS score improvements over time
        </p>
      </div>

      {/* Summary bar */}
      {resumes.length > 0 && (
        <div className="flex items-center gap-6 mb-8 p-4 bg-white dark:bg-[#1e2a5e]/60 border border-slate-200 dark:border-[#AED6CF]/25 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-slate-400 dark:text-white/30" />
            <span className="text-slate-500 dark:text-white/40">{resumes.length} optimization{resumes.length > 1 ? "s" : ""}</span>
          </div>
          {bestScore != null && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-[#AED6CF]" />
              <span className="text-slate-500 dark:text-white/40">Best score: </span>
              <span className="font-bold text-[#AED6CF] dark:text-[#AED6CF]">{bestScore}/100</span>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-slate-400 dark:text-white/30 animate-spin" />
        </div>
      ) : resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#AED6CF]/15 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-slate-300 dark:text-white/20" />
          </div>
          <p className="text-slate-500 dark:text-white/40 text-sm font-medium">No optimization history yet</p>
          <Link
            href="/builder"
            className="text-sm text-[#91ADC8] dark:text-[#647FBC] hover:text-[#91ADC8] dark:hover:text-[#647FBC] font-semibold transition-colors"
          >
            Start optimizing your resume
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume, i) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#1e2a5e]/60 border border-slate-200 dark:border-[#AED6CF]/25 rounded-2xl p-5 shadow-sm hover:border-[#91ADC8]/40 dark:hover:border-[#647FBC]/20 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{resume.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 dark:text-white/30">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(resume.createdAt).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                      })}
                    </span>
                    {resume.isOptimized && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#647FBC]/10 dark:bg-[#647FBC]/10 text-[#91ADC8] dark:text-[#647FBC] rounded-full text-[10px] font-semibold">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI
                      </span>
                    )}
                  </div>
                </div>

                {resume.atsScore != null && (
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Target className="w-3.5 h-3.5 text-slate-400 dark:text-white/20" />
                        <span className={`text-2xl font-bold ${scoreColor(resume.atsScore)}`}>
                          {resume.atsScore}
                        </span>
                        <span className="text-sm text-slate-400 dark:text-white/30">/100</span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-white/30 text-right">{scoreLabel(resume.atsScore)}</p>
                    </div>
                  </div>
                )}
              </div>

              {resume.atsScore != null && (
                <div className="mb-4">
                  <div className="h-2 bg-slate-100 dark:bg-[#AED6CF]/20 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${getScoreBg(resume.atsScore)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${resume.atsScore}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400 dark:text-white/30">
                  {resume.keywordMatch != null && (
                    <span>Keyword match: <span className="font-semibold text-slate-600 dark:text-white/50">{Math.round(resume.keywordMatch)}%</span></span>
                  )}
                </div>
                <Link
                  href={`/builder?id=${resume.id}`}
                  className="text-xs font-semibold text-[#91ADC8] dark:text-[#647FBC] hover:text-[#91ADC8] dark:hover:text-[#647FBC] transition-colors"
                >
                  Open in Builder
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
