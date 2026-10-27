import type { CaseRecord, Concern, LearningPassport } from "@/lib/types";

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

export const seedConcerns: Concern[] = [];

/** Layla has two earlier Check-ins; today's demo session adds to this evidence. */
export const seedPassport: LearningPassport = {
  sessions: 2,
  updatedAt: hoursAgo(24 * 12),
  evidence: {
    tts: { with: [5, 6], without: [8, 13] },
    untimed: { with: [14, 17], without: [1, 2] },
    spacing: { with: [3, 5], without: [10, 14] },
  },
  contribute: false,
};

/** Layla (the demo student) starts with no case — the demo creates it live. */
export const seedCases: CaseRecord[] = [
  {
    id: "case-1001",
    studentName: "Mariam Al Hashimi",
    studentId: "stu-mariam",
    ladder: "L2",
    status: "with_advisor",
    owner: null,
    slaHours: 48,
    source: "checkin",
    consent: "coach",
    summary:
      "Completed Check-in. Text-to-speech improved accuracy on reading questions. Requested a learning coach.",
    suggestedRoute: "learning_center",
    suggestedReason:
      "Pattern relates to reading load and tools, not a language-of-instruction issue. Learning center can coach strategies first.",
    confirmedRoute: null,
    handoffs: [
      {
        at: hoursAgo(20),
        from: "System",
        to: "Advising queue",
        note: "Student chose Talk to a coach after Check-in.",
      },
    ],
    audit: [],
    createdAt: hoursAgo(20),
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
    consent: "coach",
    summary:
      "Faculty noted difficulty with timed reading weeks 3–5; strong oral contributions. Support offer accepted.",
    suggestedRoute: "language_support",
    suggestedReason:
      "Student studies in a second language; separate path from screening until strategies are tried.",
    confirmedRoute: "language_support",
    handoffs: [
      {
        at: hoursAgo(70),
        from: "Dr. Sara Khan",
        to: "Omar Al Nuaimi",
        note: "Support offer via Concern Desk.",
      },
      {
        at: hoursAgo(52),
        from: "Omar Al Nuaimi",
        to: "Language Support",
        note: "Route confirmed by advisor.",
      },
    ],
    audit: [],
    createdAt: hoursAgo(70),
  },
  {
    id: "case-1003",
    studentName: "Hessa Al Ketbi",
    studentId: "stu-hessa",
    ladder: "L2",
    status: "offer_sent",
    owner: null,
    slaHours: 48,
    source: "concern",
    summary:
      "Lab reports in BIO 210 submitted late three weeks in a row; asks good questions in lab.",
    suggestedRoute: "academic_advising",
    suggestedReason:
      "Frontline observation created a support offer. Advisor should confirm the best next service with the student.",
    confirmedRoute: null,
    handoffs: [
      {
        at: hoursAgo(55),
        from: "Dr. Khalid Rahman",
        to: "Advising queue",
        note: "Support offer from Concern Desk.",
      },
    ],
    audit: [],
    createdAt: hoursAgo(55),
  },
  {
    id: "case-1004",
    studentName: "Yousef Al Shamsi",
    studentId: "stu-yousef",
    ladder: "L3",
    status: "with_sas",
    owner: "Noura Hassan (SAS)",
    slaHours: 72,
    source: "checkin",
    consent: "sas",
    summary:
      "Pattern persisted after six weeks of learning-center coaching. Student asked SAS to review.",
    suggestedRoute: "sas",
    suggestedReason:
      "Student consented to SAS review after trying support. A qualified human must confirm.",
    confirmedRoute: "sas",
    handoffs: [
      {
        at: hoursAgo(30),
        from: "Learning Center",
        to: "SAS queue",
        note: "Student consented to SAS review.",
      },
      {
        at: hoursAgo(26),
        from: "SAS queue",
        to: "Noura Hassan (SAS)",
        note: "Owner assigned.",
      },
    ],
    audit: [],
    createdAt: hoursAgo(30),
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
  demand: [
    { service: "Learning Center", requests: 64, capacity: 70 },
    { service: "Language Support", requests: 31, capacity: 35 },
    { service: "SAS", requests: 22, capacity: 18 },
    { service: "Counseling", requests: 15, capacity: 20 },
  ],
};

/** Pilot KPIs from the project brief (section 9). */
export const pilotTargets = {
  medianDaysToSupport: 5,
  appropriatenessPct: 80,
  trustScore: 4,
  checkinCompletionPct: 25,
};

/** Demo shows the honest-wait path: SAS demand exceeds capacity this term. */
export const sasCapacityFull = true;
export const sasWaitDays = 9;
