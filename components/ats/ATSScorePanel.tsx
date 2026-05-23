"use client";

import { motion } from "framer-motion";
import { ATSScore, JDAnalysis } from "@/types";
import { scoreColor, scoreLabel, scoreRingColor } from "@/lib/utils";
import { CheckCircle2, XCircle, Lightbulb, TrendingUp, ChevronDown, ChevronUp, Target } from "lucide-react";
import { useState } from "react";

interface ATSScorePanelProps {
  score: ATSScore | null;
  jdAnalysis: JDAnalysis | null;
  isLoading?: boolean;
}

function ScoreRing({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.min(value / max, 1);
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="currentColor" className="text-slate-200 dark:text-[#3B7597]" strokeWidth="4" />
        <motion.circle
          cx="26" cy="26" r={r}
          fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 26 26)"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <text x="26" y="30" textAnchor="middle" fill="currentColor" className="text-slate-700 dark:text-white" fontSize="10" fontWeight="600">{value}</text>
      </svg>
      <span className="text-[10px] text-slate-400 dark:text-white/50 text-center leading-tight">{label}</span>
    </div>
  );
}

export default function ATSScorePanel({ score, jdAnalysis, isLoading }: ATSScorePanelProps) {
  const [showMissing, setShowMissing] = useState(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400 dark:text-white/40 text-sm animate-pulse">Calculating ATS score...</div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#3B7597]/20 flex items-center justify-center">
          <Target className="w-8 h-8 text-slate-300 dark:text-white/20" />
        </div>
        <p className="text-slate-400 dark:text-white/40 text-sm leading-relaxed">
          Upload your resume and paste a job description, then click Optimize to see your ATS score.
        </p>
      </div>
    );
  }

  const overallColor = scoreRingColor(score.overall);
  const overallPct = score.overall;
  const overallCirc = 2 * Math.PI * 45;
  const overallDash = overallCirc * (overallPct / 100);

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">

      {/* Main Score */}
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" className="text-slate-200 dark:text-[#3B7597]" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="45"
              fill="none" stroke={overallColor} strokeWidth="8"
              strokeDasharray={`${overallDash} ${overallCirc}`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              initial={{ strokeDasharray: `0 ${overallCirc}` }}
              animate={{ strokeDasharray: `${overallDash} ${overallCirc}` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-bold text-slate-900 dark:text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score.overall}
            </motion.span>
            <span className="text-xs text-slate-400 dark:text-white/40">/100</span>
          </div>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold ${scoreColor(score.overall)}`}>
            {scoreLabel(score.overall)}
          </p>
          <p className="text-xs text-slate-400 dark:text-white/40">ATS Compatibility Score</p>
        </div>
      </div>

      {/* Keyword Match */}
      <div className="bg-slate-50 dark:bg-[#3B7597]/15 rounded-xl p-3 border border-slate-100 dark:border-[#3B7597]/25">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-white/60 uppercase tracking-wider">Keyword Match</span>
          <span className={`text-sm font-bold ${scoreColor(score.keywordMatchPercentage)}`}>
            {score.keywordMatchPercentage}%
          </span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-[#3B7597]/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: scoreRingColor(score.keywordMatchPercentage) }}
            initial={{ width: 0 }}
            animate={{ width: `${score.keywordMatchPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Score Breakdown */}
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-white/50 uppercase tracking-wider mb-3">Score Breakdown</p>
        <div className="grid grid-cols-3 gap-2">
          <ScoreRing value={score.breakdown.keywordMatch} max={40} color={scoreRingColor(score.breakdown.keywordMatch * 2.5)} label="Keywords" />
          <ScoreRing value={score.breakdown.skillsMatch} max={20} color={scoreRingColor(score.breakdown.skillsMatch * 5)} label="Skills" />
          <ScoreRing value={score.breakdown.formatScore} max={20} color={scoreRingColor(score.breakdown.formatScore * 5)} label="Format" />
        </div>
      </div>

      {/* Matched Keywords */}
      {score.matchedKeywords.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3B7597]" />
            Matched ({score.matchedKeywords.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {score.matchedKeywords.slice(0, 12).map((kw, i) => (
              <span key={i} className="px-2 py-0.5 bg-[#3B7597]/10 text-[#3B7597] dark:text-[#3B7597] rounded-full text-[10px] font-medium border border-[#3B7597]/20">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {score.missingKeywords.length > 0 && (
        <div>
          <button
            onClick={() => setShowMissing(!showMissing)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-white/50 uppercase tracking-wider mb-2"
          >
            <span className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-500" />
              Missing ({score.missingKeywords.length})
            </span>
            {showMissing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showMissing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap gap-1.5"
            >
              {score.missingKeywords.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 rounded-full text-[10px] font-medium border border-red-200 dark:border-red-500/20">
                  {kw}
                </span>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Suggestions */}
      {score.suggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-[#6FD1D7]" />
            Suggestions
          </p>
          <div className="space-y-1.5">
            {score.suggestions.map((s, i) => (
              <div key={i} className="flex gap-2 bg-[#5DF8D8]/10 dark:bg-[#3B7597]/15 border border-[#6FD1D7]/20 dark:border-[#3B7597]/25 rounded-lg p-2.5">
                <span className="text-[#6FD1D7] text-xs mt-0.5">•</span>
                <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {score.strengths.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#6FD1D7]" />
            Strengths
          </p>
          <div className="space-y-1.5">
            {score.strengths.map((s, i) => (
              <div key={i} className="flex gap-2 bg-[#5DF8D8]/10 dark:bg-[#5DF8D8]/10 rounded-lg p-2.5 border border-[#6FD1D7]/20 dark:border-[#5DF8D8]/20">
                <span className="text-[#6FD1D7] text-xs mt-0.5">✓</span>
                <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JD Role Info */}
      {jdAnalysis && (
        <div className="bg-slate-50 dark:bg-[#3B7597]/15 rounded-xl p-3 border border-slate-200 dark:border-[#3B7597]/25">
          <p className="text-xs font-semibold text-slate-400 dark:text-white/50 uppercase tracking-wider mb-2">Target Role</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{jdAnalysis.jobTitle}</p>
          <p className="text-xs text-slate-400 dark:text-white/40">{jdAnalysis.industry} · {jdAnalysis.experienceLevel}</p>
        </div>
      )}
    </div>
  );
}
