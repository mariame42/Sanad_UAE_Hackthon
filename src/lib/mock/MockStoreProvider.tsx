"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  dashboardSeries,
  pilotTargets,
  sasCapacityFull,
  sasWaitDays,
  seedCases,
  seedConcerns,
} from "./seed";
import { createPersistentStore } from "./persist";
import {
  buildPassportEvidence,
  buildPassportFormats,
  shareCode,
} from "@/lib/passport";
import { STUDENT_PROFILE } from "@/lib/student-profile";
import type {
  CaseRecord,
  CaseStatus,
  CheckInAttempt,
  Concern,
  ConsentChoice,
  FocusSummary,
  HandoffEntry,
  LearningPassport,
  Role,
  RouteOption,
} from "@/lib/types";

type SavedCheckIn = { at: string; strategies: string[] };

type DemoState = {
  concerns: Concern[];
  cases: CaseRecord[];
  savedCheckIn: SavedCheckIn | null;
  passport: LearningPassport | null;
  /** Barrier Map fixes applied in the leadership simulation. */
  appliedFixes: string[];
};

const DEMO_STUDENT = {
  name: STUDENT_PROFILE.nameEn,
  id: STUDENT_PROFILE.id,
};

const seedPassport: LearningPassport = {
  studentId: DEMO_STUDENT.id,
  studentName: DEMO_STUDENT.name,
  updatedAt: new Date().toISOString(),
  evidence: [
    {
      tool: "tts",
      labelEn: "Read aloud / text-to-speech",
      labelAr: "القراءة بصوت عالٍ",
      withPct: 88,
      withoutPct: 50,
      deltaPct: 38,
      trialsOn: 2,
      trialsOff: 1,
      helped: true,
    },
    {
      tool: "chunking",
      labelEn: "One chunk at a time",
      labelAr: "جزء واحد في كل مرة",
      withPct: 75,
      withoutPct: 50,
      deltaPct: 25,
      trialsOn: 2,
      trialsOff: 1,
      helped: true,
    },
  ],
  formats: [
    { format: "text", pct: 67 },
    { format: "audio", pct: 88 },
    { format: "video", pct: 100 },
  ],
  strategyTitles: ["Read aloud helped you", "One chunk at a time helped you"],
  shares: [],
};

const demoStore = createPersistentStore<DemoState>("sanad-demo-v4", {
  concerns: seedConcerns,
  cases: seedCases,
  savedCheckIn: null,
  passport: seedPassport,
  appliedFixes: [],
});

type MockStoreValue = {
  concerns: Concern[];
  cases: CaseRecord[];
  savedCheckIn: SavedCheckIn | null;
  passport: LearningPassport | null;
  addConcern: (
    concern: Omit<Concern, "id" | "createdAt" | "outcome" | "caseId">,
  ) => Concern;
  addCaseFromCheckIn: (
    consent: ConsentChoice,
    strategies: string[],
    attempts?: CheckInAttempt[],
    focus?: FocusSummary | null,
  ) => CaseRecord | null;
  updatePassportFromCheckIn: (
    attempts: CheckInAttempt[],
    strategies: string[],
    focus?: FocusSummary | null,
  ) => LearningPassport;
  sharePassport: (course: string) => LearningPassport | null;
  revokePassportShare: (shareId: string) => void;
  clearPassport: () => void;
  /** Instructor answers a shared Passport (faculty /passport). */
  respondShare: (shareId: string, accept: boolean) => void;
  appliedFixes: string[];
  applyFix: (id: string, applied: boolean) => void;
  updateCase: (id: string, patch: Partial<CaseRecord>) => void;
  confirmRoute: (id: string, route: RouteOption, owner: string) => void;
  assignOwner: (id: string, owner: string) => void;
  disputeCase: (id: string, reason: string, withdraw?: boolean) => void;
  acceptOffer: (id: string, accept: boolean) => void;
  logView: (id: string, who: string, role: Role) => void;
  draftHandoff: (id: string, text: string, to: RouteOption) => void;
  respondHandoff: (id: string, approve: boolean) => void;
  studentCase: (studentId?: string) => CaseRecord | undefined;
  resetDemo: () => void;
  dashboard: typeof dashboardSeries;
  pilotTargets: typeof pilotTargets;
  sasFull: boolean;
  sasWaitDays: number;
};

