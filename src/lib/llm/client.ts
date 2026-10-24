/**
 * LLM client stub — wire to your provider via env vars.
 * Used later for concern drafting, triage summaries, and strategy tips.
 * Never used for diagnosis or individual risk scores.
 */

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chatCompletion(_messages: LlmMessage[]): Promise<string> {
  // TODO: call LLM_API_BASE_URL with LLM_API_KEY / LLM_MODEL
  throw new Error("LLM client not configured yet");
}
