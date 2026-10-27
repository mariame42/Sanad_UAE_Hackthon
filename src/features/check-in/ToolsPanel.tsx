"use client";

export type Tools = {
  tts: boolean;
  spacing: boolean;
  dyslexiaFont: boolean;
  chunking: boolean;
  slowerSpeech: boolean;
};

type Props = {
  locale: "en" | "ar";
  tools: Tools;
  onChange: (next: Tools) => void;
  labels: {
    title: string;
    hint: string;
    tts: string;
    dyslexiaFont: string;
    spacing: string;
    chunking: string;
    slowerSpeech: string;
  };
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm font-medium text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sanad-sea)] ${
          checked ? "bg-[var(--sanad-sea)]" : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-[inset-inline-start] ${
            checked ? "inset-inline-start-[1.35rem]" : "inset-inline-start-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function ToolsPanel({ locale, tools, onChange, labels }: Props) {
  return (
    <aside className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-bold text-[var(--sanad-indigo)] dark:text-[#E8ECF8]">
        {labels.title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {labels.hint}
      </p>
      <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
        <Toggle
          label={labels.tts}
          checked={tools.tts}
          onChange={(v) => onChange({ ...tools, tts: v })}
        />
        <Toggle
          label={labels.dyslexiaFont}
          checked={tools.dyslexiaFont}
          onChange={(v) => onChange({ ...tools, dyslexiaFont: v })}
        />
        <Toggle
          label={labels.spacing}
          checked={tools.spacing}
          onChange={(v) => onChange({ ...tools, spacing: v })}
        />
        <Toggle
          label={labels.chunking}
          checked={tools.chunking}
          onChange={(v) => onChange({ ...tools, chunking: v })}
        />
        <Toggle
          label={labels.slowerSpeech}
          checked={tools.slowerSpeech}
          onChange={(v) => onChange({ ...tools, slowerSpeech: v })}
        />
      </div>
      <p className="sr-only">
        {locale === "ar"
          ? "الأدوات مساعدات تفعّلها أنت، وليست إعدادات مفروضة."
          : "These tools are help you turn on, not forced settings."}
      </p>
    </aside>
  );
}
