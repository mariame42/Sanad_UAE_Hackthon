"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Time } from "@/components/ui/Time";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import { PASSPORT_COURSES } from "@/lib/passport";
import { formatSec, PART_LABEL } from "@/features/check-in/focus/focusStats";
import { STUDENT_PROFILE } from "@/lib/student-profile";
import { useRole } from "@/lib/roles/RoleProvider";

export function PassportView() {
  const { t, locale } = useLocale();
  const ar = locale === "ar";
  const { role } = useRole();
  const { passport, sharePassport, revokePassportShare, clearPassport } =
    useMockStore();
  const [course, setCourse] = useState<string>(PASSPORT_COURSES[0]);
  const [custom, setCustom] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const activeShares = useMemo(
    () => passport?.shares.filter((s) => !s.revokedAt) ?? [],
    [passport],
  );

  if (role === "faculty") {
    return <FacultyPassportInbox ar={ar} />;
  }

  if (!passport || passport.evidence.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <h1 className="text-3xl font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
          {t.passport.title}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {t.passport.empty}
        </p>
        <Link
          href="/check-in"
          className="mt-6 inline-block text-sm font-semibold text-[var(--sanad-sea)]"
        >
          {t.checkIn.title} →
        </Link>
      </div>
    );
  }

  function share() {
    const name = custom.trim() || course;
    sharePassport(name);
    setCustom("");
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  const displayName = ar ? STUDENT_PROFILE.nameAr : passport.studentName;

  return (
    <div className="sanad-checkin-bg min-h-[calc(100vh-5rem)] px-4 py-8 sm:px-6">
      <div className="mx-auto w-[min(100%,92%)]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--sanad-sea)]">
              {t.passport.eyebrow}
            </p>
            <h1 className="text-2xl font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8] sm:text-3xl">
              {t.passport.title}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              {t.passport.subtitle}
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => clearPassport()}>
            {t.passport.clear}
          </Button>
        </div>

        {/* Open passport book — two facing pages */}
        <div className="passport-book relative mx-auto max-w-5xl">
          <div
            className="pointer-events-none absolute -inset-x-2 top-4 bottom-0 z-0 rounded-[1.25rem] bg-black/20 blur-xl sm:-inset-x-4"
            aria-hidden
          />
          {/* Leather cover rim */}
          <div className="relative z-10 overflow-hidden rounded-[1.1rem] bg-gradient-to-br from-[#3d1f2b] via-[#2a1520] to-[#1a0f14] p-[0.55rem] shadow-[0_28px_70px_rgba(26,15,20,0.45)]">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 20% 10%,rgba(201,162,39,0.25),transparent 45%),radial-gradient(ellipse at 80% 90%,rgba(201,162,39,0.12),transparent 40%)",
              }}
              aria-hidden
            />
            <div className="relative grid overflow-hidden rounded-[0.65rem] bg-[#efe6d6] md:grid-cols-2 dark:bg-[#2a2430]">
              {/* Spine gutter */}
              <div
                className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-6 -translate-x-1/2 md:block"
                aria-hidden
              >
                <div className="h-full w-full bg-gradient-to-r from-[#1a0f14]/35 via-[#c9a227]/35 to-[#1a0f14]/25" />
                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#1a0f14]/40" />
              </div>

              {/* LEFT PAGE — identity */}
              <section className="relative border-b border-[#1b2a4a]/10 px-5 py-6 text-[#1b2a4a] sm:px-7 sm:py-8 md:border-b-0 md:border-e dark:border-white/10 dark:text-[#E8ECF8]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg,#1b2a4a 0,#1b2a4a 1px,transparent 1px,transparent 14px)",
                  }}
                  aria-hidden
                />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3 border-b border-[#8a6d1f]/35 pb-4">
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#8a6d1f]">
                        {ar ? "سند · جامعة زايد" : "Sanad · Zayed University"}
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-reading)] text-xl font-semibold">
                        {ar ? "جواز التعلّم" : "Learning Passport"}
                      </p>
                    </div>
                    <span className="rounded border border-[#8a6d1f]/50 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wide text-[#8a6d1f]">
                      {ar ? "ليس تشخيصاً" : "Not a diagnosis"}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="mx-auto shrink-0 sm:mx-0">
                      <div className="relative h-40 w-32 overflow-hidden rounded-sm border-[3px] border-[#8a6d1f]/55 bg-white shadow-[inset_0_0_0_1px_rgba(27,42,74,0.12)]">
                        <Image
                          src={STUDENT_PROFILE.photoSrc}
                          alt={displayName}
                          fill
                          className="object-cover object-top"
                          sizes="128px"
                          priority
                        />
                      </div>
                      <p className="mt-2 text-center text-[0.6rem] font-semibold uppercase tracking-wider text-[#8a6d1f]">
                        {ar ? "صورة الطالبة" : "Student photo"}
                      </p>
                    </div>

                    <dl className="min-w-0 flex-1 space-y-3 text-sm">
                      <div>
                        <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-[#8a6d1f]/90">
                          {ar ? "الاسم" : "Name"}
                        </dt>
                        <dd className="font-[family-name:var(--font-reading)] text-lg font-semibold leading-snug">
                          {displayName}
                        </dd>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-[#8a6d1f]/90">
                            {ar ? "الرقم" : "ID"}
                          </dt>
                          <dd className="font-mono text-sm">{STUDENT_PROFILE.id}</dd>
                        </div>
                        <div>
                          <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-[#8a6d1f]/90">
                            {ar ? "البرنامج" : "Program"}
                          </dt>
                          <dd>
                            {ar
                              ? STUDENT_PROFILE.programAr
                              : STUDENT_PROFILE.programEn}
                          </dd>
                        </div>
                      </div>
                      <div>
                        <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-[#8a6d1f]/90">
                          {ar ? "الجامعة" : "University"}
                        </dt>
                        <dd>
                          {ar
                            ? STUDENT_PROFILE.universityAr
                            : STUDENT_PROFILE.universityEn}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-[#8a6d1f]/90">
                          {t.passport.updated}
                        </dt>
                        <dd>
                          <Time iso={passport.updatedAt} locale={locale} />
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <p className="mt-auto border-t border-[#8a6d1f]/25 pt-4 text-xs leading-relaxed text-[#1b2a4a]/75 dark:text-[#E8ECF8]/75">
                    {t.passport.guardrail}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#8a6d1f]">
                      {ar ? "ملك الطالبة · قابل للإلغاء" : "Student-owned · Revocable"}
                    </p>
                    <span className="font-mono text-[0.65rem] text-[#8a6d1f]/80">
                      {ar ? "ص ١" : "p. 1"}
                    </span>
                  </div>
                </div>
              </section>

              {/* RIGHT PAGE — evidence */}
              <section className="relative bg-[#faf6ee] px-5 py-6 text-[#1b2a4a] sm:px-7 sm:py-8 dark:bg-[#1f1a28] dark:text-[#E8ECF8]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg,#1b2a4a 0,#1b2a4a 1px,transparent 1px,transparent 16px)",
                  }}
                  aria-hidden
                />
                <div className="relative flex h-full flex-col">
                  <h2 className="font-[family-name:var(--font-reading)] text-xl font-semibold">
                    {t.passport.evidenceTitle}
                  </h2>
                  <p className="mt-1 text-xs text-[#1b2a4a]/60 dark:text-[#E8ECF8]/60">
                    {ar
                      ? "مع الأداة مقابل بدونها — دليل، لا تصنيف."
                      : "With tool vs without — evidence, not a label."}
                  </p>

                  <ul className="mt-5 space-y-3">
                    {passport.evidence.map((e) => {
                      const label = ar ? e.labelAr : e.labelEn;
                      const delta =
                        e.deltaPct === null
                          ? null
                          : e.deltaPct > 0
                            ? `+${e.deltaPct}%`
                            : `${e.deltaPct}%`;
                      return (
                        <li
                          key={e.tool}
                          className="rounded-md border border-[#1b2a4a]/10 bg-white/80 px-3.5 py-3 dark:border-white/10 dark:bg-white/5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold">{label}</p>
                            {delta ? (
                              <span className="shrink-0 rounded bg-[#e6f5f3] px-2 py-0.5 text-xs font-bold text-[#2f9e95] dark:bg-[#2f9e95]/20">
                                {delta}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-[#1b2a4a]/65 dark:text-[#E8ECF8]/65">
                            {ar
                              ? `مع ${e.withPct ?? "—"}٪ · بدون ${e.withoutPct ?? "—"}٪ · ${e.trialsOn}+${e.trialsOff} تجارب`
                              : `With ${e.withPct ?? "—"}% · Without ${e.withoutPct ?? "—"}% · ${e.trialsOn}+${e.trialsOff} trials`}
                          </p>
                        </li>
                      );
                    })}
                  </ul>

                  <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-[#8a6d1f]">
                    {t.passport.formatsTitle}
                  </h3>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {passport.formats.map((f) => (
                      <div
                        key={f.format}
                        className="rounded-md border border-[#1b2a4a]/10 bg-white/80 px-2 py-2 text-center dark:border-white/10 dark:bg-white/5"
                      >
                        <p className="text-[0.6rem] font-bold uppercase tracking-wide text-[#8a6d1f]">
                          {
                            {
                              text: ar ? "نص" : "Text",
                              audio: ar ? "صوت" : "Audio",
                              video: ar ? "فيديو" : "Video",
                            }[f.format]
                          }
                        </p>
                        <p className="mt-0.5 text-lg font-bold tabular-nums">
                          {f.pct === null ? "—" : `${f.pct}%`}
                        </p>
                      </div>
                    ))}
                  </div>

                  {passport.focus ? (
                    <>
                      <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-[#8a6d1f]">
                        {ar ? "التركيز (الكاميرا)" : "Focus (camera)"}
                      </h3>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {[
                          [ar ? "مركّز" : "Focused", `${passport.focus.pct}%`],
                          [ar ? "أطول فترة" : "Longest", formatSec(passport.focus.longestSec)],
                          [ar ? "التفات" : "Look-aways", String(passport.focus.lookAways)],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-md border border-[#1b2a4a]/10 bg-white/80 px-2 py-2 text-center dark:border-white/10 dark:bg-white/5"
                          >
                            <p className="text-[0.6rem] font-bold uppercase tracking-wide text-[#8a6d1f]">
                              {label}
                            </p>
                            <p className="mt-0.5 text-lg font-bold tabular-nums" dir="ltr">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {passport.focus.parts
                          .map((p) => `${PART_LABEL[p.part][locale]} ${p.pct}%`)
                          .join(" · ")}
                      </p>
                    </>
                  ) : null}

                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#8a6d1f]/25 pt-4">
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#8a6d1f]">
                        {t.passport.qrTitle}
                      </p>
                      <p className="mt-1 max-w-[10rem] font-mono text-[0.65rem] text-[#1b2a4a]/55 dark:text-[#E8ECF8]/55">
                        {activeShares[0]?.code ??
                          (ar
                            ? "شارك مقرراً لإصدار الرمز"
                            : "Share a course for a code")}
                      </p>
                      <p className="mt-3 font-mono text-[0.65rem] text-[#8a6d1f]/80">
                        {ar ? "ص ٢" : "p. 2"}
                      </p>
                    </div>
                    <div
                      className="grid h-16 w-16 grid-cols-5 grid-rows-5 gap-0.5 rounded-sm bg-[#1b2a4a] p-1.5"
                      aria-hidden
                    >
                      {Array.from({ length: 25 }, (_, i) => (
                        <span
                          key={i}
                          className={`rounded-[1px] ${
                            [
                              0, 1, 2, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 21,
                              22, 24,
                            ].includes(i)
                              ? "bg-[#f7f1e6]"
                              : "bg-transparent"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Share controls under the book */}
        <section className="mx-auto mt-8 max-w-5xl rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
            {t.passport.shareTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {t.passport.shareHint}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PASSPORT_COURSES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCourse(c)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  course === c && !custom
                    ? "bg-[var(--sanad-indigo)] text-white"
                    : "border border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block min-w-0 flex-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              {t.passport.customCourse}
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder={ar ? "مثال: CHEM 201" : "e.g. CHEM 201"}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              />
            </label>
            <Button
              type="button"
              className="!bg-[var(--sanad-indigo)] sm:mb-0.5"
              onClick={share}
            >
              {t.passport.shareAction}
            </Button>
          </div>

          <ul className="mt-5 space-y-2">
            {passport.shares.length === 0 ? (
              <li className="text-sm text-slate-400">{t.passport.noShares}</li>
            ) : (
              passport.shares.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3 dark:border-slate-800"
                >
                  <div>
                    <p className="font-semibold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
                      {s.course}
                    </p>
                    <p className="text-xs text-slate-400">
                      {s.revokedAt ? t.passport.revoked : t.passport.active} ·{" "}
                      <Time iso={s.sharedAt} locale={locale} />
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-500">{s.code}</p>
                    {s.response && !s.revokedAt ? (
                      <p className="pop mt-1 text-xs font-semibold text-[var(--sanad-sea)]">
                        {s.response === "accepted"
                          ? ar
                            ? "✓ قبل المدرّس التعديل"
                            : "✓ Instructor accepted the adjustment"
                          : ar
                            ? "💬 المدرّس يريد التحدث أولاً"
                            : "💬 Instructor would like to talk first"}
                      </p>
                    ) : null}
                  </div>
                  {!s.revokedAt ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => copyCode(s.code)}
                      >
                        {copied === s.code ? t.passport.copied : t.passport.copy}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => revokePassportShare(s.id)}
                      >
                        {t.passport.revoke}
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function FacultyPassportInbox({ ar }: { ar: boolean }) {
  const { passport, respondShare } = useMockStore();
  const active = passport?.shares.filter((s) => !s.revokedAt) ?? [];

  return (
    <div className="stagger mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
        {ar ? "جوازات مشاركة الطلاب" : "Shared Learning Passports"}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {ar
          ? "الطالب يشارك معك دليلاً على ما يساعده — ليس تشخيصاً. يمكنك قبول تعديلات مرنة فوراً."
          : "A student shared evidence of what helps them — not a diagnosis. You can agree flexible adjustments immediately."}
      </p>

      {active.length === 0 || !passport ? (
        <p className="mt-8 text-sm text-slate-500">
          {ar
            ? "لا توجد مشاركات نشطة بعد. اطلب من الطالب مشاركة جوازه لمقرر ما."
            : "No active shares yet. Ask the student to share their Passport for a course."}
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {active.map((s) => (
            <article
              key={s.id}
              className="lift flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-sm border border-slate-200 bg-slate-50">
                <Image
                  src={STUDENT_PROFILE.photoSrc}
                  alt={passport.studentName}
                  fill
                  className="object-cover object-top"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--sanad-sea)]">
                  {s.course}
                </p>
                <h2 className="mt-1 text-xl font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
                  {passport.studentName}
                </h2>
                <ul className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                  {passport.evidence.map((e) => (
                    <li key={e.tool}>
                      {(ar ? e.labelAr : e.labelEn)}
                      {e.deltaPct !== null
                        ? `: ${e.deltaPct > 0 ? "+" : ""}${e.deltaPct}%`
                        : ""}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-slate-400">
                  {ar ? "رمز المشاركة" : "Share code"}:{" "}
                  <span className="font-mono">{s.code}</span>
                </p>
                {s.response ? (
                  <p className="pop mt-4 text-sm font-semibold text-[var(--sanad-sea)]" role="status">
                    {s.response === "accepted"
                      ? ar
                        ? "✓ قبلتَ التعديل — أُبلغت الطالبة."
                        : "✓ You accepted — the student has been told."
                      : ar
                        ? "💬 طلبتَ نقاشاً أولاً — أُبلغت الطالبة."
                        : "💬 You asked to talk first — the student has been told."}
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      className="!bg-[var(--sanad-indigo)]"
                      onClick={() => respondShare(s.id, true)}
                    >
                      {ar
                        ? "قبول تعديل مرن (تجريبي)"
                        : "Accept flexible adjustment (pilot)"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => respondShare(s.id, false)}
                    >
                      {ar ? "لنتحدث أولاً" : "Let’s talk first"}
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
