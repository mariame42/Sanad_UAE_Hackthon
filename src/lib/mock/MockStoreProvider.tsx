"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  dashboardSeries,
  classInsightsData,
  sasCapacityFull,
  seedCases,
  seedConcerns,
} from "./seed";
import type {
  CaseRecord,
  CaseStatus,
  Concern,
  ConsentChoice,
  RouteOption,
} from "@/lib/types";

type MockStoreValue = {
  concerns: Concern[];
  cases: CaseRecord[];
  addConcern: (concern: Omit<Concern, "id" | "createdAt">) => Concern;
  addCaseFromCheckIn: (consent: ConsentChoice, strategies: string[]) => CaseRecord | null;
  updateCase: (id: string, patch: Partial<CaseRecord>) => void;
  confirmRoute: (id: string, route: RouteOption, owner: string) => void;
  assignOwner: (id: string, owner: string) => void;
  disputeCase: (id: string, reason: string) => void;
  studentCase: (studentId?: string) => CaseRecord | undefined;
  dashboard: typeof dashboardSeries;
  classInsights: typeof classInsightsData;
  sasFull: boolean;
};

const MockStoreContext = createContext<MockStoreValue | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function MockStoreProvider({ children }: { children: React.ReactNode }) {
  const [concerns, setConcerns] = useState<Concern[]>(seedConcerns);
  const [cases, setCases] = useState<CaseRecord[]>(seedCases);

  const addConcern = useCallback(
    (input: Omit<Concern, "id" | "createdAt">) => {
      const concern: Concern = {
        ...input,
        id: uid("concern"),
        createdAt: new Date().toISOString(),
      };
      setConcerns((prev) => [concern, ...prev]);

      if (input.action === "offer_to_advisor") {
        const record: CaseRecord = {
          id: uid("case"),
          studentName: "Layla Al Mansoori",
          studentId: "stu-layla",
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
              at: new Date().toISOString(),
              from: input.facultyName,
              to: "Advising queue",
              note: "Support offer from Concern Desk.",
            },
          ],
          createdAt: new Date().toISOString(),
        };
        setCases((prev) => [record, ...prev]);
      }
      return concern;
    },
    [],
  );

  const addCaseFromCheckIn = useCallback(
    (consent: ConsentChoice, strategies: string[]) => {
      if (consent === "private" || consent === "saved") return null;
      const toSas = consent === "sas";
      const record: CaseRecord = {
        id: uid("case"),
        studentName: "Layla Al Mansoori",
        studentId: "stu-layla",
        ladder: toSas ? "L3" : "L2",
        status: toSas ? "with_sas" : "with_advisor",
        owner: null,
        slaHours: toSas ? 72 : 48,
        source: "checkin",
        summary: `Check-in strategies: ${strategies.join("; ")}`,
        suggestedRoute: toSas ? "sas" : "learning_center",
        suggestedReason: toSas
          ? "Student asked SAS to review after trying strategies. Human confirmation required."
          : "Student requested a learning coach. Learning center is the least intensive next step.",
        confirmedRoute: null,
        handoffs: [
          {
            at: new Date().toISOString(),
            from: "Student (Check-in)",
            to: toSas ? "SAS queue" : "Advising / coach queue",
            note: toSas
              ? "Student consented to SAS review."
              : "Student chose Talk to a coach.",
          },
        ],
        waitDays: toSas && sasCapacityFull ? 12 : undefined,
        createdAt: new Date().toISOString(),
      };
      setCases((prev) => [record, ...prev]);
      return record;
    },
    [],
  );

  const updateCase = useCallback((id: string, patch: Partial<CaseRecord>) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }, []);

  const confirmRoute = useCallback(
    (id: string, route: RouteOption, owner: string) => {
      setCases((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const status: CaseStatus =
            route === "sas" ? "with_sas" : "routed";
          return {
            ...c,
            confirmedRoute: route,
            owner,
            status,
            ladder: route === "sas" ? "L3" : c.ladder,
            handoffs: [
              ...c.handoffs,
              {
                at: new Date().toISOString(),
                from: owner,
                to: route,
                note: "Route confirmed by human owner.",
              },
            ],
          };
        }),
      );
    },
    [],
  );

  const assignOwner = useCallback((id: string, owner: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              owner,
              handoffs: [
                ...c.handoffs,
                {
                  at: new Date().toISOString(),
                  from: "Queue",
                  to: owner,
                  note: "Owner assigned.",
                },
              ],
            }
          : c,
      ),
    );
  }, []);

  const disputeCase = useCallback((id: string, reason: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "disputed" as CaseStatus,
              handoffs: [
                ...c.handoffs,
                {
                  at: new Date().toISOString(),
                  from: c.studentName,
                  to: "Recourse",
                  note: reason,
                },
              ],
            }
          : c,
      ),
    );
  }, []);

  const studentCase = useCallback(
    (studentId = "stu-layla") =>
      cases.find(
        (c) => c.studentId === studentId && c.status !== "closed",
      ) ?? cases.find((c) => c.studentId === studentId),
    [cases],
  );

  const value = useMemo(
    () => ({
      concerns,
      cases,
      addConcern,
      addCaseFromCheckIn,
      updateCase,
      confirmRoute,
      assignOwner,
      disputeCase,
      studentCase,
      dashboard: dashboardSeries,
      classInsights: classInsightsData,
      sasFull: sasCapacityFull,
    }),
    [
      concerns,
      cases,
      addConcern,
      addCaseFromCheckIn,
      updateCase,
      confirmRoute,
      assignOwner,
      disputeCase,
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
