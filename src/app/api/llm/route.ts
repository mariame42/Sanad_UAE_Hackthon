import { NextResponse } from "next/server";

/**
 * Placeholder LLM API route.
 * Will power assistive drafting only — never diagnosis or risk scores.
 */
export async function POST() {
  return NextResponse.json(
    { error: "LLM endpoint not implemented yet" },
    { status: 501 },
  );
}
