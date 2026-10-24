"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";

export function DashboardView() {
  const { t } = useLocale();
  const { dashboard } = useMockStore();
  const equity = dashboard.equity.filter((row) => row.n >= 10);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {t.dashboard.title}
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label={t.dashboard.timeToSupport}
          value={String(dashboard.kpis.medianDaysToSupport)}
        />
        <Kpi
          label={t.dashboard.appropriateness}
          value={`${dashboard.kpis.appropriatenessPct}%`}
        />
        <Kpi label={t.dashboard.wait} value={String(dashboard.kpis.avgWaitDays)} />
        <Kpi
          label={t.dashboard.checkinRate}
          value={`${dashboard.kpis.checkinCompletionPct}%`}
        />
        <Kpi
          label={t.dashboard.trust}
          value={String(dashboard.kpis.trustScore)}
        />
      </div>

      <section className="mt-10" aria-labelledby="time-chart-title">
        <h2
          id="time-chart-title"
          className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]"
        >
          {t.dashboard.timeToSupport}
        </h2>
        <div className="mt-4 h-64 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dashboard.timeToSupportDays}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="days"
                stroke="#1F7A7A"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="approp-chart-title">
        <h2
          id="approp-chart-title"
          className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]"
        >
          {t.dashboard.appropriateness}
        </h2>
        <div className="mt-4 h-64 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboard.appropriateness}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="pct" fill="#4DB3B0" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="equity-title">
        <h2
          id="equity-title"
          className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]"
        >
          {t.dashboard.equity}
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="min-w-full text-start text-sm">
            <caption className="sr-only">{t.dashboard.summary}</caption>
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Group
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Days
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  n
                </th>
              </tr>
            </thead>
            <tbody>
              {equity.map((row) => (
                <tr
                  key={row.group}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="px-4 py-3">{row.group}</td>
                  <td className="px-4 py-3">{row.days}</td>
                  <td className="px-4 py-3">{row.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Groups with n &lt; 10 are hidden.
        </p>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {value}
      </p>
    </div>
  );
}
