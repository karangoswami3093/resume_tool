"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { JDAnalysis } from "@/types";

interface JDInputPanelProps {
  value: string;
  onChange: (v: string) => void;
  jdAnalysis: JDAnalysis | null;
}

export default function JDInputPanel({ value, onChange, jdAnalysis }: JDInputPanelProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the full job description here...&#10;&#10;Include requirements, responsibilities, and preferred qualifications for best results."
          className="w-full h-40 px-3 py-2.5 bg-slate-50 dark:bg-[#AED6CF]/10 border border-slate-200 dark:border-[#AED6CF]/30 rounded-xl text-sm text-slate-800 dark:text-white/80 placeholder-slate-300 dark:placeholder-white/20 resize-none focus:outline-none focus:border-[#91ADC8] dark:focus:border-[#647FBC]/50 transition-colors"
        />
        <div className="absolute bottom-2.5 right-3 text-xs text-slate-300 dark:text-white/20">
          {value.length} chars
        </div>
      </div>

      {value.length > 100 && (
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/40">
          <Briefcase className="w-3.5 h-3.5" />
          <span>
            {value.length > 500
              ? "Good length. Detailed JD improves optimization accuracy."
              : "Add more details for better keyword extraction"}
          </span>
        </div>
      )}

      {jdAnalysis && (
        <div className="rounded-xl border border-slate-200 dark:border-[#AED6CF]/30 bg-slate-50 dark:bg-[#AED6CF]/10 overflow-hidden">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2 text-xs font-semibold text-[#91ADC8] dark:text-[#647FBC]">
              <Sparkles className="w-3.5 h-3.5" />
              JD Analysis
            </span>
            {showAnalysis ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 dark:text-white/30" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-white/30" />
            )}
          </button>

          {showAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="px-3 pb-3 space-y-2.5"
            >
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Role</p>
                  <p className="text-xs font-semibold text-white">{jdAnalysis.jobTitle}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Level</p>
                  <p className="text-xs font-semibold text-white">{jdAnalysis.experienceLevel}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Priority Keywords</p>
                <div className="flex flex-wrap gap-1">
                  {jdAnalysis.priorityKeywords.slice(0, 10).map((kw, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-[#647FBC]/15 text-[#647FBC] rounded text-[10px] border border-[#647FBC]/20">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {jdAnalysis.requiredSkills.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {jdAnalysis.requiredSkills.slice(0, 8).map((skill, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-[#AED6CF]/20 text-[#AED6CF] rounded text-[10px] border border-[#AED6CF]/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {jdAnalysis.tools.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Tools & Technologies</p>
                  <p className="text-xs text-white/50">{jdAnalysis.tools.join(", ")}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
