"use client";

import Link from "next/link";
import { LadderBadge, StatusBadge } from "@/components/ui/Badge";
import { SlaChip } from "@/components/ui/Time";
import { CountUp } from "@/components/motion/CountUp";
import { RoleScopeBanner } from "@/components/shell/RoleScopeBanner";
import { routeLabel, statusLabel } from "@/lib/i18n/labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import { useRole } from "@/lib/roles/RoleProvider";
import type { CaseRecord } from "@/lib/types";

function visibleForRole(role: string, cases: CaseRecord[]): CaseRecord[] {
  if (role === "sas") {
    // L3 only — student asked SAS to look.
    return cases.filter((c) => c.ladder === "L3" || c.consent === "sas");
  }
  if (role === "advisor") {
    // L2 queue — coach / advisor pathway, not raw faculty notes alone.
    return cases.filter(
      (c) =>
        c.consent === "coach" ||
        c.consent === "sas" ||
        c.status === "with_advisor" ||
        c.status === "with_sas" ||
        c.status === "awaiting_student" ||
        c.status === "offer_sent" ||
        c.ladder === "L2" ||
        c.ladder === "L3",
    );
  }
  if (role === "faculty" || role === "leadership" || role === "student") {
    return [];
  }
  return cases;
}

export function CaseHub() {
  const { t, locale } = useLocale();
  const { cases } = useMockStore();
  const { role } = useRole();
  const ar = locale === "ar";

  const visible = visibleForRole(role, cases);
  const open = visible.filter((c) => c.status !== "closed");

  if (role === "faculty") {
    return (
      <div className="stagger mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <RoleScopeBanner />
        <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          {ar ? "ملفات الحالات ليست لهيئة التدريس" : "Case files are not for faculty"}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-300">
          {ar
            ? "في L1 ترى ما لاحظته فقط. ارفع ملاحظة من مكتب الملاحظة، أو راجع جوازات المشاركة لمقررك، أو خريطة العوائق."
            : "At L1 you only work from what you observed. Use Concern Desk, course Passport shares, or the Barrier Map."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/concern"
            className="rounded-xl bg-[var(--sanad-indigo)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            {ar ? "مكتب الملاحظة" : "Concern Desk"}
          </Link>
          <Link
            href="/passport"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            {ar ? "جوازات المقرر" : "Course Passports"}
          </Link>
        </div>
      </div>
    );
  }

  if (role === "leadership" || role === "student") {
    return (
      <div className="stagger mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <RoleScopeBanner />
        <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          {role === "leadership"
            ? ar
              ? "لا ملفات فردية للقيادة"
              : "No individual case files for leadership"
            : ar
              ? "تابع حالتك من «حالتي»"
              : "Follow your case from My case"}
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {role === "leadership"
            ? ar
              ? "افتح لوحة المؤشرات أو خريطة العوائق للأنماط المجمّعة."
              : "Open the Dashboard or Barrier Map for aggregated patterns."
            : ar
              ? "مركز الإحالة للعاملين في الدعم — ليس للطالب."
              : "The Case Hub is for support staff — not the student view."}
        </p>
        <Link
          href={role === "leadership" ? "/dashboard" : "/my-case"}
          className="mt-6 inline-block rounded-xl bg-[var(--sanad-indigo)] px-4 py-2.5 text-sm font-semibold text-white"
        >
          {role === "leadership"
            ? ar
              ? "لوحة المؤشرات"
              : "Dashboard"
            : ar
              ? "حالتي"
              : "My case"}
        </Link>
      </div>
    );
  }

  return (
    <div className="stagger mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <RoleScopeBanner />
      <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {role === "sas"
          ? ar
            ? "قائمة إحالة خدمات الإتاحة (L3)"
            : "SAS screening queue (L3)"
          : ar
            ? "قائمة دعم المرشد (L2)"
            : "Advisor support queue (L2)"}
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {role === "sas"
          ? ar
            ? "ترى خدمات الإتاحة فقط الحالات التي وافق الطالب على مشاركتها (L3)."
            : "SAS sees only cases the student agreed to share (L3)."
          : ar
            ? "حالات الطلاب الذين اختاروا «التحدث مع مدرب» أو وصلوا عبر مسار الدعم — لكل حالة مسؤول ومهلة."
            : "Cases from students who chose “Talk to a coach” or entered the support path — each has an owner and SLA."}
      </p>

      <dl className="stagger mt-6 grid grid-cols-3 gap-3">
        {[
          [ar ? "مفتوحة" : "Open", open.length],
          [ar ? "بلا مسؤول" : "Unassigned", open.filter((c) => !c.owner).length],
          [
            ar ? "بانتظار الطالب" : "Waiting for student",
            open.filter(
              (c) =>
                c.status === "awaiting_student" ||
                c.handoffSummary?.status === "pending",
            ).length,
          ],
        ].map(([label, n]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-soft dark:border-white/10 dark:bg-slate-900/70"
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {label}
            </dt>
            <dd className="mt-1 text-2xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
              <CountUp value={Number(n)} />
            </dd>
          </div>
        ))}
      </dl>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
          {role === "sas"
            ? ar
              ? "لا حالات L3 بعد. يحتاج الطالب اختيار «اطلب من خدمات الإتاحة النظر»."
              : "No L3 cases yet. A student must choose “Ask SAS to look at this.”"
            : ar
              ? "لا حالات L2 بعد. يحتاج الطالب اختيار «التحدث مع مدرب تعلّم» بعد التسجيل."
              : "No L2 cases yet. A student must choose “Talk to a learning coach” after Check-in."}
        </p>
      ) : (
        <ul className="stagger mt-6 space-y-3">
          {visible.map((c) => (
            <li key={c.id}>
              <Link
                href={`/cases/${c.id}`}
                className="lift group flex gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-soft hover:border-[#1F7A7A]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] dark:border-white/10 dark:bg-slate-900/70"
              >
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E8F4F3] to-[#C4E4E1] text-sm font-bold text-[#0F3D3E] dark:from-[#1A3D3A] dark:to-[#1F4F4B] dark:text-[#E8F0EF]"
                >
                  {c.studentName
                    .split(" ")
                    .map((w) => w[0])
                    .filter((ch) => /[A-Z]/.test(ch))
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
                      {c.studentName}
                    </span>
                    <LadderBadge level={c.ladder} />
                    <StatusBadge>{statusLabel(c.status, locale)}</StatusBadge>
                    {c.status !== "closed" ? (
                      <SlaChip
                        createdAt={c.createdAt}
                        slaHours={c.slaHours}
                        met={Boolean(c.owner)}
                        locale={locale}
                      />
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {c.summary}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {t.cases.owner}: {c.owner ?? t.cases.unassigned} · ✨{" "}
                    {routeLabel(c.confirmedRoute ?? c.suggestedRoute, locale)}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="nudge self-center text-slate-300 group-hover:text-[#1F7A7A] dark:text-slate-600"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
