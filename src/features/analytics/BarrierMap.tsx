"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CountUp, CountUpText } from "@/components/motion/CountUp";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  BARRIER_COURSES,
  BARRIER_WEEKS,
  barrierGrid,
  barriers,
  MIN_GROUP,
  optedInContributors,
  projectImpact,
  RESIDUAL_GAP_PCT,
  type BarrierCell,
} from "@/lib/mock/barriers";
import { useMockStore } from "@/lib/mock/MockStoreProvider";

/** Sequential teal ramp (one hue, light → dark); dark mode has its own steps. */
const BINS = [
  { min: 30, cls: "bg-[#1F7A7A] text-white dark:bg-[#6FD1CB] dark:text-[#0B1615]" },
  { min: 20, cls: "bg-[#6FBDB7] text-[#0B1615] dark:bg-[#2F8580] dark:text-white" },
  { min: 10, cls: "bg-[#C4E4E1] text-[#0F3D3E] dark:bg-[#1F4F4B] dark:text-[#E8F0EF]" },
  { min: 0, cls: "bg-[#EEF6F5] text-slate-600 dark:bg-[#16302E] dark:text-slate-300" },
];

const HATCH =
  "bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgba(100,116,139,0.18)_6px_8px)] text-slate-400";

function binClass(pct: number) {
  return BINS.find((b) => pct >= b.min)!.cls;
}

