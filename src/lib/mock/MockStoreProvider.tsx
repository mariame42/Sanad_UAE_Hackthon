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
  seedPassport,
} from "./seed";
import { COURSES, mergeEvidence } from "@/lib/passport";
import { createPersistentStore } from "./persist";
import type {
  AdjustmentKey,
  CaseRecord,
  CaseStatus,
  Concern,
  ConsentChoice,
  HandoffEntry,
  LearningPassport,
  PassportEvidence,
  PassportShare,
  Role,
  RouteOption,
} from "@/lib/types";

type SavedCheckIn = { at: string; strategies: string[] };

type DemoState = {
  concerns: Concern[];
  cases: CaseRecord[];
  savedCheckIn: SavedCheckIn | null;
  passport: LearningPassport;
  shares: PassportShare[];
  appliedFixes: string[];
};

const demoStore = createPersistentStore<DemoState>("sanad-demo-v3", {
  concerns: seedConcerns,
  cases: seedCases,
  savedCheckIn: null,
  passport: seedPassport,
  shares: [],
  appliedFixes: [],
});

const DEMO_STUDENT = { name: "Layla Al Mansoori", id: "stu-layla" };

type MockStoreValue = {
  concerns: Concern[];
  cases: CaseRecord[];
  savedCheckIn: SavedCheckIn | null;
  addConcern: (
    concern: Omit<Concern, "id" | "createdAt" | "outcome" | "caseId">,
  ) => Concern;
  addCaseFromCheckIn: (
    consent: ConsentChoice,
    strategies: string[],
  ) => CaseRecord | null;
  updateCase: (id: string, patch: Partial<CaseRecord>) => void;
  confirmRoute: (id: string, route: RouteOption, owner: string) => void;
  assignOwner: (id: string, owner: string) => void;
  disputeCase: (id: string, reason: string, withdraw?: boolean) => void;
  acceptOffer: (id: string, accept: boolean) => void;
  logView: (id: string, who: string, role: Role) => void;
  draftHandoff: (id: string, text: string, to: RouteOption) => void;
  respondHandoff: (id: string, approve: boolean) => void;
  studentCase: (studentId?: string) => CaseRecord | undefined;
  passport: LearningPassport;
  shares: PassportShare[];
  savePassport: (evidence: Partial<Record<AdjustmentKey, PassportEvidence>>) => void;
  setContribute: (on: boolean) => void;
  sharePassport: (course: string, adjustments: AdjustmentKey[]) => void;
  respondShare: (id: string, accept: boolean) => void;
  revokeShare: (id: string) => void;
  appliedFixes: string[];
  applyFix: (id: string, applied: boolean) => void;
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

  const addCaseFromCheckIn = useCallback(
    (consent: ConsentChoice, strategies: string[]) => {
      if (consent === "private") return null;
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
    [],
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

  const savePassport = useCallback(
    (evidence: Partial<Record<AdjustmentKey, PassportEvidence>>) => {
      demoStore.set((s) => ({
        ...s,
        passport: {
          ...s.passport,
          sessions: s.passport.sessions + 1,
          updatedAt: now(),
          evidence: mergeEvidence(s.passport.evidence, evidence),
        },
      }));
    },
    [],
  );

  const setContribute = useCallback((on: boolean) => {
    demoStore.set((s) => ({ ...s, passport: { ...s.passport, contribute: on } }));
  }, []);

  const sharePassport = useCallback((course: string, adjustments: AdjustmentKey[]) => {
    const instructor = COURSES.find((c) => c.course === course)?.instructor ?? "Instructor";
    const share: PassportShare = {
      id: uid("share"),
      course,
      instructor,
      adjustments,
      status: "pending",
      createdAt: now(),
    };
    // One live share per course: a new one replaces the old.
    demoStore.set((s) => ({
      ...s,
      shares: [share, ...s.shares.filter((x) => x.course !== course)],
    }));
  }, []);

  const respondShare = useCallback((id: string, accept: boolean) => {
    demoStore.set((s) => ({
      ...s,
      shares: s.shares.map((x) =>
        x.id === id && x.status === "pending"
          ? { ...x, status: accept ? "accepted" : "discuss", respondedAt: now() }
          : x,
      ),
    }));
  }, []);

  const revokeShare = useCallback((id: string) => {
    demoStore.set((s) => ({
      ...s,
      shares: s.shares.map((x) =>
        x.id === id ? { ...x, status: "revoked", respondedAt: now() } : x,
      ),
    }));
  }, []);

  const applyFix = useCallback((id: string, applied: boolean) => {
    demoStore.set((s) => ({
      ...s,
      appliedFixes: applied
        ? [...new Set([...s.appliedFixes, id])]
        : s.appliedFixes.filter((x) => x !== id),
    }));
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
      addConcern,
      addCaseFromCheckIn,
      updateCase,
      confirmRoute,
      assignOwner,
      disputeCase,
      acceptOffer,
      logView,
      draftHandoff,
      respondHandoff,
      studentCase,
      passport: state.passport,
      shares: state.shares,
      savePassport,
      setContribute,
      sharePassport,
      respondShare,
      revokeShare,
      appliedFixes: state.appliedFixes,
      applyFix,
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
      updateCase,
      confirmRoute,
      assignOwner,
      disputeCase,
      acceptOffer,
      logView,
      draftHandoff,
      respondHandoff,
      studentCase,
      savePassport,
      setContribute,
      sharePassport,
      respondShare,
      revokeShare,
      applyFix,
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
