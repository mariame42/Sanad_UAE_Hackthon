const features = [
  {
    n: "01",
    title: "Learning Check-in",
    body: "Students try short learning activities and discover which tools help them learn better.",
    bg: "bg-[#F3EEF9] dark:bg-[#2A2438]",
    accent: "text-[#7B6BB0] dark:text-[#B5A4DE]",
    btn: "bg-[#C4B5E8] text-[#4A3D7A] hover:bg-[#B5A4DE] dark:bg-[#4A3D7A] dark:text-[#E8E0F8] dark:hover:bg-[#5A4D8A]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6" />
        <path d="M16 4l2 2-5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Concern Desk",
    body: "Faculty and tutors describe what they observe. AI rewrites notes into objective, non-diagnostic language.",
    bg: "bg-[#EAF2FB] dark:bg-[#1E2A38]",
    accent: "text-[#4A7AB0] dark:text-[#8BB4E0]",
    btn: "bg-[#A8C8E8] text-[#2E5478] hover:bg-[#97BBDF] dark:bg-[#2E5478] dark:text-[#D0E4F8] dark:hover:bg-[#3A6588]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="9" cy="8" r="2.5" />
        <circle cx="15" cy="8" r="2.5" />
        <circle cx="12" cy="13" r="2.5" />
        <path d="M4 20c1-3 2.5-4.5 5-4.5M20 20c-1-3-2.5-4.5-5-4.5M8 20c1-2 2.5-3 4-3s3 1 4 3" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Referral & Case Hub",
    body: "AI suggests the right support service. A human makes the final decision.",
    bg: "bg-[#E8F5EF] dark:bg-[#1A2E28]",
    accent: "text-[#3D8A6A] dark:text-[#7EC9A8]",
    btn: "bg-[#9DD4BC] text-[#1F5C44] hover:bg-[#8BC9AF] dark:bg-[#1F5C44] dark:text-[#D0F0E0] dark:hover:bg-[#2A6E54]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="5" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <path d="M12 7.5v4M12 11.5L6.5 16M12 11.5l5.5 4.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: "04",
    title: "Class Insights",
    body: "Faculty see anonymous class-level learning patterns to improve teaching for everyone.",
    bg: "bg-[#FBF0E8] dark:bg-[#2E241C]",
    accent: "text-[#C07848] dark:text-[#E0A878]",
    btn: "bg-[#F0C4A0] text-[#7A4420] hover:bg-[#E8B48C] dark:bg-[#7A4420] dark:text-[#F8E0C8] dark:hover:bg-[#8A5430]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: "05",
    title: "Dashboard",
    body: "University leadership tracks support effectiveness, waiting times and fairness.",
    bg: "bg-[#E8F4F6] dark:bg-[#1A2C30]",
    accent: "text-[#2F7A88] dark:text-[#7EC0CC]",
    btn: "bg-[#9FCDD6] text-[#1A4F58] hover:bg-[#8DC0CB] dark:bg-[#1A4F58] dark:text-[#D0ECF0] dark:hover:bg-[#2A5F68]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M8 20h8M7 14l3-3 2.5 2.5L17 8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
] as const;

export function HowSanadHelps() {
  return (
    <section
      id="about"
      className="border-t border-slate-100 bg-white px-5 py-14 sm:px-8 sm:py-16 dark:border-slate-800 dark:bg-[#0F1C1B]"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold tracking-tight text-[#0F3D3E] sm:text-3xl dark:text-[#E8F0EF]">
          How Sanad helps
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((f) => (
            <article
              key={f.n}
              className={`flex flex-col rounded-2xl p-5 ${f.bg} transition hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/40`}
            >
              <div className="flex items-start justify-between">
                <span className={`${f.accent}`}>{f.icon}</span>
                <span className={`text-xs font-semibold ${f.accent}`}>{f.n}</span>
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
                {f.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {f.body}
              </p>
              <button
                type="button"
                className={`mt-5 inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${f.btn}`}
                aria-label={`Open ${f.title}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
