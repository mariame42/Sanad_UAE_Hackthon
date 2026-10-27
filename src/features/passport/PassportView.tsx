"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Time } from "@/components/ui/Time";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import {
  ADJUSTMENT_KEYS,
  ADJUSTMENTS,
  COURSES,
  evidenceLine,
  rate,
  verdict,
  type Verdict,
} from "@/lib/passport";
import type { AdjustmentKey, Locale, PassportShare } from "@/lib/types";

const VERDICT: Record<Verdict, { en: string; ar: string; cls: string }> = {
  helps: {
    en: "Helps you",
    ar: "يساعدك",
    cls: "bg-[#E8F4F3] text-[#0F3D3E] dark:bg-[#1A3D3A] dark:text-[#E8F0EF]",
  },
  no_difference: {
    en: "No clear difference",
    ar: "لا فرق واضح",
    cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  not_enough: {
    en: "Need more tries",
    ar: "يحتاج محاولات أكثر",
    cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
};

export const SHARE_STATUS: Record<PassportShare["status"], { en: string; ar: string }> = {
  pending: { en: "⏳ Waiting for the instructor", ar: "⏳ بانتظار المدرّس" },
  accepted: { en: "✓ Adjustment accepted", ar: "✓ تمت الموافقة على التعديل" },
  discuss: {
    en: "💬 The instructor would like a short chat first",
    ar: "💬 يودّ المدرّس حديثاً قصيراً أولاً",
  },
  revoked: { en: "Withdrawn by you", ar: "سحبتَه أنت" },
};

export function PassportView() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const { passport, shares, sharePassport, revokeShare, setContribute } = useMockStore();

  const keys = ADJUSTMENT_KEYS.filter((k) => passport.evidence[k]);
  const helping = keys.filter((k) => verdict(passport.evidence[k]) === "helps");

  const [course, setCourse] = useState(COURSES[0].course);
  const [picked, setPicked] = useState<AdjustmentKey[] | null>(null);
  const chosen = (picked ?? helping).filter((k) => helping.includes(k));
  const instructor = COURSES.find((c) => c.course === course)!.instructor;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {ar ? "جواز التعلّم" : "My Learning Passport"}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {ar
          ? "دليل على ما ينجح معك — وليس تشخيصاً لما هو «خطأ». ملكك أنت، وتشاركه مقرراً تلو الآخر."
          : "Evidence of what works for you — not proof of what’s “wrong”. You own it and share it one course at a time."}
      </p>

      <section
        aria-label={ar ? "بطاقة الجواز" : "Passport card"}
        className="lens-in relative mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F3D3E] via-[#1F5F5F] to-[#1F7A7A] p-6 text-white shadow-xl"
      >
        <div aria-hidden className="absolute -end-16 -top-16 h-56 w-56 rounded-full border-[18px] border-white/5" />
        <div aria-hidden className="absolute -bottom-20 -start-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9FD9D6]">
              {ar ? "سند · جواز التعلّم" : "Sanad · Learning Passport"}
            </p>
            <p className="mt-2 text-2xl font-bold">{ar ? "ليلى المنصوري" : "Layla Al Mansoori"}</p>
            <p className="mt-1 text-xs text-white/70">
              {ar ? `${passport.sessions} جلسات تسجيل · آخر تحديث ` : `${passport.sessions} Check-in sessions · updated `}
              <Time iso={passport.updatedAt} locale={locale} />
            </p>
          </div>
          <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold">
            🚫 {ar ? "لا تشخيص بداخله" : "No diagnosis inside"}
          </span>
        </div>

        <ul className="relative mt-6 space-y-4">
          {keys.map((k) => {
            const e = passport.evidence[k]!;
            const v = verdict(e);
            return (
              <li key={k} className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{ADJUSTMENTS[k].tool[locale]}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${VERDICT[v].cls}`}>
                    {VERDICT[v][locale]}
                  </span>
                </div>
                <Bar label={ar ? "معه" : "With"} value={rate(e.with)} strong />
                <Bar label={ar ? "بدونه" : "Without"} value={rate(e.without)} />
                <p className="mt-2 text-xs text-white/60">{evidenceLine(e, locale)}</p>
              </li>
            );
          })}
        </ul>
        {!keys.length ? (
          <p className="relative mt-6 text-sm text-white/80">
            {ar ? "لا نتائج بعد. جرّب أداة في تسجيل التعلّم." : "No results yet. Try a tool in the Check-in."}
          </p>
        ) : null}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          {ar ? "شاركه مع مدرّس" : "Share with an instructor"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {ar
            ? "للتعديلات المرنة البسيطة فقط. التسهيلات الرسمية تمر عبر خدمات الإتاحة."
            : "For light, flexible adjustments. Formal accommodations still go through SAS."}
        </p>

        <label className="mt-4 block text-sm font-bold">
          {ar ? "المقرر" : "Course"}
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {COURSES.map((c) => (
              <option key={c.course} value={c.course}>
                {c.course} · {c.instructor}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="mt-4">
          <legend className="text-sm font-bold">{ar ? "ما أطلبه" : "What I’m asking for"}</legend>
          <div className="mt-2 space-y-2">
            {keys.map((k) => {
              const ok = helping.includes(k);
              return (
                <label
                  key={k}
                  className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                    ok
                      ? "cursor-pointer border-slate-200 has-[:checked]:border-[#1F7A7A] dark:border-slate-700"
                      : "border-dashed border-slate-200 text-slate-400 dark:border-slate-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={!ok}
                    checked={chosen.includes(k)}
                    onChange={(e) =>
                      setPicked(
                        e.target.checked ? [...chosen, k] : chosen.filter((x) => x !== k),
                      )
                    }
                    className="mt-0.5 h-4 w-4 text-[#1F7A7A]"
                  />
                  <span>
                    <span className="font-semibold">{ADJUSTMENTS[k].ask[locale]}</span>
                    <span className="block text-xs">
                      {ok
                        ? `${ADJUSTMENTS[k].tool[locale]} · ${evidenceLine(passport.evidence[k]!, locale)}`
                        : ar
                          ? "لا دليل كافٍ — لا يُقترح"
                          : "No clear evidence — not proposed"}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {ar ? `ما سيراه ${instructor}` : `Exactly what ${instructor} will see`}
          </p>
          {chosen.length ? (
            <ul className="mt-2 list-disc space-y-1 ps-5">
              {chosen.map((k) => (
                <li key={k}>
                  {ADJUSTMENTS[k].ask[locale]}{" "}
                  <span className="text-slate-500">({evidenceLine(passport.evidence[k]!, locale)})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-slate-500">{ar ? "لم تختر شيئاً." : "Nothing selected."}</p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            {ar
              ? "لا إجاباتك، ولا نتائجك الأخرى، ولا أي تشخيص."
              : "Not your answers, not your other results, never a diagnosis."}
          </p>
        </div>

        <Button
          type="button"
          className="mt-4"
          disabled={!chosen.length}
          onClick={() => sharePassport(course, chosen)}
        >
          {ar ? `شارك مع ${course}` : `Share for ${course}`}
        </Button>
      </section>

      {shares.length ? (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
            {ar ? "مشاركاتي" : "My shares"}
          </h2>
          <ul className="mt-3 space-y-3">
            {shares.map((s) => (
              <ShareRow key={s.id} share={s} locale={locale} onRevoke={() => revokeShare(s.id)} />
            ))}
          </ul>
        </section>
      ) : null}

      <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
        <input
          type="checkbox"
          checked={passport.contribute}
          onChange={(e) => setContribute(e.target.checked)}
          className="mt-0.5 h-4 w-4 text-[#1F7A7A]"
        />
        <span>
          <span className="font-semibold">
            {ar ? "ساهم دون كشف هويتك في خريطة العوائق" : "Contribute anonymously to the Barrier Map"}
          </span>
          <span className="mt-0.5 block text-slate-500">
            {ar
              ? "تُحتسب النتائج فقط في مجموعات من 10 أو أكثر، لإصلاح عوائق المقررات للجميع. متوقف افتراضياً."
              : "Counted only in groups of 10 or more, to fix course barriers for everyone. Off by default."}
          </span>
        </span>
      </label>

      <Link href="/check-in" className="mt-6 inline-block text-sm font-semibold text-[#1F7A7A] dark:text-[#4DB3B0]">
        {ar ? "أضف جلسة تسجيل أخرى" : "Add another Check-in session"} →
      </Link>
    </div>
  );
}

function Bar({ label, value, strong }: { label: string; value: number | null; strong?: boolean }) {
  const pct = Math.round((value ?? 0) * 100);
  return (
    <div className="mt-2 grid grid-cols-[4rem_1fr_2.5rem] items-center gap-2 text-xs">
      <span className="text-white/80">{label}</span>
      <span className="h-2 overflow-hidden rounded-full bg-white/15">
        <span
          className={`block h-full rounded-full transition-[width] duration-700 ${strong ? "bg-[#9FD9D6]" : "bg-white/45"}`}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="text-end font-semibold tabular-nums">{value === null ? "—" : `${pct}%`}</span>
    </div>
  );
}

function ShareRow({
  share,
  locale,
  onRevoke,
}: {
  share: PassportShare;
  locale: Locale;
  onRevoke: () => void;
}) {
  const ar = locale === "ar";
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold">
          {share.course} · {share.instructor}
        </p>
        <p className="text-xs text-slate-400">
          <Time iso={share.respondedAt ?? share.createdAt} locale={locale} />
        </p>
      </div>
      <p className="mt-1 text-slate-600 dark:text-slate-300">
        {share.adjustments.map((k) => ADJUSTMENTS[k].ask[locale]).join(" · ")}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold" role="status">
          {SHARE_STATUS[share.status][locale]}
        </p>
        {share.status !== "revoked" ? (
          <button
            type="button"
            onClick={onRevoke}
            className="text-xs font-semibold text-rose-700 underline-offset-2 hover:underline dark:text-rose-300"
          >
            {ar ? "اسحب المشاركة" : "Revoke access"}
          </button>
        ) : null}
      </div>
    </li>
  );
}
