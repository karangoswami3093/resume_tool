"use client";

import { useState, useCallback } from "react";
import { ResumeData, ATSScore, JDAnalysis } from "@/types";
import toast from "react-hot-toast";

export function useResume() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
  const [rawText, setRawText] = useState("");
  const [jdText, setJdText] = useState("");
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [jdAnalysis, setJdAnalysis] = useState<JDAnalysis | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);

  const parseResume = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/resume/parse", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setResumeData(data.resumeData);
    setRawText(data.rawText);
    return data;
  }, []);

  const optimize = useCallback(async () => {
    if (!jdText || jdText.length < 50) {
      toast.error("Please paste a job description");
      return;
    }

    setIsOptimizing(true);
    try {
      const res = await fetch("/api/resume/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, jdText, originalText: rawText, resumeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOptimizedResume(data.resumeData);
      setAtsScore(data.atsScore);
      setJdAnalysis(data.jdAnalysis);
      if (data.resumeId) setResumeId(data.resumeId);
      return data;
    } finally {
      setIsOptimizing(false);
    }
  }, [resumeData, jdText, rawText, resumeId]);

  const exportPDF = useCallback(async () => {
    const target = optimizedResume || resumeData;
    if (!target) return;

    const res = await fetch("/api/resume/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeData: target }),
    });

    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${target.personalInfo.name.replace(/\s+/g, "_")}_Resume.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }, [optimizedResume, resumeData]);

  return {
    resumeData,
    optimizedResume,
    rawText,
    jdText,
    atsScore,
    jdAnalysis,
    isOptimizing,
    resumeId,
    setResumeData,
    setRawText,
    setJdText,
    parseResume,
    optimize,
    exportPDF,
  };
}
