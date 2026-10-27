import { NextResponse } from "next/server";
import { rewriteFallback } from "@/lib/language-guard";
import { chatCompletion, routeSuggestFallback } from "@/lib/llm/client";

type Body = {
  action: "language_guard" | "route_suggest" | "handoff_summary";
  text?: string;
  locale?: "en" | "ar";
  summary?: string;
  context?: { course?: string; task?: string; when?: string };
};

/**
 * Assistive drafting only — never diagnosis or risk scores.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const locale = body.locale === "ar" ? "ar" : "en";

  try {
    if (body.action === "language_guard") {
      const raw = body.text?.trim() ?? "";
      if (!raw) {
        return NextResponse.json({ error: "Missing text" }, { status: 400 });
      }

      try {
        const rewritten = await chatCompletion([
          {
            role: "system",
            content:
              locale === "ar"
                ? "أنت حارس لغة لسند. أعد صياغة ملاحظات الموظفين إلى وقائع ملاحظة فقط: ماذا لوحظ، متى، وفي أي مهمة. احذف أي تشخيص أو تسمية إعاقة أو حكم على الشخصية. لا تخترع وقائع غير موجودة. أجب بجملة أو جملتين بالعربية دون مقدمات."
                : "You are Sanad Language Guard. Rewrite the staff note into observable facts only: what was seen, when, in which task. Remove any diagnosis, disability name, mental-health term or character judgement (e.g. lazy). Never invent facts that are not in the note. Reply with 1-2 English sentences, no preamble.",
          },
          {
            role: "user",
            content: `Course: ${body.context?.course ?? "-"}\nTask: ${body.context?.task ?? "-"}\nWhen: ${body.context?.when ?? "-"}\nNote: ${raw}`,
          },
        ]);
        return NextResponse.json({ rewritten, source: "llm" });
      } catch {
        return NextResponse.json({
          rewritten: rewriteFallback(raw, body.context ?? {}, locale),
          source: "fallback",
        });
      }
    }

    if (body.action === "route_suggest") {
      const summary = body.summary?.trim() ?? body.text?.trim() ?? "";
      try {
        const raw = await chatCompletion([
          {
            role: "system",
            content:
              'Suggest one route from: learning_center, language_support, academic_advising, sas, counseling, career_wellbeing. Reply JSON: {"route":"...","reason":"..."}. Never diagnose. Prefer least intensive path. Language difficulty ≠ learning disability.',
          },
          { role: "user", content: summary },
        ]);
        const json = raw.replace(/^```(?:json)?\s*|\s*```$/g, "");
        const parsed = JSON.parse(json) as { route?: string; reason?: string };
        if (parsed.route && parsed.reason) {
          return NextResponse.json({ ...parsed, source: "llm" });
        }
      } catch {
        /* fallback */
      }
      const fb = routeSuggestFallback(summary);
      return NextResponse.json({ ...fb, source: "fallback" });
    }

    if (body.action === "handoff_summary") {
      const summary = body.summary?.trim() ?? "";
      try {
        const text = await chatCompletion([
          {
            role: "system",
            content:
              "Write a minimum-necessary handoff summary for the next support owner. Include only: what was observed, what was already tried, what the student asked for. Exclude names of classmates, grades, health information and any diagnosis or label. Max 3 sentences." +
              (locale === "ar" ? " Reply in Arabic." : ""),
          },
          { role: "user", content: summary },
        ]);
        return NextResponse.json({ summary: text, source: "llm" });
      } catch {
        return NextResponse.json({
          summary:
            locale === "ar"
              ? `طلب الطالب الدعم ووافق على مشاركة هذا الملخص. ما لوحظ: ${summary.slice(0, 220) || "صعوبة في مهام محددة"}. لا يتضمن أي تشخيص؛ الخطوة التالية تُتفق مع الطالب.`
              : `Student requested support and consented to share this summary. Observed: ${summary.slice(0, 220) || "difficulty with specific tasks"}. No diagnosis implied; next step to be agreed with the student.`,
          source: "fallback",
        });
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "LLM failed" },
      { status: 500 },
    );
  }
}
