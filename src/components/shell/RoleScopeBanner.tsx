"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useRole } from "@/lib/roles/RoleProvider";
import type { Role } from "@/lib/types";

const SCOPE: Record<
  Role,
  { ladderEn: string; ladderAr: string; canEn: string; canAr: string; notEn: string; notAr: string }
> = {
  student: {
    ladderEn: "You own your data",
    ladderAr: "بياناتك ملكك",
    canEn: "Check-in, Passport, and My case — you choose who sees what.",
    canAr: "التسجيل والجواز وحالتي — أنت تختار من يرى ماذا.",
    notEn: "Sanad never diagnoses you or shares without your consent.",
    notAr: "سند لا يشخّصك ولا يشارك دون موافقتك.",
  },
  faculty: {
    ladderEn: "L1 · Observation only",
    ladderAr: "L1 · ملاحظة فقط",
    canEn: "Raise a concern, rewrite notes, accept course Passport shares, fix course barriers.",
    canAr: "ارفع ملاحظة، أعد صياغة الملاحظات، اقبل مشاركة الجواز للمقرر، أصلح عوائق المقرر.",
    notEn: "You do not open case files or send anyone to SAS.",
    notAr: "لا تفتح ملفات الحالات ولا ترسل أحداً لخدمات الإتاحة.",
  },
  advisor: {
    ladderEn: "L2 · Support need",
    ladderAr: "L2 · حاجة دعم",
    canEn: "Own cases the student sent to a coach. Confirm routes and handoffs.",
    canAr: "تملك الحالات التي أرسلها الطالب لمدرب. أكّد المسارات والتسليم.",
    notEn: "You cannot escalate to SAS alone — the student must agree.",
    notAr: "لا تصعّد لخدمات الإتاحة وحدك — يجب موافقة الطالب.",
  },
  sas: {
    ladderEn: "L3 · Screening (consent required)",
    ladderAr: "L3 · إحالة (بموافقة)",
    canEn: "Review only cases the student asked SAS to see.",
    canAr: "راجع فقط الحالات التي طلب الطالب عرضها على خدمات الإتاحة.",
    notEn: "No L1 classroom notes. No leadership-style aggregates here.",
    notAr: "لا ملاحظات صف L1. لا بيانات مجمّعة بأسلوب القيادة هنا.",
  },
  leadership: {
    ladderEn: "Aggregates only",
    ladderAr: "بيانات مجمّعة فقط",
    canEn: "Dashboard and Barrier Map — patterns across groups of 10+.",
    canAr: "لوحة المؤشرات وخريطة العوائق — أنماط لمجموعات من 10 فأكثر.",
    notEn: "You never see a named student's Passport or case file.",
    notAr: "لا ترى جواز طالب باسمه ولا ملف حالته.",
  },
};

export function RoleScopeBanner() {
  const { locale } = useLocale();
  const { role } = useRole();
  const ar = locale === "ar";
  const s = SCOPE[role];

  return (
    <aside
      className="mb-6 rounded-2xl border border-[var(--sanad-sea)]/25 bg-[var(--sanad-sea-soft)]/90 px-4 py-3 dark:border-[var(--sanad-sea)]/35 dark:bg-[var(--sanad-sea)]/10"
      aria-label={ar ? "نطاق هذا الدور" : "What this role can do"}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--sanad-sea)]">
        {ar ? s.ladderAr : s.ladderEn}
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
        {ar ? s.canAr : s.canEn}
      </p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        {ar ? s.notAr : s.notEn}
      </p>
    </aside>
  );
}
