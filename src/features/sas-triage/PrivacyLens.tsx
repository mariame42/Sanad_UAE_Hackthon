"use client";

import { useState } from "react";
import { routeLabel, statusLabel } from "@/lib/i18n/labels";
import { useRole } from "@/lib/roles/RoleProvider";
import type { CaseRecord, Locale, Role } from "@/lib/types";

type Viewer = "faculty" | "advisor" | "sas" | "leadership";

type Cell = { value: string } | { hidden: string };

const VIEWERS: { id: Viewer; en: string; ar: string }[] = [
  { id: "faculty", en: "Faculty", ar: "هيئة التدريس" },
  { id: "advisor", en: "Advisor", ar: "المرشد" },
  { id: "sas", en: "SAS", ar: "خدمات الإتاحة" },
  { id: "leadership", en: "Leadership", ar: "القيادة" },
];

function viewerForRole(role: Role): Viewer {
  if (role === "faculty" || role === "advisor" || role === "sas" || role === "leadership") {
    return role;
  }
  return "advisor";
}

/**
 * Shows the same case through each role's eyes — the role-based access
 * rules from the brief, made visible. Hidden values are never rendered.
 */
export function PrivacyLens({ record, locale }: { record: CaseRecord; locale: Locale }) {
  const { role } = useRole();
  const [viewer, setViewer] = useState<Viewer>(() => viewerForRole(role));
  const [roleSynced, setRoleSynced] = useState(role);
  if (role !== roleSynced) {
    setRoleSynced(role);
    setViewer(viewerForRole(role));
  }
  const ar = locale === "ar";
  const sasConsented = record.consent === "sas" || record.handoffSummary?.status === "approved";

  const reason = {
    l1: ar ? "هيئة التدريس تعمل في L1 فقط" : "Faculty operate at L1 only",
    aggregate: ar ? "القيادة ترى بيانات مجمّعة فقط" : "Leadership sees aggregates only",
    consent: ar ? "لم يوافق الطالب على مشاركته مع خدمات الإتاحة" : "Student has not consented to share with SAS",
    pending: ar ? "بانتظار موافقة الطالب" : "Waiting for the student's approval",
    never: ar ? "لا يغادر مكتب الملاحظة أبداً" : "Never leaves the Concern Desk",
    outside: ar ? "يبقى في أنظمة خدمات الإتاحة، خارج سند" : "Kept in SAS systems, outside Sanad",
    none: ar ? "غير موجود — سند لا ينتج تشخيصاً" : "Does not exist — Sanad never produces one",
  };

  const handoffCell = (): Cell => {
    if (!record.handoffSummary) return { hidden: ar ? "لا يوجد ملخص بعد" : "No summary yet" };
    if (record.handoffSummary.status !== "approved") return { hidden: reason.pending };
    return { value: record.handoffSummary.text };
  };

  const rows: { label: string; cells: Record<Viewer, Cell> }[] = [
    {
      label: ar ? "اسم الطالب" : "Student name",
      cells: {
        faculty: { hidden: reason.l1 },
        advisor: { value: record.studentName },
        sas: sasConsented ? { value: record.studentName } : { hidden: reason.consent },
        leadership: { hidden: reason.aggregate },
      },
    },
    {
      label: ar ? "حالة الدعم" : "Support status",
      cells: {
        faculty: {
          value:
            record.status === "offer_sent"
              ? ar ? "عُرض الدعم" : "Support offered"
              : ar ? "قُبل الدعم" : "Support accepted",
        },
        advisor: { value: statusLabel(record.status, locale) },
        sas: sasConsented ? { value: statusLabel(record.status, locale) } : { hidden: reason.consent },
        leadership: { value: ar ? "+1 في عدد الحالات المفتوحة" : "+1 in open-case count" },
      },
    },
    {
      label: ar ? "الملاحظة المحايدة" : "Neutral observation",
      cells: {
        faculty: { hidden: reason.l1 },
        advisor: { value: record.summary },
        sas: sasConsented ? { value: record.summary } : { hidden: reason.consent },
        leadership: { hidden: reason.aggregate },
      },
    },
    {
      label: ar ? "المسار" : "Route",
      cells: {
        faculty: { hidden: reason.l1 },
        advisor: { value: routeLabel(record.confirmedRoute ?? record.suggestedRoute, locale) },
        sas: sasConsented
          ? { value: routeLabel(record.confirmedRoute ?? record.suggestedRoute, locale) }
          : { hidden: reason.consent },
        leadership: { value: ar ? "ضمن توزيع المسارات" : "Counted in route mix" },
      },
    },
    {
      label: ar ? "ملخص التسليم" : "Handoff summary",
      cells: {
        faculty: { hidden: reason.l1 },
        advisor: handoffCell(),
        sas: handoffCell(),
        leadership: { hidden: reason.aggregate },
      },
    },
    {
      label: ar ? "ملاحظة الموظف الأصلية" : "Original staff wording",
      cells: {
        faculty: { hidden: reason.never },
        advisor: { hidden: reason.never },
        sas: { hidden: reason.never },
        leadership: { hidden: reason.never },
      },
    },
    {
      label: ar ? "السجلات السريرية (L4)" : "Clinical records (L4)",
      cells: {
        faculty: { hidden: reason.outside },
        advisor: { hidden: reason.outside },
        sas: { hidden: reason.outside },
        leadership: { hidden: reason.outside },
      },
    },
    {
      label: ar ? "تشخيص / درجة خطر" : "Diagnosis / risk score",
      cells: {
        faculty: { hidden: reason.none },
        advisor: { hidden: reason.none },
        sas: { hidden: reason.none },
        leadership: { hidden: reason.none },
      },
    },
  ];

  const visible = rows.filter((r) => "value" in r.cells[viewer]).length;

  return (
    <section
      aria-labelledby="lens-title"
      className="mt-8 rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft p-5 dark:border-white/10 dark:bg-slate-900/70"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="lens-title" className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          🔍 {ar ? "عدسة الخصوصية: من يرى ماذا" : "Privacy Lens: who sees what"}
        </h2>
        <p className="text-xs text-slate-500">
          {ar ? `${visible} من ${rows.length} حقول مرئية` : `${visible} of ${rows.length} fields visible`}
        </p>
      </div>

      <div role="tablist" aria-label={ar ? "عرض بصفة" : "View as"} className="mt-4 inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {VIEWERS.map((v) => (
          <button
            key={v.id}
            role="tab"
            type="button"
            aria-selected={viewer === v.id}
            onClick={() => setViewer(v.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              viewer === v.id
                ? "bg-white text-[#0F3D3E] shadow-sm dark:bg-slate-900 dark:text-[#E8F0EF]"
                : "text-slate-500 hover:text-[#0F3D3E] dark:text-slate-400"
            }`}
          >
            {ar ? v.ar : v.en}
          </button>
        ))}
      </div>

      <dl className="mt-4 divide-y divide-slate-100 dark:divide-slate-800" role="tabpanel">
        {rows.map((row) => {
          const cell = row.cells[viewer];
          return (
            <div key={row.label} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {row.label}
              </dt>
              <dd className="text-sm">
                {"value" in cell ? (
                  <span className="animate-[lens-in_.35s_ease-out] text-slate-800 dark:text-slate-100">
                    {cell.value}
                  </span>
                ) : (
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-block h-3.5 w-36 rounded bg-slate-300/80 blur-[3px] dark:bg-slate-600"
                    />
                    <span className="text-xs text-slate-500">🔒 {cell.hidden}</span>
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
