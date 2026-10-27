"use client";

import { WATCH_VIDEO_SRC, type ModeId } from "./content";
import { AudioPlayerBar } from "./AudioPlayerBar";

type Props = {
  locale: "en" | "ar";
  mode: ModeId;
  onModeChange?: (mode: ModeId) => void;
  showModeTabs?: boolean;
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
  onPrevChunk?: () => void;
  onNextChunk?: () => void;
};

const MODES: { id: ModeId; en: string; ar: string }[] = [
  { id: "read", en: "Read", ar: "قراءة" },
  { id: "watch", en: "Watch", ar: "مشاهدة" },
];

export function ReadingStage({
  locale,
  mode,
  onModeChange,
  showModeTabs = true,
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
  onPrevChunk,
  onNextChunk,
}: Props) {
  const dyslexia = bodyClass.includes("sanad-dyslexia");
  const readingFont = dyslexia ? "" : "font-[family-name:var(--font-reading)]";
  const ar = locale === "ar";

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-500">{partLabel}</p>
        {showModeTabs && onModeChange ? (
          <div
            className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800"
            role="tablist"
            aria-label={ar ? "طريقة العرض" : "How you take this part"}
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
                  {ar ? m.ar : m.en}
                </button>
              );
            })}
          </div>
        ) : (
          <span className="rounded-full bg-[var(--sanad-indigo)]/10 px-3.5 py-1.5 text-sm font-semibold text-[var(--sanad-indigo)] dark:text-[#C5D0F0]">
            {ar
              ? mode === "watch"
                ? "مشاهدة"
                : "قراءة"
              : mode === "watch"
                ? "Watch"
                : "Read"}
          </span>
        )}
      </div>

      <h1
        className={`mt-5 ${readingFont} text-2xl font-semibold leading-snug text-[var(--sanad-indigo)] sm:text-3xl dark:text-[#E8ECF8] ${dyslexia ? bodyClass : ""}`}
      >
        {title}
      </h1>

      {mode === "watch" ? (
        <div className="mt-6">
          <div className="mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-2xl bg-black">
            <video
              key={WATCH_VIDEO_SRC}
              data-lesson-video
              className="h-full w-full object-contain"
              src={WATCH_VIDEO_SRC}
              width={720}
              height={1280}
              controls
              playsInline
              preload="metadata"
              aria-label={
                ar ? "مقطع قصير عن النوم والذاكرة" : "Short clip about sleep and memory"
              }
            />
          </div>
          {captionsOn && captionText ? (
            <p
              className={`mx-auto mt-3 max-w-sm rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600 dark:bg-slate-800 dark:text-slate-300 ${bodyClass}`}
            >
              {captionText}
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <div className={`mt-6 space-y-1 ${bodyClass}`}>
            {chunks.map((chunk, i) => {
              const isActive = chunking ? i === activeChunk : true;
              const faded = chunking && !isActive;
              return (
                <p
                  key={i}
                  className={`rounded-xl px-4 py-3 ${readingFont} text-base leading-relaxed transition sm:text-lg ${
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

          {chunking && (onPrevChunk || onNextChunk) ? (
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onPrevChunk}
                disabled={!onPrevChunk || activeChunk <= 0}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[var(--sanad-indigo)] transition hover:border-[var(--sanad-sea)] disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-[#E8ECF8]"
              >
                {ar ? "الفقرة السابقة" : "Previous paragraph"}
              </button>
              <span className="text-xs text-slate-500">
                {activeChunk + 1} / {chunks.length}
              </span>
              <button
                type="button"
                onClick={onNextChunk}
                disabled={!onNextChunk || activeChunk >= chunks.length - 1}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[var(--sanad-indigo)] transition hover:border-[var(--sanad-sea)] disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-[#E8ECF8]"
              >
                {ar ? "الفقرة التالية" : "Next paragraph"}
              </button>
            </div>
          ) : null}

          <AudioPlayerBar
            locale={locale}
            playing={playing}
            onToggle={onTogglePlay}
            captionsOn={captionsOn}
            onToggleCaptions={onToggleCaptions}
            slower={slowerSpeech}
          />
        </>
      )}
    </section>
  );
}
