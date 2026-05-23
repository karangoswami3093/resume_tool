import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function scoreColor(score: number): string {
  if (score >= 80) return "text-[#C8E83C]";
  if (score >= 60) return "text-[#1E5C40]";
  if (score >= 40) return "text-[#7ECBC4]";
  return "text-red-500";
}

export function scoreRingColor(score: number): string {
  if (score >= 80) return "#C8E83C";
  if (score >= 60) return "#1E5C40";
  if (score >= 40) return "#7ECBC4";
  return "#ef4444";
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Fair";
  if (score >= 40) return "Needs Work";
  return "Poor";
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "..." : str;
}
