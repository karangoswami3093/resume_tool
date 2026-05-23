"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, WandSparkles, History,
  ChevronLeft, ChevronRight,
  FileText, Settings, HelpCircle, TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  {
    section: "MAIN",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/builder",   icon: WandSparkles,    label: "Builder" },
      { href: "/history",   icon: History,         label: "History" },
    ],
  },
  {
    section: "EXPLORE",
    items: [
      { href: "/templates", icon: FileText,    label: "Templates" },
      { href: "/settings",  icon: Settings,    label: "Settings" },
      { href: "/help",      icon: HelpCircle,  label: "Help" },
    ],
  },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
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
      className="relative flex flex-col h-screen bg-white border-r border-gray-100 shrink-0 overflow-hidden"
      style={{ width: W }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-100 shrink-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: "#C8E83C" }}
        >
          <span className="font-black text-[15px] leading-none" style={{ color: "#0D3B2C" }}>r</span>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="ml-2.5 font-black text-sm tracking-tight whitespace-nowrap text-gray-900"
            >
              resu<span style={{ color: "#1E5C40" }}>mint</span>
            </motion.span>
          )}
        </AnimatePresence>

        <div className="flex-1" />
        <button
          onClick={toggle}
          className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all shrink-0"
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
                  className="px-3 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest"
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
                        ? "bg-[#1E5C40]/10 text-[#1E5C40]"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    title={collapsed ? navItem.label : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeBar"
                        className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#1E5C40] rounded-full"
                      />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.18, rotate: isActive ? 0 : 8 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="shrink-0"
                    >
                      <navItem.icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 1.8} />
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
                    {collapsed && (
                      <div className="absolute left-full ml-2.5 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
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

      {/* Bottom */}
      <div className="shrink-0 border-t border-gray-100">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="mx-3 mt-3 p-3 rounded-xl border border-[#C8E83C]/50"
              style={{ backgroundColor: "rgba(30,92,64,0.06)" }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-gray-700">Free Plan</p>
                <span className="text-[10px] font-bold" style={{ color: "#1E5C40" }}>3/10 resumes</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(30,92,64,0.12)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "#C8E83C" }}
                  initial={{ width: 0 }}
                  animate={{ width: "30%" }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                />
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-1 text-[11px] font-semibold hover:opacity-80 transition-opacity"
                style={{ color: "#1E5C40" }}
              >
                <TrendingUp className="w-3 h-3" />
                Upgrade Your Plan
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-3 flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #1E5C40, #3A7A62)" }}
          >
            U
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <p className="text-xs font-semibold text-gray-800 truncate">User</p>
                <p className="text-[10px] text-gray-400 truncate">Free plan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
