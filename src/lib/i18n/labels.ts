import type { CaseStatus, Locale, RouteOption } from "@/lib/types";

export const ROUTE_LABELS: Record<RouteOption, Record<Locale, string>> = {
  learning_center: { en: "Learning Center", ar: "مركز التعلّم" },
  language_support: { en: "Language Support", ar: "دعم اللغة" },
  academic_advising: { en: "Academic Advising", ar: "الإرشاد الأكاديمي" },
  sas: { en: "Student Accessibility Services", ar: "خدمات إتاحة الطلاب" },
  counseling: { en: "Counseling", ar: "الإرشاد النفسي" },
  career_wellbeing: { en: "Career & Wellbeing", ar: "المهني والرفاه" },
};

export const STATUS_LABELS: Record<CaseStatus, Record<Locale, string>> = {
  offer_sent: { en: "Support offered", ar: "عُرض الدعم" },
  awaiting_student: { en: "Waiting for student", ar: "بانتظار الطالب" },
  with_advisor: { en: "With advisor", ar: "لدى المرشد" },
  routed: { en: "Routed", ar: "تم التوجيه" },
  with_sas: { en: "With SAS", ar: "لدى خدمات الإتاحة" },
  closed: { en: "Closed", ar: "مغلقة" },
  disputed: { en: "Student disagreed", ar: "اعترض الطالب" },
};

export function routeLabel(route: string, locale: Locale) {
  return ROUTE_LABELS[route as RouteOption]?.[locale] ?? route;
}

export function statusLabel(status: CaseStatus, locale: Locale) {
  return STATUS_LABELS[status]?.[locale] ?? status;
}
