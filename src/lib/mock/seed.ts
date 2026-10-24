import type { CaseRecord, Concern } from "@/lib/types";

export const seedConcerns: Concern[] = [];

export const seedCases: CaseRecord[] = [
  {
    id: "case-1001",
    studentName: "Layla Al Mansoori",
    studentId: "stu-layla",
    ladder: "L2",
    status: "with_advisor",
    owner: null,
    slaHours: 48,
    source: "checkin",
    summary:
      "Student completed Check-in. Text-to-speech improved accuracy on reading questions. Requested learning coach.",
    suggestedRoute: "learning_center",
    suggestedReason:
      "Pattern relates to reading load and tools, not a language-of-instruction issue. Learning center can coach strategies first.",
    confirmedRoute: null,
    handoffs: [
      {
        at: "2026-03-01T09:00:00Z",
        from: "System",
        to: "Advising queue",
        note: "Student chose Talk to a coach after Check-in.",
      },
    ],
    createdAt: "2026-03-01T09:00:00Z",
  },
  {
    id: "case-1002",
    studentName: "Ahmed Faris",
    studentId: "stu-ahmed",
    ladder: "L2",
    status: "routed",
    owner: "Omar Al Nuaimi",
    slaHours: 72,
    source: "concern",
    summary:
      "Faculty noted difficulty with timed reading weeks 3–5; strong oral contributions. Support offer accepted.",
    suggestedRoute: "language_support",
    suggestedReason:
      "Student studies in a second language; separate path from screening until strategies are tried.",
    confirmedRoute: "language_support",
    handoffs: [
      {
        at: "2026-02-20T11:00:00Z",
        from: "Dr. Sara Khan",
        to: "Omar Al Nuaimi",
        note: "Support offer via Concern Desk.",
      },
      {
        at: "2026-02-21T08:30:00Z",
        from: "Omar Al Nuaimi",
        to: "Language Support",
        note: "Route confirmed by advisor.",
      },
    ],
    createdAt: "2026-02-20T11:00:00Z",
  },
];

export const dashboardSeries = {
  timeToSupportDays: [
    { week: "W1", days: 6.2 },
    { week: "W2", days: 5.4 },
    { week: "W3", days: 4.8 },
    { week: "W4", days: 4.1 },
    { week: "W5", days: 3.9 },
    { week: "W6", days: 3.6 },
  ],
  appropriateness: [
    { month: "Jan", pct: 72 },
    { month: "Feb", pct: 78 },
    { month: "Mar", pct: 84 },
  ],
  kpis: {
    avgWaitDays: 3.2,
    checkinCompletionPct: 31,
    trustScore: 4.2,
    appropriatenessPct: 84,
    medianDaysToSupport: 3.6,
  },
  equity: [
    { group: "Gender — Women", days: 3.5, n: 48 },
    { group: "Gender — Men", days: 3.8, n: 41 },
    { group: "Language — Arabic L1", days: 3.4, n: 52 },
    { group: "Language — Other L1", days: 4.0, n: 28 },
    { group: "Year 1", days: 3.2, n: 60 },
    { group: "Year 2+", days: 4.1, n: 35 },
    { group: "Campus A", days: 3.5, n: 55 },
    { group: "Campus B", days: 3.9, n: 22 },
    { group: "Tiny cohort (hidden)", days: 2.0, n: 4 },
  ],
};

export const classInsightsData = [
  {
    course: "ENG 101 — Module 3 reading",
    insight:
      "38% of the class struggled with the Module 3 reading; audio versions improved scores in similar courses.",
  },
  {
    course: "BIO 210 — Lab reports",
    insight:
      "Chunked templates correlated with fewer late submissions class-wide.",
  },
  {
    course: "MATH 105 — Word problems",
    insight:
      "Dual-format instructions (diagram + text) associated with higher quiz completion.",
  },
];

export const sasCapacityFull = false;
