import type { Persona, Role } from "@/lib/types";

export const PERSONAS: Record<Role, Persona> = {
  student: {
    role: "student",
    nameEn: "Layla Al Mansoori",
    nameAr: "ليلى المنصوري",
  },
  faculty: {
    role: "faculty",
    nameEn: "Dr. Sara Khan",
    nameAr: "د. سارة خان",
  },
  advisor: {
    role: "advisor",
    nameEn: "Omar Al Nuaimi",
    nameAr: "عمر النعيمي",
  },
  sas: {
    role: "sas",
    nameEn: "Noura Hassan (SAS)",
    nameAr: "نورة حسن (خدمات الإتاحة)",
  },
  leadership: {
    role: "leadership",
    nameEn: "Dean Fatima Al Suwaidi",
    nameAr: "العميدة فاطمة السويدي",
  },
};

export const ROLE_HOME: Record<Role, string> = {
  student: "/check-in",
  faculty: "/concern",
  advisor: "/cases",
  sas: "/cases",
  leadership: "/dashboard",
};

export function navForRole(role: Role): { href: string; key: string }[] {
  switch (role) {
    case "student":
      return [
        { href: "/check-in", key: "checkIn" },
        { href: "/my-case", key: "myCase" },
        { href: "/principles", key: "principles" },
      ];
    case "faculty":
      return [
        { href: "/concern", key: "concern" },
        { href: "/class-insights", key: "classInsights" },
        { href: "/principles", key: "principles" },
      ];
    case "advisor":
    case "sas":
      return [
        { href: "/cases", key: "cases" },
        { href: "/principles", key: "principles" },
      ];
    case "leadership":
      return [
        { href: "/dashboard", key: "dashboard" },
        { href: "/class-insights", key: "classInsights" },
        { href: "/principles", key: "principles" },
      ];
  }
}
