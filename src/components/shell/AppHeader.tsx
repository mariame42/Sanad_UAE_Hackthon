"use client";

import Image from "next/image";
import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { navForRole, PERSONAS, ROLE_HOME } from "@/lib/roles/config";
import { useRole } from "@/lib/roles/RoleProvider";
import { STUDENT_PROFILE } from "@/lib/student-profile";
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
  const items = [{ href: "/", key: "home" }, ...links];
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navLink = (link: { href: string; key: string }) => {
    const active = isActive(link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={`relative shrink-0 rounded-full px-3.5 py-2 text-sm transition-colors ${
          active
            ? "font-semibold text-[#0F3D3E] dark:text-[#E8F0EF]"
            : "font-medium text-slate-500 hover:bg-slate-100/70 hover:text-[#0F3D3E] dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-[#E8F0EF]"
        }`}
      >
        {active ? (
          // Shared name: the underline glides to the new link on navigation.
          <span
            aria-hidden
            style={{ viewTransitionName: "nav-indicator" }}
            className="absolute inset-x-3.5 bottom-0.5 h-[3px] rounded-full bg-gradient-to-r from-[#4DB3B0] to-[#1F7A7A]"
          />
        ) : null}
        {navLabel(link.key)}
      </Link>
    );
  };

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-50 border-b border-slate-200/60 bg-[#F9FBFC]/75 backdrop-blur-xl dark:border-white/5 dark:bg-[#0B1615]/75"
    >
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-3 px-5 sm:h-20 sm:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label={t.brand}>
          <BrandMark className="h-9 w-9 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
          <span className="leading-none">
            <span className="block text-lg font-bold tracking-tight text-[#0F3D3E] dark:text-[#E8F0EF]">
              Sanad
            </span>
            <span
              lang="ar"
              className="block font-[family-name:var(--font-arabic)] text-xs font-semibold text-[#1F7A7A] dark:text-[#4DB3B0]"
            >
              سند
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {items.map(navLink)}
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
              className="inline-flex max-w-[12rem] items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:max-w-none"
            >
              {role === "student" ? (
                <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-[#4DB3B0]/40">
                  <Image
                    src={STUDENT_PROFILE.photoSrc}
                    alt=""
                    fill
                    className="object-cover object-top"
                    sizes="28px"
                  />
                </span>
              ) : (
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4DB3B0] to-[#1F7A7A] text-[10px] font-bold text-white"
                >
                  {initials(PERSONAS[role].nameEn)}
                </span>
              )}
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
                className="rise absolute end-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-1 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
              >
                {ALL_ROLES.map((r) => (
                  <li key={r} role="option" aria-selected={r === role}>
                    <Link
                      href={ROLE_HOME[r]}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none dark:hover:bg-slate-800 ${
                        r === role ? "bg-[#E8F4F3] dark:bg-[#1A3D3A]" : ""
                      }`}
                      onClick={() => {
                        setRole(r);
                        setOpen(false);
                      }}
                    >
                      <span
                        aria-hidden
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4DB3B0] to-[#1F7A7A] text-xs font-bold text-white"
                      >
                        {initials(PERSONAS[r].nameEn)}
                      </span>
                      <span>
                        <span className="block font-semibold text-[#0F3D3E] dark:text-[#E8F0EF]">
                          {(t.roles as Record<string, string>)[r]}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {locale === "ar"
                            ? PERSONAS[r].nameAr
                            : PERSONAS[r].nameEn}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
      <nav
        className="flex gap-1 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:hidden"
        aria-label="Primary"
      >
        {items.map(navLink)}
      </nav>
      <p className="sr-only" aria-live="polite">
        {personaName(locale)}
      </p>
    </header>
  );
}

function initials(name: string) {
  return name
    .replace(/^(Dr\.|Dean)\s+/, "")
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}
