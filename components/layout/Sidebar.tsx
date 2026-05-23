"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, WandSparkles, History,
  ChevronLeft, ChevronRight, Sun, Moon,
  FileText, Settings, HelpCircle, Zap, LogOut,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const NAV = [
  {
    section: "MAIN",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/builder", icon: WandSparkles, label: "Builder" },
      { href: "/history", icon: History, label: "History" },
    ],
  },
  {
    section: "EXPLORE",
    items: [
      { href: "/templates", icon: FileText, label: "Templates" },
      { href: "/settings", icon: Settings, label: "Settings" },
      { href: "/help", icon: HelpCircle, label: "Help" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar_collapsed", String(next));
  };

  const W = collapsed ? 64 : 240;

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-white dark:bg-[#1e2a5e] border-r border-gray-100 dark:border-[#AED6CF]/25 shrink-0 overflow-hidden"
      style={{ width: W }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-100 dark:border-[#AED6CF]/25 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-[#647FBC] flex items-center justify-center shadow-lg shadow-[#647FBC]/25 shrink-0">
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="ml-2.5 font-bold text-sm text-gray-900 dark:text-white tracking-tight whitespace-nowrap"
            >
              Resume<span className="text-[#91ADC8]">AI</span>
            </motion.span>
          )}
        </AnimatePresence>
        <div className="flex-1" />
        <button
          onClick={toggle}
          className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all shrink-0"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAV.map((group) => (
          <div key={group.section}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-1.5 text-[10px] font-semibold text-gray-400 dark:text-white/25 uppercase tracking-widest"
                >
                  {group.section}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {group.items.map((navItem) => {
                const isActive = pathname === navItem.href || pathname.startsWith(navItem.href + "/");
                return (
                  <Link
                    key={navItem.href}
                    href={navItem.href}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? "bg-[#647FBC]/10 dark:bg-[#647FBC]/10 text-[#91ADC8] dark:text-[#647FBC]"
                        : "text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                    title={collapsed ? navItem.label : undefined}
                  >
                    {/* Active left bar */}
                    {isActive && (
                      <motion.div
                        layoutId="activeBar"
                        className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#647FBC] rounded-full"
                      />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.18, rotate: isActive ? 0 : 8 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="shrink-0"
                    >
                      <navItem.icon
                        className="w-4 h-4"
                        strokeWidth={isActive ? 2.5 : 1.8}
                      />
                    </motion.div>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.12 }}
                          className="whitespace-nowrap"
                        >
                          {navItem.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div className="absolute left-full ml-2.5 px-2.5 py-1 bg-gray-900 dark:bg-[#AED6CF]/20 text-white text-xs rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-white/10">
                        {navItem.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-gray-100 dark:border-[#AED6CF]/25">

        {/* Upgrade card — only when expanded */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="mx-3 mt-3 p-3 rounded-xl bg-[#647FBC]/10 dark:bg-[#647FBC]/10 border border-[#91ADC8]/20 dark:border-[#647FBC]/20"
            >
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-gray-700 dark:text-white/70">Free Plan</p>
                <span className="text-[10px] text-[#91ADC8] dark:text-[#647FBC] font-bold">3/10 resumes</span>
              </div>
              <div className="h-1.5 bg-[#91ADC8]/15 dark:bg-[#647FBC]/15 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-[#647FBC] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "30%" }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                />
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-1 text-[11px] font-semibold text-[#91ADC8] dark:text-[#647FBC] hover:text-[#AED6CF] dark:hover:text-[#647FBC] transition-colors"
              >
                <TrendingUp className="w-3 h-3" />
                Upgrade Your Plan
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Theme + user row */}
        <div className="p-3 flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all shrink-0 ${
                collapsed ? "w-8 h-8 justify-center" : ""
              } text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10`}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-medium whitespace-nowrap"
                  >
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 flex-1 min-w-0 ml-auto"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#91ADC8] to-[#91ADC8] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                  U
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">User</p>
                  <p className="text-[10px] text-gray-400 dark:text-white/30 truncate">Free plan</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
