import type { Locale } from "@/lib/types";

type Text = Record<Locale, string>;

/**
 * Barrier Map demo data: aggregated, anonymous Check-in results by course × week.
 * gapPct = share of students who did markedly better once a tool was on or a
 * timer was off. Nothing here points to a person.
 */
export type Barrier = {
  id: string;
  course: string;
  week: number;
  n: number;
  gapPct: number;
  tool: Text;
  cause: Text;
  fix: Text;
  /** Simulation inputs (students reached, referrals and SAS requests avoided). */
  affected: number;
  referralsAvoided: number;
  sasAvoided: number;
};

export type BarrierCell = {
  course: string;
  week: number;
  n: number;
  gapPct: number;
  barrierId?: string;
};

export const BARRIER_COURSES = ["ENG 101", "MATH 105", "BIO 210", "CHEM 110", "IT 120"];
export const BARRIER_WEEKS = [1, 2, 3, 4, 5, 6, 7, 8];

/** Groups smaller than this are never shown. */
export const MIN_GROUP = 10;

/** Fixed share of students for whom a removed barrier stops mattering. */
export const RESIDUAL_GAP_PCT = 7;

export const barriers: Barrier[] = [
  {
    id: "bio-w3",
    course: "BIO 210",
    week: 3,
    n: 46,
    gapPct: 38,
    tool: { en: "Text-to-speech", ar: "تحويل النص إلى كلام" },
    cause: {
      en: "Week 3 reading is a scanned PDF without a text layer — read-aloud can’t open it.",
      ar: "قراءة الأسبوع 3 ملف PDF ممسوح بلا طبقة نص — لا يستطيع القارئ الصوتي فتحه.",
    },
    fix: {
      en: "Replace it with an accessible PDF or an HTML page",
      ar: "استبداله بملف PDF قابل للوصول أو صفحة HTML",
    },
    affected: 17,
    referralsAvoided: 6,
    sasAvoided: 4,
  },
  {
    id: "eng-w3",
    course: "ENG 101",
    week: 3,
    n: 58,
    gapPct: 34,
    tool: { en: "Chunking", ar: "تقسيم النص" },
    cause: {
      en: "Module 3 reading: 12 dense pages with no sections or summaries.",
      ar: "قراءة الوحدة 3: ‏12 صفحة كثيفة بلا أقسام أو ملخصات.",
    },
    fix: {
      en: "Split it into 4 sections with a one-line summary each",
      ar: "تقسيمها إلى 4 أقسام مع ملخص من سطر لكل قسم",
    },
    affected: 20,
    referralsAvoided: 6,
    sasAvoided: 3,
  },
  {
    id: "math-w5",
    course: "MATH 105",
    week: 5,
    n: 52,
    gapPct: 31,
    tool: { en: "No hard timer", ar: "دون مؤقت صارم" },
    cause: {
      en: "Quiz 2 has a 45-second timer per question. Without it the gap disappears.",
      ar: "الاختبار 2 فيه مؤقت 45 ثانية لكل سؤال. بدونه تختفي الفجوة.",
    },
    fix: {
      en: "Drop the per-question timer; keep one overall time window",
      ar: "إلغاء المؤقت لكل سؤال مع إبقاء نافذة زمنية واحدة",
    },
    affected: 16,
    referralsAvoided: 5,
    sasAvoided: 4,
  },
  {
    id: "it-w6",
    course: "IT 120",
    week: 6,
    n: 41,
    gapPct: 27,
    tool: { en: "Captions", ar: "الترجمة النصية" },
    cause: {
      en: "Recorded lecture has no captions or transcript.",
      ar: "المحاضرة المسجّلة بلا ترجمة نصية أو نص مكتوب.",
    },
    fix: {
      en: "Add captions and a transcript (auto-captions + a quick check)",
      ar: "إضافة ترجمة نصية ونص مكتوب (تلقائي + مراجعة سريعة)",
    },
    affected: 11,
    referralsAvoided: 3,
    sasAvoided: 2,
  },
];

/** Deterministic background noise so the grid looks like real data. */
function noise(course: number, week: number) {
  return 4 + ((course * 7 + week * 5) % 11);
}

export const barrierGrid: BarrierCell[] = BARRIER_COURSES.flatMap((course, ci) =>
  BARRIER_WEEKS.map((week) => {
    const hit = barriers.find((b) => b.course === course && b.week === week);
    if (hit) return { course, week, n: hit.n, gapPct: hit.gapPct, barrierId: hit.id };
    // CHEM 110 is a small elective cohort: most weeks fall under the n ≥ 10 rule.
    const n = course === "CHEM 110" ? (week <= 2 ? 12 : 7) : 38 + ((ci * 3 + week) % 9) * 2;
    // Spill-over: the week after a barrier stays warm until it is fixed.
    const spill = barriers.find((b) => b.course === course && b.week === week - 1);
    return { course, week, n, gapPct: spill ? 19 : noise(ci, week), barrierId: spill?.id };
  }),
);

/** Students who opted in to anonymous contribution, pilot-wide. */
export const optedInContributors = 1284;

/**
 * Simulation, not a forecast: each fixed barrier reaches its students without a
 * referral, and SAS wait shrinks in proportion to the requests it no longer gets.
 */
export function projectImpact(applied: string[], sasDemand: number, sasWaitDays: number) {
  const fixed = barriers.filter((b) => applied.includes(b.id));
  const reached = fixed.reduce((n, b) => n + b.affected, 0);
  const referralsAvoided = fixed.reduce((n, b) => n + b.referralsAvoided, 0);
  const sasAvoided = fixed.reduce((n, b) => n + b.sasAvoided, 0);
  const projectedWait = Math.max(
    2,
    Math.round((sasWaitDays * (sasDemand - sasAvoided)) / sasDemand),
  );
  return { fixed: fixed.length, reached, referralsAvoided, sasAvoided, projectedWait };
}
