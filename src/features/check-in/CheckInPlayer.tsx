"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import type { ConsentChoice } from "@/lib/types";
import { FocusModeHint } from "./FocusModeHint";
import {
  activities,
  FULL_IDS,
  QUICK_IDS,
  type ActivityId,
} from "./content";

type Tools = {
  tts: boolean;
  spacing: boolean;
  dyslexiaFont: boolean;
  chunking: boolean;
};

type Phase = "intro" | "play" | "results" | "consent" | "done";

type ToolKey = keyof Tools;

type Attempt = {
  id: ActivityId;
  correct: number;
  total: number;
  tools: Tools;
};

const FORMAT: Partial<Record<ActivityId, "text" | "audio" | "video">> = {
  read: "text",
  listen: "audio",
  watch: "video",
};

const TOOL_LABEL: Record<ToolKey, { en: string; ar: string }> = {
  tts: { en: "Text-to-speech", ar: "تحويل النص إلى كلام" },
  spacing: { en: "Wider spacing", ar: "التباعد الأوسع" },
  dyslexiaFont: { en: "Reading-friendly font", ar: "الخط المريح للقراءة" },
  chunking: { en: "Chunking", ar: "تقسيم النص" },
};

const TOOL_HOWTO: Record<ToolKey, { en: string; ar: string }> = {
  tts: {
    en: "Turn it on: LMS → Accessibility → Read aloud. In Word: Review → Read Aloud.",
    ar: "للتفعيل: نظام التعلّم ← الإتاحة ← القراءة بصوت عالٍ. في Word: مراجعة ← قراءة بصوت عالٍ.",
  },
  spacing: {
    en: "In Word: Layout → Spacing, or use Immersive Reader → Text preferences.",
    ar: "في Word: تخطيط ← التباعد، أو القارئ الشامل ← تفضيلات النص.",
  },
  dyslexiaFont: {
    en: "Immersive Reader → Font, or set a clear sans-serif font as default in your LMS.",
    ar: "القارئ الشامل ← الخط، أو اختر خطاً واضحاً افتراضياً في نظام التعلّم.",
  },
  chunking: {
    en: "Split readings into short sections and add a one-line summary after each.",
    ar: "قسّم القراءات إلى أجزاء قصيرة وأضف ملخصاً من سطر بعد كل جزء.",
  },
};

function accuracy(list: Attempt[]) {
  const total = list.reduce((n, a) => n + a.total, 0);
  return total ? list.reduce((n, a) => n + a.correct, 0) / total : null;
}

