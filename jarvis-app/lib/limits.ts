// LIMITS + AUDIT — the two things a money route needs and neither had.
//
// Rate limiting: a fixed-window counter per key. Honest about the limitation — on serverless
// each instance keeps its own map, so this stops a burst (the realistic attack: a script
// hammering one endpoint) but is not a global quota. Anything that needs a true global limit
// is counted in Postgres instead, which is why the money routes also write an audit row.
//
// Audit: every privileged action writes one row. The operation already promised two ledgers —
// community and team — and an audit trail is the team ledger's spine. If it is not written down,
// it did not happen, and it cannot be published when it goes wrong.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export const LIMITS = {
  login: { limit: 8, windowMs: 60_000 },        // brute force
  money: { limit: 6, windowMs: 60_000 },        // plan changes, funding authority
  agent: { limit: 30, windowMs: 60_000 },       // agent runs
  webhook: { limit: 300, windowMs: 60_000 },    // provider bursts
  read: { limit: 120, windowMs: 60_000 },       // everything else
} as const;

export type LimitName = keyof typeof LIMITS;

export function rateLimit(key: string, name: LimitName, now = Date.now()): {
  allowed: boolean;
  remaining: number;
  retry_after_s: number;
} {
  const { limit, windowMs } = LIMITS[name];
  const id = `${name}:${key}`;
  const b = buckets.get(id);
  if (!b || now >= b.resetAt) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retry_after_s: 0 };
  }
  if (b.count >= limit) {
    return { allowed: false, remaining: 0, retry_after_s: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { allowed: true, remaining: limit - b.count, retry_after_s: 0 };
}

/** Tests need a clean slate; production never calls this. */
export function resetLimits() {
  buckets.clear();
}

export type AuditEntry = {
  actor: string;
  role: string;
  action: string;
  target?: string;
  result: "ok" | "denied" | "error";
  meta?: Record<string, unknown>;
};

/**
 * Write the row. Never throws: an audit failure must not take down the action it was recording,
 * but it is always reported so it cannot pass silently either.
 */
export async function audit(entry: AuditEntry, sql: any): Promise<{ written: boolean; reason?: string }> {
  if (!sql) return { written: false, reason: "no database — audit row dropped, and that is itself an incident" };
  try {
    // The table predates this work and has four columns: actor, action, detail, created_at.
    // Everything else goes inside detail so the row stays one insert and never drifts from schema.
    await sql`
      INSERT INTO audit_log (actor, action, detail)
      VALUES (${entry.actor}, ${entry.action},
              ${JSON.stringify({ role: entry.role, target: entry.target ?? null, result: entry.result, ...(entry.meta ?? {}) })}::jsonb)
    `;
    return { written: true };
  } catch (e: any) {
    return { written: false, reason: e?.message ?? "insert failed" };
  }
}

/** What must be audited. Anything that moves money, grants access or changes policy. */
export const MUST_AUDIT = [
  "plan_change",
  "funding_authority_change",
  "global_pause",
  "oauth_grant",
  "oauth_revoke",
  "publish_override",
  "member_tier_change",
  "price_change",
] as const;

export type MustAudit = (typeof MUST_AUDIT)[number];

/** A route that touches money must have a limit AND an audit. This is how we check. */
export function moneyRouteReady(src: string): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!/rateLimit\(/.test(src)) missing.push("no rate limit");
  if (!/audit\(/.test(src)) missing.push("no audit row");
  if (!/getSession\(\)/.test(src)) missing.push("no session check");
  if (!/role !== "owner"/.test(src)) missing.push("no owner gate");
  return { ok: missing.length === 0, missing };
}
