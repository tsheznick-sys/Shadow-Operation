// THE RUN — the only place in this system that spends money to make something.
//
// Why this file exists (2026-10-31, third pass):
//
//   Everything around it was built and tested: entitlement, quotas, watermark, the gate, the
//   render adapter, the publisher, the calendar. And `lib/render-paid.ts` — 117 lines, tested
//   against a stub — **had zero importers**. There was no route that charged a member a run and
//   returned a file. The decision layer could say "allowed" and nothing could act on it.
//
//   This closes it. The order below is not stylistic; each step exists because doing it in the
//   other order has a specific cost:
//
//     1. entitlement  — is this person paying at all (a failed check denies, never allows)
//     2. reserve      — take the run BEFORE spending. Two concurrent requests that both read
//                       "41 remaining" both spend it. A reservation is how you avoid paying twice.
//     3. gate         — the script must pass rules + policy + disclosure BEFORE the renderer is
//                       paid. Rendering then refusing wastes the render.
//     4. render       — lib/render-paid.ts, which returns a typed result, never a thrown string
//     5. settle       — success: keep the reservation and record the cost. failure: refund it,
//                       because a member should not pay for our outage.
//     6. record       — agent_runs gets tier, cost, status and the URL. Without this row the
//                       quota is a number with no evidence behind it.

import { quotaCheck, WATERMARK_LABEL, type Tier, type Quota } from "./stickman-agent";
import { preflight } from "./render";

export const RUN_KIND = "render" as const;

export type ReserveResult = {
  allowed: boolean;
  reason: string | null;
  /** the counters to persist if allowed; unchanged if not */
  next: Quota;
  /** true when the window had expired and the counters were reset as part of reserving */
  window_reset: boolean;
};

/**
 * Take one run. Pure, so the arithmetic is provable without a database.
 *
 * A window that has expired resets the counter rather than refusing — otherwise a member who
 * has not used the agent for six hours is told they are out of runs until the month rolls over.
 */
export function reserve(tier: Tier, q: Quota, now: Date = new Date()): ReserveResult {
  const check = quotaCheck(tier, q, now);
  if (!check.allowed) return { allowed: false, reason: check.reason, next: q, window_reset: false };

  const winMs = 5 * 3600_000;
  const elapsed = now.getTime() - new Date(q.window_started).getTime();
  const expired = !Number.isFinite(elapsed) || elapsed >= winMs;

  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const monthChanged = q.month !== month;

  return {
    allowed: true,
    reason: null,
    window_reset: expired || monthChanged,
    next: {
      // A new window starts now and carries 1 used; an unexpired one increments in place.
      window_started: expired ? now.toISOString() : q.window_started,
      used_in_window: expired ? 1 : q.used_in_window + 1,
      used_this_month: monthChanged ? 1 : q.used_this_month + 1,
      month,
    },
  };
}

/** Give the run back. Only on our failure — never on a member's. */
export function refund(q: Quota): Quota {
  return {
    ...q,
    used_in_window: Math.max(0, q.used_in_window - 1),
    used_this_month: Math.max(0, q.used_this_month - 1),
  };
}

export type GateInputs = {
  rules_ok: boolean;
  policy_ok: boolean;
  disclosure_ok: boolean;
  /** When present, the shape checks in lib/render.ts also run before any money moves. */
  script?: string;
  niche?: string;
  format?: "longform" | "short";
  characterLock?: string;
};

/**
 * The pre-render gate. Cheapest possible refusal: every one of these is free to check and
 * expensive to discover after paying a renderer.
 */
export function beforeRender(g: GateInputs): { ok: boolean; reason: string | null } {
  if (!g.rules_ok) return { ok: false, reason: "failed a rule check — the renderer is not paid for an asset that cannot publish" };
  if (!g.policy_ok) return { ok: false, reason: "failed the policy check — this is the bucket that gets channels removed" };
  if (!g.disclosure_ok) return { ok: false, reason: "AI disclosure missing — required on every public surface" };
  // The three flags above are computed by the caller. The shape checks below are the ones the
  // caller cannot assert its way past: a 90-character "script" is a caption, and a longform with
  // no character lock stops being the same page by episode three.
  if (typeof g.script === "string") {
    const pre = preflight(
      { script: g.script, niche: g.niche || "", format: g.format === "longform" ? "longform" : "short", characterLock: g.characterLock, tier: "free" },
      true,
      true,
    );
    if (!pre.ok) return { ok: false, reason: pre.problems.join("; ") };
  }
  return { ok: true, reason: null };
}

/** What the member sees when the run is spent. `label` is the watermark text, not a promise. */
export function renderSpec(tier: Tier) {
  return {
    watermark: tier === "free",
    watermark_label: tier === "free" ? WATERMARK_LABEL : null,
    duration_seconds: 5,
    resolution: tier === "free" ? ("720p" as const) : ("1080p" as const),
  };
}

/** The row agent_runs gets. One shape, so a cost report cannot disagree with itself. */
export function runRecord(input: {
  member_id: string | null;
  tier: Tier;
  status: "ok" | "failed" | "blocked";
  cost: number;
  asset_id: string | null;
  video_url: string | null;
  reason?: string | null;
  ms?: number;
}) {
  return {
    member_id: input.member_id,
    kind: RUN_KIND,
    status: input.status,
    cost: input.status === "ok" ? Number(input.cost.toFixed(4)) : 0,
    asset_id: input.asset_id,
    video_url: input.video_url,
    tier: input.tier,
    detail: {
      reason: input.reason ?? null,
      ms: input.ms ?? null,
      // A failed run that recorded a cost would inflate the spend report with money not spent.
      billed: input.status === "ok",
    },
  };
}

/**
 * Which tier is this caller? From the session or from the entitlement check — never from the
 * request body. A client that says "team" is not evidence.
 */
export function tierFrom(explicit: string | null | undefined): Tier | null {
  const t = (explicit || "").trim().toLowerCase();
  return t === "free" || t === "circle" || t === "pro" || t === "team" ? (t as Tier) : null;
}

/** Parse the quota columns out of an agent_members row without trusting their types. */
export function quotaFromRow(row: any, now: Date = new Date()): Quota {
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return {
    used_in_window: Number(row?.used_in_window) || 0,
    used_this_month: row?.month_key === month ? Number(row?.used_this_month) || 0 : 0,
    window_started: row?.window_started ? new Date(row.window_started).toISOString() : now.toISOString(),
    month: row?.month_key || month,
  };
}
