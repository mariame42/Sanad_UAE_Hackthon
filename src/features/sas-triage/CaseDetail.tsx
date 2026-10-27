"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LadderBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";
import { SlaChip, Time } from "@/components/ui/Time";
import { ROUTE_LABELS, routeLabel, statusLabel } from "@/lib/i18n/labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import { useRole } from "@/lib/roles/RoleProvider";
import type { RouteOption } from "@/lib/types";
import { PrivacyLens } from "./PrivacyLens";

const ROUTES = Object.keys(ROUTE_LABELS) as RouteOption[];

export function CaseDetail() {
  const params = useParams();
  const id = String(params.id);
  const { t, locale } = useLocale();
  const { cases, confirmRoute, assignOwner, logView, draftHandoff, sasFull, sasWaitDays } =
    useMockStore();
  const { personaName, role } = useRole();
  const record = cases.find((c) => c.id === id);
  const ar = locale === "ar";
  const [aiRoute, setAiRoute] = useState<RouteOption | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [chosen, setChosen] = useState<RouteOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [drafting, setDrafting] = useState(false);

  const canAct = role === "advisor" || role === "sas";
  const me = personaName("en");
  const exists = Boolean(record);

  // Every view of a case file is written to the audit log the student can see.
  useEffect(() => {
    if (exists && canAct) logView(id, me, role);
  }, [exists, canAct, id, me, role, logView]);

  if (!record) {
    return (
      <div className="stagger mx-auto max-w-2xl px-5 py-10">
        <p>{t.cases.empty}</p>
      </div>
    );
  }

  const suggested = aiRoute ?? record.suggestedRoute;
  const why = reason ?? record.suggestedReason;
  const decision = chosen ?? record.confirmedRoute ?? suggested;

  async function refreshSuggestion() {
    setLoading(true);
    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "route_suggest", summary: record!.summary, locale }),
      });
      const data = (await res.json()) as { route?: RouteOption; reason?: string };
      if (data.route && data.route in ROUTE_LABELS) setAiRoute(data.route);
      if (data.reason) setReason(data.reason);
    } catch {
      setAiRoute(record!.suggestedRoute);
      setReason(record!.suggestedReason);
    } finally {
      setLoading(false);
    }
  }

  async function draftSummary() {
    setDrafting(true);
    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "handoff_summary", summary: record!.summary, locale }),
      });
      const data = (await res.json()) as { summary?: string };
      setDraft(data.summary ?? record!.summary);
    } catch {
      setDraft(record!.summary);
    } finally {
      setDrafting(false);
    }
  }

  const handoff = record.handoffSummary;

  return (
    <div className="stagger mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <Link href="/cases" className="text-sm font-semibold text-[#1F7A7A] dark:text-[#4DB3B0]">
        ← {t.cases.title}
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          {record.studentName}
        </h1>
        <LadderBadge level={record.ladder} />
        <StatusBadge>{statusLabel(record.status, locale)}</StatusBadge>
        <SlaChip
          createdAt={record.createdAt}
          slaHours={record.slaHours}
          met={Boolean(record.owner)}
          locale={locale}
        />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {record.summary}
      </p>

      {sasFull && (decision === "sas" || record.ladder === "L3") ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100"
        >
          {t.cases.capacity}{" "}
          {ar ? `(الانتظار الحالي ~${sasWaitDays} أيام عمل)` : `(current wait ~${sasWaitDays} working days)`}
        </p>
      ) : null}

      <div className="mt-6 rounded-2xl border border-[#1F7A7A]/30 bg-[#E8F4F3]/60 p-5 dark:border-[#4DB3B0]/40 dark:bg-[#1A3D3A]/60">
        <p className="text-xs font-bold uppercase tracking-wide text-[#1F7A7A] dark:text-[#4DB3B0]">
          ✨ {t.cases.suggest}
        </p>
        <p className="mt-1 text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          {routeLabel(suggested, locale)}
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="font-semibold">{t.cases.reason}:</span> {why}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {ar ? "اقتراح فقط — يقرر إنسان مؤهل." : "Suggestion only — a qualified human decides."}
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-3"
          disabled={loading}
          onClick={() => void refreshSuggestion()}
        >
          {loading ? "…" : ar ? "تحديث الاقتراح" : "Refresh AI suggestion"}
        </Button>
      </div>

      {canAct ? (
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-bold">
            {t.cases.confirm}
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-900/70"
              value={decision}
              onChange={(e) => setChosen(e.target.value as RouteOption)}
            >
              {ROUTES.map((r) => (
                <option key={r} value={r}>
                  {routeLabel(r, locale)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => confirmRoute(record.id, decision, me)}>
              {t.cases.confirm}
            </Button>
            {record.owner !== me ? (
              <Button type="button" variant="secondary" onClick={() => assignOwner(record.id, me)}>
                {t.cases.assign}
              </Button>
            ) : null}
          </div>
          {record.status === "awaiting_student" ? (
            <p className="text-sm text-amber-800 dark:text-amber-200" role="status">
              {ar
                ? "مسار خدمات الإتاحة يحتاج موافقة الطالب. أرسل له ملخصاً ليوافق عليه."
                : "The SAS route needs the student's agreement. Send them a summary to approve."}
            </p>
          ) : null}
        </div>
      ) : null}

      {canAct && record.confirmedRoute ? (
        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft p-5 dark:border-white/10 dark:bg-slate-900/70">
          <h2 className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
            {ar ? "ملخص التسليم (الحد الأدنى الضروري)" : "Handoff summary (minimum necessary)"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {ar
              ? `إلى: ${routeLabel(record.confirmedRoute, locale)} · لا يُشارك قبل موافقة الطالب`
              : `To: ${routeLabel(record.confirmedRoute, locale)} · nothing is shared until the student approves`}
          </p>
          {handoff ? (
            <div className="mt-3">
              <p className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">{handoff.text}</p>
              <p className="mt-2 text-sm font-semibold" role="status">
                {handoff.status === "pending"
                  ? ar ? "⏳ بانتظار موافقة الطالب" : "⏳ Waiting for the student's approval"
                  : handoff.status === "approved"
                    ? ar ? "✓ وافق الطالب — تمت المشاركة" : "✓ Student approved — shared"
                    : ar ? "✕ رفض الطالب — لم يُرسل شيء" : "✕ Student declined — nothing sent"}
              </p>
            </div>
          ) : draft ? (
            <div className="mt-3 space-y-3">
              <TextArea
                aria-label={ar ? "ملخص التسليم" : "Handoff summary"}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <Button
                type="button"
                onClick={() => draftHandoff(record.id, draft, record.confirmedRoute!)}
              >
                {ar ? "أرسل للطالب للموافقة" : "Send to student for approval"}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              disabled={drafting}
              onClick={() => void draftSummary()}
            >
              {drafting ? "…" : ar ? "✨ صياغة الملخص بالذكاء الاصطناعي" : "✨ Draft with AI"}
            </Button>
          )}
        </section>
      ) : null}

      <PrivacyLens record={record} locale={locale} />

      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">{t.cases.handoff}</h2>
        <ol className="mt-3 space-y-3 border-s-2 border-[#1F7A7A]/30 ps-4">
          {record.handoffs.map((h, i) => (
            <li
              key={`${h.at}-${i}`}
              className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/60"
            >
              <p className="font-semibold">
                {h.from} → {routeLabel(h.to, locale)}
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{h.note}</p>
              <p className="mt-1 text-xs text-slate-400">
                <Time iso={h.at} locale={locale} />
              </p>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        {t.cases.owner}: {record.owner ?? t.cases.unassigned} · {t.cases.sla}: {record.slaHours}
        {t.cases.hours}
      </p>
    </div>
  );
}
