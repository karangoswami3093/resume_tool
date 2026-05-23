"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { ResumeData } from "@/types";
import toast from "react-hot-toast";

interface ResumeUploadProps {
  onResumeParsed: (data: ResumeData, rawText: string) => void;
}

export default function ResumeUpload({ onResumeParsed }: ResumeUploadProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [pastedText, setPastedText] = useState("");

  const handleFile = useCallback(
    async (file: File) => {
      setIsParsing(true);
      setUploadedFile(file.name);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/resume/parse", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        onResumeParsed(data.resumeData, data.rawText);
        toast.success("Resume parsed successfully!");
      } catch {
        toast.error("Failed to parse resume. Try pasting as text.");
        setUploadedFile(null);
      } finally {
        setIsParsing(false);
      }
    },
    [onResumeParsed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => { if (acceptedFiles[0]) handleFile(acceptedFiles[0]); },
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handlePasteSubmit = async () => {
    if (!pastedText.trim() || pastedText.trim().length < 100) {
      toast.error("Please paste your full resume text");
      return;
    }
    setIsParsing(true);
    const formData = new FormData();
    formData.append("text", pastedText);
    try {
      const res = await fetch("/api/resume/parse", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onResumeParsed(data.resumeData, pastedText);
      toast.success("Resume loaded successfully!");
    } catch {
      toast.error("Failed to parse. Please check your resume text.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex rounded-lg bg-slate-100 dark:bg-[#3B7597]/15 p-0.5">
        {(["upload", "paste"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === m
                ? "bg-[#5DF8D8] text-[#093C5D] shadow-sm"
                : "text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80"
            }`}
          >
            {m === "upload" ? "Upload File" : "Paste Text"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "upload" ? (
          <motion.div key="upload" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
            {uploadedFile ? (
              <div className="flex items-center gap-3 p-3 bg-[#3B7597]/10 border border-[#3B7597]/20 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-[#3B7597] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{uploadedFile}</p>
                  <p className="text-xs text-slate-400 dark:text-white/40">Parsed successfully</p>
                </div>
                <button onClick={() => setUploadedFile(null)} className="text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? "border-[#5DF8D8] bg-[#5DF8D8]/10 dark:bg-[#5DF8D8]/10"
                    : "border-slate-200 dark:border-[#3B7597]/30 hover:border-[#6FD1D7] dark:hover:border-white/30 bg-slate-50 dark:bg-[#3B7597]/10 hover:bg-slate-100 dark:hover:bg-[#3B7597]/20"
                }`}
              >
                <input {...getInputProps()} />
                {isParsing ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-[#6FD1D7] animate-spin" />
                    <p className="text-sm text-slate-500 dark:text-white/50">Parsing resume...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-[#3B7597]/20 flex items-center justify-center">
                      {isDragActive ? (
                        <Upload className="w-5 h-5 text-[#6FD1D7]" />
                      ) : (
                        <FileText className="w-5 h-5 text-slate-400 dark:text-white/40" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-white/70">
                        {isDragActive ? "Drop it here" : "Drag & drop your resume"}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">PDF, DOCX, or TXT · Max 5MB</p>
                    </div>
                    <button type="button" className="text-xs text-[#6FD1D7] dark:text-[#5DF8D8] hover:text-[#6FD1D7] dark:hover:text-[#5DF8D8] font-medium">
                      or browse files
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="paste" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-2">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your resume content here...&#10;&#10;Include all sections: name, contact, summary, skills, experience, education."
              className="w-full h-36 px-3 py-2.5 bg-slate-50 dark:bg-[#3B7597]/10 border border-slate-200 dark:border-[#3B7597]/30 rounded-xl text-sm text-slate-800 dark:text-white/80 placeholder-slate-300 dark:placeholder-white/20 resize-none focus:outline-none focus:border-[#6FD1D7] dark:focus:border-[#5DF8D8]/50 transition-colors"
            />
            <button
              onClick={handlePasteSubmit}
              disabled={isParsing || pastedText.length < 50}
              className="w-full py-2 rounded-lg bg-[#5DF8D8] hover:bg-[#6FD1D7] disabled:opacity-40 disabled:cursor-not-allowed text-[#093C5D] text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isParsing ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Parsing...</>
              ) : "Load Resume"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
