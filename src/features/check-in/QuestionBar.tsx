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
  footerRight: string;
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
  footerRight,
}: Props) {
  const prompt = locale === "ar" ? question.promptAr : question.promptEn;
  const options = locale === "ar" ? question.optionsAr : question.optionsEn;

  return (
    <div className="sticky bottom-0 z-30 border-t border-slate-200/80 bg-white/95 shadow-[0_-8px_30px_rgba(27,42,74,0.06)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-950/95">
      <div className="mx-auto max-w-6xl px-5 py-4 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {locale === "ar"
                ? `سؤال ${questionIndex + 1} من ${questionTotal}`
                : `Question ${questionIndex + 1} of ${questionTotal}`}
            </p>
            <p className="mt-1 text-base font-semibold text-[var(--sanad-indigo)] dark:text-[#E8ECF8] sm:text-lg">
              {prompt}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {options.map((opt, oi) => {
                const active = selected === oi;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onSelect(oi)}
                    className={`rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sanad-sea)] ${
                      active
                        ? "bg-[var(--sanad-sea)] text-white shadow-sm"
                        : "border border-slate-200 bg-slate-50 text-[var(--sanad-indigo)] hover:border-[var(--sanad-sea)]/40 dark:border-slate-600 dark:bg-slate-800 dark:text-[#E8ECF8]"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={onNext}
            disabled={selected === undefined}
            className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-[var(--sanad-indigo)] px-6 py-3.5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sanad-indigo)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {nextLabel}
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:justify-between">
          <p>{footerLeft}</p>
          <p>{footerRight}</p>
        </div>
      </div>
    </div>
  );
}
