"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { Time } from "@/components/ui/Time";
import { findLabels, rewriteFallback, segmentText } from "@/lib/language-guard";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import { useRole } from "@/lib/roles/RoleProvider";
import type { Concern } from "@/lib/types";

const GUIDE = {
  en: [
    ["“I noticed the timed reading quiz seemed to take longer. How did it feel for you?”", "“I think you might be dyslexic.”"],
    ["“Lots of students use audio or extra spacing — want me to show you?”", "“You should get tested.”"],
    ["“There are coaches who help with study strategies. Would that be useful?”", "“Something seems wrong with how you learn.”"],
    ["“It’s completely your choice, and nothing goes on your record.”", "“I’ve already reported this to SAS.”"],
  ],
  ar: [
    ["«لاحظت أن اختبار القراءة المحدد بوقت أخذ وقتاً أطول. كيف كان بالنسبة لك؟»", "«أعتقد أن لديك عسر قراءة.»"],
    ["«كثير من الطلاب يستخدمون الصوت أو تباعد النص — هل أريك كيف؟»", "«يجب أن تخضع لاختبار.»"],
    ["«هناك مدربون يساعدون في استراتيجيات الدراسة. هل يفيدك ذلك؟»", "«هناك مشكلة في طريقة تعلّمك.»"],
    ["«القرار لك تماماً، ولا يُسجَّل شيء في ملفك.»", "«لقد أبلغت خدمات الإتاحة بالفعل.»"],
  ],
} as const;

const OUTCOME_LABEL: Record<Concern["outcome"], { en: string; ar: string }> = {
  support_offered: { en: "Support offered", ar: "عُرض الدعم" },
  support_accepted: { en: "Support accepted", ar: "قُبل الدعم" },
  class_invited: { en: "Check-in offered to whole class", ar: "عُرض التسجيل على الصف" },
};

