"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { createPersistentStore } from "@/lib/mock/persist";
import { PERSONAS } from "./config";
import type { Role } from "@/lib/types";

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  personaName: (locale: "en" | "ar") => string;
};

const RoleContext = createContext<RoleContextValue | null>(null);

/** Per-tab (sessionStorage) so two windows can demo two roles side by side. */
const roleStore = createPersistentStore<Role>("sanad-role", "student", "session");

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const stored = useSyncExternalStore(
    roleStore.subscribe,
    roleStore.get,
    roleStore.getServer,
  );
  const role: Role = stored in PERSONAS ? stored : "student";

  const setRole = useCallback((next: Role) => roleStore.set(next), []);

  const personaName = useCallback(
    (locale: "en" | "ar") =>
      locale === "ar" ? PERSONAS[role].nameAr : PERSONAS[role].nameEn,
    [role],
  );

  const value = useMemo(
    () => ({ role, setRole, personaName }),
    [role, setRole, personaName],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
