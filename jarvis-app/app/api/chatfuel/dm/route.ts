import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { bearered } from "@/lib/cron-auth";
import { chatfuelConfig, dmSurfaceFor, sendDm } from "@/lib/chatfuel";

export const dynamic = "force-dynamic";

/**
 * POST /api/chatfuel/dm — one DM into one conversation.
 *
 *   { "surface": "facebook" | "instagram" | "tiktok",
 *     "conversation_id": "<Chatfuel conversation>",
 *     "text": "..." }
 *
 * This is the leg that answers a comment. n8n holds the webhook Chatfuel fires, normalises it, and
 * calls this route; the Chatfuel token stays here and never travels to the workflow.
 *
 * There is deliberately no "broadcast to everyone" mode. A broadcast is a panel action with a
 * different consent story, and an endpoint that can DM an arbitrary audience is the one thing that
 * gets a Meta app restricted.
 */
export async function POST(req: Request) {
  const machine = bearered(req, (process.env.N8N_BRAIN_TOKEN || "").trim() ? "N8N_BRAIN_TOKEN" : "CRON_SECRET").ok;
  const session = getSession();
  if (!machine && !session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const surface = typeof body?.surface === "string" ? body.surface.trim().toLowerCase() : "";
  const conversationId = typeof body?.conversation_id === "string" ? body.conversation_id.trim() : "";
  const text = typeof body?.text === "string" ? body.text : "";

  if (!dmSurfaceFor(surface)) {
    return NextResponse.json(
      { ok: false, error: "unsupported_surface", detail: "Chatfuel sends to facebook, instagram and tiktok only", surface },
      { status: 422 },
    );
  }
  if (!conversationId) {
    return NextResponse.json({ ok: false, error: "conversation_id_required" }, { status: 400 });
  }
  if (!text.trim()) {
    return NextResponse.json({ ok: false, error: "text_required" }, { status: 400 });
  }

  const cfg = chatfuelConfig();
  if (!cfg.ready) {
    // 503, not 200-with-a-warning: a DM that was not sent must not read as sent to the workflow.
    return NextResponse.json({ ok: false, error: "chatfuel_not_configured", missing: cfg.missing }, { status: 503 });
  }

  const result = await sendDm({ surface, conversation_id: conversationId, text });

  if (!result.ok) {
    const status = result.code === "rate_limited" ? 429 : result.code === "auth" ? 502 : 502;
    return NextResponse.json({ ok: false, ...result, error: result.code }, { status });
  }

  return NextResponse.json({ ok: true, id: result.id, status: result.status, surface: result.surface, ms: result.ms });
}

/** Readiness, for the panel and for Step 6c of the runbook. Never returns the token. */
export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ ok: false, error: "unauthorised" }, { status: 401 });
  const cfg = chatfuelConfig();
  return NextResponse.json({
    ok: true,
    ready: cfg.ready,
    missing: cfg.missing,
    endpoint: cfg.endpoint,
    bot_configured: !!cfg.bot_id,
    surfaces: ["facebook", "instagram", "tiktok"],
  });
}