export function BarrierMap() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const { appliedFixes, applyFix, dashboard, sasWaitDays } = useMockStore();
  const [selected, setSelected] = useState<BarrierCell | null>(null);

  const sasDemand = dashboard.demand.find((d) => d.service === "SAS")?.requests ?? 1;
  const impact = projectImpact(appliedFixes, sasDemand, sasWaitDays);
  const barrier = selected?.barrierId ? barriers.find((b) => b.id === selected.barrierId) : undefined;
  const isFixed = (cell: BarrierCell) => Boolean(cell.barrierId && appliedFixes.includes(cell.barrierId));
  const shown = (cell: BarrierCell) => (isFixed(cell) ? RESIDUAL_GAP_PCT : cell.gapPct);

  return (
    <div className="stagger mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F7A7A] dark:text-[#4DB3B0]">
        {ar ? "شخّص المقرر، لا الطالب" : "Diagnose the course, not the student"}
      </p>
      <h1 className="mt-1 text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {ar ? "خريطة العوائق" : "Barrier Map"}
      </h1>
      <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">
        {ar
          ? "نتائج تسجيل التعلّم المجهولة لكل مقرر وأسبوع: نسبة الطلاب الذين تحسّن أداؤهم بوضوح عند تفعيل أداة أو إلغاء المؤقت. حين تتوهج خلية، المشكلة في المادة — فلنُصلحها للجميع."
          : "Anonymous Check-in results by course and week: the share of students who did markedly better once a tool was on or a timer was off. When a cell glows, the problem is in the material — so fix it for everyone."}
      </p>

      <section
        aria-labelledby="impact-title"
        className="mt-6 rounded-2xl bg-[#0F3D3E] p-5 text-white dark:bg-[#1A3D3A]"
      >
        <h2 id="impact-title" className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#9FD9D6]">
          {ar ? "الأثر — محاكاة" : "Impact — simulation"}
          <span className="rounded-full bg-white/10 px-2 py-0.5 normal-case tracking-normal text-white/70">
            {ar ? "ليست توقعاً" : "not a forecast"}
          </span>
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4" aria-live="polite">
          <Stat label={ar ? "عوائق أُزيلت" : "Barriers fixed"} value={`${impact.fixed} / ${barriers.length}`} />
          <Stat label={ar ? "طلاب وصلهم الدعم دون إحالة" : "Students reached, no referral"} value={`~${impact.reached}`} />
          <Stat label={ar ? "إحالات تم تجنّبها" : "Referrals avoided"} value={`~${impact.referralsAvoided}`} />
          <div>
            <dt className="text-xs text-white/70">{ar ? "انتظار خدمات الإتاحة" : "SAS wait (working days)"}</dt>
            <dd className="text-3xl font-bold tabular-nums">
              <span dir="ltr" className="inline-block">
                {impact.fixed ? (
                  <>
                    <span className="text-xl text-white/50 line-through">{sasWaitDays}</span>{" "}
                    <span className="inline-block">→ <CountUp value={impact.projectedWait} /></span>
                  </>
                ) : (
                  sasWaitDays
                )}
              </span>
            </dd>
          </div>
        </dl>
        <details className="mt-3 text-xs text-white/70">
          <summary className="cursor-pointer font-semibold">{ar ? "الافتراضات" : "Assumptions"}</summary>
          <p className="mt-1">
            {ar
              ? "كل عائق مُزال يصل إلى طلابه دون إحالة؛ ينخفض انتظار خدمات الإتاحة بنسبة الطلبات التي لم تعد تصلها (الطلب الحالي "
              : "Each removed barrier reaches its students without a referral; SAS wait shrinks in proportion to the requests it no longer receives (current demand "}
            {sasDemand}
            {ar ? " طلباً). أرقام تجريبية — الأرقام الحقيقية تأتي من التجربة." : " requests). Demo numbers — real ones come from the pilot."}
          </p>
        </details>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <div className="overflow-x-auto" dir="ltr">
            <table className="w-full min-w-[34rem] border-separate border-spacing-[3px] text-sm">
              <caption className="sr-only">
                {ar ? "خريطة العوائق حسب المقرر والأسبوع" : "Barrier Map by course and week"}
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="w-24 text-start text-xs font-semibold text-slate-500">
                    {ar ? "المقرر" : "Course"}
                  </th>
                  {BARRIER_WEEKS.map((w) => (
                    <th key={w} scope="col" className="text-xs font-semibold text-slate-500">
                      W{w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BARRIER_COURSES.map((course) => (
                  <tr key={course}>
                    <th scope="row" className="whitespace-nowrap pe-2 text-start text-xs font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
                      {course}
                    </th>
                    {BARRIER_WEEKS.map((week) => {
                      const cell = barrierGrid.find((c) => c.course === course && c.week === week)!;
                      const hidden = cell.n < MIN_GROUP;
                      const fixed = isFixed(cell);
                      const active = selected?.course === course && selected.week === week;
                      const value = shown(cell);
                      return (
                        <td key={week} className="p-0">
                          <button
                            type="button"
                            onClick={() => setSelected(cell)}
                            aria-pressed={active}
                            aria-label={`${course}, week ${week}: ${
                              hidden ? "fewer than 10 students, hidden" : `${value}%${fixed ? ", fixed" : ""}`
                            }`}
                            className={`relative flex h-11 w-full items-center justify-center rounded-md text-xs font-semibold tabular-nums transition-colors duration-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F3D3E] dark:focus-visible:outline-white ${
                              hidden ? HATCH : binClass(value)
                            } ${active ? "ring-2 ring-[#0F3D3E] ring-offset-1 dark:ring-white dark:ring-offset-[#0B1615]" : ""}`}
                          >
                            {hidden ? "n<10" : `${value}%`}
                            {fixed ? (
                              <span aria-hidden className="pop absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-[#1F7A7A] shadow dark:bg-[#0B1615] dark:text-[#6FD1CB]">
                                ✓
                              </span>
                            ) : null}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500" aria-hidden>
            <span>{ar ? "نسبة الطلاب المتأثرين:" : "Share of students affected:"}</span>
            {[...BINS].reverse().map((b, i) => (
              <span key={b.min} className="inline-flex items-center gap-1.5">
                <span className={`h-3 w-5 rounded-sm ${b.cls}`} />
                {i === BINS.length - 1 ? `${b.min}%+` : `${b.min}–${BINS[BINS.length - 2 - i].min - 1}%`}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-3 w-5 rounded-sm ${HATCH}`} />
              {ar ? "مخفي (n<10)" : "hidden (n<10)"}
            </span>
            <span>✓ {ar ? "أُصلح" : "fixed"}</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {ar ? "المصدر: " : "Source: "}
            {optedInContributors.toLocaleString(ar ? "ar-AE" : "en-GB")}
            {ar ? " طالباً اختاروا المساهمة دون كشف الهوية" : " students who opted in to anonymous contribution"}
            {ar ? " · لا بيانات عن أفراد." : " · no individual data."}
          </p>
        </div>

        <aside
          aria-live="polite"
          className="h-fit rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft p-5 dark:border-white/10 dark:bg-slate-900/70"
        >
          {!selected ? (
            <p className="text-sm text-slate-500">
              {ar
                ? "اختر خلية متوهجة لترى السبب المحتمل والإصلاح المقترح."
                : "Pick a glowing cell to see the likely cause and the suggested fix."}
            </p>
          ) : selected.n < MIN_GROUP ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              🔒{" "}
              {ar
                ? `${selected.course} · الأسبوع ${selected.week}: أقل من 10 طلاب — مخفي لحماية الخصوصية.`
                : `${selected.course} · week ${selected.week}: fewer than 10 students — hidden to protect privacy.`}
            </p>
          ) : barrier ? (
            <div key={barrier.id} className="lens-in">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {barrier.course} · {ar ? `الأسبوع ${barrier.week} · ${barrier.n} طالباً` : `Week ${barrier.week} · ${barrier.n} students`}
              </p>
              <p className="mt-2 text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
                {ar
                  ? `${barrier.gapPct}٪ تحسّنوا بوضوح مع: ${barrier.tool.ar}`
                  : `${barrier.gapPct}% did markedly better with ${barrier.tool.en}`}
              </p>
              <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                {ar ? "السبب المحتمل" : "Likely barrier"}
              </h3>
              <p className="mt-1 text-sm">{barrier.cause[locale]}</p>
              <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                {ar ? "الإصلاح المقترح" : "Suggested fix"}
              </h3>
              <p className="mt-1 text-sm font-semibold">{barrier.fix[locale]}</p>
              <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center text-xs dark:bg-slate-800">
                <Mini label={ar ? "طلاب" : "students"} value={barrier.affected} />
                <Mini label={ar ? "إحالات أقل" : "fewer referrals"} value={barrier.referralsAvoided} />
                <Mini label={ar ? "طلبات SAS أقل" : "fewer SAS requests"} value={barrier.sasAvoided} />
              </dl>
              {appliedFixes.includes(barrier.id) ? (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-[#1F7A7A] dark:text-[#4DB3B0]" role="status">
                    ✓ {ar ? "طُبّق الإصلاح — للجميع، دون تحديد أحد." : "Fix applied — for everyone, no one identified."}
                  </p>
                  <button
                    type="button"
                    onClick={() => applyFix(barrier.id, false)}
                    className="mt-2 text-xs font-semibold text-slate-500 underline-offset-2 hover:underline"
                  >
                    {ar ? "تراجع" : "Undo"}
                  </button>
                </div>
              ) : (
                <Button type="button" className="mt-4 w-full" onClick={() => applyFix(barrier.id, true)}>
                  {ar ? "طبّق الإصلاح" : "Apply fix"}
                </Button>
              )}
              <p className="mt-3 text-xs text-slate-500">
                {ar
                  ? "المدرّس يقرر. سند يقترح فقط."
                  : "The instructor decides. Sanad only suggests."}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {ar
                ? `${selected.course} · الأسبوع ${selected.week}: ${selected.gapPct}٪ — ضمن المعدل المعتاد، لا إشارة إلى عائق.`
                : `${selected.course} · week ${selected.week}: ${selected.gapPct}% — within the usual range, no barrier signal.`}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-white/70">{label}</dt>
      <dd className="text-3xl font-bold tabular-nums">
        <span dir="ltr" className="inline-block"><CountUpText text={value} /></span>
      </dd>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse justify-end">
      <dt className="text-slate-500">{label}</dt>
      <dd dir="ltr" className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">~{value}</dd>
    </div>
  );
}
