"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { createPersistentStore } from "@/lib/mock/persist";
import { getDictionary, type Dictionary } from "./dictionaries";
import type { Locale } from "@/lib/types";

type LocaleContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const localeStore = createPersistentStore<Locale>("sanad-locale-v2", "en");

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const stored = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.get,
    localeStore.getServer,
  );
  const locale: Locale = stored === "ar" ? "ar" : "en";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    // Plain value read by the pre-hydration script in the root layout.
    localStorage.setItem("sanad-locale", locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => localeStore.set(next), []);
  const toggleLocale = useCallback(
    () => localeStore.set((prev) => (prev === "en" ? "ar" : "en")),
    [],
  );

  const value = useMemo(
    () => ({
      locale,
      dir: (locale === "ar" ? "rtl" : "ltr") as "ltr" | "rtl",
      t: getDictionary(locale),
      setLocale,
      toggleLocale,
    }),
    [locale, setLocale, toggleLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
