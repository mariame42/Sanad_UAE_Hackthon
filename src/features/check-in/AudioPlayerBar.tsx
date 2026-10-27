"use client";

type Props = {
  locale: "en" | "ar";
  playing: boolean;
  onToggle: () => void;
  captionsOn: boolean;
  onToggleCaptions: () => void;
  slower: boolean;
};

export function AudioPlayerBar({
  locale,
  playing,
  onToggle,
  captionsOn,
  onToggleCaptions,
  slower,
}: Props) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-[var(--sanad-indigo)] px-4 py-3 text-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--sanad-gold)] text-[var(--sanad-indigo)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sanad-gold)]"
        aria-label={playing ? (locale === "ar" ? "إيقاف" : "Pause") : locale === "ar" ? "تشغيل" : "Play"}
      >
        {playing ? (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" className="ms-0.5 h-4 w-4" aria-hidden>
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        )}
      </button>

      <div className="flex min-w-0 flex-1 items-end gap-0.5 px-1" aria-hidden>
        {WAVE.map((h, i) => (
          <span
            key={i}
            className={`w-1 rounded-full sm:w-1.5 ${
              i < 18 ? "bg-[var(--sanad-gold)]" : "bg-white/25"
            } ${playing ? "animate-pulse" : ""}`}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>

      <span className="text-xs tabular-nums text-white/80">1:12 / 2:58</span>
      <span className="hidden text-xs text-white/70 sm:inline">
        {slower
          ? locale === "ar"
            ? "سرعة 0.75×"
            : "0.75× speed"
          : locale === "ar"
            ? "سرعة 1×"
            : "1× speed"}
      </span>
      <button
        type="button"
        onClick={onToggleCaptions}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          captionsOn
            ? "bg-white/20 text-white"
            : "bg-transparent text-white/70 hover:text-white"
        }`}
      >
        {captionsOn
          ? locale === "ar"
            ? "الترجمة شغّالة"
            : "Captions on"
          : locale === "ar"
            ? "الترجمة"
            : "Captions"}
      </button>
    </div>
  );
}

const WAVE = [
  8, 14, 10, 18, 22, 12, 20, 16, 24, 14, 18, 10, 22, 16, 12, 20, 14, 18, 8, 12, 16, 10, 14, 8, 12,
  10, 8, 14, 10, 8,
];
