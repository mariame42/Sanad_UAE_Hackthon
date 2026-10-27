export type Role = "student" | "faculty" | "advisor" | "sas" | "leadership";

export type Locale = "en" | "ar";

export type LadderLevel = "L1" | "L2" | "L3" | "L4";

export type ConsentChoice = "private" | "saved" | "coach" | "sas";

export type CaseStatus =
  | "offer_sent"
  | "awaiting_student"
  | "with_advisor"
  | "routed"
  | "with_sas"
  | "closed"
  | "disputed";

export type RouteOption =
  | "learning_center"
  | "language_support"
  | "academic_advising"
  | "sas"
  | "counseling"
  | "career_wellbeing";

export type Concern = {
  id: string;
  facultyName: string;
  course: string;
  task: string;
  when: string;
  rawNote: string;
  rewrittenNote: string;
  action: "offer_to_advisor" | "recommend_checkin_class";
  /** What the faculty member is allowed to see back (L1 only). */
  outcome: "support_offered" | "support_accepted" | "class_invited";
  caseId?: string;
  createdAt: string;
};

export type HandoffEntry = {
  at: string;
  from: string;
  to: string;
  note: string;
};

export type AuditEntry = {
  at: string;
  who: string;
  role: Role;
  what: string;
};

export type HandoffSummary = {
  text: string;
  to: RouteOption;
  status: "pending" | "approved" | "declined";
};

export type CaseRecord = {
  id: string;
  studentName: string;
  studentId: string;
  ladder: LadderLevel;
  status: CaseStatus;
  owner: string | null;
  slaHours: number;
  source: "checkin" | "concern";
  summary: string;
  suggestedRoute: RouteOption;
  suggestedReason: string;
  confirmedRoute: RouteOption | null;
  handoffs: HandoffEntry[];
  waitDays?: number;
  consent?: ConsentChoice;
  handoffSummary?: HandoffSummary;
  audit?: AuditEntry[];
  createdAt: string;
};

export type CheckInStrategy = {
  id: string;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
};

export type PassportToolKey =
  | "tts"
  | "spacing"
  | "dyslexiaFont"
  | "chunking";

/** One Check-in activity result, used to build Passport evidence. */
export type CheckInAttempt = {
  id: string;
  correct: number;
  total: number;
  tools: {
    tts: boolean;
    spacing: boolean;
    dyslexiaFont: boolean;
    chunking: boolean;
    slowerSpeech?: boolean;
  };
};

export type PassportEvidence = {
  tool: PassportToolKey;
  labelEn: string;
  labelAr: string;
  withPct: number | null;
  withoutPct: number | null;
  /** withPct − withoutPct when both exist */
  deltaPct: number | null;
  trialsOn: number;
  trialsOff: number;
  helped: boolean;
};

export type PassportFormatEvidence = {
  format: "text" | "audio" | "video";
  pct: number | null;
};

export type PassportShare = {
  id: string;
  course: string;
  sharedAt: string;
  revokedAt: string | null;
  code: string;
  /** Instructor's answer on /passport (faculty view); undefined while pending. */
  response?: "accepted" | "discuss";
  respondedAt?: string;
};

/** Student-owned evidence of what works — not a diagnosis. */
export type LearningPassport = {
  studentId: string;
  studentName: string;
  updatedAt: string;
  evidence: PassportEvidence[];
  formats: PassportFormatEvidence[];
  strategyTitles: string[];
  shares: PassportShare[];
};

export type Persona = {
  role: Role;
  nameEn: string;
  nameAr: string;
};
