"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { navForRole, PERSONAS, ROLE_HOME } from "@/lib/roles/config";
import { useRole } from "@/lib/roles/RoleProvider";
import type { Role } from "@/lib/types";

const ALL_ROLES: Role[] = [
  "student",
  "faculty",
  "advisor",
  "sas",
  "leadership",
];

export function AppHeader() {
  const { t, locale, toggleLocale } = useLocale();
  const { role, setRole, personaName } = useRole();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = navForRole(role);

  const navLabel = (key: string) =>
    (t.nav as Record<string, string>)[key] ?? key;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100/80 bg-[#F9FBFC]/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0B1615]/90">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-3 px-5 sm:h-20 sm:px-8">
        <Link href="/" className="shrink-0" aria-label={t.brand}>
          <Image
            src="/logo.png"
            alt={t.brand}
            width={180}
            height={52}
            priority
            className="h-11 w-auto object-contain sm:h-12 dark:brightness-110"
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          <Link
            href="/"
            className={`text-sm font-medium transition ${
              pathname === "/"
                ? "border-b-2 border-[#1F7A7A] pb-0.5 text-[#0F3D3E] dark:border-[#4DB3B0] dark:text-[#E8F0EF]"
                : "text-slate-500 hover:text-[#0F3D3E] dark:text-slate-400"
            }`}
          >
            {t.nav.home}
          </Link>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition ${
                pathname.startsWith(link.href)
                  ? "border-b-2 border-[#1F7A7A] pb-0.5 text-[#0F3D3E] dark:border-[#4DB3B0] dark:text-[#E8F0EF]"
                  : "text-slate-500 hover:text-[#0F3D3E] dark:text-slate-400"
              }`}
            >
              {navLabel(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLocale}
            className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            aria-label={t.lang.toggle}
          >
            {locale === "en" ? "ع" : "EN"}
          </button>
          <ThemeToggle />

          <div className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-label={t.roles.switch}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex max-w-[11rem] items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:max-w-none"
            >
              <span className="truncate">
                {(t.roles as Record<string, string>)[role]}
              </span>
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 shrink-0 text-slate-400"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {open ? (
              <ul
                role="listbox"
                aria-label={t.roles.switch}
                className="absolute end-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
              >
                {ALL_ROLES.map((r) => (
                  <li key={r} role="option" aria-selected={r === role}>
                    <Link
                      href={ROLE_HOME[r]}
                      className="block px-3 py-2 text-sm hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none dark:hover:bg-slate-800"
                      onClick={() => {
                        setRole(r);
                        setOpen(false);
                      }}
                    >
                      <span className="font-semibold text-[#0F3D3E] dark:text-[#E8F0EF]">
                        {(t.roles as Record<string, string>)[r]}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {locale === "ar"
                          ? PERSONAS[r].nameAr
                          : PERSONAS[r].nameEn}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {personaName(locale)}
      </p>
    </header>
  );
}
