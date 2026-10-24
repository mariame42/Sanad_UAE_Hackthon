"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMockStore } from "@/lib/mock/MockStoreProvider";
import { useRole } from "@/lib/roles/RoleProvider";

export function ConcernDeskForm() {
  const { t, locale } = useLocale();
  const { personaName } = useRole();
  const { addConcern } = useMockStore();

  const [course, setCourse] = useState("ENG 101");
  const [task, setTask] = useState("Timed Module 3 reading quiz");
  const [when, setWhen] = useState("Weeks 3–5");
  const [note, setNote] = useState("Student seems dyslexic — struggles in class.");
  const [rewritten, setRewritten] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function rewrite() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "language_guard",
          text: note,
          locale,
        }),
      });
      const data = (await res.json()) as { rewritten?: string; error?: string };
      if (!res.ok || !data.rewritten) throw new Error(data.error ?? "Failed");
      setRewritten(data.rewritten);
    } catch {
      setRewritten(
        locale === "ar"
          ? "صعوبة في مهام القراءة المحددة بوقت خلال الأسابيع 3–5؛ مشاركات شفوية قوية."
          : "Difficulty with timed reading tasks, weeks 3–5; strong oral contributions.",
      );
    } finally {
      setLoading(false);
    }
  }

  function save(action: "offer_to_advisor" | "recommend_checkin_class") {
    const finalNote =
      rewritten ||
      (locale === "ar"
        ? "ملاحظة تحتاج إعادة صياغة قبل الإرسال."
        : "Note pending Language Guard rewrite.");
    addConcern({
      facultyName: personaName("en"),
      course,
      task,
      when,
      rawNote: note,
      rewrittenNote: finalNote,
      action,
    });
    setMessage(
      action === "offer_to_advisor" ? t.concern.saved : t.concern.classRec,
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
        {t.concern.title}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {t.concern.subtitle}
      </p>

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
        <Field id="course" label={t.concern.course}>
          <TextInput
            id="course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          />
        </Field>
        <Field id="task" label={t.concern.task}>
          <TextInput
            id="task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            required
          />
        </Field>
        <Field id="when" label={t.concern.when}>
          <TextInput
            id="when"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            required
          />
        </Field>
        <Field id="note" label={t.concern.note} hint={t.concern.noteHint}>
          <TextArea
            id="note"
            aria-describedby="note-hint"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
        </Field>

        <Button type="submit" disabled={loading}>
          {loading ? t.concern.rewriting : t.concern.rewrite}
        </Button>
      </form>

      {rewritten ? (
        <div className="mt-6 rounded-2xl border border-[#1F7A7A]/30 bg-[#E8F4F3] p-5 dark:border-[#4DB3B0]/40 dark:bg-[#1A3D3A]">
          <h2 className="text-sm font-bold text-[#0F3D3E] dark:text-[#E8F0EF]">
            {t.concern.rewritten}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {rewritten}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" onClick={() => save("offer_to_advisor")}>
              {t.concern.offerAdvisor}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => save("recommend_checkin_class")}
            >
              {t.concern.recommendClass}
            </Button>
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="mt-4 text-sm font-medium text-[#1F7A7A]" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
