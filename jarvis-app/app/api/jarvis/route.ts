import { NextResponse } from "next/server";
import { askJarvis } from "@/lib/jarvis";

/**
 * The member-facing chat. Before 2026-10-31 this route had no body validation and no failure
 * status: a missing key, a retired model and a network fault all produced HTTP 200 with a
 * canned paragraph in the `text` field, which the chat page rendered as Jarvis's answer.
 *
 * Now the status is the truth: 200 with real text, 503 when no model answered. The page maps
 * 503 to a visible "brain offline" message instead of inventing a reply.
 */
export async function POST(req: Request) {
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) return NextResponse.json({ ok: false, error: "prompt_required" }, { status: 400 });
  if (prompt.length > 8000) return NextResponse.json({ ok: false, error: "prompt_too_long" }, { status: 413 });

  const history = Array.isArray(body?.history) ? body.history : [];
  const reply = await askJarvis(prompt, history);

  if (!reply.ok) {
    return NextResponse.json(
      { ok: false, error: "brain_unavailable", detail: reply.error, text: reply.text },
      { status: 503 },
    );
  }
  return NextResponse.json({
    ok: true,
    text: reply.text,
    mock: reply.mock,
    provider: reply.provider,
    model: reply.model ?? null,
    ms: reply.ms ?? null,
  });
}
