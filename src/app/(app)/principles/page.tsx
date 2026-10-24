"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function PrinciplesPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
      <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {t.principlesPage.title}
      </h1>
      <ul className="mt-8 space-y-4">
        {t.principlesPage.items.map((item) => (
          <li
            key={item}
            className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
          >
            <span
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D8EFE8] text-[#1F7A7A] dark:bg-[#1A3D3A] dark:text-[#4DB3B0]"
              aria-hidden
            >
              ✓
            </span>
            <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-200">
              {item}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
