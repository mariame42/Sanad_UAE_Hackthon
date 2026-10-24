import Image from "next/image";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const links = [
  { href: "#home", label: "Home", active: true },
  { href: "#about", label: "About", active: false },
  { href: "#support", label: "Support", active: false },
];

export function WelcomeHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100/80 bg-[#F9FBFC]/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0B1615]/90">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
        <a href="#home" className="shrink-0" aria-label="Sanad home">
          <Image
            src="/logo.png"
            alt="Sanad"
            width={180}
            height={52}
            priority
            className="h-12 w-auto object-contain sm:h-14 dark:brightness-110"
          />
        </a>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Primary"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition ${
                link.active
                  ? "border-b-2 border-[#1F7A7A] pb-0.5 text-[#0F3D3E] dark:border-[#4DB3B0] dark:text-[#E8F0EF]"
                  : "text-slate-500 hover:text-[#0F3D3E] dark:text-slate-400 dark:hover:text-[#E8F0EF]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700"
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F4F3] text-[#1F7A7A] dark:bg-[#1A3D3A] dark:text-[#4DB3B0]"
              aria-hidden
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-3.5 w-3.5"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="8" r="3.5" />
              </svg>
            </span>
            Student
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-slate-400"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
