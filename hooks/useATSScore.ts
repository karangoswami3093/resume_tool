"use client";

import { useState, useCallback } from "react";
import { ATSScore, JDAnalysis, ResumeData } from "@/types";

export function useATSScore() {
  const [score, setScore] = useState<ATSScore | null>(null);
  const [jdAnalysis, setJdAnalysis] = useState<JDAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculate = useCallback(async (resumeData: ResumeData, jdText: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ats/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, jdText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScore(data.score);
      setJdAnalysis(data.jdAnalysis);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { score, jdAnalysis, isLoading, calculate };
}
