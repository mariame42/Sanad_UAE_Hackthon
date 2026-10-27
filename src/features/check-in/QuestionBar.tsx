"use client";

import type { Question } from "./content";

type Props = {
  locale: "en" | "ar";
  question: Question;
  questionIndex: number;
  questionTotal: number;
  selected: number | undefined;
  onSelect: (index: number) => void;
  onNext: () => void;
  nextLabel: string;
  footerLeft: string;
  bodyClass?: string;
};

export function QuestionBar({
  locale,
  question,
  questionIndex,
  questionTotal,
  selected,
  onSelect,
  onNext,
  nextLabel,
  footerLeft,
  bodyClass = "",
}: Props) {
  const prompt = locale === "ar" ? question.promptAr : question.promptEn;
  const options = locale === "ar" ? question.optionsAr : question.optionsEn;

  return (
    <aside
      aria-label={locale === "ar" ? "الأسئلة" : "Questions"}
      className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:self-start dark:border-slate-700 dark:bg-slate-900"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {locale === "ar"
          ? `سؤال ${questionIndex + 1} من ${questionTotal}`
          : `Question ${questionIndex + 1} of ${questionTotal}`}
      </p>
      <p
        className={`mt-2 text-base font-semibold text-[var(--sanad-indigo)] sm:text-lg dark:text-[#E8ECF8] ${bodyClass}`}
      >
        {prompt}
      </p>

      <div
        role="radiogroup"
        aria-label={prompt}
        className={`mt-4 flex flex-col gap-2 ${bodyClass}`}
      >
        {options.map((opt, oi) => {
          const checked = selected === oi;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onSelect(oi)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-start text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sanad-sea)] ${
                checked
                  ? "border-[var(--sanad-sea)] bg-[var(--sanad-sea)]/10 text-[var(--sanad-indigo)] dark:text-[#E8ECF8]"
                  : "border-slate-200 bg-slate-50 text-[var(--sanad-indigo)] hover:border-[var(--sanad-sea)]/40 dark:border-slate-600 dark:bg-slate-800 dark:text-[#E8ECF8]"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                  checked
                    ? "border-[var(--sanad-sea)] bg-[var(--sanad-sea)] text-white"
                    : "border-slate-300 bg-white dark:border-slate-500 dark:bg-slate-900"
                }`}
              >
                {checked ? (
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                    <path
                      d="M3.5 8.5l3 3 6-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-400">{footerLeft}</p>

      <button
        type="button"
        onClick={onNext}
        disabled={selected === undefined}
        className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--sanad-indigo)] px-6 py-3.5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sanad-indigo)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {nextLabel}
      </button>
    </aside>
  );
}
