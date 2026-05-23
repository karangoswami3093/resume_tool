"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/builder",   label: "Builder" },
  { href: "/history",   label: "History" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/90 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-screen-xl mx-auto h-full px-6 flex items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#C8E83C" }}
          >
            <span className="font-black text-[13px] leading-none" style={{ color: "#0D3B2C" }}>r</span>
          </div>
          <span className="font-black text-sm tracking-tight text-slate-900">
            resu<span style={{ color: "#1E5C40" }}>mint</span>
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
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "rgba(30,92,64,0.1)" }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className={isActive ? "text-[#1E5C40] relative z-10 font-semibold" : "text-slate-500 hover:text-slate-900 relative z-10"}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #1E5C40, #3A7A62)" }}
        >
          U
        </div>
      </div>
    </header>
  );
}
