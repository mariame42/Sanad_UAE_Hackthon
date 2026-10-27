"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import type { ConsentChoice } from "@/lib/types";
import { AudioPlayerBar } from "./AudioPlayerBar";
import { CameraNotice } from "./CameraNotice";
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
  type ModeId,
  type Question,
} from "./content";
import { JourneyBar } from "./JourneyBar";
import { QuestionBar } from "./QuestionBar";
import { ReadingStage } from "./ReadingStage";
import { ToolsPanel, type Tools } from "./ToolsPanel";

type Phase = "intro" | "play" | "results" | "consent" | "done";
type ToolKey = "tts" | "spacing" | "dyslexiaFont" | "chunking";

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

function isModeId(id: ActivityId): id is ModeId {
  return id === "read" || id === "listen" || id === "watch";
}

export function CheckInPlayer() {
  const { t, locale } = useLocale();
  const { addCaseFromCheckIn } = useMockStore();
  const router = useRouter();
  const ar = locale === "ar";

  const [phase, setPhase] = useState<Phase>("intro");
  const [path, setPath] = useState<"quick" | "full">("quick");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [qIndex, setQIndex] = useState(0);
  const [modeOverride, setModeOverride] = useState<ModeId | null>(null);
  const [activeChunk, setActiveChunk] = useState(0);
  const [playing, setPlaying] = useState(false);
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

  const ids = path === "quick" ? QUICK_IDS : FULL_IDS;
  const current = activities.find((a) => a.id === ids[index])!;
  const journeyMode: ModeId | "tools" =
    phase === "results" || phase === "consent" || phase === "done"
      ? "tools"
      : isModeId(current.id)
        ? current.id
        : "read";
  const mode: ModeId =
    modeOverride ?? (isModeId(current.id) ? current.id : "read");

  const completed = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < index; i++) {
      set.add(ids[i]);
    }
    if (phase === "results" || phase === "consent" || phase === "done") {
      set.add("read");
      set.add("listen");
      set.add("watch");
    }
    return set;
  }, [ids, index, phase]);

  const flatQuestions = useMemo(() => {
    const list: { activityId: ActivityId; question: Question }[] = [];
    for (const id of ids) {
      const act = activities.find((a) => a.id === id)!;
      for (const q of act.questions) {
        list.push({ activityId: id, question: q });
      }
    }
    return list;
  }, [ids]);

  const activityQuestionOffset = useMemo(() => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += activities.find((a) => a.id === ids[i])!.questions.length;
    }
    return offset;
  }, [ids, index]);

  const currentQuestions = current.questions;
  const currentQuestion = currentQuestions[qIndex];
  const globalQIndex = activityQuestionOffset + qIndex;

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

    const formats = (["text", "audio", "video"] as const).map((f) => ({
      format: f,
      acc: accuracy(attempts.filter((a) => FORMAT[a.id] === f)),
    }));
    const overall = accuracy(attempts) ?? 1;
    return { strategies, formats, persistent: overall < 0.6 };
  }, [attempts, ar, locale]);
  const strategies = insight.strategies;

  useEffect(() => {
    if (!tools.chunking) return;
    const id = window.setInterval(() => {
      setActiveChunk((c) => (c + 1) % chunks.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [tools.chunking, chunks.length]);

  useEffect(() => {
    if (!playing || !tools.tts) return;
    const text = chunks.join(" ");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale === "ar" ? "ar-AE" : "en-US";
    u.rate = tools.slowerSpeech ? 0.75 : 1;
    u.onend = () => setPlaying(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return () => window.speechSynthesis.cancel();
  }, [playing, tools.tts, tools.slowerSpeech, chunks, locale]);

  function scoreActivity(activityId: ActivityId) {
    const act = activities.find((a) => a.id === activityId)!;
    let correct = 0;
    for (const q of act.questions) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    return correct;
  }

  function advanceFromActivity() {
    window.speechSynthesis?.cancel();
    setPlaying(false);
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
    setQIndex(0);
    setModeOverride(null);
    setActiveChunk(0);
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
  ]
    .filter(Boolean)
    .join(" ");

  const partNumber = Math.min(index + 1, 3);
  const partLabel =
    locale === "ar"
      ? `الجزء ${partNumber} من 3 — ${topic}`
      : `Part ${partNumber} of 3 — ${topic}`;

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
            <CameraNotice locale={locale} />
          </div>
          <Button
            type="button"
            className="mt-6 !bg-[var(--sanad-indigo)]"
            onClick={() => {
              setIndex(0);
              setQIndex(0);
              setPhase("play");
            }}
          >
            {t.checkIn.start}
          </Button>
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
                  className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 text-sm"
                >
                  <span className="font-medium">
                    {
                      {
                        text: ar ? "نص" : "Text",
                        audio: ar ? "صوت" : "Audio",
                        video: ar ? "فيديو" : "Video",
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
  const captionText =
    locale === "ar"
      ? (current.transcriptAr ?? chunks.join(" "))
      : (current.transcriptEn ?? chunks.join(" "));

  return (
    <div className="sanad-checkin-bg flex min-h-[calc(100vh-5rem)] flex-col">
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-8">
        <PrivacyPill locale={locale} />
        <div className="mt-6">
          <JourneyBar locale={locale} current={journeyMode} completed={completed} />
        </div>

        {showReadingShell ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
            <ReadingStage
              locale={locale}
              mode={mode}
              onModeChange={(m) => {
                setModeOverride(m);
                if (m === "listen" && tools.tts) setPlaying(true);
              }}
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
            />
            <div className="space-y-4">
              <ToolsPanel
                locale={locale}
                tools={tools}
                onChange={setTools}
                labels={{
                  title: t.checkIn.tools,
                  hint: t.checkIn.toolsHint,
                  tts: t.checkIn.tts,
                  dyslexiaFont: t.checkIn.dyslexiaFont,
                  spacing: t.checkIn.spacing,
                  chunking: t.checkIn.chunking,
                  slowerSpeech: t.checkIn.slowerSpeech,
                }}
              />
              <CameraNotice locale={locale} />
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
            <section className={`rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${bodyClass}`}>
              <h1 className="text-2xl font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
                {locale === "ar" ? current.titleAr : current.titleEn}
              </h1>
              <div className="mt-4 space-y-3 text-base leading-relaxed text-slate-700 dark:text-slate-200">
                {(locale === "ar" ? current.bodyAr : current.bodyEn)
                  .split(". ")
                  .filter(Boolean)
                  .map((sentence, i) => (
                    <p key={i}>
                      {sentence.trim().endsWith(".") ? sentence : `${sentence}.`}
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
            <div className="space-y-4">
              <ToolsPanel
                locale={locale}
                tools={tools}
                onChange={setTools}
                labels={{
                  title: t.checkIn.tools,
                  hint: t.checkIn.toolsHint,
                  tts: t.checkIn.tts,
                  dyslexiaFont: t.checkIn.dyslexiaFont,
                  spacing: t.checkIn.spacing,
                  chunking: t.checkIn.chunking,
                  slowerSpeech: t.checkIn.slowerSpeech,
                }}
              />
              <CameraNotice locale={locale} />
            </div>
          </div>
        )}
      </div>

      {currentQuestion ? (
        <QuestionBar
          locale={locale}
          question={currentQuestion}
          questionIndex={globalQIndex}
          questionTotal={flatQuestions.length}
          selected={answers[currentQuestion.id]}
          onSelect={(oi) =>
            setAnswers((prev) => ({ ...prev, [currentQuestion.id]: oi }))
          }
          onNext={nextQuestion}
          nextLabel={
            globalQIndex + 1 >= flatQuestions.length
              ? t.checkIn.submit
              : t.checkIn.nextQuestion
          }
          footerLeft={t.checkIn.footerPause}
          footerRight={t.checkIn.footerFormats}
        />
      ) : null}
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
