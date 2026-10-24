"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";

export function ClassInsightsView() {
  const { t } = useLocale();
  const { classInsights } = useMockStore();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {t.classInsights.title}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {t.classInsights.subtitle}
      </p>
      <ul className="mt-8 space-y-4">
        {classInsights.map((row) => (
          <li
            key={row.course}
            className="rounded-2xl border border-slate-200 bg-[#FBF0E8] p-5 dark:border-slate-700 dark:bg-[#2E241C]"
          >
            <h2 className="font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
              {row.course}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {row.insight}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
