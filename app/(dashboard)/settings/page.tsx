"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Trash2, RotateCcw, Check, AlertTriangle } from "lucide-react";
import { useTheme } from "next-themes";

const section = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-[#3B7597]/25 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-white">{label}</p>
        <p className="text-xs text-slate-400 dark:text-white/35 mt-0.5">{description}</p>
      </div>
      <div className="ml-6 shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [defaultMode, setDefaultMode] = useState("standard");
  const [defaultPages, setDefaultPages] = useState("1");
  const [clearConfirm, setClearConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("resumeai_default_mode");
    if (saved) setDefaultMode(saved);
    const savedPages = localStorage.getItem("resumeai_default_pages");
    if (savedPages) setDefaultPages(savedPages);
  }, []);

  const saveMode = (val: string) => {
    setDefaultMode(val);
    localStorage.setItem("resumeai_default_mode", val);
  };

  const savePages = (val: string) => {
    setDefaultPages(val);
    localStorage.setItem("resumeai_default_pages", val);
  };

  const clearHistory = () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }
    localStorage.removeItem("resumeai_history");
    setClearConfirm(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  };

  const modes = [
    { value: "standard", label: "Standard", desc: "Balanced quality and speed" },
    { value: "aggressive", label: "Aggressive ATS", desc: "Maximum keyword density" },
    { value: "conservative", label: "Conservative", desc: "Minimal changes to your content" },
    { value: "star", label: "STAR Bullets", desc: "All bullets use S.T.A.R structure" },
  ];

  return (
    <div className="h-screen overflow-y-auto bg-white dark:bg-[#093C5D]">
      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-400 dark:text-white/40 mt-1">
            Manage your preferences and application defaults.
          </p>
        </div>

        {/* Appearance */}
        <motion.div
          variants={section}
          initial="hidden"
          animate="show"
          className="bg-white dark:bg-[#093C5D]/60 border border-slate-200 dark:border-[#3B7597]/25 rounded-2xl p-5 mb-4 shadow-sm"
        >
          <h2 className="text-xs font-semibold text-slate-400 dark:text-white/30 uppercase tracking-widest mb-1">Appearance</h2>

          <SettingRow label="Theme" description="Choose between light and dark interface">
            {mounted && (
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    theme === "light"
                      ? "bg-[#5DF8D8] border-[#5DF8D8] text-[#093C5D]"
                      : "bg-slate-100 dark:bg-[#3B7597]/20 border-slate-200 dark:border-[#3B7597]/30 text-slate-600 dark:text-white/50 hover:border-[#6FD1D7] dark:hover:border-[#5DF8D8]"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    theme === "dark"
                      ? "bg-[#5DF8D8] border-[#5DF8D8] text-[#093C5D]"
                      : "bg-slate-100 dark:bg-[#3B7597]/20 border-slate-200 dark:border-[#3B7597]/30 text-slate-600 dark:text-white/50 hover:border-[#6FD1D7] dark:hover:border-[#5DF8D8]"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" /> Dark
                </button>
              </div>
            )}
          </SettingRow>
        </motion.div>

        {/* Builder Defaults */}
        <motion.div
          variants={section}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-[#093C5D]/60 border border-slate-200 dark:border-[#3B7597]/25 rounded-2xl p-5 mb-4 shadow-sm"
        >
          <h2 className="text-xs font-semibold text-slate-400 dark:text-white/30 uppercase tracking-widest mb-1">Builder Defaults</h2>

          <SettingRow label="Default Generation Mode" description="Pre-selected mode when you open the builder">
            <select
              value={defaultMode}
              onChange={(e) => saveMode(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#3B7597]/20 border border-slate-200 dark:border-[#3B7597]/30 text-slate-700 dark:text-white/70 focus:outline-none focus:border-[#6FD1D7] dark:focus:border-[#5DF8D8]"
            >
              {modes.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </SettingRow>

          <SettingRow label="Default Page Count" description="Target resume length when generating">
            <select
              value={defaultPages}
              onChange={(e) => savePages(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#3B7597]/20 border border-slate-200 dark:border-[#3B7597]/30 text-slate-700 dark:text-white/70 focus:outline-none focus:border-[#6FD1D7] dark:focus:border-[#5DF8D8]"
            >
              <option value="1">1 Page</option>
              <option value="2">2 Pages</option>
            </select>
          </SettingRow>
        </motion.div>

        {/* Data & Privacy */}
        <motion.div
          variants={section}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#093C5D]/60 border border-slate-200 dark:border-[#3B7597]/25 rounded-2xl p-5 shadow-sm"
        >
          <h2 className="text-xs font-semibold text-slate-400 dark:text-white/30 uppercase tracking-widest mb-1">Data & Privacy</h2>

          <SettingRow
            label="Clear Resume History"
            description="Permanently delete all locally saved resumes. This cannot be undone."
          >
            {cleared ? (
              <span className="flex items-center gap-1.5 text-xs text-[#3B7597] font-semibold">
                <Check className="w-3.5 h-3.5" /> Cleared
              </span>
            ) : clearConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6FD1D7] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Sure?
                </span>
                <button
                  onClick={clearHistory}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setClearConfirm(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-[#3B7597]/20 text-slate-600 dark:text-white/50 text-xs font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </button>
            )}
          </SettingRow>

          <SettingRow label="Storage" description="Where your resume data is stored">
            <span className="text-xs text-slate-500 dark:text-white/40 bg-slate-100 dark:bg-[#3B7597]/20 px-2.5 py-1 rounded-lg">
              Local browser only
            </span>
          </SettingRow>
        </motion.div>

        {/* Version info */}
        <p className="text-center text-[11px] text-slate-300 dark:text-white/20 mt-8">
          ResumeAI v1.0.0 - Powered by Claude
        </p>
      </div>
    </div>
  );
}
