import { NextResponse } from "next/server";
import {
  chatCompletion,
  languageGuardFallback,
  routeSuggestFallback,
} from "@/lib/llm/client";

type Body = {
  action: "language_guard" | "route_suggest" | "handoff_summary";
  text?: string;
  locale?: "en" | "ar";
  summary?: string;
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
                ? "أنت حارس لغة لسند. أعد صياغة ملاحظات الموظفين إلى وقائع ملاحظة فقط. لا تشخيص، لا إعاقة، لا درجات خطر. أجب بجملة أو جملتين بالعربية."
                : "You are Sanad Language Guard. Rewrite staff notes into observable facts only. Never diagnose, never name a disability, never invent a risk score. Reply in 1-2 English sentences.",
          },
          { role: "user", content: raw },
        ]);
        return NextResponse.json({ rewritten, source: "llm" });
      } catch {
        return NextResponse.json({
          rewritten: languageGuardFallback(raw, locale),
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
        const parsed = JSON.parse(raw) as { route?: string; reason?: string };
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
              "Write a minimal handoff summary for the next support owner. Observable facts only. No diagnosis. Max 3 sentences.",
          },
          { role: "user", content: summary },
        ]);
        return NextResponse.json({ summary: text, source: "llm" });
      } catch {
        return NextResponse.json({
          summary:
            summary.slice(0, 280) ||
            "Student requested support. Please review with consent and confirm next step.",
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
