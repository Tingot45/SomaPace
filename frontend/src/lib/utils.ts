import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountInCents: number): string {
  const amount = amountInCents / 100;
  if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `KES ${amount.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `KES ${amount.toFixed(0)}`;
}

export function formatPriceKES(amountKES: number): string {
  return `KES ${amountKES.toLocaleString("en-KE")}`;
}

export function formatDate(dateString: string, style: "full" | "short" | "relative" = "short"): string {
  if (style === "relative") return getTimeAgo(new Date(dateString));
  const d = new Date(dateString);
  if (style === "full")
    return d.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export function getTimeAgo(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date.toISOString(), "short");
}

export function getGradeLabel(grade: number): string {
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  const suffix = grade >= 11 && grade <= 13 ? "th" : suffixes[grade % 10] ?? "th";
  return `Grade ${grade}${suffix}`;
}

export function getSubjectEmoji(subject: string): string {
  const map: Record<string, string> = {
    mathematics: "🔢",
    math: "🔢",
    english: "📖",
    kiswahili: "🗣️",
    science: "🔬",
    physics: "⚛️",
    chemistry: "🧪",
    biology: "🧬",
    geography: "🌍",
    history: "📜",
    "civic education": "🏛️",
    religious: "✝️",
    ict: "💻",
    computer: "💻",
    creative: "🎨",
    home_science: "👩‍🍳",
  };
  const lower = subject.toLowerCase();
  for (const [key, emoji] of Object.entries(map)) {
    if (lower.includes(key)) return emoji;
  }
  return "📚";
}

export function getSubjectColor(subject: string): string {
  const lower = subject.toLowerCase();
  if (lower.includes("math")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
  if (lower.includes("english") || lower.includes("literature"))
    return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
  if (lower.includes("swahili")) return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
  if (lower.includes("science") || lower.includes("physics") || lower.includes("chemistry") || lower.includes("biology"))
    return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
  if (lower.includes("geo")) return "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300";
  if (lower.includes("hist")) return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  return "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300";
}

export function getDifficultyBadge(difficulty: string): string {
  const map: Record<string, string> = {
    easy: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
    medium: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
    hard: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  };
  return map[difficulty] ?? map.easy;
}

export function calculateStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0;
  const sorted = [...new Set(completedDates)]
    .map((d) => new Date(d).toISOString().slice(0, 10))
    .sort()
    .reverse();
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let expected = today;
  for (const date of sorted) {
    if (date === expected) {
      streak++;
      const d = new Date(date);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().slice(0, 10);
    } else if (date < expected) {
      break;
    }
  }
  return streak;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trimEnd() + "…";
}

export function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 180));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-KE");
}

export function getDayName(dateStr: string, short = false): string {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    weekday: short ? "narrow" : "short",
  });
}

export function getWeeklyDays(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}