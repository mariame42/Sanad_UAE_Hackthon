"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import type { ConsentChoice, FocusSummary } from "@/lib/types";
import { AudioPlayerBar } from "./AudioPlayerBar";
import {
  activities,
  FULL_IDS,
  PASSAGE_CHUNKS_AR,
  PASSAGE_CHUNKS_EN,
  PASSAGE_TITLE_AR,
  PASSAGE_TITLE_EN,
  PASSAGE_TOPIC_AR,
  PASSAGE_TOPIC_EN,
  QUICK_IDS,
  type ActivityId,
  type JourneyId,
  type ModeId,
} from "./content";
import { FocusOptIn, FocusPanel, FocusResults } from "./focus/FocusCamera";
import { summarize } from "./focus/focusStats";
import { useFocusTracker } from "./focus/useFocusTracker";
import { DotTraceActivity } from "./DotTraceActivity";
import { JourneyBar } from "./JourneyBar";
import { QuestionBar } from "./QuestionBar";
import { ReadingStage } from "./ReadingStage";
import { ToolsPanel, type Tools } from "./ToolsPanel";

type Phase = "intro" | "play" | "analyzing" | "results" | "consent" | "done";
type PlayStage = "content" | "questions";
type ToolKey = "tts" | "spacing" | "dyslexiaFont" | "chunking";

const ANALYZE_STEPS = [
  {
    en: "Reading your answers across text, audio, video, numbers, and trace…",
    ar: "قراءة إجاباتك عبر النص والصوت والفيديو والأعداد والتتبع…",
  },
  {
    en: "Comparing results with tools on vs off…",
    ar: "مقارنة النتائج مع الأدوات ومعطّلة…",
  },
  {
    en: "Building strategies that fit you — not a label…",
    ar: "بناء استراتيجيات تناسبك — بلا تصنيف…",
  },
] as const;

const ANALYZE_STEP_MS = 1850;

type Attempt = {
  id: ActivityId;
  correct: number;
  total: number;
  tools: Tools;
};

const FORMAT: Partial<Record<ActivityId, "text" | "video">> = {
  read: "text",
  watch: "video",
};

