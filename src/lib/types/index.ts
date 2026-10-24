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
  createdAt: string;
};

export type HandoffEntry = {
  at: string;
  from: string;
  to: string;
  note: string;
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
  createdAt: string;
};

export type CheckInStrategy = {
  id: string;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
};

export type Persona = {
  role: Role;
  nameEn: string;
  nameAr: string;
};
