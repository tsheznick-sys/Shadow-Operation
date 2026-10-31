import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { bearered } from "@/lib/cron-auth";
import { getSql, MissingDatabaseError } from "@/lib/db";
import { chatfuelConfig, clampDmText, dmSurfaceFor, sendDm, type DmKind } from "@/lib/chatfuel";
import { buildJoinLink, isLinkFailure, joinMessage, strayLinks, type JoinTier } from "@/lib/whop-links";

export const dynamic = "force-dynamic";

/**
 * POST /api/chatfuel/dm — one DM into one conversation, carrying the community link.
 *
 *   { "surface": "facebook" | "instagram" | "tiktok",
 *     "conversation_id": "…",
 *     "kind": "private_reply" | "reply",
 *     "comment_id": "…",            // required for private_reply
 *     "inbound_at": "2026-10-31T…", // when the person commented or messaged
 *     "tier": "free" | "circle" | "pro" | "team",
 *     "page_ref": "psychology",     // which page's post this came from
 *     "community": "The Night Shift", // what the DM calls it
 *     "text": "…" }                 // optional; the link paragraph is built here
 *
 * The COMMENT → DM → WHOP path lives in one place:
 *
 *   1. the link is BUILT from environment ids (lib/whop-links.ts), never typed into a message;
 *   2. any other URL in the text is refused (a compromised workflow must not be able to DM a
 *      phishing link to the audience we spent the build on);
 *   3. the messaging window is checked (one private reply per comment, 7 days; 24h for a reply);
 *   4. the comment is CLAIMED in `dm_handoffs` before the send, so two overlapping webhooks cannot
 *      answer the same comment twice — Meta allows one private reply per comment, and the second
 *      one is a policy breach, not a duplicate;
 *   5. the claim is released if the send fails, so a retry is still possible inside the window.
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
  const kind: DmKind = body?.kind === "reply" ? "reply" : "private_reply";
  const commentId = typeof body?.comment_id === "string" ? body.comment_id.trim() : "";
  const inboundAt = typeof body?.inbound_at === "string" ? body.inbound_at.trim() : "";
  const tier: JoinTier = ["free", "circle", "pro", "team"].includes(body?.tier) ? body.tier : "free";
  const pageRef = typeof body?.page_ref === "string" && body.page_ref.trim() ? body.page_ref.trim() : "unknown_page";
  const community = typeof body?.community === "string" && body.community.trim() ? body.community.trim().slice(0, 60) : "the community";

  if (!dmSurfaceFor(surface)) {
    return NextResponse.json(
      { ok: false, error: "unsupported_surface", detail: "Chatfuel sends to facebook, instagram and tiktok only", surface },
      { status: 422 },
    );
  }
  if (!conversationId) return NextResponse.json({ ok: false, error: "conversation_id_required" }, { status: 400 });
  if (kind === "private_reply" && !commentId) {
    return NextResponse.json({ ok: false, error: "comment_id_required", detail: "one private reply per comment — without the comment id there is no limit to enforce" }, { status: 400 });
  }
  if (!inboundAt) {
    return NextResponse.json({ ok: false, error: "inbound_at_required", detail: "the messaging window cannot be proven without it" }, { status: 400 });
  }

  const cfg = chatfuelConfig();
  if (!cfg.ready) {
    return NextResponse.json({ ok: false, error: "chatfuel_not_configured", missing: cfg.missing }, { status: 503 });
  }

  // ---- 1. the link ------------------------------------------------------------
  const link = buildJoinLink({ tier, page_ref: pageRef, surface });
  if (isLinkFailure(link)) {
    // No link, no DM: a private reply is spent whether or not it carried anywhere.
    return NextResponse.json({ ok: false, error: link.code, detail: link.reason }, { status: 503 });
  }

  // ---- 2. the text ------------------------------------------------------------
  const composed = typeof body?.text === "string" && body.text.trim()
    ? body.text.trim()
    : joinMessage({ link: link.url, community, surface });
  const strays = strayLinks(composed);
  if (strays.length > 0) {
    return NextResponse.json(
      { ok: false, error: "link_not_allowed", detail: `a DM may only carry a whop.com link; refused ${strays[0].slice(0, 120)}` },
      { status: 422 },
    );
  }
  if (!composed.includes(link.url)) {
    return NextResponse.json({ ok: false, error: "link_missing", detail: "the text does not contain the join link" }, { status: 422 });
  }
  const clamped = clampDmText(composed, surface as any);

  // ---- 3. claim the comment ---------------------------------------------------
  let sql: any = null;
  let claimed = false;
  try {
    sql = getSql();
  } catch (e) {
    if (e instanceof MissingDatabaseError) {
      // Without the table the one-per-comment rule cannot be enforced, and an unenforced rule is
      // a restriction waiting to happen. Refuse rather than send blind.
      return NextResponse.json({ ok: false, error: "db_not_configured", detail: e.message }, { status: 503 });
    }
    throw e;
  }

  if (kind === "private_reply") {
    try {
      const rows: any[] = await sql`
        INSERT INTO dm_handoffs (comment_id, surface, conversation_id, page_ref, tier, link, status)
        VALUES (${commentId}, ${surface}, ${conversationId}, ${pageRef}, ${tier}, ${link.url}, 'claimed')
        ON CONFLICT (comment_id) DO NOTHING
        RETURNING id
      `;
      claimed = rows.length > 0;
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: "claim_failed", detail: String(e?.message || e).slice(0, 160) }, { status: 503 });
    }
    if (!claimed) {
      return NextResponse.json(
        { ok: false, error: "already_replied", detail: "this comment already has its one private reply — Meta allows exactly one" },
        { status: 409 },
      );
    }
  }

  const release = async () => {
    if (!claimed) return;
    try {
      await sql`DELETE FROM dm_handoffs WHERE comment_id = ${commentId} AND status = 'claimed'`;
    } catch {
      // The row stays claimed; the operator sees it in GET and can clear it. Better a blocked
      // comment than a second reply Meta would count as a breach.
    }
  };

  // ---- 4. send ----------------------------------------------------------------
  const result = await sendDm({
    surface,
    conversation_id: conversationId,
    text: clamped.text,
    kind,
    comment_id: commentId || undefined,
    inbound_at: inboundAt,
    client_id: kind === "private_reply" ? `cf_${commentId}` : undefined,
  });

  if (!result.ok) {
    await release();
    return NextResponse.json({ ok: false, ...result, error: result.code }, { status: result.code === "rate_limited" ? 429 : 502 });
  }

  // ---- 5. record --------------------------------------------------------------
  if (claimed) {
    try {
      await sql`
        UPDATE dm_handoffs
           SET status = 'sent', message_id = ${result.id}, sent_at = NOW(), truncated = ${clamped.truncated}
         WHERE comment_id = ${commentId}
      `;
    } catch {
      // The DM went out; a failed bookkeeping write must not report the send as failed.
    }
  }

  return NextResponse.json({
    ok: true,
    id: result.id,
    status: result.status,
    surface: result.surface,
    kind,
    link: link.url,
    link_kind: link.kind,
    truncated: clamped.truncated,
    ms: result.ms,
  });
}

/** GET — recent handoffs, so "did the DM leg run" is answerable without opening Chatfuel. */
export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ ok: false, error: "unauthorised" }, { status: 401 });

  const cfg = chatfuelConfig();
  const out: any = { ok: true, ready: cfg.ready, missing: cfg.missing, surfaces: ["facebook", "instagram", "tiktok"], recent: [], exact: false };

  let sql: any = null;
  try {
    sql = getSql();
  } catch {
    return NextResponse.json(out);
  }
  try {
    const rows: any[] = await sql`
      SELECT comment_id, surface, page_ref, tier, status, message_id, sent_at
        FROM dm_handoffs
       ORDER BY created_at DESC
       LIMIT 25
    `;
    out.recent = rows;
    out.exact = true;
  } catch {
    out.reason = "dm_handoffs is not readable (run npm run migrate)";
  }
  return NextResponse.json(out);
}
