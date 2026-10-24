"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PERSONAS, ROLE_HOME } from "@/lib/roles/config";
import { useRole } from "@/lib/roles/RoleProvider";
import type { Role } from "@/lib/types";

const ROLES: Role[] = [
  "student",
  "faculty",
  "advisor",
  "sas",
  "leadership",
];

export default function RolePickPage() {
  const { t, locale } = useLocale();
  const { setRole } = useRole();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {t.rolePickTitle}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{t.rolePickHint}</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {ROLES.map((role) => (
          <li key={role}>
            <Link
              href={ROLE_HOME[role]}
              onClick={() => setRole(role)}
              className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#1F7A7A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
                {(t.roles as Record<string, string>)[role]}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {locale === "ar"
                  ? PERSONAS[role].nameAr
                  : PERSONAS[role].nameEn}
              </p>
              <p className="mt-3 text-sm font-semibold text-[#1F7A7A] dark:text-[#4DB3B0]">
                {t.continueAs} →
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
