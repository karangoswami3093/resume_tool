"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/builder", label: "Builder" },
  { href: "/history", label: "History" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/80 dark:bg-[#093C5D]/80 backdrop-blur-xl border-b border-slate-200 dark:border-[#3B7597]/25">
      <div className="max-w-screen-xl mx-auto h-full px-6 flex items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6FD1D7] to-[#6FD1D7] flex items-center justify-center shadow-lg shadow-[#5DF8D8]/25">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
            Resume<span className="text-[#6FD1D7] dark:text-[#5DF8D8]">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-slate-100 dark:bg-white/10 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span
                  className={
                    isActive
                      ? "text-slate-900 dark:text-white relative z-10"
                      : "text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white/80 relative z-10"
                  }
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          )}

          {/* User avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6FD1D7] to-[#6FD1D7] flex items-center justify-center text-xs font-bold text-white shadow-md shadow-[#5DF8D8]/25">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
