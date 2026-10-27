import type {
  AdjustmentKey,
  Locale,
  PassportEvidence,
} from "@/lib/types";

type Text = Record<Locale, string>;

/** What the student tried, and the flexible adjustment it can justify. */
export const ADJUSTMENTS: Record<AdjustmentKey, { tool: Text; ask: Text }> = {
  tts: {
    tool: { en: "Text-to-speech", ar: "تحويل النص إلى كلام" },
    ask: {
      en: "Readings as accessible text, so read-aloud works",
      ar: "القراءات بنص قابل للوصول ليعمل القارئ الصوتي",
    },
  },
  spacing: {
    tool: { en: "Wider spacing", ar: "التباعد الأوسع" },
    ask: {
      en: "Materials in an editable format (I adjust the spacing)",
      ar: "المواد بصيغة قابلة للتعديل (أضبط التباعد)",
    },
  },
  dyslexiaFont: {
    tool: { en: "Reading-friendly font", ar: "الخط المريح للقراءة" },
    ask: {
      en: "Materials in an editable format (I change the font)",
      ar: "المواد بصيغة قابلة للتعديل (أغيّر الخط)",
    },
  },
  chunking: {
    tool: { en: "Chunking", ar: "تقسيم النص" },
    ask: {
      en: "Long tasks split into steps with a short summary",
      ar: "تقسيم المهام الطويلة إلى خطوات مع ملخص قصير",
    },
  },
  untimed: {
    tool: { en: "No hard timer", ar: "دون مؤقت صارم" },
    ask: {
      en: "+25% time on timed quizzes",
      ar: "وقت إضافي ‎+25٪ في الاختبارات المؤقتة",
    },
  },
};

export const ADJUSTMENT_KEYS = Object.keys(ADJUSTMENTS) as AdjustmentKey[];

/** Demo timetable for Layla. Dr. Sara Khan is the faculty persona. */
export const COURSES = [
  { course: "ENG 101", instructor: "Dr. Sara Khan" },
  { course: "MATH 105", instructor: "Dr. Sara Khan" },
  { course: "BIO 210", instructor: "Dr. Khalid Rahman" },
];

/** Smallest gain (in accuracy) we are willing to call “helps”. */
const MIN_GAIN = 0.1;

export function rate([correct, total]: [number, number]) {
  return total ? correct / total : null;
}

export type Verdict = "helps" | "no_difference" | "not_enough";

export function verdict(e: PassportEvidence | undefined): Verdict {
  if (!e) return "not_enough";
  const w = rate(e.with);
  const wo = rate(e.without);
  if (w === null || wo === null || e.with[1] + e.without[1] < 3) return "not_enough";
  return w - wo >= MIN_GAIN ? "helps" : "no_difference";
}

export function mergeEvidence(
  a: Partial<Record<AdjustmentKey, PassportEvidence>>,
  b: Partial<Record<AdjustmentKey, PassportEvidence>>,
) {
  const out = { ...a };
  for (const key of ADJUSTMENT_KEYS) {
    const add = b[key];
    if (!add) continue;
    const prev = out[key];
    out[key] = prev
      ? {
          with: [prev.with[0] + add.with[0], prev.with[1] + add.with[1]],
          without: [prev.without[0] + add.without[0], prev.without[1] + add.without[1]],
        }
      : add;
  }
  return out;
}

/** One line a teacher can read: evidence, never a diagnosis. */
export function evidenceLine(e: PassportEvidence, locale: Locale) {
  const pct = (n: number | null) => `${Math.round((n ?? 0) * 100)}%`;
  const answers = e.with[1] + e.without[1];
  return locale === "ar"
    ? `${pct(rate(e.with))} معه مقابل ${pct(rate(e.without))} بدونه · ${answers} إجابات`
    : `${pct(rate(e.with))} with it vs ${pct(rate(e.without))} without · ${answers} answers`;
}
