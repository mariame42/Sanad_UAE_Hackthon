"use client";

import { useSyncExternalStore } from "react";
import type { Locale } from "@/lib/types";

const noop = () => () => {};

let nowValue = typeof window === "undefined" ? 0 : Date.now();

function subscribeNow(onChange: () => void) {
  const id = setInterval(() => {
    nowValue = Date.now();
    onChange();
  }, 30_000);
  return () => clearInterval(id);
}

/** Current time, refreshed every 30s; 0 during SSR/hydration. */
export function useNow() {
  return useSyncExternalStore(
    subscribeNow,
    () => nowValue,
    () => 0,
  );
}

/** False during SSR/hydration, true afterwards — for time-dependent text. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function Time({ iso, locale }: { iso: string; locale: Locale }) {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return (
    <time dateTime={iso}>
      {new Date(iso).toLocaleString(locale === "ar" ? "ar-AE" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      })}
    </time>
  );
}

/** Response-time target: met once a named owner picks the case up. */
export function SlaChip({
  createdAt,
  slaHours,
  met,
  locale,
}: {
  createdAt: string;
  slaHours: number;
  met: boolean;
  locale: Locale;
}) {
  const now = useNow();
  if (!now) return null;

  const left = Math.round(
    (Date.parse(createdAt) + slaHours * 3_600_000 - now) / 3_600_000,
  );
  const ar = locale === "ar";
  const [tone, text] = met
    ? ["bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200", ar ? "تم الالتزام بالمهلة" : "SLA met"]
    : left < 0
      ? ["bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200", ar ? `متأخر ${-left} ساعة` : `Overdue ${-left}h`]
      : left <= 12
        ? ["bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100", ar ? `متبقٍ ${left} ساعة` : `Due in ${left}h`]
        : ["bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200", ar ? `متبقٍ ${left} ساعة` : `Due in ${left}h`];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      {text}
    </span>
  );
}
