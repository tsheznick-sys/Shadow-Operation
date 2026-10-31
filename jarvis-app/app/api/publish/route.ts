import { NextResponse } from "next/server";
import { bearered } from "@/lib/cron-auth";
import {
  ALL_SURFACES, canAutoPublish, canScheduleToBuffer, channelsFromEnv, describeChannels, fitsBudget, listChannels, proposeMapping,
  publish, validate, buildCreatePost, type PublishInput, type Surface,
} from "@/lib/publish";
import type { AgentTier } from "@/lib/tiers";

/**
 * THE PUBLISH DOOR.
 *
 * n8n WF5 used to POST directly to Buffer with a token in its Variables. That put four things
 * outside this repo: the token, the channel ids, the platform limits and the error handling.
 * Every one of those is a second source of truth, and this project has already paid for that
 * mistake three times.
 *
 *   GET  /api/publish            → which surfaces are configured, and what is missing
 *   POST /api/publish?dry=1      → validate and build, send nothing
 *   POST /api/publish            → publish one post to one surface
 *
 * Auth: Bearer $N8N_BRAIN_TOKEN (or $CRON_SECRET), same rule as /api/brain.
 *
 * One call, one surface — that is Buffer's API shape, not a design choice. Five surfaces are five
 * calls, and each one reports its own outcome.
 */
export async function GET(req: Request) {
  const tokenName = (process.env.N8N_BRAIN_TOKEN || "").trim() ? "N8N_BRAIN_TOKEN" : "CRON_SECRET";
  const gate = bearered(req, tokenName);
  if (!gate.ok) return gate.response!;

  const env = process.env;
  const configured = (env.BUFFER_API_KEY || env.BUFFER_TOKEN || "").trim();

  return NextResponse.json({
    ok: true,
    buffer_key: configured ? "set" : "missing",
    surfaces: describeChannels(env),
    retired: ["x", "twitter"],
    limits: { per_15m: 100, per_day_floor: 250 },
    budget: fitsBudget(75, "day"),
    next: configured
      ? "POST /api/publish?dry=1 with {surface, text, videoUrl} to see the exact GraphQL body"
      : "Add BUFFER_API_KEY (Buffer → Settings → API access → Generate token), then set the five channel ids",
    discover: "POST /api/publish?discover=1 with the key set, to list channels and get a proposed mapping",
  });
}

export async function POST(req: Request) {
  const tokenName = (process.env.N8N_BRAIN_TOKEN || "").trim() ? "N8N_BRAIN_TOKEN" : "CRON_SECRET";
  const gate = bearered(req, tokenName);
  if (!gate.ok) return gate.response!;

  const url = new URL(req.url);
  const dry = url.searchParams.get("dry") === "1";
  const discover = url.searchParams.get("discover") === "1";

  if (discover) {
    const r = await listChannels();
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 502 });
    const mapping = proposeMapping(r.channels);
    return NextResponse.json({
      ok: true,
      organization: r.organizationId,
      channels: r.channels,
      proposed: mapping.proposed,
      unmatched: mapping.unmatched,
      ambiguous: mapping.ambiguous,
      env: Object.fromEntries(Object.entries(mapping.proposed).map(([k, v]) => [`BUFFER_CHANNEL_${k.toUpperCase()}`, v])),
      warn: "A channel id is never guessed. Copy the ones you recognise into Vercel env, surface by surface.",
    });
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const surface = typeof body?.surface === "string" ? (body.surface as Surface) : null;
  if (!surface || !ALL_SURFACES.includes(surface)) {
    return NextResponse.json(
      { ok: false, error: "unknown_surface", allowed: ALL_SURFACES, note: "X is retired and will never be accepted" },
      { status: 400 },
    );
  }

  // The channel is resolved HERE from env, not passed in by n8n. Channel ids live in one place
  // (Vercel env) — a workflow carrying five ids is five more things that can drift.
  const fromEnv = channelsFromEnv(process.env).channels[surface] ?? "";

  const input: PublishInput = {
    surface,
    channelId: String(body?.channelId || fromEnv),
    text: String(body?.text || ""),
    videoUrl: body?.videoUrl ? String(body.videoUrl) : undefined,
    imageUrl: body?.imageUrl ? String(body.imageUrl) : undefined,
    title: body?.title ? String(body.title) : undefined,
    dueAt: body?.dueAt ? String(body.dueAt) : undefined,
  };

  // The tier gate. Two privileges: scheduled (Circle and up) and direct (Pro and up).
  // The scheduler posts on the member's behalf, so it checks the first, not the second.
  const tier = (typeof body?.tier === "string" ? body.tier : "free") as AgentTier;
  const path = body?.path === "direct" ? "direct" : "scheduled";
  const allowed = path === "direct" ? canAutoPublish(tier) : canScheduleToBuffer(tier);
  if (body?.requireTier !== false && !allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: path === "direct" ? "tier_cannot_publish_directly" : "tier_cannot_schedule",
        tier,
        path,
        remedy:
          path === "direct"
            ? "Direct publish to your own connected accounts is Pro and Team. Circle is scheduled through our publisher instead."
            : "Free receives the finished asset to post. Circle and above are scheduled automatically.",
      },
      { status: 403 },
    );
  }

  const problems = validate(input);
  if (problems.length) return NextResponse.json({ ok: false, error: "invalid_post", problems }, { status: 422 });

  const { built } = buildCreatePost(input);
  const adjustments = built?.adjustments ?? [];

  if (dry) {
    return NextResponse.json({
      ok: true,
      dry: true,
      surface,
      would_send: built?.variables,
      adjustments,
      note: "Nothing was sent. Buffer returns HTTP 200 for a failed mutation too — a real call's result is in `code`.",
    });
  }

  const result = await publish(input);
  if (result.status === "error") {
    const status = result.code === "rate_limited" ? 429 : result.code === "not_configured" ? 503 : 502;
    return NextResponse.json(
      { ok: false, error: result.code, detail: result.message, retryable: result.retryable, surface },
      { status },
    );
  }
  return NextResponse.json({ ok: true, surface, post: result.post, adjustments });
}
