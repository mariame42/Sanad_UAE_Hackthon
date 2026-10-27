"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useHydrated } from "@/components/ui/Time";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import { useRole } from "@/lib/roles/RoleProvider";
import type { Role } from "@/lib/types";

type Step = { role: Role; href: string; title: string; cue: string };

/**
 * The pitch script, one click per step. Story: diagnose the barrier, not the
 * student — Learning Passport for one student, Barrier Map for everyone.
 */
const STEPS: Step[] = [
  {
    role: "faculty",
    href: "/concern",
    title: "Faculty writes a concern",
    cue: "Type “seems dyslexic” — labels light up live. Rewrite with Language Guard, then Recommend Check-in to whole class.",
  },
  {
    role: "student",
    href: "/check-in",
    title: "Student takes the Check-in",
    cue: "Skip one reading question, turn on Text-to-speech for the Tool trial → “Text-to-speech helped you” → Talk to a learning coach.",
  },
  {
    role: "student",
    href: "/passport",
    title: "Learning Passport, not a diagnosis",
    cue: "Evidence of what works: with vs without. Pick ENG 101 → “Exactly what Dr. Sara Khan will see” → Share.",
  },
  {
    role: "faculty",
    href: "/adjustments",
    title: "Instructor accepts in one click",
    cue: "No diagnosis attached — none needed. Accept adjustment. Weeks of paperwork → one click.",
  },
  {
    role: "advisor",
    href: "/cases",
    title: "Advisor routes — student approves",
    cue: "Open Layla’s case: AI suggests, human decides. Show the Privacy Lens (Diagnosis: does not exist).",
  },
  {
    role: "leadership",
    href: "/barriers",
    title: "Barrier Map: fix the course",
    cue: "BIO 210 week 3 glows: scanned PDF. Apply fix → counters move, SAS wait drops. Fix two more.",
  },
  {
    role: "student",
    href: "/principles",
    title: "Close",
    cue: "“We don’t look for what’s wrong with students. We find what’s wrong with the learning — and fix it for everyone.”",
  },
];

export function DemoConductor() {
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { role, setRole } = useRole();
  const { resetDemo } = useMockStore();
  // Role lives in sessionStorage: match the server HTML until hydrated.
  const hydrated = useHydrated();

  const activeIndex = hydrated
    ? STEPS.findIndex((s) => s.role === role && pathname.startsWith(s.href))
    : -1;

  function go(step: Step) {
    setRole(step.role);
    router.push(step.href);
  }

  return (
    <div className="fixed bottom-4 end-4 z-[60] print:hidden" dir="ltr">
      {open ? (
        <div
          role="dialog"
          aria-label="Demo script"
          className="mb-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between bg-[#0F3D3E] px-4 py-3 text-white">
            <p className="text-sm font-bold">🎬 Demo script · 4 min</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close demo script"
              className="rounded px-1 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
          <ol className="max-h-[60vh] space-y-1 overflow-y-auto p-2">
            {STEPS.map((step, i) => {
              const active = i === activeIndex;
              return (
                <li key={step.title}>
                  <button
                    type="button"
                    onClick={() => go(step)}
                    aria-current={active ? "step" : undefined}
                    className={`w-full rounded-xl px-3 py-2.5 text-start transition ${
                      active
                        ? "bg-[#E8F4F3] dark:bg-[#1A3D3A]"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-[#0F3D3E] dark:text-[#E8F0EF]">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                          active
                            ? "bg-[#1F7A7A] text-white"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {i + 1}
                      </span>
                      {step.title}
                    </span>
                    {active ? (
                      <span className="mt-1 block ps-7 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {step.cue}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-xs dark:border-slate-800">
            <span className="text-slate-500">Tip: open a 2nd window for split screen</span>
            {confirmReset ? (
              <button
                type="button"
                onClick={() => {
                  resetDemo();
                  setConfirmReset(false);
                  go(STEPS[0]);
                }}
                className="font-semibold text-rose-700 dark:text-rose-300"
              >
                Confirm reset
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="font-semibold text-[#1F7A7A] dark:text-[#4DB3B0]"
              >
                Reset demo data
              </button>
            )}
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="ms-auto flex h-12 items-center gap-2 rounded-full bg-[#0F3D3E] px-4 text-sm font-semibold text-white shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] dark:bg-[#4DB3B0] dark:text-[#0B1615]"
      >
        🎬 {activeIndex >= 0 ? `Step ${activeIndex + 1}/${STEPS.length}` : "Demo"}
      </button>
    </div>
  );
}
