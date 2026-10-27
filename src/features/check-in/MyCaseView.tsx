"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Time } from "@/components/ui/Time";
import { routeLabel, statusLabel } from "@/lib/i18n/labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import type { CaseRecord } from "@/lib/types";

const ROLE_NAME = {
  advisor: { en: "Advisor", ar: "مرشد" },
  sas: { en: "SAS professional", ar: "مختص خدمات الإتاحة" },
  faculty: { en: "Faculty", ar: "هيئة تدريس" },
  student: { en: "Student", ar: "طالب" },
  leadership: { en: "Leadership", ar: "القيادة" },
} as const;

export function MyCaseView() {
  const { t, locale } = useLocale();
  const { studentCase, disputeCase, acceptOffer, respondHandoff, savedCheckIn, sasWaitDays } =
    useMockStore();
  const record = studentCase();
  const ar = locale === "ar";
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  if (!record) {
    return (
      <div className="stagger mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">{t.myCase.title}</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">{t.myCase.none}</p>
        {savedCheckIn ? <SavedResults strategies={savedCheckIn.strategies} ar={ar} /> : null}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#1F7A7A] dark:text-[#4DB3B0]">
          <Link href="/check-in">{t.checkIn.title} →</Link>
          <Link href="/passport">🛂 {ar ? "جواز التعلّم" : "My Learning Passport"} →</Link>
        </div>
      </div>
    );
  }

  function submitDispute(reason: string, withdraw = false) {
    disputeCase(record!.id, reason, withdraw);
    setOpen(false);
    setDone(true);
  }

  const handoff = record.handoffSummary;
  const audit = record.audit ?? [];

  return (
    <div className="stagger mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">{t.myCase.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {ar ? "أنت ترى كل ما يراه الآخرون عنك." : "You can see everything others can see about you."}{" "}
        <Link href="/passport" className="font-semibold text-[#1F7A7A] dark:text-[#4DB3B0]">
          🛂 {ar ? "جواز التعلّم" : "My Learning Passport"} →
        </Link>
      </p>

      {record.status === "offer_sent" ? (
        <section className="mt-6 rounded-2xl border-2 border-[#1F7A7A] bg-[#E8F4F3] p-5 dark:bg-[#1A3D3A]">
          <h2 className="font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
            {ar ? "عرض دعم من مرشدك" : "A support offer from your advisor"}
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
            {ar
              ? "لاحظ أحد أعضاء هيئة التدريس أن بعض المهام قد تكون صعبة. هل تريد التحدث مع مرشد؟ القرار لك، ولا يُسجل شيء إن رفضت."
              : "A member of staff noticed some tasks might be harder than they should be. Would you like to talk with an advisor? It’s your choice — nothing is recorded if you say no."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" onClick={() => acceptOffer(record.id, true)}>
              {ar ? "نعم، أود ذلك" : "Yes, I’d like that"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => acceptOffer(record.id, false)}>
              {ar ? "ليس الآن" : "Not now"}
            </Button>
          </div>
        </section>
      ) : null}

      {handoff?.status === "pending" ? (
        <section className="mt-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 dark:bg-amber-950/40">
          <h2 className="font-bold text-amber-950 dark:text-amber-100">
            {ar
              ? `موافقتك مطلوبة: مشاركة هذا الملخص مع ${routeLabel(handoff.to, locale)}`
              : `Your approval needed: share this summary with ${routeLabel(handoff.to, locale)}`}
          </h2>
          <blockquote className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {handoff.text}
          </blockquote>
          <p className="mt-2 text-xs text-amber-900 dark:text-amber-200">
            {ar ? "هذا كل ما سيُرسل. لا شيء آخر." : "This is exactly what will be sent. Nothing else."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" onClick={() => respondHandoff(record.id, true)}>
              {ar ? "أوافق على المشاركة" : "Approve and share"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => respondHandoff(record.id, false)}>
              {ar ? "لا تشارك" : "Don’t share"}
            </Button>
          </div>
        </section>
      ) : null}

      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft p-6 dark:border-white/10 dark:bg-slate-900/70">
        <Stepper record={record} ar={ar} />

        {record.waitDays && record.status !== "closed" ? (
          <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {ar
              ? `مراجعة خدمات الإتاحة تستغرق حالياً نحو ${sasWaitDays} أيام عمل. في الأثناء سيتواصل معك مدرب تعلّم خلال 48 ساعة.`
              : `SAS review currently takes about ${sasWaitDays} working days. Meanwhile, a learning coach will contact you within 48 hours.`}
          </p>
        ) : null}

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info label={t.cases.owner} value={record.owner ?? (ar ? "يُعيَّن قريباً" : "Being assigned")} />
          <Info label={t.cases.status} value={statusLabel(record.status, locale)} />
          <Info
            label={ar ? "المسار" : "Route"}
            value={record.confirmedRoute ? routeLabel(record.confirmedRoute, locale) : ar ? "لم يُحدد بعد" : "Not decided yet"}
          />
          <Info label={ar ? "مهلة الرد" : "Response target"} value={`${record.slaHours}${ar ? " ساعة" : "h"}`} />
        </dl>

        <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">{record.summary}</p>

        {record.status !== "closed" ? (
          <Button
            type="button"
            variant="secondary"
            className="mt-6"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
          >
            ✋ {t.myCase.disagree}
          </Button>
        ) : null}

        {done ? (
          <p className="mt-3 text-sm font-medium text-[#1F7A7A]" role="status">
            {t.myCase.submitted}
          </p>
        ) : null}
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft p-6 dark:border-white/10 dark:bg-slate-900/70" aria-labelledby="audit-title">
        <h2 id="audit-title" className="font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          👁 {ar ? "من اطّلع على ملفي" : "Who viewed my file"}
        </h2>
        {audit.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            {ar ? "لم يطّلع أحد بعد." : "No one has opened it yet."}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {audit.map((a, i) => (
              <li key={`${a.at}-${i}`} className="flex flex-wrap justify-between gap-2 text-sm">
                <span>
                  <span className="font-semibold">{a.who}</span>{" "}
                  <span className="text-slate-500">· {ROLE_NAME[a.role][locale]}</span>
                </span>
                <span className="text-xs text-slate-400">
                  <Time iso={a.at} locale={locale} />
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-slate-500">
          {ar
            ? "كل اطلاع يُسجَّل. هيئة التدريس لا ترى ملفك أبداً."
            : "Every view is logged. Faculty never see your file."}
        </p>
      </section>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="disagree-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur-sm sm:items-center"
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        >
          <div className="rise w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h2 id="disagree-title" className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
              {t.myCase.disagreeTitle}
            </h2>
            <ul className="mt-4 space-y-2">
              {(
                [
                  [t.myCase.contest, false],
                  [t.myCase.changeOwner, false],
                  [t.myCase.withdraw, true],
                  [t.myCase.escalate, false],
                ] as const
              ).map(([label, withdraw]) => (
                <li key={label}>
                  <button
                    type="button"
                    autoFocus={!withdraw && label === t.myCase.contest}
                    className={`w-full rounded-xl border px-4 py-3 text-start text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] ${
                      withdraw
                        ? "border-rose-200 text-rose-800 hover:border-rose-400 dark:border-rose-900 dark:text-rose-200"
                        : "border-slate-200 hover:border-[#1F7A7A] dark:border-slate-700"
                    }`}
                    onClick={() => submitDispute(label, withdraw)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <Button type="button" variant="ghost" className="mt-4" onClick={() => setOpen(false)}>
              {t.myCase.cancel}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stepper({ record, ar }: { record: CaseRecord; ar: boolean }) {
  const steps = ar
    ? ["استُلم الطلب", "مسؤول مسمّى", "اتُّفق على المسار", "تواصل الدعم"]
    : ["Request received", "Named owner", "Route agreed", "Support contact"];
  const reached =
    record.status === "closed"
      ? -1
      : record.status === "routed" || record.status === "with_sas"
        ? record.owner
          ? 3
          : 2
        : record.owner
          ? 1
          : 0;

  if (record.status === "closed") {
    return (
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        {ar ? "الحالة مغلقة. لا يُشارك شيء آخر." : "This case is closed. Nothing further is shared."}
      </p>
    );
  }

  return (
    <ol className="grid grid-cols-4 gap-2" aria-label={ar ? "تقدّم الحالة" : "Case progress"}>
      {steps.map((label, i) => {
        const state = i < reached ? "done" : i === reached ? "current" : "todo";
        return (
          <li key={label} className="flex flex-col gap-2" aria-current={state === "current" ? "step" : undefined}>
            <span
              className={`h-1.5 rounded-full ${
                state === "todo" ? "bg-slate-200 dark:bg-slate-700" : "bg-[#1F7A7A] dark:bg-[#4DB3B0]"
              } ${state === "current" ? "animate-pulse" : ""}`}
            />
            <span
              className={`text-xs ${
                state === "todo" ? "text-slate-400" : "font-semibold text-[#0F3D3E] dark:text-[#E8F0EF]"
              }`}
            >
              {state === "done" ? "✓ " : ""}
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

function SavedResults({ strategies, ar }: { strategies: string[]; ar: boolean }) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft p-5 dark:border-white/10 dark:bg-slate-900/70">
      <h2 className="font-bold">{ar ? "نتائجي المحفوظة (أنا فقط)" : "My saved results (only me)"}</h2>
      <ul className="mt-2 list-disc ps-5 text-sm text-slate-600 dark:text-slate-300">
        {strategies.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </section>
  );
}
