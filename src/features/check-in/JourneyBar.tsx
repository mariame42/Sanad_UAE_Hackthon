"use client";

import { JOURNEY_STEPS, type JourneyId } from "./content";

type Props = {
  locale: "en" | "ar";
  current: JourneyId;
  completed: Set<string>;
};

export function JourneyBar({ locale, current, completed }: Props) {
  const currentIndex = JOURNEY_STEPS.findIndex((s) => s.id === current);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <ol className="flex flex-1 flex-wrap items-start gap-0 sm:gap-1">
        {JOURNEY_STEPS.map((step, i) => {
          const done = completed.has(step.id) || i < currentIndex;
          const active = step.id === current;
          const label = locale === "ar" ? step.labelAr : step.labelEn;
          const hint = done
            ? locale === "ar"
              ? "تم"
              : "Done"
            : locale === "ar"
              ? step.hintAr
              : step.hintEn;

          return (
            <li key={step.id} className="flex min-w-[4.5rem] flex-1 items-start sm:min-w-[5.5rem]">
              {i > 0 ? (
                <div
                  className={`mt-4 h-0.5 w-3 shrink-0 sm:w-6 ${
                    i <= currentIndex ? "bg-[var(--sanad-sea)]" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                  aria-hidden
                />
              ) : null}
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${
                    done
                      ? "bg-[var(--sanad-sea)] text-white"
                      : active
                        ? "bg-[var(--sanad-indigo)] text-white ring-4 ring-[var(--sanad-indigo)]/15"
                        : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : step.id === "tools" ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`text-xs font-semibold sm:text-sm ${
                    active
                      ? "text-[var(--sanad-indigo)] dark:text-[#C5D0F0]"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {label}
                </span>
                <span className="text-[0.65rem] text-slate-400 sm:text-xs">{hint}</span>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="max-w-xs text-sm leading-snug text-slate-500 dark:text-slate-400 lg:text-end">
        {locale === "ar"
          ? "لا إجابات خاطئة. هذا ليس درجة."
          : "There are no wrong answers. This is not a grade."}
      </p>
    </div>
  );
}
