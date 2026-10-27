"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CountUp, CountUpText } from "@/components/motion/CountUp";
import { RoleScopeBanner } from "@/components/shell/RoleScopeBanner";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import { useRole } from "@/lib/roles/RoleProvider";
import Link from "next/link";

const AXIS = { fontSize: 12, fill: "#64748b" };

export function DashboardView() {
  const { t, locale } = useLocale();
  const { role } = useRole();
  const { dashboard, pilotTargets, cases, passport, appliedFixes } = useMockStore();
  const ar = locale === "ar";
  const [equityAsTable, setEquityAsTable] = useState(false);

  const equity = dashboard.equity.filter((row) => row.n >= 10);
  const hiddenGroups = dashboard.equity.length - equity.length;
  const maxDays = Math.max(...equity.map((r) => r.days));
  const gap = Math.max(...equity.map((r) => r.days)) - Math.min(...equity.map((r) => r.days));

  const live = {
    open: cases.filter((c) => c.status !== "closed").length,
    shared: cases.filter((c) => c.handoffSummary?.status === "approved").length,
    disputes: cases.filter((c) => c.handoffs.some((h) => h.to === "Recourse")).length,
    views: cases.reduce((n, c) => n + (c.audit?.length ?? 0), 0),
    adjustments: passport?.shares.filter((s) => s.response === "accepted" && !s.revokedAt).length ?? 0,
    fixes: appliedFixes.length,
  };

  const k = dashboard.kpis;
  const targets = [
    {
      label: t.dashboard.timeToSupport,
      value: `${k.medianDaysToSupport}`,
      target: ar ? `الهدف < ${pilotTargets.medianDaysToSupport}` : `Target < ${pilotTargets.medianDaysToSupport}`,
      ok: k.medianDaysToSupport < pilotTargets.medianDaysToSupport,
    },
    {
      label: t.dashboard.appropriateness,
      value: `${k.appropriatenessPct}%`,
      target: ar ? `الهدف ≥ ${pilotTargets.appropriatenessPct}%` : `Target ≥ ${pilotTargets.appropriatenessPct}%`,
      ok: k.appropriatenessPct >= pilotTargets.appropriatenessPct,
    },
    {
      label: t.dashboard.trust,
      value: `${k.trustScore}`,
      target: ar ? `الهدف ≥ ${pilotTargets.trustScore}` : `Target ≥ ${pilotTargets.trustScore}`,
      ok: k.trustScore >= pilotTargets.trustScore,
    },
    {
      label: t.dashboard.checkinRate,
      value: `${k.checkinCompletionPct}%`,
      target: ar ? `الهدف ≥ ${pilotTargets.checkinCompletionPct}%` : `Target ≥ ${pilotTargets.checkinCompletionPct}%`,
      ok: k.checkinCompletionPct >= pilotTargets.checkinCompletionPct,
    },
    {
      label: t.dashboard.wait,
      value: `${k.avgWaitDays}`,
      target: ar ? "للمتابعة" : "Monitor",
      ok: true,
    },
  ];

  if (role !== "leadership") {
    return (
      <div className="stagger mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <RoleScopeBanner />
        <h1 className="text-2xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          {ar ? "لوحة المؤشرات للقيادة" : "Dashboard is for leadership"}
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {ar
            ? "بدّل الدور إلى القيادة لرؤية الأنماط المجمّعة — بلا أسماء طلاب."
            : "Switch to Leadership to see aggregated patterns — no student names."}
        </p>
        <Link href="/role" className="mt-6 inline-block text-sm font-semibold text-[#1F7A7A]">
          {ar ? "اختيار الدور ←" : "Pick a role →"}
        </Link>
      </div>
    );
  }

  return (
    <div className="stagger mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <RoleScopeBanner />
      <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">{t.dashboard.title}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {ar
          ? "بيانات مجمّعة فقط · المجموعات الأصغر من 10 مخفية · مؤشرات التجربة لفصل واحد في كليتين"
          : "Aggregated data only · groups under 10 hidden · pilot KPIs: one semester, two colleges"}
      </p>

      <section aria-labelledby="live-title" className="mt-6 rounded-2xl bg-[#0F3D3E] p-5 text-white dark:bg-[#1A3D3A]">
        <h2 id="live-title" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#9FD9D6]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#4DB3B0]" aria-hidden />
          {ar ? "مباشر من هذا العرض" : "Live from this demo"}
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            [ar ? "حالات مفتوحة" : "Open cases", live.open],
            [ar ? "مشاركات بموافقة" : "Shares with consent", live.shared],
            [ar ? "طلبات اعتراض" : "Recourse requests", live.disputes],
            [ar ? "اطلاعات مسجّلة" : "Logged file views", live.views],
            [ar ? "تعديلات بالجواز" : "Passport adjustments", live.adjustments],
            [ar ? "عوائق أُزيلت" : "Barriers fixed", live.fixes],
          ].map(([label, n]) => (
            <div key={String(label)}>
              <dt className="text-xs text-white/70">{label}</dt>
              <dd className="text-3xl font-bold tabular-nums"><CountUp value={Number(n)} /></dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {targets.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft p-4 dark:border-white/10 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]"><CountUpText text={kpi.value} /></p>
            <p className={`mt-1 text-xs font-semibold ${kpi.ok ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
              {kpi.ok ? "✓" : "⚠"} {kpi.target}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="time-chart-title">
          <h2 id="time-chart-title" className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
            {t.dashboard.timeToSupport}
          </h2>
          <div className="mt-4 h-64 rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-slate-200 shadow-soft dark:border-white/10 dark:bg-slate-900/70 dark:text-white/10" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard.timeToSupportDays} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="currentColor" vertical={false} />
                <XAxis dataKey="week" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} domain={[0, 7]} />
                <Tooltip />
                <ReferenceLine
                  y={pilotTargets.medianDaysToSupport}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{ value: ar ? "الهدف" : "Target", position: "insideTopRight", fontSize: 11, fill: "#64748b" }}
                />
                <Line type="monotone" dataKey="days" stroke="#1F7A7A" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section aria-labelledby="approp-chart-title">
          <h2 id="approp-chart-title" className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
            {t.dashboard.appropriateness}
          </h2>
          <div className="mt-4 h-64 rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-slate-200 shadow-soft dark:border-white/10 dark:bg-slate-900/70 dark:text-white/10" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.appropriateness} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="currentColor" vertical={false} />
                <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(148,163,184,0.12)" }} />
                <ReferenceLine y={pilotTargets.appropriatenessPct} stroke="#94a3b8" strokeDasharray="4 4" />
                <Bar dataKey="pct" fill="#1F7A7A" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mt-10" aria-labelledby="demand-title">
        <h2 id="demand-title" className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          {ar ? "الطلب مقابل السعة" : "Demand vs capacity"}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {ar
            ? "سند لا يخلق طلباً لا يستطيع تلبيته: عند امتلاء خدمة ما، يحصل الطالب على دعم L2 فوراً ووقت انتظار صادق."
            : "Sanad doesn’t create demand it can’t serve: when a service is full, students get L2 support now and an honest wait time."}
        </p>
        <ul className="mt-4 space-y-4 rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft p-5 dark:border-white/10 dark:bg-slate-900/70">
          {dashboard.demand.map((row) => {
            const scale = Math.max(...dashboard.demand.map((d) => Math.max(d.requests, d.capacity))) * 1.1;
            const over = row.requests > row.capacity;
            return (
              <li key={row.service} className="grid gap-1 sm:grid-cols-[10rem_1fr_9rem] sm:items-center sm:gap-4">
                <span className="text-sm font-medium">{row.service}</span>
                <span className="relative h-3 rounded-full bg-slate-100 dark:bg-slate-800" title={`${row.requests} / ${row.capacity}`}>
                  <span
                    className="absolute inset-y-0 start-0 rounded-full bg-[#1F7A7A] dark:bg-[#4DB3B0]"
                    style={{ width: `${(row.requests / scale) * 100}%` }}
                  />
                  <span
                    aria-hidden
                    className="absolute -inset-y-1 w-0.5 rounded bg-slate-700 dark:bg-slate-200"
                    style={{ insetInlineStart: `${(row.capacity / scale) * 100}%` }}
                  />
                </span>
                <span className={`text-xs font-semibold tabular-nums ${over ? "text-amber-700 dark:text-amber-300" : "text-slate-500"}`}>
                  {row.requests} / {row.capacity}
                  {over ? (ar ? ` · ⚠ ${row.requests - row.capacity} غير ملبّى` : ` · ⚠ ${row.requests - row.capacity} unmet`) : ""}
                </span>
              </li>
            );
          })}
          <li className="text-xs text-slate-500">
            {ar ? "الشريط = الطلبات · الخط العمودي = السعة" : "Bar = requests · vertical tick = capacity"}
          </li>
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="equity-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="equity-title" className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
            {t.dashboard.equity}
          </h2>
          <button
            type="button"
            onClick={() => setEquityAsTable((v) => !v)}
            className="text-sm font-semibold text-[#1F7A7A] dark:text-[#4DB3B0]"
          >
            {equityAsTable ? (ar ? "عرض كرسم" : "Show as chart") : ar ? "عرض كجدول" : "Show as table"}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {ar ? "أيام حتى أول تواصل دعم، حسب المجموعة." : "Days to first support contact, by group."}{" "}
          {gap >= 0.8
            ? ar
              ? `⚠ فجوة ${gap.toFixed(1)} يوم — تُناقش في المراجعة الفصلية.`
              : `⚠ ${gap.toFixed(1)}-day gap — flagged for the quarterly review.`
            : ""}
        </p>

        {equityAsTable ? (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-full text-start text-sm">
              <caption className="sr-only">{t.dashboard.summary}</caption>
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{ar ? "المجموعة" : "Group"}</th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{ar ? "أيام" : "Days"}</th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">n</th>
                </tr>
              </thead>
              <tbody>
                {equity.map((row) => (
                  <tr key={row.group} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">{row.group}</td>
                    <td className="px-4 py-3 tabular-nums">{row.days}</td>
                    <td className="px-4 py-3 tabular-nums">{row.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="mt-4 space-y-2 rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft p-5 dark:border-white/10 dark:bg-slate-900/70">
            {equity.map((row) => (
              <li key={row.group} className="grid grid-cols-[9rem_1fr_3.5rem] items-center gap-3 text-sm sm:grid-cols-[12rem_1fr_4rem]">
                <span className="truncate">{row.group}</span>
                <span className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800" title={`${row.days} days · n=${row.n}`}>
                  <span
                    className="block h-full rounded-full bg-[#1F7A7A] dark:bg-[#4DB3B0]"
                    style={{ width: `${(row.days / (maxDays * 1.15)) * 100}%` }}
                  />
                </span>
                <span className="text-end text-xs tabular-nums text-slate-500">
                  {row.days}d · {row.n}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-slate-500">
          {ar
            ? `🔒 ${hiddenGroups} مجموعة مخفية (أقل من 10 طلاب) لحماية الهوية.`
            : `🔒 ${hiddenGroups} group hidden (fewer than 10 students) to protect identity.`}
        </p>
      </section>
    </div>
  );
}
