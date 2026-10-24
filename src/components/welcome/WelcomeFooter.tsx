export function WelcomeFooter() {
  return (
    <footer
      id="support"
      className="border-t border-slate-200 bg-[#F3F6F8] px-5 py-6 sm:px-8 dark:border-slate-800 dark:bg-[#0A1413]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D8EFE8] text-[#1F7A7A] sm:mt-0 dark:bg-[#1A3D3A] dark:text-[#4DB3B0]"
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 2l7 3v6c0 5-3.5 9.4-7 11-3.5-1.6-7-6-7-11V5l7-3zm-1.2 13.2l5.5-5.5-1.4-1.4-4.1 4.1-2-2-1.4 1.4 3.4 3.4z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
              Our principles
            </p>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
              No diagnosis. No surveillance. No labels. No decisions without a
              human. No sharing without consent.{" "}
              <svg
                viewBox="0 0 24 24"
                className="ml-1 inline-block h-4 w-4 align-[-2px] text-[#1F7A7A] dark:text-[#4DB3B0]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </p>
          </div>
        </div>

        <p className="flex items-center gap-2 text-sm text-slate-600 sm:max-w-xs sm:text-right dark:text-slate-400">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#1F7A7A] shadow-sm sm:order-2 dark:bg-slate-800 dark:text-[#4DB3B0]"
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="9" cy="9" r="2.5" />
              <circle cx="15" cy="9" r="2.5" />
              <path d="M4 19c1-3 2.5-4.5 5-4.5M20 19c-1-3-2.5-4.5-5-4.5M8.5 19c1-2 2.2-3 3.5-3s2.5 1 3.5 3" />
            </svg>
          </span>
          <span className="sm:order-1">
            A more inclusive learning experience for every student.
          </span>
        </p>
      </div>
    </footer>
  );
}
