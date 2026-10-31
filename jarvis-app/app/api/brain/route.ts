import { NextResponse } from "next/server";
import { askJarvis } from "@/lib/jarvis";
import { bearered } from "@/lib/cron-auth";

/**
 * THE MACHINE DOOR TO THE BRAIN — the link between the n8n automation and Claude.
 *
 * n8n cannot hold a session cookie, so every /api route except the crons and the Whop webhook
 * answered it 401. WF2 could not ask for a script; WF3 could not ask for a reframe.
 *
 *   POST /api/brain
 *   Authorization: Bearer $N8N_BRAIN_TOKEN   (falls back to CRON_SECRET if unset)
 *   {
 *     "prompt":  "...",
 *     "expect":  "script" | "rank" | "reframe" | "chat" | "classify" | "deep",
 *     "schema":  { ...JSON Schema... }        // optional — forces structured output
 *   }
 *
 * `expect` picks the lane, and the lane picks the model:
 *   classify/extract/route → claude-haiku-5-5 (cheap)
 *   script/rank/reframe    → claude-sonnet-5-5 (quality)
 *   deep/strategy          → claude-opus-5-5 (opt-in)
 *
 * With `schema`, the provider is asked for JSON via output_config.format, so a workflow receives
 * an object instead of a paragraph it has to scrape. `parsed` is the object; `data` is still the
 * raw text so an older node keeps working.
 *
 * 503 when no model answered. A workflow must treat that as failure, not as content.
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
  const schema = body?.schema && typeof body.schema === "object" ? body.schema : undefined;

  const started = Date.now();
  const reply = await askJarvis(prompt, history, { expect, schema, schemaName: body?.schemaName });

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
    parsed: reply.parsed ?? null,
    provider: reply.provider,
    model: reply.model ?? null,
    lane: reply.lane ?? null,
    effort: reply.effort ?? null,
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
    lanes: {
      cheap: "classify | extract | route",
      quality: "chat | script | rank | reframe",
      deep: "deep | strategy | plan",
    },
    structured: "send `schema` to receive `parsed` as an object",
    catalog: "GET /api/brain/models — what the account can actually call right now",
    warns: "503 means no model answered — do not publish the body as content",
  });
}
