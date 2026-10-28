import type { FocusPart, FocusSummary } from "@/lib/types";

/** Running totals for one part of the Check-in (e.g. "read:content"). */
export type SegmentStats = {
  trackedMs: number;
  onMs: number;
  lookAways: number;
  /** Completed focus stretches, in ms. */
  stretches: number[];
};

export const emptySegment = (): SegmentStats => ({
  trackedMs: 0,
  onMs: 0,
  lookAways: 0,
  stretches: [],
});

/** Segment keys are `${activityId}:${stage}`; map them to what the student did. */
export function partOf(segment: string): FocusPart {
  const [activity, stage] = segment.split(":");
  if (stage === "questions") return "questions";
  if (activity === "watch") return "video";
  if (activity === "numbers") return "numbers";
  if (activity === "trace") return "trace";
  return "text";
}

/** Ignore parts with less than this much camera time — too short to say anything. */
const MIN_TRACKED_MS = 3000;

export function summarize(
  segments: Record<string, SegmentStats>,
): FocusSummary | null {
  const byPart = new Map<FocusPart, SegmentStats>();
  for (const [key, s] of Object.entries(segments)) {
    const part = partOf(key);
    const acc = byPart.get(part) ?? emptySegment();
    acc.trackedMs += s.trackedMs;
    acc.onMs += s.onMs;
    acc.lookAways += s.lookAways;
    acc.stretches.push(...s.stretches);
    byPart.set(part, acc);
  }

  const parts = (
    ["text", "video", "numbers", "trace", "questions"] as const
  )
    .map((part) => ({ part, s: byPart.get(part) }))
    .filter((p): p is { part: FocusPart; s: SegmentStats } =>
      Boolean(p.s && p.s.trackedMs >= MIN_TRACKED_MS),
    )
    .map(({ part, s }) => ({
      part,
      pct: Math.round((s.onMs / s.trackedMs) * 100),
      longestSec: Math.round(Math.max(0, ...s.stretches) / 1000),
      avgSec: s.stretches.length
        ? Math.round(s.stretches.reduce((a, b) => a + b, 0) / s.stretches.length / 1000)
        : 0,
      lookAways: s.lookAways,
      minutes: Math.round((s.trackedMs / 60000) * 10) / 10,
    }));

  if (!parts.length) return null;

  const all = [...byPart.values()];
  const tracked = all.reduce((n, s) => n + s.trackedMs, 0);
  const on = all.reduce((n, s) => n + s.onMs, 0);
  const stretches = all.flatMap((s) => s.stretches);
  return {
    at: new Date().toISOString(),
    pct: Math.round((on / tracked) * 100),
    longestSec: Math.round(Math.max(0, ...stretches) / 1000),
    avgSec: stretches.length
      ? Math.round(stretches.reduce((a, b) => a + b, 0) / stretches.length / 1000)
      : 0,
    lookAways: all.reduce((n, s) => n + s.lookAways, 0),
    parts,
  };
}

export function formatSec(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const PART_LABEL: Record<FocusPart, { en: string; ar: string }> = {
  text: { en: "Reading", ar: "القراءة" },
  video: { en: "Video", ar: "الفيديو" },
  numbers: { en: "Numbers", ar: "الأعداد" },
  trace: { en: "Trace", ar: "التتبع" },
  questions: { en: "Questions", ar: "الأسئلة" },
};

/** A strategy drawn from the focus pattern — about formats, never about the person. */
export function focusTip(f: FocusSummary, ar: boolean): string {
  const text = f.parts.find((p) => p.part === "text");
  const video = f.parts.find((p) => p.part === "video");
  if (text && video && video.pct - text.pct >= 10) {
    return ar
      ? `بقيت مركّزاً مع الفيديو أكثر (${video.pct}٪ مقابل ${text.pct}٪ للنص). جرّب النسخ المرئية أو الصوتية للمحاضرات.`
      : `Video held your focus best (${video.pct}% vs ${text.pct}% for text). Try video or audio versions of readings.`;
  }
  if (text && video && text.pct - video.pct >= 10) {
    return ar
      ? `بقيت مركّزاً مع النص أكثر (${text.pct}٪ مقابل ${video.pct}٪ للفيديو). اطلب النصوص المكتوبة للمحاضرات المسجّلة.`
      : `Text held your focus best (${text.pct}% vs ${video.pct}% for video). Ask for transcripts of recorded lectures.`;
  }
  if (f.avgSec > 0 && f.avgSec < 45) {
    return ar
      ? `فترات تركيزك اليوم حوالي ${formatSec(f.avgSec)}. «جزء واحد في كل مرة» يناسب هذا الإيقاع — فعّله للقراءات الطويلة.`
      : `Your focus stretches today were about ${formatSec(f.avgSec)}. “One chunk at a time” fits that rhythm — turn it on for long readings.`;
  }
  return ar
    ? "حافظت على تركيز ثابت اليوم. فترات راحة قصيرة كل 25 دقيقة تساعد في القراءات الطويلة."
    : "Your focus was steady today. Short breaks every 25 minutes help with long readings.";
}
