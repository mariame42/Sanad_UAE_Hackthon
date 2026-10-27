/**
 * LLM client — assistive drafting only.
 * Never used for diagnosis or individual risk scores.
 */

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chatCompletion(messages: LlmMessage[]): Promise<string> {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_API_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.LLM_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("LLM_API_KEY not configured");
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty LLM response");
  return content;
}

export function routeSuggestFallback(summary: string): {
  route: string;
  reason: string;
} {
  const lower = summary.toLowerCase();
  if (lower.includes("language") || lower.includes("second language") || lower.includes("لغة")) {
    return {
      route: "language_support",
      reason:
        "Signals look related to studying in a second language. Language support is a separate path from SAS screening.",
    };
  }
  if (lower.includes("sas") || lower.includes("screen")) {
    return {
      route: "sas",
      reason:
        "Student consented to SAS review after trying support. A qualified human must confirm.",
    };
  }
  return {
    route: "learning_center",
    reason:
      "Least intensive next step: learning strategies and tools before any screening path.",
  };
}
