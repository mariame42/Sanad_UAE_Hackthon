import type {
  CheckInAttempt,
  PassportEvidence,
  PassportFormatEvidence,
  PassportToolKey,
} from "@/lib/types";

export const PASSPORT_TOOL_LABEL: Record<
  PassportToolKey,
  { en: string; ar: string }
> = {
  tts: { en: "Read aloud / text-to-speech", ar: "القراءة بصوت عالٍ" },
  spacing: { en: "Wider spacing", ar: "التباعد الأوسع" },
  dyslexiaFont: { en: "Dyslexia-friendly font", ar: "الخط المريح للقراءة" },
  chunking: { en: "One chunk at a time", ar: "جزء واحد في كل مرة" },
};

export const PASSPORT_COURSES = [
  "ENG 101",
  "BIO 210",
  "MATH 105",
  "UNI 100",
] as const;

function accuracy(
  list: CheckInAttempt[],
): number | null {
  const total = list.reduce((n, a) => n + a.total, 0);
  return total ? list.reduce((n, a) => n + a.correct, 0) / total : null;
}

function pct(n: number | null) {
  return n === null ? null : Math.round(n * 100);
}

/** Turn Check-in attempts into Passport evidence (with tool vs without). */
export function buildPassportEvidence(
  attempts: CheckInAttempt[],
): PassportEvidence[] {
  const keys: PassportToolKey[] = [
    "tts",
    "spacing",
    "dyslexiaFont",
    "chunking",
  ];
  const out: PassportEvidence[] = [];
  for (const tool of keys) {
    const on = attempts.filter((a) => a.tools[tool]);
    if (!on.length) continue;
    const off = attempts.filter((a) => !a.tools[tool]);
    const withAcc = accuracy(on);
    const withoutAcc = accuracy(off);
    const withPct = pct(withAcc);
    const withoutPct = pct(withoutAcc);
    const deltaPct =
      withPct !== null && withoutPct !== null ? withPct - withoutPct : null;
    out.push({
      tool,
      labelEn: PASSPORT_TOOL_LABEL[tool].en,
      labelAr: PASSPORT_TOOL_LABEL[tool].ar,
      withPct,
      withoutPct,
      deltaPct,
      trialsOn: on.length,
      trialsOff: off.length,
      helped: deltaPct !== null ? deltaPct > 0 : withPct !== null && withPct >= 50,
    });
  }
  return out;
}

export function buildPassportFormats(
  attempts: CheckInAttempt[],
): PassportFormatEvidence[] {
  const map: Record<
    "text" | "audio" | "video" | "numbers" | "trace",
    (a: CheckInAttempt) => boolean
  > = {
    text: (a) => a.id === "read",
    audio: (a) => a.tools.tts,
    video: (a) => a.id === "watch",
    numbers: (a) => a.id === "numbers",
    trace: (a) => a.id === "trace",
  };
  return (["text", "audio", "video", "numbers", "trace"] as const).map(
    (format) => ({
      format,
      pct: pct(accuracy(attempts.filter(map[format]))),
    }),
  );
}

export function shareCode(studentId: string, course: string) {
  const slug = course.replace(/\s+/g, "").toUpperCase();
  const who = studentId.replace(/^stu-/, "").toUpperCase();
  return `SANAD-${who}-${slug}`;
}
