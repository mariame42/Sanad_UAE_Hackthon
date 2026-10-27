"use client";

import type { ModeId } from "./content";
import { AudioPlayerBar } from "./AudioPlayerBar";

type Props = {
  locale: "en" | "ar";
  mode: ModeId;
  onModeChange: (mode: ModeId) => void;
  partLabel: string;
  title: string;
  chunks: string[];
  activeChunk: number;
  chunking: boolean;
  bodyClass: string;
  playing: boolean;
  onTogglePlay: () => void;
  captionsOn: boolean;
  onToggleCaptions: () => void;
  slowerSpeech: boolean;
  captionText?: string;
};

const MODES: { id: ModeId; en: string; ar: string }[] = [
  { id: "read", en: "Read", ar: "قراءة" },
  { id: "listen", en: "Listen", ar: "استماع" },
  { id: "watch", en: "Watch", ar: "مشاهدة" },
];

export function ReadingStage({
  locale,
  mode,
  onModeChange,
  partLabel,
  title,
  chunks,
  activeChunk,
  chunking,
  bodyClass,
  playing,
  onTogglePlay,
  captionsOn,
  onToggleCaptions,
  slowerSpeech,
  captionText,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-500">{partLabel}</p>
        <div
          className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800"
          role="tablist"
          aria-label={locale === "ar" ? "طريقة العرض" : "How you take this part"}
        >
          {MODES.map((m) => {
            const selected = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onModeChange(m.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  selected
                    ? "bg-[var(--sanad-indigo)] text-white shadow-sm"
                    : "text-slate-500 hover:text-[var(--sanad-indigo)] dark:hover:text-white"
                }`}
              >
                {locale === "ar" ? m.ar : m.en}
              </button>
            );
          })}
        </div>
      </div>

      <h1 className="mt-5 font-[family-name:var(--font-reading)] text-2xl font-semibold leading-snug text-[var(--sanad-indigo)] sm:text-3xl dark:text-[#E8ECF8]">
        {title}
      </h1>

      {mode === "watch" ? (
        <div
          className="mt-6 flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--sanad-indigo)] to-[var(--sanad-sea)] text-center text-white"
          role="img"
          aria-label={
            locale === "ar" ? "مقطع قصير عن النوم والذاكرة" : "Short clip about sleep and memory"
          }
        >
          <p className="max-w-md px-6 text-lg font-semibold sm:text-xl">
            {locale === "ar"
              ? "احتياجات مختلفة. أهداف واحدة. الراحة جزء من التعلّم."
              : "Different needs. Same goals. Rest is part of how you learn."}
          </p>
        </div>
      ) : null}

      <div className={`mt-6 space-y-1 ${bodyClass}`}>
        {chunks.map((chunk, i) => {
          const isActive = chunking ? i === activeChunk : true;
          const faded = chunking && !isActive;
          return (
            <p
              key={i}
              className={`rounded-xl px-4 py-3 font-[family-name:var(--font-reading)] text-base leading-relaxed transition sm:text-lg ${
                chunking && isActive
                  ? "sanad-chunk-active text-[var(--sanad-indigo)] dark:text-[#E8ECF8]"
                  : faded
                    ? "text-slate-400/80 dark:text-slate-500"
                    : "text-slate-700 dark:text-slate-200"
              }`}
            >
              {chunk}
            </p>
          );
        })}
      </div>

      {mode === "listen" || mode === "read" ? (
        <AudioPlayerBar
          locale={locale}
          playing={playing}
          onToggle={onTogglePlay}
          captionsOn={captionsOn}
          onToggleCaptions={onToggleCaptions}
          slower={slowerSpeech}
        />
      ) : null}

      {captionsOn && captionText && (mode === "listen" || mode === "watch") ? (
        <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {captionText}
        </p>
      ) : null}
    </section>
  );
}
