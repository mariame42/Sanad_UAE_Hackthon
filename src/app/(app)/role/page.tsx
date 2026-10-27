"use client";

import Link from "next/link";
import { PageTransition } from "@/components/motion/PageTransition";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PERSONAS, ROLE_HOME } from "@/lib/roles/config";
import { useRole } from "@/lib/roles/RoleProvider";
import type { Role } from "@/lib/types";

const ROLES: { role: Role; icon: string; tint: string; en: string; ar: string }[] = [
  {
    role: "student",
    icon: "🎒",
    tint: "from-[#F3EEF9] to-white dark:from-[#2A2438] dark:to-slate-900/70",
    en: "Try the Check-in, build a Learning Passport, stay in control of your case.",
    ar: "جرّب تسجيل التعلّم، وابنِ جواز التعلّم، وتحكّم في حالتك.",
  },
  {
    role: "faculty",
    icon: "🧑‍🏫",
    tint: "from-[#EAF1FB] to-white dark:from-[#1E2A3A] dark:to-slate-900/70",
    en: "Note what you saw without labels, accept adjustments, fix course barriers.",
    ar: "دوّن ما لاحظته بلا تصنيفات، واقبل التعديلات، وأصلح عوائق المقرر.",
  },
  {
    role: "advisor",
    icon: "🧭",
    tint: "from-[#E6F4EF] to-white dark:from-[#1A3330] dark:to-slate-900/70",
    en: "Route each case to the right service. AI suggests, you decide.",
    ar: "وجّه كل حالة إلى الخدمة المناسبة. الذكاء يقترح وأنت تقرر.",
  },
  {
    role: "sas",
    icon: "🤝",
    tint: "from-[#E8F4F3] to-white dark:from-[#1A3D3A] dark:to-slate-900/70",
    en: "See only the cases students agreed to share with you (L3).",
    ar: "ترى فقط الحالات التي وافق الطلاب على مشاركتها معك (L3).",
  },
  {
    role: "leadership",
    icon: "📊",
    tint: "from-[#FBF0E8] to-white dark:from-[#2E241C] dark:to-slate-900/70",
    en: "Outcomes, equity and the Barrier Map — aggregated, never individual.",
    ar: "النتائج والإنصاف وخريطة العوائق — مجمّعة، لا فردية.",
  },
];

export default function RolePickPage() {
  const { t, locale } = useLocale();
  const { setRole } = useRole();
  const ar = locale === "ar";

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <p className="rise text-xs font-bold uppercase tracking-[0.2em] text-[#1F7A7A] dark:text-[#4DB3B0]">
          {ar ? "عرض تجريبي" : "Live demo"}
        </p>
        <h1 className="rise mt-1 text-3xl font-bold tracking-tight text-[#0F3D3E] sm:text-4xl dark:text-[#E8F0EF]">
          {t.rolePickTitle}
        </h1>
        <p className="rise mt-2 text-slate-600 dark:text-slate-300">{t.rolePickHint}</p>
        <ul className="stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map(({ role, icon, tint, en, ar: arText }) => (
            <li key={role}>
              <Link
                href={ROLE_HOME[role]}
                onClick={() => setRole(role)}
                className={`lift group flex h-full flex-col rounded-3xl border border-slate-200/80 bg-gradient-to-br ${tint} p-5 shadow-soft hover:border-[#1F7A7A]/40 dark:border-white/10`}
              >
                <span
                  aria-hidden
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 dark:bg-slate-800"
                >
                  {icon}
                </span>
                <p className="mt-4 text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
                  {(t.roles as Record<string, string>)[role]}
                </p>
                <p className="text-sm text-slate-500">
                  {ar ? PERSONAS[role].nameAr : PERSONAS[role].nameEn}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {ar ? arText : en}
                </p>
                <p className="mt-4 text-sm font-semibold text-[#1F7A7A] dark:text-[#4DB3B0]">
                  {t.continueAs} <span className="nudge">→</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PageTransition>
  );
}
