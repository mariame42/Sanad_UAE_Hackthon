"use client";

import { PageTransition } from "@/components/motion/PageTransition";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const ICONS = ["🩺", "👁️", "🏷️", "🧑‍⚖️", "🔐"];

export default function PrinciplesPage() {
  const { t, locale } = useLocale();
  const ar = locale === "ar";

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
        <p className="rise text-xs font-bold uppercase tracking-[0.2em] text-[#1F7A7A] dark:text-[#4DB3B0]">
          {ar ? "وعدنا" : "Our promise"}
        </p>
        <h1 className="rise mt-1 text-3xl font-bold tracking-tight text-[#0F3D3E] sm:text-4xl dark:text-[#E8F0EF]">
          {t.principlesPage.title}
        </h1>
        <ul className="stagger mt-8 space-y-3">
          {t.principlesPage.items.map((item, i) => (
            <li
              key={item}
              className="lift flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/70"
            >
              <span
                aria-hidden
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8F4F3] text-xl dark:bg-[#1A3D3A]"
              >
                {ICONS[i] ?? "✓"}
                <span className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  ✕
                </span>
              </span>
              <p className="font-medium leading-relaxed text-slate-700 dark:text-slate-200">{item}</p>
            </li>
          ))}
        </ul>
        <p className="rise mt-8 rounded-2xl bg-gradient-to-br from-[#0F3D3E] to-[#1F7A7A] p-6 text-lg font-semibold leading-relaxed text-white shadow-soft">
          {ar
            ? "لا نبحث عمّا هو «خطأ» في الطلاب. نجد ما يعيق التعلّم — ونصلحه للجميع."
            : "We don’t look for what’s wrong with students. We find what’s wrong with the learning — and fix it for everyone."}
        </p>
      </div>
    </PageTransition>
  );
}
