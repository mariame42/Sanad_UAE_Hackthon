"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { LadderBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import { useRole } from "@/lib/roles/RoleProvider";
import type { RouteOption } from "@/lib/types";

const ROUTES: RouteOption[] = [
  "learning_center",
  "language_support",
  "academic_advising",
  "sas",
  "counseling",
  "career_wellbeing",
];

export function CaseDetail() {
  const params = useParams();
  const id = String(params.id);
  const { t, locale } = useLocale();
  const { cases, confirmRoute, assignOwner, sasFull } = useMockStore();
  const { personaName, role } = useRole();
  const record = cases.find((c) => c.id === id);
  const [route, setRoute] = useState<RouteOption | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!record) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10">
        <p>{t.cases.empty}</p>
      </div>
    );
  }

  async function refreshSuggestion() {
    setLoading(true);
    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "route_suggest",
          summary: record!.summary,
          locale,
        }),
      });
      const data = (await res.json()) as {
        route?: RouteOption;
        reason?: string;
      };
      if (data.route) setRoute(data.route);
      if (data.reason) setReason(data.reason);
    } catch {
      setRoute(record!.suggestedRoute);
      setReason(record!.suggestedReason);
    } finally {
      setLoading(false);
    }
  }

  const suggested = route ?? record.suggestedRoute;
  const why = reason ?? record.suggestedReason;
  const canAct = role === "advisor" || role === "sas";

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          {record.studentName}
        </h1>
        <LadderBadge level={record.ladder} />
        <StatusBadge>{record.status}</StatusBadge>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {record.summary}
      </p>

      {sasFull && suggested === "sas" ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100"
        >
          {t.cases.capacity}
        </p>
      ) : null}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          {t.cases.suggest}:{" "}
          <span className="font-semibold text-[#1F7A7A]">{suggested}</span>
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="font-semibold">{t.cases.reason}:</span> {why}
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-3"
          disabled={loading}
          onClick={() => void refreshSuggestion()}
        >
          {loading ? "…" : locale === "ar" ? "تحديث الاقتراح" : "Refresh AI suggestion"}
        </Button>
      </div>

      {canAct ? (
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-bold">
            {t.cases.confirm}
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={suggested}
              onChange={(e) => setRoute(e.target.value as RouteOption)}
            >
              {ROUTES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() =>
                confirmRoute(record.id, suggested, personaName("en"))
              }
            >
              {t.cases.confirm}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => assignOwner(record.id, personaName("en"))}
            >
              {t.cases.assign}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          {t.cases.handoff}
        </h2>
        <ol className="mt-3 space-y-3">
          {record.handoffs.map((h, i) => (
            <li
              key={`${h.at}-${i}`}
              className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/60"
            >
              <p className="font-semibold">
                {h.from} → {h.to}
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{h.note}</p>
              <p className="mt-1 text-xs text-slate-400">
                {new Date(h.at).toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        {t.cases.owner}: {record.owner ?? t.cases.unassigned} · {t.cases.sla}:{" "}
        {record.slaHours}
        {t.cases.hours}
        {record.confirmedRoute
          ? ` · ${record.confirmedRoute}`
          : ""}
      </p>
    </div>
  );
}
