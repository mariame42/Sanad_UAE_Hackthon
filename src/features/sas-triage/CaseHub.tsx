"use client";

import Link from "next/link";
import { LadderBadge, StatusBadge } from "@/components/ui/Badge";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";

export function CaseHub() {
  const { t } = useLocale();
  const { cases } = useMockStore();

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {t.cases.title}
      </h1>

      {cases.length === 0 ? (
        <p className="mt-6 text-slate-600 dark:text-slate-300">{t.cases.empty}</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {cases.map((c) => (
            <li key={c.id}>
              <Link
                href={`/cases/${c.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#1F7A7A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
                    {c.studentName}
                  </span>
                  <LadderBadge level={c.ladder} />
                  <StatusBadge>{c.status}</StatusBadge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                  {c.summary}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {t.cases.owner}: {c.owner ?? t.cases.unassigned} · {t.cases.sla}:{" "}
                  {c.slaHours}
                  {t.cases.hours}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
