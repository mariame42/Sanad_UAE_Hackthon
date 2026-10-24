"use client";

import { useMemo, useState } from "react";
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
  const [baselineCorrect, setBaselineCorrect] = useState(0);
  const [toolCorrect, setToolCorrect] = useState(0);

  const ids = path === "quick" ? QUICK_IDS : FULL_IDS;
  const current = activities.find((a) => a.id === ids[index])!;

  const strategies = useMemo(() => {
    const list: { title: string; body: string }[] = [];
    if (tools.tts || toolCorrect >= baselineCorrect) {
      list.push({
        title:
          locale === "ar"
            ? "تحويل النص إلى كلام ساعدك"
            : "Text-to-speech helped you",
        body:
          locale === "ar"
            ? `أحبتَ ${Math.max(toolCorrect, baselineCorrect + (tools.tts ? 1 : 0))} أسئلة مع الأدوات. جرّب تفعيله في نظام التعلّم وWord.`
            : `You answered ${Math.max(toolCorrect, baselineCorrect + (tools.tts ? 1 : 0))} with tools on. Here's how to turn TTS on in your LMS and Word.`,
      });
    }
    if (tools.chunking || tools.spacing) {
      list.push({
        title:
          locale === "ar" ? "التقسيم والتباعد" : "Chunking and spacing",
        body:
          locale === "ar"
            ? "تقسيم النص قلّل الجهد على القائمة المحددة بوقت. استخدم فقرات أقصر في ملاحظاتك."
            : "Chunking cut effort on the timed list. Use shorter paragraphs in your notes.",
      });
    }
    if (list.length === 0) {
      list.push({
        title:
          locale === "ar"
            ? "استراتيجيات عامة"
            : "General strategies",
        body:
          locale === "ar"
            ? "جرّب مسارات متعددة الوسائط (نص / صوت / فيديو) واختر ما يناسب المهمة — دون تصنيفات."
            : "Try multi-format paths (text / audio / video) and pick what fits the task — no labels.",
      });
    }
    return list;
  }, [baselineCorrect, locale, toolCorrect, tools]);

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
    if (current.id === "read") {
      setBaselineCorrect(scoreActivity("read"));
    }
    if (current.id === "tool_trial") {
      setToolCorrect(scoreActivity("tool_trial"));
    }
    if (index + 1 >= ids.length) {
      setPhase("results");
      return;
    }
    setIndex((i) => i + 1);
  }

  function chooseConsent(choice: ConsentChoice) {
    addCaseFromCheckIn(
      choice,
      strategies.map((s) => s.title),
    );
    setPhase("done");
    if (choice === "coach" || choice === "sas") {
      setTimeout(() => router.push("/my-case"), 800);
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
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-start transition hover:border-[#1F7A7A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A7A] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900"
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
            {phase === "done" ? (
              <p className="mt-4 font-medium text-[#1F7A7A]" role="status">
                {t.checkIn.done}
              </p>
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
      <h1 className="mt-2 text-2xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {title}
      </h1>

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
              <div
                className="flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-[#1F7A7A] to-[#0F3D3E] text-center text-white"
                role="img"
                aria-label={
                  locale === "ar"
                    ? "فيديو توضيحي للحرم"
                    : "Illustrated campus video placeholder"
                }
              >
                <p className="px-6 text-lg font-semibold">
                  {locale === "ar"
                    ? "احتياجات مختلفة. أهداف واحدة."
                    : "Different needs. Same goals."}
                </p>
              </div>
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
