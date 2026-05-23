"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, FileDown } from "lucide-react";
import ResumeTemplate from "./ResumeTemplate";
import { ResumeData } from "@/types";
import toast from "react-hot-toast";

interface ResumePreviewProps {
  resumeData: ResumeData | null;
  isOptimizing?: boolean;
  pageCount?: string;
}

export default function ResumePreview({ resumeData, isOptimizing, pageCount = "1" }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!resumeData) return;

    const toastId = toast.loading("Generating PDF, this takes a few seconds...");
    try {
      const res = await fetch("/api/resume/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Export failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resumeData.personalInfo.name.replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Export failed. Please try again.",
        { id: toastId }
      );
    }
  };

  // Scale the 816px resume to fit the preview pane
  const SCALE = 0.72;
  const RESUME_W = 816;
  const RESUME_H = 1056;

  return (
    <div className="flex flex-col h-full">
      {/* Preview header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-whitensparent shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Resume Preview
          </h2>
          {resumeData && (
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {pageCount === "auto" ? "Auto length" : `${pageCount} page`}
            </span>
          )}
        </div>
        {resumeData && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#C8E83C] hover:bg-[#d4ef55] text-[#0D3B2C] text-xs font-semibold transition-colors shadow-md shadow-[#1E5C40]/25"
          >
            <FileDown className="w-3.5 h-3.5" />
            Download PDF
          </motion.button>
        )}
      </div>

      {/* Preview body */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-200 p-6 flex justify-center resume-scroll"
      >
        {isOptimizing ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="relative">
              <Loader2 className="w-10 h-10 animate-spin text-[#7ECBC4]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Optimizing your resume with AI...</p>
              <p className="text-xs text-slate-400 mt-1">Usually takes 20-35 seconds</p>
            </div>
          </div>
        ) : resumeData ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Outer container at scaled size */}
            <div
              className="shadow-2xl shadow-black/50 ring-1 ring-white/5"
              style={{
                width: RESUME_W * SCALE,
                overflow: "hidden",
              }}
            >
              {/* Inner at full size, scaled down */}
              <div
                style={{
                  width: RESUME_W,
                  transform: `scale(${SCALE})`,
                  transformOrigin: "top left",
                }}
              >
                <ResumeTemplate data={resumeData} />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
            <div className="w-20 h-28 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
              <Download className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">Your optimized resume will appear here</p>
            <p className="text-xs text-slate-300">Upload resume, paste JD, then click Optimize</p>
          </div>
        )}
      </div>
    </div>
  );
}
