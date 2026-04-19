import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatViewCount(value?: number | string): string {
  const count = Number(value ?? 0);
  if (!Number.isFinite(count)) return "0 views";
  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  return `${formatter.format(count)} views`;
}

export function formatCount(value?: number | string): string {
  const count = Number(value ?? 0);
  if (!Number.isFinite(count)) return "0";
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);
}

export function formatDuration(totalSeconds?: number | string): string {
  const seconds = Math.max(0, Number(totalSeconds ?? 0));
  if (!Number.isFinite(seconds)) return "0:00";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function enhanceYouTubeThumbnail(url?: string): string {
  if (!url) return "";

  return url
    .replace("/default.jpg", "/hqdefault.jpg")
    .replace("/mqdefault.jpg", "/hq720.jpg")
    .replace("/hqdefault.jpg", "/hq720.jpg");
}

export function getBestThumbnail(thumbnails?: string[]): string {
  const candidates = (thumbnails || []).filter(Boolean);
  if (!candidates.length) return "";

  const best = candidates[candidates.length - 1] || candidates[0];
  return enhanceYouTubeThumbnail(best);
}

export function formatRelativeDate(input?: string | number | Date): string {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";

  const now = Date.now();
  const diffSeconds = Math.max(1, Math.floor((now - date.getTime()) / 1000));

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const [unit, secondsPerUnit] of units) {
    if (diffSeconds >= secondsPerUnit) {
      const value = -Math.floor(diffSeconds / secondsPerUnit);
      return rtf.format(value, unit);
    }
  }

  return "just now";
}

export function formatExactDate(input?: string | number | Date): string {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function parseYouTubeTimeToSeconds(timestamp: string): number {
  const parts = timestamp.split(":").map((p) => Number(p));
  if (parts.some((p) => Number.isNaN(p))) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
}

export type ParsedDescriptionPart =
  | { type: "text"; value: string }
  | { type: "timestamp"; value: string; seconds: number }
  | { type: "url"; value: string; href: string }
  | { type: "hashtag"; value: string; tag: string };

export function parseDescriptionText(text: string): ParsedDescriptionPart[] {
  const tokenRegex = /(https?:\/\/[^\s]+|(?:\d{1,2}:)?\d{1,2}:\d{2}|#[A-Za-z0-9_]+)/g;
  const parts: ParsedDescriptionPart[] = [];
  let lastIndex = 0;

  let match = tokenRegex.exec(text);
  while (match) {
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, matchIndex) });
    }

    const token = match[0];
    if (token.startsWith("http://") || token.startsWith("https://")) {
      parts.push({ type: "url", value: token, href: token });
    } else if (token.startsWith("#")) {
      parts.push({ type: "hashtag", value: token, tag: token.slice(1) });
    } else {
      parts.push({
        type: "timestamp",
        value: token,
        seconds: parseYouTubeTimeToSeconds(token),
      });
    }

    lastIndex = matchIndex + token.length;
    match = tokenRegex.exec(text);
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts;
}

export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delay = 300,
) {
  let timer: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 2,
): Promise<Response> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      const response = await fetch(input, init);
      if (response.ok) return response;

      if (response.status >= 400 && response.status < 500) {
        return response;
      }
    } catch (error) {
      lastError = error;
    }
    attempt += 1;
  }

  if (lastError instanceof Error) throw lastError;
  throw new Error("Request failed after retries");
}
