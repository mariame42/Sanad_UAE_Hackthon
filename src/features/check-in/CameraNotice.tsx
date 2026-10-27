"use client";

import { useState } from "react";

type Props = {
  locale: "en" | "ar";
};

/** Optional Focus Mode — camera never required; nothing stored. */
export function CameraNotice({ locale }: Props) {
  const [focus, setFocus] = useState(false);

  return (
    <div className="rounded-2xl border border-[var(--sanad-sea)]/25 bg-[var(--sanad-sea-soft)] px-4 py-3 dark:border-[var(--sanad-sea)]/40 dark:bg-[var(--sanad-sea)]/15">
      <div className="flex gap-3">
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-[var(--sanad-sea)] dark:bg-slate-900/50"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
            />
            <path strokeLinecap="round" d="M3 3l18 18" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
            {locale === "ar"
              ? "الكاميرا مغلقة. كل شيء يعمل بدونها. وضع التركيز اختياري."
              : "Camera is off. Everything works without it. Focus Mode is optional."}
          </p>
          <button
            type="button"
            onClick={() => setFocus((v) => !v)}
            className="mt-2 text-xs font-semibold text-[var(--sanad-sea)] underline-offset-2 hover:underline"
          >
            {focus
              ? locale === "ar"
                ? "إيقاف وضع التركيز"
                : "Turn Focus Mode off"
              : locale === "ar"
                ? "تجربة وضع التركيز"
                : "Try Focus Mode"}
          </button>
          {focus ? (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300" role="status">
              {locale === "ar"
                ? "إيقاع أبطأ لهذه الجلسة. لا تُستخدم كاميرا في هذا العرض التوضيحي."
                : "Pacing slowed for this session. No camera is used in this demo."}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
