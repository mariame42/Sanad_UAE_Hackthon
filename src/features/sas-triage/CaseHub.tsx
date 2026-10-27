"use client";

import Link from "next/link";
import { LadderBadge, StatusBadge } from "@/components/ui/Badge";
import { SlaChip } from "@/components/ui/Time";
import { CountUp } from "@/components/motion/CountUp";
import { routeLabel, statusLabel } from "@/lib/i18n/labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import { useRole } from "@/lib/roles/RoleProvider";

export function CaseHub() {
  const { t, locale } = useLocale();
  const { cases } = useMockStore();
  const { role } = useRole();
  const ar = locale === "ar";

  // SAS only ever sees cases the student agreed to share with SAS (L3).
  const visible =
    role === "sas"
      ? cases.filter((c) => c.ladder === "L3" || c.consent === "sas")
      : cases;
  const open = visible.filter((c) => c.status !== "closed");

  return (
    <div className="stagger mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">{t.cases.title}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {role === "sas"
          ? ar
            ? "ترى خدمات الإتاحة فقط الحالات التي وافق الطالب على مشاركتها (L3)."
            : "SAS sees only cases the student agreed to share (L3)."
          : ar
            ? "لكل حالة مسؤول مسمّى ومهلة استجابة وسجل تسليم."
            : "Every case has a named owner, a response-time target and a handoff log."}
      </p>

      <dl className="stagger mt-6 grid grid-cols-3 gap-3">
        {[
          [ar ? "مفتوحة" : "Open", open.length],
          [ar ? "بلا مسؤول" : "Unassigned", open.filter((c) => !c.owner).length],
          [ar ? "بانتظار الطالب" : "Waiting for student", open.filter((c) => c.status === "awaiting_student" || c.handoffSummary?.status === "pending").length],
        ].map(([label, n]) => (
          <div key={String(label)} className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft p-4 dark:border-white/10 dark:bg-slate-900/70">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-2xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]"><CountUp value={Number(n)} /></dd>
          </div>
        ))}
      </dl>

      {visible.length === 0 ? (
        <p className="mt-6 text-slate-600 dark:text-slate-300">{t.cases.empty}</p>
      ) : (
        <ul className="stagger mt-6 space-y-3">
          {visible.map((c) => (
            <li key={c.id}>
              <Link
                href={`/cases/${c.id}`}
                className="lift group flex gap-4 rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft p-5 hover:border-[#1F7A7A]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] dark:border-white/10 dark:bg-slate-900/70"
              >
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E8F4F3] to-[#C4E4E1] text-sm font-bold text-[#0F3D3E] dark:from-[#1A3D3A] dark:to-[#1F4F4B] dark:text-[#E8F0EF]"
                >
                  {c.studentName.split(" ").map((w) => w[0]).filter((ch) => /[A-Z]/.test(ch)).slice(0, 2).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">{c.studentName}</span>
                    <LadderBadge level={c.ladder} />
                    <StatusBadge>{statusLabel(c.status, locale)}</StatusBadge>
                    {c.status !== "closed" ? (
                      <SlaChip createdAt={c.createdAt} slaHours={c.slaHours} met={Boolean(c.owner)} locale={locale} />
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{c.summary}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {t.cases.owner}: {c.owner ?? t.cases.unassigned} · ✨{" "}
                    {routeLabel(c.confirmedRoute ?? c.suggestedRoute, locale)}
                  </p>
                </div>
                <span aria-hidden className="nudge self-center text-slate-300 group-hover:text-[#1F7A7A] dark:text-slate-600">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
