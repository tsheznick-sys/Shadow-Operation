import { NextResponse } from "next/server";
import { askJarvis } from "@/lib/jarvis";
import { bearered } from "@/lib/cron-auth";

/**
 * THE MACHINE DOOR TO THE BRAIN — this is the missing link in "n8n Cloud automation + Claude brain".
 *
 * n8n cannot hold a session cookie, so every /api route except /api/auth, /api/whop/webhook and
 * /api/cron answered it 401. The automation half of the architecture had no way to reach the
 * thinking half: WF2 could not ask for a script, WF3 could not ask for a reframe. The blueprint
 * said "Claude 3.5 Sonnet primary + Grok-2 secondary" inside an n8n node, which would have put a
 * second copy of the prompt and a second copy of the model id outside this repo — the exact drift
 * that produced the tier bug.
 *
 * So n8n calls THIS, with a token, and gets one prompt, one model policy, one audit trail.
 *
 *   POST /api/brain
 *   Authorization: Bearer $N8N_BRAIN_TOKEN   (falls back to CRON_SECRET if the former is unset)
 *   { "prompt": "...", "history": [...], "expect": "script" | "rank" | "reframe" | "chat" }
 *
 * 503 when no model answered. n8n must treat that as a failure, not as content — a workflow that
 * quietly publishes the word "brain unavailable" is worse than one that stops.
 */
export async function POST(req: Request) {
  const tokenName = (process.env.N8N_BRAIN_TOKEN || "").trim() ? "N8N_BRAIN_TOKEN" : "CRON_SECRET";
  const gate = bearered(req, tokenName);
  if (!gate.ok) return gate.response!;

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) return NextResponse.json({ ok: false, error: "prompt_required" }, { status: 400 });
  if (prompt.length > 8000) return NextResponse.json({ ok: false, error: "prompt_too_long" }, { status: 413 });

  const expect = typeof body?.expect === "string" ? body.expect : "chat";
  const history = Array.isArray(body?.history) ? body.history : [];

  const started = Date.now();
  const reply = await askJarvis(prompt, history);

  if (!reply.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "brain_unavailable",
        detail: reply.error,
        // A workflow node must be able to branch on this without parsing prose.
        retryable: true,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    expect,
    data: reply.text,
    provider: reply.provider,
    model: reply.model ?? null,
    mock: reply.mock,
    ms: reply.ms ?? Date.now() - started,
    // Never let a mock reach a publishing node.
    publishable: reply.mock === false,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    door: "/api/brain",
    auth: "Authorization: Bearer $N8N_BRAIN_TOKEN (or $CRON_SECRET)",
    warns: "503 means no model answered — do not publish the body as content",
  });
}
