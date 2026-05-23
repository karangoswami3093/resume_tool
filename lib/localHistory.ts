const KEY = "resumeai_history";

export interface LocalResume {
  id: string;
  title: string;
  atsScore: number | null;
  keywordMatch: number | null;
  isOptimized: boolean;
  createdAt: string;
  updatedAt: string;
  resumeData: object;
  jdText: string;
}

export function saveToLocalHistory(data: LocalResume): void {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalHistory();
    const updated = [data, ...list.filter((r) => r.id !== data.id)].slice(0, 50);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // ignore quota errors
  }
}

export function getLocalHistory(): LocalResume[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function deleteFromLocalHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const updated = getLocalHistory().filter((r) => r.id !== id);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