export function CheckInPlayer() {
  const { t, locale } = useLocale();
  const { addCaseFromCheckIn } = useMockStore();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("intro");
  const [path, setPath] = useState<"quick" | "full">("quick");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [tools, setTools] = useState<Tools>({
    tts: false,
    spacing: false,
    dyslexiaFont: false,
    chunking: false,
  });
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [consent, setConsent] = useState<ConsentChoice | null>(null);

  const ids = path === "quick" ? QUICK_IDS : FULL_IDS;
  const current = activities.find((a) => a.id === ids[index])!;

  const ar = locale === "ar";

  const insight = useMemo(() => {
    const strategies: { title: string; body: string }[] = [];
    for (const key of Object.keys(TOOL_LABEL) as ToolKey[]) {
      const on = attempts.filter((a) => a.tools[key]);
      if (!on.length) continue;
      const withAcc = accuracy(on)!;
      const withoutAcc = accuracy(attempts.filter((a) => !a.tools[key]));
      const helped = withoutAcc !== null && withAcc > withoutAcc;
      const pct = (n: number) => Math.round(n * 100);
      const name = TOOL_LABEL[key][locale];
      strategies.push({
        title: helped
          ? ar
            ? `${name} ساعدك`
            : `${name} helped you`
          : ar
            ? `${name} مناسب لك`
            : `${name} worked well for you`,
        body:
          (helped
            ? ar
              ? `أجبت بشكل صحيح عن ${pct(withAcc)}٪ مع تفعيله مقابل ${pct(withoutAcc)}٪ بدونه. `
              : `You got ${pct(withAcc)}% right with it on, versus ${pct(withoutAcc)}% without. `
            : ar
              ? `أداؤك معه ${Math.round(withAcc * 100)}٪ — احتفظ به كخيار. `
              : `You scored ${Math.round(withAcc * 100)}% with it on — keep it as an option. `) +
          TOOL_HOWTO[key][locale],
      });
    }
    if (!strategies.length) {
      strategies.push({
        title: ar ? "جرّب أداة في المرة القادمة" : "Try a tool next time",
        body: ar
          ? "لم تستخدم أدوات هذه المرة. كثير من الطلاب يجدون تحويل النص إلى كلام أو التقسيم مفيداً للقراءات الطويلة."
          : "You didn’t switch any tools on this time. Many students find text-to-speech or chunking useful for long readings.",
      });
    }

    const formats = (["text", "audio", "video"] as const).map((f) => ({
      format: f,
      acc: accuracy(attempts.filter((a) => FORMAT[a.id] === f)),
    }));
    const overall = accuracy(attempts) ?? 1;
    return { strategies, formats, persistent: overall < 0.6 };
  }, [attempts, ar, locale]);
  const strategies = insight.strategies;

  function scoreActivity(activityId: ActivityId) {
    const act = activities.find((a) => a.id === activityId)!;
    let correct = 0;
    for (const q of act.questions) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    return correct;
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale === "ar" ? "ar-AE" : "en-US";
    window.speechSynthesis.speak(u);
  }

  function next() {
    window.speechSynthesis?.cancel();
    setAttempts((prev) => [
      ...prev.filter((a) => a.id !== current.id),
      {
        id: current.id,
        correct: scoreActivity(current.id),
        total: current.questions.length,
        tools: { ...tools },
      },
    ]);
    if (index + 1 >= ids.length) {
      setPhase("results");
      return;
    }
    setIndex((i) => i + 1);
  }

  function chooseConsent(choice: ConsentChoice) {
    setConsent(choice);
    addCaseFromCheckIn(
      choice,
      strategies.map((s) => s.title),
    );
    setPhase("done");
    if (choice === "coach" || choice === "sas") {
      setTimeout(() => router.push("/my-case"), 1400);
    }
  }

  const bodyClass = [
    tools.spacing ? "sanad-wide" : "",
    tools.dyslexiaFont ? "sanad-dyslexia" : "",
    tools.chunking ? "sanad-chunk" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          {t.checkIn.title}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {t.checkIn.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            type="button"
            variant={path === "quick" ? "primary" : "secondary"}
            onClick={() => setPath("quick")}
          >
            {t.checkIn.quick}
          </Button>
          <Button
            type="button"
            variant={path === "full" ? "primary" : "secondary"}
            onClick={() => setPath("full")}
          >
            {t.checkIn.full}
          </Button>
        </div>
        <FocusModeHint />
        <Button
          type="button"
          className="mt-6"
          onClick={() => {
            setIndex(0);
            setPhase("play");
          }}
        >
          {t.checkIn.start}
        </Button>
      </div>
    );
  }

  if (phase === "results" || phase === "consent" || phase === "done") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          {t.checkIn.results}
        </h1>
        <ul className="mt-6 space-y-4">
          {strategies.map((s) => (
            <li
              key={s.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
            >
              <h2 className="font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
                {s.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {s.body}
              </p>
            </li>
          ))}
        </ul>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900" aria-labelledby="formats-title">
          <h2 id="formats-title" className="font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
            {ar ? "أين كان الفهم أسهل اليوم" : "Where it clicked today"}
          </h2>
          <ul className="mt-4 space-y-3">
            {insight.formats.map(({ format, acc }) => (
              <li key={format} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 text-sm">
                <span className="font-medium">
                  {{ text: ar ? "نص" : "Text", audio: ar ? "صوت" : "Audio", video: ar ? "فيديو" : "Video" }[format]}
                </span>
                <span className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <span
                    className="block h-full rounded-full bg-[#1F7A7A] transition-[width] duration-700 dark:bg-[#4DB3B0]"
                    style={{ width: `${Math.round((acc ?? 0) * 100)}%` }}
                  />
                </span>
                <span className="text-end tabular-nums text-slate-500">
                  {acc === null ? "—" : `${Math.round(acc * 100)}%`}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            {ar
              ? "هذا ليس «أسلوب تعلّم» ولا تصنيفاً — فقط ما ساعدك اليوم. لا يُحفظ شيء دون اختيارك."
              : "This is not a “learning style” or a label — just what helped today. Nothing is saved unless you choose."}
          </p>
        </section>

        {insight.persistent ? (
          <p className="mt-4 rounded-2xl bg-[#FBF0E8] p-4 text-sm text-slate-700 dark:bg-[#2E241C] dark:text-slate-200">
            {ar
              ? "كثير من الطلاب يجدون أن التحدث مع شخص ما حول هذا مفيد. يمكنك اختيار «التحدث مع مدرب تعلّم» أدناه — القرار لك."
              : "Many students find it useful to talk to someone about this. You can pick “Talk to a learning coach” below — it’s your choice."}
          </p>
        ) : null}

        {phase === "results" ? (
          <Button type="button" className="mt-6" onClick={() => setPhase("consent")}>
            {t.checkIn.next}
          </Button>
        ) : null}

        {phase === "consent" || phase === "done" ? (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
              {t.checkIn.consentTitle}
            </h2>
            <div className="mt-4 grid gap-3">
              {(
                [
                  ["private", t.checkIn.private, t.checkIn.privateHint],
                  ["saved", t.checkIn.saved, t.checkIn.savedHint],
                  ["coach", t.checkIn.coach, t.checkIn.coachHint],
                  ["sas", t.checkIn.sas, t.checkIn.sasHint],
                ] as const
              ).map(([key, label, hint]) => (
                <button
                  key={key}
                  type="button"
                  disabled={phase === "done"}
                  onClick={() => chooseConsent(key)}
                  aria-pressed={consent === key}
                  className={`rounded-2xl border bg-white p-4 text-start transition hover:border-[#1F7A7A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] disabled:cursor-default dark:bg-slate-900 ${
                    consent === key
                      ? "border-[#1F7A7A] ring-2 ring-[#1F7A7A]/30"
                      : "border-slate-200 disabled:opacity-50 dark:border-slate-700"
                  }`}
                >
                  <span className="font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
                    {label}
                  </span>
                  <span className="mt-1 block text-sm text-slate-500">
                    {hint}
                  </span>
                </button>
              ))}
            </div>
            {phase === "done" && consent ? (
              <ConsentReceipt choice={consent} ar={ar} />
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  const title = locale === "ar" ? current.titleAr : current.titleEn;
  const body = locale === "ar" ? current.bodyAr : current.bodyEn;
  const transcript =
    locale === "ar" ? current.transcriptAr : current.transcriptEn;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <p className="text-sm font-medium text-slate-500">
        {t.checkIn.progress} {index + 1} / {ids.length}
      </p>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={ids.length}
        aria-valuenow={index + 1}
      >
        <div
          className="h-full rounded-full bg-[#1F7A7A] transition-[width] duration-500 dark:bg-[#4DB3B0]"
          style={{ width: `${((index + 1) / ids.length) * 100}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">{title}</h1>
        {current.id === "timed" ? <Countdown key={current.id} seconds={45} ar={ar} /> : null}
      </div>

      <fieldset className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <legend className="px-1 text-sm font-bold">{t.checkIn.tools}</legend>
        <div className="flex flex-wrap gap-3">
          {(
            [
              ["tts", t.checkIn.tts],
              ["spacing", t.checkIn.spacing],
              ["dyslexiaFont", t.checkIn.dyslexiaFont],
              ["chunking", t.checkIn.chunking],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="inline-flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={tools[key]}
                onChange={(e) =>
                  setTools((prev) => ({ ...prev, [key]: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-[#1F7A7A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A]"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={`mt-6 rounded-2xl bg-white p-5 dark:bg-slate-900 ${bodyClass}`}>
        {current.id === "listen" || current.id === "watch" ? (
          <div className="mb-4 space-y-3">
            {current.id === "listen" ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => speak(transcript ?? body)}
              >
                ▶ {locale === "ar" ? "تشغيل الصوت" : "Play audio"}
              </Button>
            ) : (
              <CaptionedClip
                lines={(transcript ?? "").split(/(?<=\.)\s+/).filter(Boolean)}
                speak={speak}
                ar={ar}
              />
            )}
            {transcript ? (
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-[#1F7A7A]">
                  {t.checkIn.transcript}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {transcript}
                </p>
              </details>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {body.split(". ").filter(Boolean).map((sentence, i) => (
            <p key={i}>{sentence.trim().endsWith(".") ? sentence : `${sentence}.`}</p>
          ))}
        </div>

        {tools.tts ? (
          <Button
            type="button"
            variant="ghost"
            className="mt-3"
            onClick={() => speak(body)}
          >
            {t.checkIn.tts}
          </Button>
        ) : null}
      </div>

      <div className="mt-6 space-y-5">
        {current.questions.map((q) => {
          const prompt = locale === "ar" ? q.promptAr : q.promptEn;
          const options = locale === "ar" ? q.optionsAr : q.optionsEn;
          return (
            <fieldset key={q.id}>
              <legend className="text-sm font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
                {prompt}
              </legend>
              <div className="mt-2 space-y-2">
                {options.map((opt, oi) => (
                  <label
                    key={opt}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm has-[:checked]:border-[#1F7A7A] dark:border-slate-700"
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === oi}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: oi }))
                      }
                      className="h-4 w-4 text-[#1F7A7A]"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>

      <Button type="button" className="mt-8" onClick={next}>
        {index + 1 >= ids.length ? t.checkIn.submit : t.checkIn.next}
      </Button>
    </div>
  );
}

/** Gentle timer: shows time, never penalises running out. */
function Countdown({ seconds, ar }: { seconds: number; ar: boolean }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${
        left > 10
          ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          : "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
      }`}
      aria-live={left === 0 ? "polite" : "off"}
    >
      {left > 0
        ? `⏱ ${left}${ar ? " ث" : "s"}`
        : ar
          ? "انتهى الوقت — أجب بلا عقوبة"
          : "Time’s up — answer anyway, no penalty"}
    </span>
  );
}

/** Narrated, always-captioned clip (no media file needed for the demo). */
function CaptionedClip({
  lines,
  speak,
  ar,
}: {
  lines: string[];
  speak: (text: string) => void;
  ar: boolean;
}) {
  const [line, setLine] = useState(-1);

  useEffect(() => {
    if (line < 0 || line >= lines.length) return;
    speak(lines[line]);
    const id = setTimeout(() => setLine((n) => n + 1), 2600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line]);

  const playing = line >= 0 && line < lines.length;

  return (
    <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1F7A7A] to-[#0F3D3E] text-center text-white">
      <div aria-hidden className={`absolute -start-10 -top-10 h-40 w-40 rounded-full bg-white/10 ${playing ? "welcome-float" : ""}`} />
      <div aria-hidden className={`absolute -bottom-12 -end-8 h-48 w-48 rounded-full bg-[#4DB3B0]/20 ${playing ? "welcome-float" : ""}`} />
      {playing ? (
        <p key={line} className="welcome-fade relative px-8 text-lg font-semibold sm:text-xl">
          {lines[line]}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setLine(0)}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-2xl text-[#0F3D3E] shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={ar ? "تشغيل المقطع" : "Play clip"}
        >
          {line >= lines.length ? "↻" : "▶"}
        </button>
      )}
      <p className="absolute bottom-2 start-3 rounded bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
        CC
      </p>
    </div>
  );
}

function ConsentReceipt({ choice, ar }: { choice: ConsentChoice; ar: boolean }) {
  const rows: Record<ConsentChoice, { en: [string, string, string]; ar: [string, string, string] }> = {
    private: {
      en: ["Nothing", "No one", "Deleted when you leave this page"],
      ar: ["لا شيء", "لا أحد", "يُحذف عند مغادرة الصفحة"],
    },
    saved: {
      en: ["Your strategies", "Only you", "Until you delete them"],
      ar: ["استراتيجياتك", "أنت فقط", "حتى تحذفها"],
    },
    coach: {
      en: ["Strategy summary (no scores)", "A learning coach (L2)", "End of semester, unless you keep it"],
      ar: ["ملخص الاستراتيجيات (دون درجات)", "مدرب تعلّم (L2)", "نهاية الفصل ما لم تحتفظ به"],
    },
    sas: {
      en: ["Strategy summary + your request", "SAS professionals (L3)", "Until SAS review ends"],
      ar: ["ملخص الاستراتيجيات + طلبك", "مختصو خدمات الإتاحة (L3)", "حتى انتهاء المراجعة"],
    },
  };
  const [what, who, until] = rows[choice][ar ? "ar" : "en"];
  const labels = ar ? ["ما يُشارك", "مع من", "حتى متى"] : ["What is shared", "With whom", "Kept until"];

  return (
    <div role="status" className="welcome-fade mt-6 rounded-2xl border border-dashed border-[#1F7A7A] bg-white p-5 dark:bg-slate-900">
      <p className="text-xs font-bold uppercase tracking-wide text-[#1F7A7A] dark:text-[#4DB3B0]">
        🧾 {ar ? "إيصال الموافقة" : "Consent receipt"}
      </p>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        {[what, who, until].map((v, i) => (
          <div key={labels[i]}>
            <dt className="text-xs text-slate-500">{labels[i]}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-slate-500">
        {ar
          ? "يمكنك سحب الموافقة في أي وقت من «حالتي»."
          : "You can withdraw consent any time from “My case”."}
      </p>
    </div>
  );
}
