"use client";

import { useState } from "react";
import { LadderBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";

export function MyCaseView() {
  const { t } = useLocale();
  const { studentCase, disputeCase } = useMockStore();
  const record = studentCase();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  if (!record) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          {t.myCase.title}
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">{t.myCase.none}</p>
      </div>
    );
  }

  const currentStep =
    record.status === "with_advisor" || record.status === "offer_sent"
      ? "Advisor review"
      : record.status === "with_sas"
        ? "SAS review"
        : record.status === "routed"
          ? `Routed to ${record.confirmedRoute}`
          : record.status === "disputed"
            ? "Recourse in progress"
            : record.status;

  const nextStep =
    record.status === "disputed"
      ? "Human follow-up"
      : record.owner
        ? "Support contact"
        : "Owner assignment";

  function submitDispute(reason: string) {
    disputeCase(record!.id, reason);
    setOpen(false);
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {t.myCase.title}
      </h1>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2">
          <LadderBadge level={record.ladder} />
          <StatusBadge>{record.status}</StatusBadge>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          {record.summary}
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t.cases.owner}
            </dt>
            <dd className="mt-1 font-medium">
              {record.owner ?? t.cases.unassigned}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t.cases.sla}
            </dt>
            <dd className="mt-1 font-medium">
              {record.slaHours}
              {t.cases.hours}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t.myCase.current}
            </dt>
            <dd className="mt-1 font-medium">{currentStep}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t.myCase.next}
            </dt>
            <dd className="mt-1 font-medium">{nextStep}</dd>
          </div>
        </dl>

        <Button
          type="button"
          variant="secondary"
          className="mt-6"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          {t.myCase.disagree}
        </Button>

        {done ? (
          <p className="mt-3 text-sm font-medium text-[#1F7A7A]" role="status">
            {t.myCase.submitted}
          </p>
        ) : null}
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="disagree-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2
              id="disagree-title"
              className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]"
            >
              {t.myCase.disagreeTitle}
            </h2>
            <ul className="mt-4 space-y-2">
              {(
                [
                  t.myCase.contest,
                  t.myCase.changeOwner,
                  t.myCase.withdraw,
                  t.myCase.escalate,
                ] as const
              ).map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-start text-sm font-medium hover:border-[#1F7A7A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] dark:border-slate-700"
                    onClick={() => submitDispute(label)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="ghost"
              className="mt-4"
              onClick={() => setOpen(false)}
            >
              {t.myCase.cancel}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