const MockStoreContext = createContext<MockStoreValue | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function now() {
  return new Date().toISOString();
}

function patchCase(id: string, fn: (c: CaseRecord) => CaseRecord) {
  demoStore.set((s) => ({
    ...s,
    cases: s.cases.map((c) => (c.id === id ? fn(c) : c)),
  }));
}

function withHandoff(c: CaseRecord, entry: Omit<HandoffEntry, "at">) {
  return { ...c, handoffs: [...c.handoffs, { at: now(), ...entry }] };
}

export function MockStoreProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(
    demoStore.subscribe,
    demoStore.get,
    demoStore.getServer,
  );

  const addConcern = useCallback(
    (input: Omit<Concern, "id" | "createdAt" | "outcome" | "caseId">) => {
      const offer = input.action === "offer_to_advisor";
      const caseId = offer ? uid("case") : undefined;
      const concern: Concern = {
        ...input,
        id: uid("concern"),
        outcome: offer ? "support_offered" : "class_invited",
        caseId,
        createdAt: now(),
      };
      const record: CaseRecord | null = offer
        ? {
            id: caseId!,
            studentName: DEMO_STUDENT.name,
            studentId: DEMO_STUDENT.id,
            ladder: "L2",
            status: "offer_sent",
            owner: null,
            slaHours: 48,
            source: "concern",
            summary: input.rewrittenNote,
            suggestedRoute: "academic_advising",
            suggestedReason:
              "Frontline observation created a support offer. Advisor should confirm the best next service with the student.",
            confirmedRoute: null,
            handoffs: [
              {
                at: now(),
                from: input.facultyName,
                to: "Advising queue",
                note: "Support offer from Concern Desk (raw note never leaves the Concern Desk).",
              },
            ],
            audit: [],
            createdAt: now(),
          }
        : null;
      demoStore.set((s) => ({
        ...s,
        concerns: [concern, ...s.concerns],
        cases: record ? [record, ...s.cases] : s.cases,
      }));
      return concern;
    },
    [],
  );

  const updatePassportFromCheckIn = useCallback(
    (
      attempts: CheckInAttempt[],
      strategies: string[],
      focus?: FocusSummary | null,
    ) => {
      const evidence = buildPassportEvidence(attempts);
      const formats = buildPassportFormats(attempts);
      const passport: LearningPassport = {
        studentId: DEMO_STUDENT.id,
        studentName: DEMO_STUDENT.name,
        updatedAt: now(),
        evidence:
          evidence.length > 0
            ? evidence
            : demoStore.get().passport?.evidence ?? [],
        formats,
        strategyTitles: strategies,
        shares: demoStore.get().passport?.shares ?? [],
        focus: focus ?? demoStore.get().passport?.focus ?? null,
      };
      demoStore.set((s) => ({ ...s, passport }));
      return passport;
    },
    [],
  );

  const sharePassport = useCallback((course: string) => {
    const current = demoStore.get().passport;
    if (!current) return null;
    const trimmed = course.trim();
    if (!trimmed) return current;
    const existing = current.shares.find(
      (s) => s.course === trimmed && !s.revokedAt,
    );
    if (existing) return current;
    const share = {
      id: uid("share"),
      course: trimmed,
      sharedAt: now(),
      revokedAt: null,
      code: shareCode(current.studentId, trimmed),
    };
    const passport = { ...current, shares: [...current.shares, share] };
    demoStore.set((s) => ({ ...s, passport }));
    return passport;
  }, []);

  const revokePassportShare = useCallback((shareId: string) => {
    demoStore.set((s) => {
      if (!s.passport) return s;
      return {
        ...s,
        passport: {
          ...s.passport,
          shares: s.passport.shares.map((share) =>
            share.id === shareId ? { ...share, revokedAt: now() } : share,
          ),
        },
      };
    });
  }, []);

  const clearPassport = useCallback(() => {
    demoStore.set((s) => ({ ...s, passport: null, savedCheckIn: null }));
  }, []);

  const respondShare = useCallback((shareId: string, accept: boolean) => {
    demoStore.set((s) => {
      if (!s.passport) return s;
      return {
        ...s,
        passport: {
          ...s.passport,
          shares: s.passport.shares.map((share) =>
            share.id === shareId && !share.response && !share.revokedAt
              ? {
                  ...share,
                  response: accept ? "accepted" : "discuss",
                  respondedAt: now(),
                }
              : share,
          ),
        },
      };
    });
  }, []);

  const applyFix = useCallback((id: string, applied: boolean) => {
    demoStore.set((s) => ({
      ...s,
      appliedFixes: applied
        ? [...new Set([...s.appliedFixes, id])]
        : s.appliedFixes.filter((x) => x !== id),
    }));
  }, []);

  const addCaseFromCheckIn = useCallback(
    (
      consent: ConsentChoice,
      strategies: string[],
      attempts: CheckInAttempt[] = [],
      focus?: FocusSummary | null,
    ) => {
      if (consent === "private") return null;
      if (attempts.length) {
        updatePassportFromCheckIn(attempts, strategies, focus);
      }
      if (consent === "saved") {
        demoStore.set((s) => ({
          ...s,
          savedCheckIn: { at: now(), strategies },
        }));
        return null;
      }
      const toSas = consent === "sas";
      const queueFull = toSas && sasCapacityFull;
      const handoffs: HandoffEntry[] = [
        {
          at: now(),
          from: "Student (Check-in)",
          to: toSas ? "SAS queue" : "Advising / coach queue",
          note: toSas
            ? "Student consented to SAS review."
            : "Student chose Talk to a coach.",
        },
      ];
      if (queueFull) {
        handoffs.push({
          at: now(),
          from: "Sanad (capacity rule)",
          to: "Learning coach",
          note: `SAS queue full (~${sasWaitDays} working days). Interim L2 coaching offered now.`,
        });
      }
      const record: CaseRecord = {
        id: uid("case"),
        studentName: DEMO_STUDENT.name,
        studentId: DEMO_STUDENT.id,
        ladder: toSas ? "L3" : "L2",
        status: toSas ? "with_sas" : "with_advisor",
        owner: null,
        slaHours: toSas ? 72 : 48,
        source: "checkin",
        consent,
        summary: `Check-in strategies: ${strategies.join("; ")}`,
        suggestedRoute: toSas ? "sas" : "learning_center",
        suggestedReason: toSas
          ? "Student asked SAS to review after trying strategies. Human confirmation required."
          : "Student requested a learning coach. Learning center is the least intensive next step.",
        confirmedRoute: null,
        handoffs,
        audit: [],
        waitDays: queueFull ? sasWaitDays : undefined,
        createdAt: now(),
      };
      demoStore.set((s) => ({ ...s, cases: [record, ...s.cases] }));
      return record;
    },
    [updatePassportFromCheckIn],
  );

  const updateCase = useCallback((id: string, patch: Partial<CaseRecord>) => {
    patchCase(id, (c) => ({ ...c, ...patch }));
  }, []);

  const confirmRoute = useCallback(
    (id: string, route: RouteOption, owner: string) => {
      patchCase(id, (c) => {
        // L3 needs the student's own agreement; an advisor cannot escalate alone.
        const needsConsent = route === "sas" && c.consent !== "sas";
        const status: CaseStatus = needsConsent
          ? "awaiting_student"
          : route === "sas"
            ? "with_sas"
            : "routed";
        return withHandoff(
          {
            ...c,
            confirmedRoute: route,
            owner,
            status,
            ladder: route === "sas" && !needsConsent ? "L3" : c.ladder,
          },
          {
            from: owner,
            to: route,
            note: needsConsent
              ? "Route proposed by human owner. SAS review starts only if the student agrees."
              : "Route confirmed by human owner.",
          },
        );
      });
    },
    [],
  );

  const assignOwner = useCallback((id: string, owner: string) => {
    patchCase(id, (c) =>
      withHandoff({ ...c, owner }, { from: "Queue", to: owner, note: "Owner assigned." }),
    );
  }, []);

  const disputeCase = useCallback(
    (id: string, reason: string, withdraw = false) => {
      patchCase(id, (c) => {
        const base = withHandoff(
          { ...c, status: (withdraw ? "closed" : "disputed") as CaseStatus },
          { from: c.studentName, to: "Recourse", note: reason },
        );
        if (!withdraw) return base;
        return {
          ...base,
          summary: "[Deleted at the student's request]",
          handoffSummary: undefined,
          consent: "private",
        };
      });
    },
    [],
  );

  const acceptOffer = useCallback((id: string, accept: boolean) => {
    demoStore.set((s) => ({
      ...s,
      concerns: s.concerns.map((c) =>
        c.caseId === id && accept ? { ...c, outcome: "support_accepted" } : c,
      ),
      cases: s.cases.map((c) =>
        c.id === id
          ? withHandoff(
              {
                ...c,
                status: (accept ? "with_advisor" : "closed") as CaseStatus,
                consent: accept ? "coach" : "private",
              },
              {
                from: c.studentName,
                to: accept ? "Advising queue" : "Closed",
                note: accept
                  ? "Student accepted the support offer."
                  : "Student declined the offer. Nothing further is shared.",
              },
            )
          : c,
      ),
    }));
  }, []);

  const logView = useCallback((id: string, who: string, role: Role) => {
    patchCase(id, (c) => {
      const audit = c.audit ?? [];
      const last = audit[audit.length - 1];
      // Collapse repeat views by the same person within a minute.
      if (last && last.who === who && Date.now() - Date.parse(last.at) < 60_000) {
        return c;
      }
      return {
        ...c,
        audit: [...audit, { at: now(), who, role, what: "Viewed case file" }],
      };
    });
  }, []);

  const draftHandoff = useCallback(
    (id: string, text: string, to: RouteOption) => {
      patchCase(id, (c) =>
        withHandoff(
          { ...c, handoffSummary: { text, to, status: "pending" } },
          {
            from: c.owner ?? "Advisor",
            to: c.studentName,
            note: "Handoff summary drafted — waiting for the student's approval before sharing.",
          },
        ),
      );
    },
    [],
  );

  const respondHandoff = useCallback((id: string, approve: boolean) => {
    patchCase(id, (c) => {
      if (!c.handoffSummary) return c;
      const to = c.handoffSummary.to;
      return withHandoff(
        {
          ...c,
          handoffSummary: {
            ...c.handoffSummary,
            status: approve ? "approved" : "declined",
          },
          status: approve ? (to === "sas" ? "with_sas" : "routed") : c.status,
          ladder: approve && to === "sas" ? "L3" : c.ladder,
          consent: approve && to === "sas" ? "sas" : c.consent,
        },
        {
          from: c.studentName,
          to,
          note: approve
            ? "Student approved the summary. Shared with consent."
            : "Student declined sharing. Nothing was sent.",
        },
      );
    });
  }, []);

  const studentCase = useCallback(
    (studentId = DEMO_STUDENT.id) =>
      state.cases.find(
        (c) => c.studentId === studentId && c.status !== "closed",
      ) ?? state.cases.find((c) => c.studentId === studentId),
    [state.cases],
  );

  const value = useMemo(
    () => ({
      concerns: state.concerns,
      cases: state.cases,
      savedCheckIn: state.savedCheckIn,
      passport: state.passport,
      appliedFixes: state.appliedFixes,
      addConcern,
      addCaseFromCheckIn,
      updatePassportFromCheckIn,
      sharePassport,
      revokePassportShare,
      clearPassport,
      respondShare,
      applyFix,
      updateCase,
      confirmRoute,
      assignOwner,
      disputeCase,
      acceptOffer,
      logView,
      draftHandoff,
      respondHandoff,
      studentCase,
      resetDemo: demoStore.reset,
      dashboard: dashboardSeries,
      pilotTargets,
      sasFull: sasCapacityFull,
      sasWaitDays,
    }),
    [
      state,
      addConcern,
      addCaseFromCheckIn,
      updatePassportFromCheckIn,
      sharePassport,
      revokePassportShare,
      clearPassport,
      respondShare,
      applyFix,
      updateCase,
      confirmRoute,
      assignOwner,
      disputeCase,
      acceptOffer,
      logView,
      draftHandoff,
      respondHandoff,
      studentCase,
    ],
  );

  return (
    <MockStoreContext.Provider value={value}>
      {children}
    </MockStoreContext.Provider>
  );
}

export function useMockStore() {
  const ctx = useContext(MockStoreContext);
  if (!ctx) throw new Error("useMockStore must be used within MockStoreProvider");
  return ctx;
}
