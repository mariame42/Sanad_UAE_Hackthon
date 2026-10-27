"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { STUDENT_PROFILE } from "@/lib/student-profile";
import type { FocusSummary } from "@/lib/types";
import { focusTip, formatSec, PART_LABEL } from "./focusStats";
import { FOCUS_MOCK, type FocusLive, type FocusStatus, type Gaze } from "./useFocusTracker";

type Locale = "en" | "ar";

function CameraIcon({ off }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
      />
      {off ? <path strokeLinecap="round" d="M3 3l18 18" /> : null}
    </svg>
  );
}

function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sanad-sea)] ${
        on ? "bg-[var(--sanad-sea)]" : "bg-slate-300 dark:bg-slate-600"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[inset-inline-start] duration-200 ${
          on ? "start-[1.375rem]" : "start-0.5"
        }`}
      />
    </button>
  );
}

const PRIVACY = {
  en: "Runs on this device. Video is never recorded or sent — only the numbers stay.",
  ar: "يعمل على جهازك. لا يُسجَّل الفيديو ولا يُرسل — تبقى الأرقام فقط.",
};

/** Intro card: optional camera — off by default; student turns it on. */
export function FocusOptIn({
  locale,
  on,
  onToggle,
}: {
  locale: Locale;
  on: boolean;
  onToggle: () => void;
}) {
  const ar = locale === "ar";
  return (
    <div className="rounded-2xl border border-[var(--sanad-sea)]/25 bg-[var(--sanad-sea-soft)] px-4 py-3 dark:border-[var(--sanad-sea)]/40 dark:bg-[var(--sanad-sea)]/15">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-[var(--sanad-sea)] dark:bg-slate-900/50">
          <CameraIcon off={!on} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
            {ar ? "تتبّع التركيز بالكاميرا" : "Camera focus tracking"}
            <span className="ms-2 text-xs font-medium text-slate-500">
              {on ? (ar ? "مفعّل" : "on") : ar ? "متوقف" : "off"}
            </span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {ar
              ? "تتابع الكاميرا اتجاه نظرك لتُظهر كم من الوقت بقيت مركّزاً على كل جزء. "
              : "The camera follows where you look to show how long you stayed focused on each part. "}
            {PRIVACY[locale]}{" "}
            {ar ? "كل شيء يعمل بدونها أيضاً." : "Everything works without it too."}
          </p>
        </div>
        <Switch
          on={on}
          onToggle={onToggle}
          label={ar ? "تتبّع التركيز بالكاميرا" : "Camera focus tracking"}
        />
      </div>
    </div>
  );
}

/** Demo camera: the student photo with a drawn eye lock, in the photo's own pixel space. */
function MockPreview({ gaze, ready }: { gaze: Gaze; ready: boolean }) {
  const away = gaze === "away";
  const corners = [
    "M393 345 V285 H453",
    "M773 285 H833 V345",
    "M833 787 V847 H773",
    "M453 847 H393 V787",
  ];
  return (
    <div className="welcome-float absolute -inset-2">
      <Image
        src={STUDENT_PROFILE.photoSrc}
        alt=""
        fill
        sizes="(min-width: 1024px) 16rem, 100vw"
        className="object-cover"
        priority
      />
      {ready && gaze !== "noface" ? (
        <svg
          viewBox="0 0 1254 1254"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {corners.map((d) => (
              <path key={d} d={d} stroke="rgba(77,179,176,0.9)" strokeWidth="8" />
            ))}
            {[505, 730].map((x) => (
              <g key={x}>
                <ellipse cx={x} cy={519} rx={60} ry={28} stroke="rgba(77,179,176,0.95)" strokeWidth="6" />
                <circle
                  cx={x}
                  cy={519}
                  r={22}
                  stroke="rgba(201,162,39,1)"
                  strokeWidth="7"
                  style={{ transform: `translateX(${away ? 30 : 0}px)`, transition: "transform 300ms ease" }}
                />
              </g>
            ))}
          </g>
        </svg>
      ) : null}
    </div>
  );
}

const GAZE_CHIP = {
  focused: { en: "Focused", ar: "مركّز", cls: "bg-emerald-500/90" },
  away: { en: "Looking away", ar: "ينظر بعيداً", cls: "bg-amber-500/90" },
  noface: { en: "No face found", ar: "لم يُعثر على وجه", cls: "bg-slate-500/90" },
} as const;

/** Sidebar panel shown for the whole Check-in: live preview, eye overlay, live numbers. */
export function FocusPanel({
  locale,
  on,
  onToggle,
  status,
  live,
  videoRef,
  canvasRef,
}: {
  locale: Locale;
  on: boolean;
  onToggle: () => void;
  status: FocusStatus;
  live: FocusLive;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) {
  const ar = locale === "ar";
  const chip = GAZE_CHIP[live.gaze];

  return (
    <section
      aria-label={ar ? "تتبّع التركيز" : "Focus tracking"}
      className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
          <span className="text-[var(--sanad-sea)]">
            <CameraIcon off={!on} />
          </span>
          {ar ? "التركيز" : "Focus"}
        </p>
        <Switch on={on} onToggle={onToggle} label={ar ? "الكاميرا" : "Camera"} />
      </div>

      {on ? (
        <>
          <div className="relative mt-3 aspect-video overflow-hidden lg:aspect-[4/3] rounded-2xl bg-slate-900">
            {FOCUS_MOCK ? (
              <MockPreview gaze={live.gaze} ready={status === "on"} />
            ) : (
              <>
                {/* Mirrored like a selfie view; the canvas draws the tracked eyes on top. */}
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  aria-hidden
                  className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  aria-hidden
                  className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
                />
              </>
            )}
            {FOCUS_MOCK ? (
              <span className="absolute end-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
                {ar ? "عرض" : "Demo"}
              </span>
            ) : null}
            {status === "on" ? (
              <span
                role="status"
                className={`absolute start-2 top-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur ${chip.cls}`}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
                {chip[locale]}
              </span>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-slate-200">
                {status === "starting"
                  ? ar
                    ? "جارٍ تشغيل الكاميرا والنموذج…"
                    : "Starting camera and model…"
                  : status === "denied"
                    ? ar
                      ? "لم يُسمح بالكاميرا. يمكنك المتابعة بدونها."
                      : "Camera not allowed. You can carry on without it."
                    : ar
                      ? "تعذّر تشغيل التتبّع. يمكنك المتابعة بدونه."
                      : "Couldn’t start tracking. You can carry on without it."}
              </div>
            )}
          </div>

          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              [ar ? "مركّز" : "Focused", `${live.pct}%`],
              [ar ? "الفترة الحالية" : "Stretch", formatSec(live.streakSec)],
              [ar ? "التفات" : "Look-aways", String(live.lookAways)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 px-1 py-2 dark:bg-slate-800">
                <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-0.5 text-base font-bold tabular-nums text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
                  <span dir="ltr">{value}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{PRIVACY[locale]}</p>
        </>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          {ar
            ? "الكاميرا متوقفة. كل شيء يعمل بدونها."
            : "Camera is off. Everything works without it."}
        </p>
      )}
    </section>
  );
}

/** Results card: focus per part of the Check-in plus one format strategy. */
export function FocusResults({ locale, focus }: { locale: Locale; focus: FocusSummary }) {
  const ar = locale === "ar";
  return (
    <section
      aria-labelledby="focus-title"
      className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="focus-title" className="font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
          {ar ? "كيف بقي تركيزك" : "How your focus held"}
        </h2>
        <p className="text-xs text-slate-500">{ar ? "من الكاميرا" : "From the camera"}</p>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[
          [ar ? "وقت التركيز" : "Time focused", `${focus.pct}%`],
          [ar ? "أطول فترة" : "Longest stretch", formatSec(focus.longestSec)],
          [ar ? "مرات الالتفات" : "Look-aways", String(focus.lookAways)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col-reverse rounded-2xl bg-[var(--sanad-sea-soft)] px-2 py-3 dark:bg-[var(--sanad-sea)]/15"
          >
            <dt className="mt-1 text-xs text-slate-600 dark:text-slate-300">{label}</dt>
            <dd className="text-2xl font-bold tabular-nums text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
              <span dir="ltr">{value}</span>
            </dd>
          </div>
        ))}
      </dl>

      <ul className="mt-5 space-y-3">
        {focus.parts.map((p) => (
          <li key={p.part} className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-3 text-sm">
            <span className="font-medium">{PART_LABEL[p.part][locale]}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <span
                className="grow-x block h-full rounded-full bg-[var(--sanad-sea)]"
                style={{ width: `${p.pct}%` }}
              />
            </span>
            <span className="text-end tabular-nums text-slate-500">{p.pct}%</span>
            <span className="col-start-2 col-end-4 -mt-2 text-xs text-slate-500">
              {ar
                ? `أطول فترة ${formatSec(p.longestSec)} · متوسط ${formatSec(p.avgSec)} · التفات ${p.lookAways}`
                : `Longest ${formatSec(p.longestSec)} · average ${formatSec(p.avgSec)} · ${p.lookAways} look-aways`}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        💡 {focusTip(focus, ar)}
      </p>
      <p className="mt-3 text-xs text-slate-500">
        {ar
          ? "لم يُحفظ أي فيديو. تُحفظ هذه الأرقام في جوازك فقط إذا اخترت «حفظ لي» أو أعلى."
          : "No video was kept. These numbers go to your Passport only if you choose “Saved for me” or above."}
      </p>
    </section>
  );
}