const TOOL_LABEL: Record<ToolKey, { en: string; ar: string }> = {
  tts: { en: "Read aloud", ar: "القراءة بصوت عالٍ" },
  spacing: { en: "Wider spacing", ar: "التباعد الأوسع" },
  dyslexiaFont: { en: "Dyslexia-friendly font", ar: "الخط المريح للقراءة" },
  chunking: { en: "One chunk at a time", ar: "جزء واحد في كل مرة" },
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
    en: "Turn on OpenDyslexic in Immersive Reader → Font, or set it as the default font in your LMS.",
    ar: "فعّل خط OpenDyslexic من القارئ الشامل ← الخط، أو اجعله الخط الافتراضي في نظام التعلّم.",
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

function isModeId(id: ActivityId): id is ModeId {
  return id === "read" || id === "watch";
}

export function CheckInPlayer() {
  const { t, locale } = useLocale();
  const { addCaseFromCheckIn } = useMockStore();
  const router = useRouter();
  const ar = locale === "ar";

  const [phase, setPhase] = useState<Phase>("intro");
  const [path, setPath] = useState<"quick" | "full">("quick");
  const [index, setIndex] = useState(0);
  const [playStage, setPlayStage] = useState<PlayStage>("content");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [qIndex, setQIndex] = useState(0);
  const [activeChunk, setActiveChunk] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speakNonce, setSpeakNonce] = useState(0);
  const activeChunkRef = useRef(0);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [tools, setTools] = useState<Tools>({
    tts: true,
    spacing: true,
    dyslexiaFont: false,
    chunking: true,
    slowerSpeech: false,
  });
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  // Off by default — loading MediaPipe from the CDN can hang the tab offline.
  const [cameraOn, setCameraOn] = useState(false);
  const [focusSummary, setFocusSummary] = useState<FocusSummary | null>(null);
  const [analyzeStep, setAnalyzeStep] = useState(0);

  const ids = path === "quick" ? QUICK_IDS : FULL_IDS;
  const current = activities.find((a) => a.id === ids[index])!;
  const journeyMode: JourneyId =
    phase === "results" ||
    phase === "consent" ||
    phase === "done" ||
    phase === "analyzing"
      ? "tools"
      : current.id === "numbers"
        ? "numbers"
        : current.id === "trace"
          ? "trace"
          : isModeId(current.id)
            ? current.id
            : "read";
  const mode: ModeId = isModeId(current.id) ? current.id : "read";
  const focus = useFocusTracker(
    cameraOn && phase === "play",
    `${current.id}:${playStage}`,
  );
  const lookingAway = focus.status === "on" && focus.live.gaze !== "focused";

  // Focus Mode adaptation: the lesson video waits while the student looks away.
  const autoPausedRef = useRef(false);
  useEffect(() => {
    if (phase !== "play" || mode !== "watch" || playStage !== "content") return;
    const video = document.querySelector<HTMLVideoElement>("video[data-lesson-video]");
    if (!video) return;
    if (lookingAway && !video.paused) {
      video.pause();
      autoPausedRef.current = true;
    } else if (!lookingAway && autoPausedRef.current) {
      autoPausedRef.current = false;
      void video.play().catch(() => {});
    }
  }, [lookingAway, phase, mode, playStage]);

  const completed = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < index; i++) {
      set.add(ids[i]);
    }
    if (
      phase === "results" ||
      phase === "consent" ||
      phase === "done" ||
      phase === "analyzing"
    ) {
      set.add("read");
      set.add("watch");
      set.add("numbers");
      set.add("trace");
    }
    return set;
  }, [ids, index, phase]);

  useEffect(() => {
    if (phase !== "analyzing") return;
    const timers: number[] = [];
    for (let i = 1; i < ANALYZE_STEPS.length; i++) {
      timers.push(
        window.setTimeout(() => setAnalyzeStep(i), i * ANALYZE_STEP_MS),
      );
    }
    timers.push(
      window.setTimeout(() => {
        setPhase("results");
      }, ANALYZE_STEPS.length * ANALYZE_STEP_MS),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [phase]);

  const currentQuestions = current.questions;
  const currentQuestion = currentQuestions[qIndex];

  const chunks = locale === "ar" ? PASSAGE_CHUNKS_AR : PASSAGE_CHUNKS_EN;
  const title = locale === "ar" ? PASSAGE_TITLE_AR : PASSAGE_TITLE_EN;
  const topic = locale === "ar" ? PASSAGE_TOPIC_AR : PASSAGE_TOPIC_EN;

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
          ? "لم تستخدم أدوات هذه المرة. كثير من الطلاب يجدون القراءة بصوت عالٍ أو التقسيم مفيداً للقراءات الطويلة."
          : "You didn’t switch any tools on this time. Many students find read aloud or chunking useful for long readings.",
      });
    }

    const numbersAttempt = attempts.find((a) => a.id === "numbers");
    if (numbersAttempt) {
      const nAcc =
        numbersAttempt.total > 0
          ? numbersAttempt.correct / numbersAttempt.total
          : 1;
      if (nAcc < 0.7) {
        strategies.push({
          title: ar
            ? "وقت إضافي وتمثيل بصري للأعداد قد يساعدانك"
            : "Extra time and visual numbers may help you",
          body: ar
            ? `في تحقق الأعداد أجبت عن ${Math.round(nAcc * 100)}٪. جرّب خط أعداد أو مسودة أو وقتاً إضافياً في المهام الكمية — استراتيجيات، لا تشخيص.`
            : `On the number check you got ${Math.round(nAcc * 100)}% right. Try a number line, scrap paper, or extra time on quantity tasks — strategies, not a diagnosis.`,
        });
      } else {
        strategies.push({
          title: ar ? "حس الأعداد لديك واضح اليوم" : "Your number sense looked solid today",
          body: ar
            ? `أجبت عن ${Math.round(nAcc * 100)}٪ في تحقق الأعداد. احتفظ بما يريحك إن ظهرت مهام كمية أصعب لاحقاً.`
            : `You got ${Math.round(nAcc * 100)}% on the number check. Keep whatever pacing helps you if harder quantity tasks show up later.`,
        });
      }
    }

    const traceAttempt = attempts.find((a) => a.id === "trace");
    if (traceAttempt) {
      const tAcc =
        traceAttempt.total > 0
          ? traceAttempt.correct / traceAttempt.total
          : 1;
      if (tAcc < 0.7) {
        strategies.push({
          title: ar
            ? "أهداف أكبر ووتيرة أهدأ قد تساعدانك في المهام اليدوية"
            : "Larger targets and a calmer pace may help on hand tasks",
          body: ar
            ? `في تتبع النقاط أكملت ${Math.round(tAcc * 100)}٪ من المسارات بسلاسة. جرّب قلماً أو فأرة أكبر أو وقتاً إضافياً للكتابة والرسم — استراتيجيات، لا تشخيص.`
            : `On follow-the-dots you completed ${Math.round(tAcc * 100)}% of paths smoothly. Try a stylus, a larger mouse, or extra time for writing and drawing — strategies, not a diagnosis.`,
        });
      } else {
        strategies.push({
          title: ar
            ? "مسار يدك بدا سلساً اليوم"
            : "Your hand path looked steady today",
          body: ar
            ? `أكملت ${Math.round(tAcc * 100)}٪ من مسارات النقاط بسلاسة. احتفظ بما يريحك إن ظهرت مهام يدوية أدق لاحقاً.`
            : `You completed ${Math.round(tAcc * 100)}% of the dot paths smoothly. Keep whatever setup helps you if finer hand tasks show up later.`,
        });
      }
    }

    const formats = (
      ["text", "audio", "video", "numbers", "trace"] as const
    ).map((f) => ({
      format: f,
      acc: accuracy(
        f === "audio"
          ? attempts.filter((a) => a.tools.tts)
          : f === "numbers"
            ? attempts.filter((a) => a.id === "numbers")
            : f === "trace"
              ? attempts.filter((a) => a.id === "trace")
              : attempts.filter((a) => FORMAT[a.id] === f),
      ),
    }));
    const overall = accuracy(attempts) ?? 1;
    return { strategies, formats, persistent: overall < 0.6 };
  }, [attempts, ar, locale]);
  const strategies = insight.strategies;

  // Keep highlight in sync when path context changes (adjust state during render).
  const chunkContext = `${tools.chunking}|${locale}|${index}`;
  const [chunkContextKey, setChunkContextKey] = useState(chunkContext);
  if (chunkContextKey !== chunkContext) {
    setChunkContextKey(chunkContext);
    setActiveChunk(0);
  }

  useEffect(() => {
    activeChunkRef.current = activeChunk;
  }, [activeChunk]);

  useEffect(() => {
    if (!playing || !tools.tts || mode !== "read") return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    let cancelled = false;
    synth.cancel();

    const speakFrom = (i: number) => {
      if (cancelled) return;
      if (i >= chunks.length) {
        setPlaying(false);
        return;
      }
      setActiveChunk(i);
      const u = new SpeechSynthesisUtterance(chunks[i]);
      u.lang = locale === "ar" ? "ar-AE" : "en-US";
      u.rate = tools.slowerSpeech ? 0.75 : 1;
      u.onend = () => speakFrom(i + 1);
      u.onerror = () => {
        if (!cancelled) setPlaying(false);
      };
      synth.speak(u);
    };

    speakFrom(tools.chunking ? activeChunkRef.current : 0);
    return () => {
      cancelled = true;
      synth.cancel();
    };
  }, [playing, tools.tts, tools.slowerSpeech, tools.chunking, chunks, locale, mode, speakNonce]);

  function goToChunk(next: number) {
    const clamped = Math.max(0, Math.min(chunks.length - 1, next));
    setActiveChunk(clamped);
    activeChunkRef.current = clamped;
    if (playing) setSpeakNonce((n) => n + 1);
  }

  function scoreActivity(activityId: ActivityId) {
    const act = activities.find((a) => a.id === activityId)!;
    let correct = 0;
    for (const q of act.questions) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    return correct;
  }

  function goToQuestions() {
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setQIndex(0);
    setPlayStage("questions");
  }

  function recordAndAdvance(correct: number, total: number) {
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setAttempts((prev) => [
      ...prev.filter((a) => a.id !== current.id),
      {
        id: current.id,
        correct,
        total,
        tools: { ...tools },
      },
    ]);
    if (index + 1 >= ids.length) {
      setFocusSummary(summarize(focus.snapshot()));
      setAnalyzeStep(0);
      setPhase("analyzing");
      return;
    }
    setIndex((i) => i + 1);
    setQIndex(0);
    setPlayStage("content");
    setActiveChunk(0);
  }

  function advanceFromActivity() {
    recordAndAdvance(scoreActivity(current.id), current.questions.length);
  }

  function advanceFromTrace(result: { correct: number; total: number }) {
    recordAndAdvance(result.correct, result.total);
  }

  function nextQuestion() {
    if (qIndex + 1 < currentQuestions.length) {
      setQIndex((i) => i + 1);
      return;
    }
    advanceFromActivity();
  }

  function chooseConsent(choice: ConsentChoice) {
    setConsent(choice);
    const titles = strategies.map((s) => s.title);
    addCaseFromCheckIn(choice, titles, attempts, focusSummary);
    setPhase("done");
    if (choice === "saved") {
      setTimeout(() => router.push("/passport"), 900);
    } else if (choice === "coach" || choice === "sas") {
      setTimeout(() => router.push("/my-case"), 1400);
    }
  }

  const bodyClass = [
    tools.spacing ? "sanad-wide" : "",
    tools.dyslexiaFont ? "sanad-dyslexia" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const partTotal = ids.filter(
    (id) =>
      id === "read" || id === "watch" || id === "numbers" || id === "trace",
  ).length;
  const partNumber = Math.min(index + 1, partTotal);
  const partLabel =
    locale === "ar"
      ? `الجزء ${partNumber} من ${partTotal} — ${topic}`
      : `Part ${partNumber} of ${partTotal} — ${topic}`;

  if (phase === "intro") {
    return (
      <div className="sanad-checkin-bg min-h-[calc(100vh-5rem)]">
        <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
          <PrivacyPill locale={locale} />
          <h1 className="mt-8 text-3xl font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
            {t.checkIn.title}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{t.checkIn.subtitle}</p>
          <p className="mt-4 text-sm text-slate-500">
            {locale === "ar"
              ? "لا إجابات خاطئة. هذا ليس درجة."
              : "There are no wrong answers. This is not a grade."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              type="button"
              variant={path === "quick" ? "primary" : "secondary"}
              className={path === "quick" ? "!bg-[var(--sanad-indigo)]" : ""}
              onClick={() => setPath("quick")}
            >
              {t.checkIn.quick}
            </Button>
            <Button
              type="button"
              variant={path === "full" ? "primary" : "secondary"}
              className={path === "full" ? "!bg-[var(--sanad-indigo)]" : ""}
              onClick={() => setPath("full")}
            >
              {t.checkIn.full}
            </Button>
          </div>
          <div className="mt-6">
            <FocusOptIn
              locale={locale}
              on={cameraOn}
              onToggle={() => setCameraOn((v) => !v)}
            />
          </div>
          <Button
            type="button"
            className="mt-6 !bg-[var(--sanad-indigo)]"
            onClick={() => {
              focus.reset();
              setFocusSummary(null);
              setIndex(0);
              setQIndex(0);
              setPlayStage("content");
              setPhase("play");
            }}
          >
            {t.checkIn.start}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "analyzing") {
    return (
      <div className="sanad-checkin-bg min-h-[calc(100vh-5rem)]">
        <div className="mx-auto max-w-lg px-5 py-12 sm:px-8">
          <PrivacyPill locale={locale} />
          <div className="mt-6">
            <JourneyBar locale={locale} current="tools" completed={completed} />
          </div>
          <div
            className="mt-12 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-9 w-9 animate-spin rounded-full border-[3px] border-[var(--sanad-sea)]/25 border-t-[var(--sanad-sea)]"
                aria-hidden
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--sanad-sea)]">
                  {ar ? "الذكاء الاصطناعي يعمل" : "AI is working"}
                </p>
                <h1 className="text-xl font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
                  {ar ? "نجهّز ما ساعدك اليوم" : "Preparing what helped you today"}
                </h1>
              </div>
            </div>

            <ol className="mt-8 space-y-4">
              {ANALYZE_STEPS.map((step, i) => {
                const done = i < analyzeStep;
                const active = i === analyzeStep;
                return (
                  <li key={step.en} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                        done
                          ? "bg-[var(--sanad-sea)] text-white"
                          : active
                            ? "bg-[var(--sanad-indigo)] text-white ring-4 ring-[var(--sanad-indigo)]/15"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                      }`}
                      aria-hidden
                    >
                      {done ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <p
                      className={`text-sm leading-snug ${
                        active
                          ? "font-semibold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]"
                          : done
                            ? "text-slate-500"
                            : "text-slate-400"
                      }`}
                    >
                      {ar ? step.ar : step.en}
                      {active ? (
                        <span className="ms-1 inline-flex gap-0.5" aria-hidden>
                          <span className="animate-pulse">.</span>
                          <span className="animate-pulse [animation-delay:150ms]">.</span>
                          <span className="animate-pulse [animation-delay:300ms]">.</span>
                        </span>
                      ) : null}
                    </p>
                  </li>
                );
              })}
            </ol>
            <p className="mt-6 text-xs text-slate-400">
              {ar
                ? "لا تشخيص ولا درجة خطر — استراتيجيات فقط."
                : "No diagnosis, no risk score — strategies only."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results" || phase === "consent" || phase === "done") {
    return (
      <div className="sanad-checkin-bg min-h-[calc(100vh-5rem)]">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <PrivacyPill locale={locale} />
          <div className="mt-6">
            <JourneyBar locale={locale} current="tools" completed={completed} />
          </div>
          <h1 className="mt-10 text-3xl font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
            {t.checkIn.results}
          </h1>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {strategies.map((s) => (
              <li
                key={s.title}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <h2 className="font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
                  {s.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {s.body}
                </p>
              </li>
            ))}
          </ul>

          <section
            className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            aria-labelledby="formats-title"
          >
            <h2
              id="formats-title"
              className="font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]"
            >
              {ar ? "أين كان الفهم أسهل اليوم" : "Where it clicked today"}
            </h2>
            <ul className="mt-4 space-y-3">
              {insight.formats.map(({ format, acc }) => (
                <li
                  key={format}
                  className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-3 text-sm"
                >
                  <span className="font-medium">
                    {
                      {
                        text: ar ? "نص" : "Text",
                        audio: ar ? "صوت" : "Audio",
                        video: ar ? "فيديو" : "Video",
                        numbers: ar ? "أعداد" : "Numbers",
                        trace: ar ? "تتبع" : "Trace",
                      }[format]
                    }
                  </span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <span
                      className="block h-full rounded-full bg-[var(--sanad-sea)] transition-[width] duration-700"
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

          {focusSummary ? <FocusResults locale={locale} focus={focusSummary} /> : null}

          {insight.persistent ? (
            <p className="mt-4 rounded-3xl bg-[#FBF0E8] p-4 text-sm text-slate-700 dark:bg-[#2E241C] dark:text-slate-200">
              {ar
                ? "كثير من الطلاب يجدون أن التحدث مع شخص ما حول هذا مفيد. يمكنك اختيار «التحدث مع مدرب تعلّم» أدناه — القرار لك."
                : "Many students find it useful to talk to someone about this. You can pick “Talk to a learning coach” below — it’s your choice."}
            </p>
          ) : null}

          {phase === "results" ? (
            <Button
              type="button"
              className="mt-8 !bg-[var(--sanad-indigo)]"
              onClick={() => setPhase("consent")}
            >
              {t.checkIn.next}
            </Button>
          ) : null}

          {phase === "consent" || phase === "done" ? (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
                {t.checkIn.consentTitle}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                    className={`rounded-3xl border bg-white p-5 text-start transition hover:border-[var(--sanad-sea)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sanad-sea)] disabled:cursor-default dark:bg-slate-900 ${
                      consent === key
                        ? "border-[var(--sanad-sea)] ring-2 ring-[var(--sanad-sea)]/30"
                        : "border-slate-200 disabled:opacity-50 dark:border-slate-700"
                    }`}
                  >
                    <span className="font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
                      {label}
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">{hint}</span>
                  </button>
                ))}
              </div>
              {phase === "done" && consent ? (
                <ConsentReceipt choice={consent} ar={ar} />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const showReadingShell = isModeId(current.id);
  const watchActivity = activities.find((a) => a.id === "watch")!;
  const captionText =
    locale === "ar"
      ? (watchActivity.transcriptAr ?? chunks.join(" "))
      : (watchActivity.transcriptEn ?? chunks.join(" "));

  const toolLabels = {
    title: t.checkIn.tools,
    hint: t.checkIn.toolsHint,
    tts: t.checkIn.tts,
    dyslexiaFont: t.checkIn.dyslexiaFont,
    spacing: t.checkIn.spacing,
    chunking: t.checkIn.chunking,
    slowerSpeech: t.checkIn.slowerSpeech,
  };

  return (
    <div className="sanad-checkin-bg flex min-h-[calc(100vh-5rem)] flex-col">
      <div className="mx-auto w-[min(100%,80%)] flex-1 px-0 py-6">
        <PrivacyPill locale={locale} />
        <div className="mt-6">
          <JourneyBar locale={locale} current={journeyMode} completed={completed} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[16.5rem_minmax(0,1fr)]">
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <FocusPanel
              locale={locale}
              on={cameraOn}
              onToggle={() => setCameraOn((v) => !v)}
              status={focus.status}
              live={focus.live}
              videoRef={focus.videoRef}
              canvasRef={focus.canvasRef}
            />
            <ToolsPanel
              locale={locale}
              tools={tools}
              onChange={setTools}
              labels={toolLabels}
            />
          </div>

          {current.id === "trace" ? (
            <DotTraceActivity locale={locale} onComplete={advanceFromTrace} />
          ) : playStage === "content" ? (
            <div className="space-y-4">
              {showReadingShell ? (
                <ReadingStage
                  locale={locale}
                  mode={mode}
                  showModeTabs={false}
                  partLabel={partLabel}
                  title={title}
                  chunks={chunks}
                  activeChunk={activeChunk}
                  chunking={tools.chunking}
                  bodyClass={bodyClass}
                  playing={playing}
                  onTogglePlay={() => {
                    if (!tools.tts) {
                      setTools((prev) => ({ ...prev, tts: true }));
                    }
                    setPlaying((p) => !p);
                  }}
                  captionsOn={captionsOn}
                  onToggleCaptions={() => setCaptionsOn((c) => !c)}
                  slowerSpeech={tools.slowerSpeech}
                  captionText={captionText}
                  onPrevChunk={() => goToChunk(activeChunk - 1)}
                  onNextChunk={() => goToChunk(activeChunk + 1)}
                />
              ) : (
                <section
                  className={`rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${bodyClass}`}
                >
                  <h1 className="text-2xl font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
                    {locale === "ar" ? current.titleAr : current.titleEn}
                  </h1>
                  <div className="mt-4 space-y-3 text-base leading-relaxed text-slate-700 dark:text-slate-200">
                    {(locale === "ar" ? current.bodyAr : current.bodyEn)
                      .split(". ")
                      .filter(Boolean)
                      .map((sentence, i) => (
                        <p key={i}>
                          {sentence.trim().endsWith(".")
                            ? sentence
                            : `${sentence}.`}
                        </p>
                      ))}
                  </div>
                  {tools.tts ? (
                    <AudioPlayerBar
                      locale={locale}
                      playing={playing}
                      onToggle={() => setPlaying((p) => !p)}
                      captionsOn={captionsOn}
                      onToggleCaptions={() => setCaptionsOn((c) => !c)}
                      slower={tools.slowerSpeech}
                    />
                  ) : null}
                </section>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  className="!bg-[var(--sanad-indigo)]"
                  onClick={goToQuestions}
                >
                  {ar ? "متابعة إلى الأسئلة" : "Continue to questions"}
                </Button>
              </div>
            </div>
          ) : currentQuestion ? (
            <div className="mx-auto w-full max-w-xl">
              <p className="mb-3 text-sm font-medium text-slate-500">
                {ar
                  ? `أسئلة — ${current.titleAr}`
                  : `Questions — ${current.titleEn}`}
              </p>
              <QuestionBar
                locale={locale}
                question={currentQuestion}
                questionIndex={qIndex}
                questionTotal={currentQuestions.length}
                selected={answers[currentQuestion.id]}
                onSelect={(oi) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.id]: oi,
                  }))
                }
                onNext={nextQuestion}
                nextLabel={
                  qIndex + 1 >= currentQuestions.length
                    ? index + 1 >= ids.length
                      ? t.checkIn.submit
                      : ar
                        ? "التالي"
                        : "Next"
                    : t.checkIn.nextQuestion
                }
                footerLeft={t.checkIn.footerPause}
                bodyClass={bodyClass}
              />
            </div>
          ) : null}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {t.checkIn.footerFormats}
        </p>
      </div>
    </div>
  );
}

function PrivacyPill({ locale }: { locale: "en" | "ar" }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-semibold text-[var(--sanad-indigo)] dark:text-[#C5D0F0]">
        {locale === "ar" ? "تسجيل التعلّم" : "Learning Check-in"}
      </p>
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <span className="h-2 w-2 rounded-full bg-[var(--sanad-sea)]" aria-hidden />
        {locale === "ar"
          ? "خاص. لا يُحفظ شيء إلا إذا اخترت."
          : "Private. Nothing is saved unless you choose."}
      </span>
    </div>
  );
}

function ConsentReceipt({ choice, ar }: { choice: ConsentChoice; ar: boolean }) {
  const rows: Record<
    ConsentChoice,
    { en: [string, string, string]; ar: [string, string, string] }
  > = {
    private: {
      en: ["Nothing", "No one", "Deleted when you leave this page"],
      ar: ["لا شيء", "لا أحد", "يُحذف عند مغادرة الصفحة"],
    },
    saved: {
      en: ["Your strategies", "Only you", "Until you delete them"],
      ar: ["استراتيجياتك", "أنت فقط", "حتى تحذفها"],
    },
    coach: {
      en: [
        "Strategy summary (no scores)",
        "A learning coach (L2)",
        "End of semester, unless you keep it",
      ],
      ar: [
        "ملخص الاستراتيجيات (دون درجات)",
        "مدرب تعلّم (L2)",
        "نهاية الفصل ما لم تحتفظ به",
      ],
    },
    sas: {
      en: [
        "Strategy summary + your request",
        "SAS professionals (L3)",
        "Until SAS review ends",
      ],
      ar: [
        "ملخص الاستراتيجيات + طلبك",
        "مختصو خدمات الإتاحة (L3)",
        "حتى انتهاء المراجعة",
      ],
    },
  };
  const [what, who, until] = rows[choice][ar ? "ar" : "en"];
  const labels = ar
    ? ["ما يُشارك", "مع من", "حتى متى"]
    : ["What is shared", "With whom", "Kept until"];

  return (
    <div
      role="status"
      className="welcome-fade mt-6 rounded-3xl border border-dashed border-[var(--sanad-sea)] bg-white p-5 dark:bg-slate-900"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--sanad-sea)]">
        {ar ? "إيصال الموافقة" : "Consent receipt"}
      </p>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        {[what, who, until].map((v, i) => (
          <div key={labels[i]}>
            <dt className="text-xs text-slate-500">{labels[i]}</dt>
            <dd className="font-semibold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
              {v}
            </dd>
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
