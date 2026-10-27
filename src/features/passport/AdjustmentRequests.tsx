"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Time } from "@/components/ui/Time";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import { ADJUSTMENTS, evidenceLine } from "@/lib/passport";
import { useRole } from "@/lib/roles/RoleProvider";
import { SHARE_STATUS } from "./PassportView";

/** Faculty side of the Learning Passport: only what the student chose to share. */
export function AdjustmentRequests() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const { personaName } = useRole();
  const { shares, passport, respondShare } = useMockStore();
  const me = personaName("en");
  const mine = shares.filter((s) => s.instructor === me);

  return (
    <div className="stagger mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {ar ? "طلبات التعديل" : "Adjustment requests"}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {ar
          ? "طلاب شاركوا معك جواز التعلّم: دليل على ما ينجح معهم. لا تشخيص مرفق — ولا حاجة إليه للتعديلات المرنة."
          : "Students who shared their Learning Passport with you: evidence of what works for them. No diagnosis attached — none is needed for flexible adjustments."}
      </p>

      {!mine.length ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">
          {ar
            ? "لا توجد مشاركات بعد. يشارك الطلاب الجواز من صفحة «جواز التعلّم»."
            : "Nothing shared with you yet. Students share from their Learning Passport."}
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {mine.map((s) => {
            const revoked = s.status === "revoked";
            return (
              <li
                key={s.id}
                className={`lens-in rounded-2xl border bg-white p-5 dark:bg-slate-900 ${
                  s.status === "pending"
                    ? "border-2 border-[#1F7A7A]"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
                    {ar ? "ليلى المنصوري" : "Layla Al Mansoori"} · {s.course}
                  </p>
                  <p className="text-xs text-slate-400">
                    <Time iso={s.createdAt} locale={locale} />
                  </p>
                </div>

                {revoked ? (
                  <p className="mt-3 text-sm text-slate-500">
                    🔒{" "}
                    {ar
                      ? "سحبت الطالبة المشاركة — الدليل مخفي."
                      : "Withdrawn by the student — the evidence is hidden."}
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {s.adjustments.map((k) => (
                      <li key={k} className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                        <p className="font-semibold">{ADJUSTMENTS[k].ask[locale]}</p>
                        <p className="text-xs text-slate-500">
                          {ADJUSTMENTS[k].tool[locale]}
                          {passport.evidence[k] ? ` · ${evidenceLine(passport.evidence[k]!, locale)}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                {s.status === "pending" ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button type="button" onClick={() => respondShare(s.id, true)}>
                      {ar ? "✓ قبول التعديل" : "✓ Accept adjustment"}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => respondShare(s.id, false)}>
                      {ar ? "لنتحدث أولاً" : "Let’s talk first"}
                    </Button>
                  </div>
                ) : !revoked ? (
                  <p className="mt-3 text-sm font-semibold" role="status">
                    {s.status === "accepted"
                      ? ar
                        ? "✓ قبلتَ التعديل — أُبلغت الطالبة."
                        : "✓ You accepted — the student has been told."
                      : SHARE_STATUS.discuss[locale]}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-8 text-sm text-slate-500">
        {ar ? "الصورة الأوسع: " : "The bigger picture: "}
        <Link href="/barriers" className="font-semibold text-[#1F7A7A] dark:text-[#4DB3B0]">
          {ar ? "خريطة العوائق لمقرراتك" : "Barrier Map for your courses"} →
        </Link>
      </p>
    </div>
  );
}
