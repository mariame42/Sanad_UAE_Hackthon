"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { HeroIllustration } from "./HeroIllustration";

export function WelcomeHero() {
  const { t, locale } = useLocale();

  return (
    <section
      id="home"
      className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-20"
    >
      <div className="welcome-fade order-2 lg:order-1">
        <p
          lang="ar"
          className="font-[family-name:var(--font-arabic)] text-4xl font-semibold leading-none text-[#1F7A7A] sm:text-5xl dark:text-[#4DB3B0]"
        >
          سند
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#0F3D3E] sm:text-5xl lg:text-6xl dark:text-[#E8F0EF]">
          {locale === "ar" ? "سند" : "Sanad"}
        </h1>

        <p className="mt-3 text-xl font-medium text-slate-500 sm:text-2xl dark:text-slate-400">
          {t.tagline}
        </p>

        <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
          {t.welcomeBody}
        </p>

        <Link
          href="/role"
          className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#1A5152] to-[#0F3D3E] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgb(15_61_62/0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-10px_rgb(15_61_62/0.75)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] dark:bg-[#4DB3B0] dark:text-[#0B1615] dark:hover:bg-[#5FC4C1]"
        >
          {t.getStarted}
          <svg
            viewBox="0 0 24 24"
            className="nudge h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      <div className="welcome-fade-delay order-1 lg:order-2">
        <HeroIllustration />
      </div>
    </section>
  );
}
