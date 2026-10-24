"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PERSONAS } from "./config";
import type { Role } from "@/lib/types";

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  personaName: (locale: "en" | "ar") => string;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("student");

  useEffect(() => {
    const stored = localStorage.getItem("sanad-role") as Role | null;
    if (
      stored === "student" ||
      stored === "faculty" ||
      stored === "advisor" ||
      stored === "sas" ||
      stored === "leadership"
    ) {
      setRoleState(stored);
    }
  }, []);

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    localStorage.setItem("sanad-role", next);
  }, []);

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