export function ConcernDeskForm() {
  const { t, locale } = useLocale();
  const { personaName } = useRole();
  const { addConcern, concerns } = useMockStore();
  const ar = locale === "ar";

  const [course, setCourse] = useState("ENG 101");
  const [task, setTask] = useState("Timed Module 3 reading quiz");
  const [when, setWhen] = useState("Weeks 3–5");
  const [note, setNote] = useState(
    "Student seems dyslexic — struggles in class. Strong oral contributions.",
  );
  const [rewritten, setRewritten] = useState("");
  const [source, setSource] = useState<"llm" | "fallback" | null>(null);
  const [rewrittenFrom, setRewrittenFrom] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [trained, setTrained] = useState(false);

  const flags = useMemo(() => findLabels(note, locale), [note, locale]);
  const fromFlags = useMemo(
    () => findLabels(rewrittenFrom, locale),
    [rewrittenFrom, locale],
  );
  const myConcerns = concerns.filter(
    (c) => c.facultyName === personaName("en"),
  );

  async function rewrite() {
    setLoading(true);
    setMessage(null);
    setRewrittenFrom(note);
    const context = { course, task, when };
    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "language_guard", text: note, locale, context }),
      });
      const data = (await res.json()) as {
        rewritten?: string;
        source?: "llm" | "fallback";
        error?: string;
      };
      if (!res.ok || !data.rewritten) throw new Error(data.error ?? "Failed");
      setRewritten(data.rewritten);
      setSource(data.source ?? "llm");
    } catch {
      setRewritten(rewriteFallback(note, context, locale));
      setSource("fallback");
    } finally {
      setLoading(false);
    }
  }

  function save(action: "offer_to_advisor" | "recommend_checkin_class") {
    addConcern({
      facultyName: personaName("en"),
      course,
      task,
      when,
      rawNote: note,
      rewrittenNote: rewritten,
      action,
    });
    setMessage(action === "offer_to_advisor" ? t.concern.saved : t.concern.classRec);
    setRewritten("");
    setSource(null);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {t.concern.title}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{t.concern.subtitle}</p>

      <p
        role="note"
        className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
      >
        {t.concern.safety}
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void rewrite();
        }}
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Field id="course" label={t.concern.course}>
            <TextInput id="course" value={course} onChange={(e) => setCourse(e.target.value)} required />
          </Field>
          <Field id="task" label={t.concern.task}>
            <TextInput id="task" value={task} onChange={(e) => setTask(e.target.value)} required />
          </Field>
          <Field id="when" label={t.concern.when}>
            <TextInput id="when" value={when} onChange={(e) => setWhen(e.target.value)} required />
          </Field>
        </div>
        <Field id="note" label={t.concern.note} hint={t.concern.noteHint}>
          <TextArea
            id="note"
            aria-describedby="note-hint note-check"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
        </Field>

        <LiveCheck note={note} flags={flags} ar={ar} />

        <Button type="submit" disabled={loading || !note.trim()}>
          {loading ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
              {t.concern.rewriting}
            </>
          ) : (
            <>✨ {t.concern.rewrite}</>
          )}
        </Button>
      </form>

      {rewritten ? (
        <section
          aria-labelledby="rewrite-title"
          className="mt-8 overflow-hidden rounded-2xl border border-[#1F7A7A]/30 bg-white shadow-sm dark:border-[#4DB3B0]/40 dark:bg-slate-900"
        >
          <div className="grid sm:grid-cols-2">
            <div className="border-b border-slate-100 p-5 sm:border-b-0 sm:border-e dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                {ar ? "قبل" : "Before"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {segmentText(rewrittenFrom, fromFlags).map((seg, i) =>
                  seg.flag ? (
                    <del key={i} className="rounded bg-rose-100 px-0.5 text-rose-800 decoration-2 dark:bg-rose-950/60 dark:text-rose-200">
                      {seg.text}
                    </del>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  ),
                )}
              </p>
            </div>
            <div className="bg-[#E8F4F3] p-5 dark:bg-[#1A3D3A]">
              <p id="rewrite-title" className="text-xs font-bold uppercase tracking-wide text-[#1F7A7A] dark:text-[#4DB3B0]">
                {ar ? "بعد — " : "After — "}
                {t.concern.rewritten}
              </p>
              <Typewriter key={rewritten} text={rewritten} />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              {source === "llm"
                ? ar ? "صاغها نموذج لغوي · يراجعها إنسان قبل الإرسال" : "Drafted by LLM · a human reviews before sending"
                : ar ? "قواعد محلية (بدون اتصال) · يراجعها إنسان" : "Offline rules (no LLM) · a human reviews before sending"}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => save("offer_to_advisor")}>
                {t.concern.offerAdvisor}
              </Button>
              <Button type="button" variant="secondary" onClick={() => save("recommend_checkin_class")}>
                {t.concern.recommendClass}
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {message ? (
        <p className="mt-4 text-sm font-medium text-[#1F7A7A]" role="status">
          {message}
        </p>
      ) : null}

      <details className="group mt-10 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <summary className="cursor-pointer font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
          {ar ? "دليل المحادثة: قل هذا، لا ذاك" : "Conversation guide: say this, not that"}
        </summary>
        <ul className="mt-4 space-y-3">
          {GUIDE[locale].map(([say, avoid]) => (
            <li key={say} className="grid gap-2 text-sm sm:grid-cols-2">
              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                ✓ {say}
              </p>
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-rose-900 line-through decoration-rose-400/60 dark:bg-rose-950/40 dark:text-rose-100">
                ✕ {avoid}
              </p>
            </li>
          ))}
        </ul>
      </details>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 px-5 py-4 dark:border-slate-600">
        <div>
          <p className="text-sm font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
            {ar ? "تدريب مصغّر · 5 دقائق" : "Micro-training · 5 min"}
          </p>
          <p className="text-xs text-slate-500">
            {ar ? "الاستجابة دون تشخيص" : "Responding without diagnosing"}
          </p>
        </div>
        {trained ? (
          <span className="rounded-full bg-[#D8EFE8] px-3 py-1 text-xs font-bold text-[#1F7A7A] dark:bg-[#1A3D3A] dark:text-[#4DB3B0]">
            🏅 {ar ? "مكتمل" : "Completed"}
          </span>
        ) : (
          <Button type="button" variant="secondary" onClick={() => setTrained(true)}>
            {ar ? "ابدأ" : "Start module"}
          </Button>
        )}
      </div>

      {myConcerns.length ? (
        <section className="mt-10" aria-labelledby="my-concerns">
          <h2 id="my-concerns" className="text-lg font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
            {ar ? "ملاحظاتي" : "My concerns"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {ar
              ? "ترى فقط ما إذا عُرض الدعم أو قُبل (المستوى L1). لا تفاصيل عن الطالب."
              : "You only see whether support was offered or accepted (L1). No student details flow back."}
          </p>
          <ul className="mt-3 space-y-2">
            {myConcerns.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="font-medium">
                  {c.course} · {c.task}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    <Time iso={c.createdAt} locale={locale} />
                  </span>
                  <span className="rounded-full bg-[#E8F4F3] px-2.5 py-0.5 text-xs font-semibold text-[#1F7A7A] dark:bg-[#1A3D3A] dark:text-[#4DB3B0]">
                    {OUTCOME_LABEL[c.outcome][locale]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function LiveCheck({
  note,
  flags,
  ar,
}: {
  note: string;
  flags: ReturnType<typeof findLabels>;
  ar: boolean;
}) {
  if (!note.trim()) return null;
  if (!flags.length) {
    return (
      <p id="note-check" role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
        ✓ {ar ? "لا توجد تصنيفات — لغة قابلة للملاحظة." : "No labels detected — this reads as observable language."}
      </p>
    );
  }
  return (
    <div id="note-check" role="status" className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900/50 dark:bg-rose-950/30">
      <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
        {ar
          ? `حارس اللغة: ${flags.length} تصنيف قد يُشعر الطالب بأنه موسوم`
          : `Language Guard: ${flags.length} label${flags.length > 1 ? "s" : ""} that could stigmatise the student`}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {segmentText(note, flags).map((seg, i) =>
          seg.flag ? (
            <mark
              key={i}
              title={seg.flag.observable}
              className="rounded bg-transparent px-0.5 text-rose-700 underline decoration-rose-500 decoration-wavy decoration-2 underline-offset-4 dark:text-rose-300"
            >
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {flags.map((f) => (
          <li key={`${f.start}-${f.phrase}`} className="rounded-full bg-white px-3 py-1 text-xs shadow-sm dark:bg-slate-900">
            <span className="text-rose-700 line-through dark:text-rose-300">{f.phrase}</span>
            <span className="mx-1 text-slate-400">→</span>
            <span className="font-medium text-[#1F7A7A] dark:text-[#4DB3B0]">{f.observable}</span>
            <span className="ms-2 text-[10px] uppercase tracking-wide text-slate-400">
              {f.kind === "diagnosis" ? (ar ? "تشخيص" : "diagnosis") : ar ? "حكم" : "judgement"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Reveals text progressively; shows it at once with reduced motion. */
function Typewriter({ text }: { text: string }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setShown(text.length));
      return () => cancelAnimationFrame(id);
    }
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= text.length) {
          clearInterval(id);
          return n;
        }
        return n + 2;
      });
    }, 18);
    return () => clearInterval(id);
  }, [text]);

  return (
    <>
      <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-100" aria-hidden>
        {text.slice(0, shown)}
        {shown < text.length ? (
          <span className="ms-0.5 inline-block h-4 w-1.5 animate-pulse bg-[#1F7A7A] align-middle" />
        ) : null}
      </p>
      <p className="sr-only" role="status">
        {text}
      </p>
    </>
  );
}
