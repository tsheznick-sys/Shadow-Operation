// TIERS — the ONE place a price and a product id are allowed to be defined.
//
// WHY THIS FILE EXISTS (2026-10-31, found while fixing the Whop wiring):
//   Three files each had their own idea of what a tier was, and all three disagreed:
//
//   lib/webhook.ts        read WHOP_PRODUCT_CIRCLE_ID ... which .env.example never declared
//   lib/entitlement.ts    mapped lite/pro/team ... there is no Circle, so a $44 buyer fell
//                         through to a "any active membership counts as lite" fallback
//   api/whop/upgrade      built env names dynamically, so WHOP_PRODUCT_GOOD_ID and
//                         WHOP_PRODUCT_BETTER_ID were looked up and never existed
//
//   Net effect: a member could pay $44 for Circle and be recorded as FREE. That is the worst
//   class of bug in this operation — money in, nothing out, and no error anywhere.
//
//   The fix is structural, not a patch: one registry, every consumer reads it, and a test
//   fails if any file reads a WHOP_PRODUCT_* env var that .env.example does not declare.

/** The three products the owner sells for the Stickman Agent. $44 / $53 / $62. */
export type AgentTier = "free" | "circle" | "pro" | "team";
export type PaidTier = "circle" | "pro" | "team";

/** Env var per product. Adding a tier without adding it here is a compile error. */
export const PRODUCT_ENV: Record<PaidTier, string> = {
  circle: "WHOP_PRODUCT_CIRCLE_ID",
  pro: "WHOP_PRODUCT_PRO_ID",
  team: "WHOP_PRODUCT_TEAM_ID",
};

export type TierSpec = {
  tier: PaidTier;
  price: number;
  seats: number;
  /** runs inside one 5-hour window, per seat */
  runs_window: number;
  /** hard monthly ceiling, per seat — the window paces, the month keeps us solvent */
  runs_month: number;
  watermark: boolean;
  vault: boolean;
  pods: boolean;
  polish: boolean;
  direct_publish: boolean;
  label: string;
};

/**
 * The three. Prices here are canonical; every other file must agree with this table or a test
 * fails. Numerology: 44, 53 and 62 all reduce to 8 (4+4, 5+3, 6+2).
 */
export const TIER_SPECS: Record<PaidTier, TierSpec> = {
  circle: {
    tier: "circle", price: 44, seats: 1,
    runs_window: 40, runs_month: 600,
    watermark: false, vault: true, pods: true, polish: false, direct_publish: false,
    label: "Circle $44",
  },
  pro: {
    tier: "pro", price: 53, seats: 1,
    runs_window: 80, runs_month: 1200,
    watermark: false, vault: true, pods: true, polish: true, direct_publish: true,
    label: "Pro $53",
  },
  team: {
    tier: "team", price: 62, seats: 3,
    runs_window: 80, runs_month: 1200,
    watermark: false, vault: true, pods: true, polish: true, direct_publish: true,
    label: "Team $62",
  },
};

export const FREE_SPEC = {
  runs_window: 20, runs_month: 300, watermark: true, vault: false, pods: false, polish: false, direct_publish: false,
} as const;

/**
 * The one-time ladder is NOT the agent subscription. It is a separate set of products, and
 * conflating the two is what produced the mess above.
 *
 * What each grants is stated explicitly so nothing has to be inferred from an env var name:
 *   First Shot $28  14 days of everything, no auto-charge. Grants circle-level access for 14 days.
 *   Lite $17        the downgrade save. Free-level runs (20/5h) but NO watermark and no vault —
 *                   "free without the branding tax". A save that takes away publishing would not
 *                   save anyone.
 *   GOOD $35        a one-time build. No recurring agent access.
 *   BETTER $89      a one-time build. No recurring agent access.
 */
export const LADDER: Record<string, { price: number; recurring: boolean; agent_tier: AgentTier | null; watermark: boolean; note: string }> = {
  first_shot: { price: 28, recurring: false, agent_tier: "circle", watermark: false, note: "14 days all-access, then it lapses on its own — no card kept" },
  lite:       { price: 17, recurring: true,  agent_tier: "free",   watermark: false, note: "free-level runs without the watermark — this is the downgrade save, so it must still feel paid" },
  good:       { price: 35, recurring: false, agent_tier: null,     watermark: false, note: "one-time build — no recurring agent access" },
  better:     { price: 89, recurring: false, agent_tier: null,     watermark: false, note: "one-time build — no recurring agent access" },
};

export type Resolution = {
  tier: AgentTier;
  /** what the member actually gets — resolved, never inferred downstream */
  watermark: boolean;
  runs_window: number;
  runs_month: number;
  seats: number;
  matched: boolean;
  reason: string;
};

export const FREE_RESOLUTION: Resolution = {
  tier: "free",
  watermark: true,
  runs_window: FREE_SPEC.runs_window,
  runs_month: FREE_SPEC.runs_month,
  seats: 1,
  matched: false,
  reason: "no recognised product — free tier, watermark on",
};

/** Paid product id -> spec. Returns null when the id matches nothing we sell. */
export function specForProduct(productId: string | undefined, env: NodeJS.ProcessEnv = process.env): TierSpec | null {
  if (!productId) return null;
  for (const tier of Object.keys(TIER_SPECS) as PaidTier[]) {
    const configured = env[PRODUCT_ENV[tier]];
    // An unset env var must never match an empty productId — that is how everyone becomes free.
    if (configured && configured === productId) return TIER_SPECS[tier];
  }
  return null;
}

/**
 * The single resolver. Webhook, entitlement and the upgrade route all go through this, so a
 * member reads the same way in all three places or none of them.
 */
export function resolveProduct(productId: string | undefined, env: NodeJS.ProcessEnv = process.env): Resolution {
  const spec = specForProduct(productId, env);
  if (!spec) return { ...FREE_RESOLUTION };
  return {
    tier: spec.tier,
    watermark: spec.watermark,
    runs_window: spec.runs_window,
    runs_month: spec.runs_month,
    seats: spec.seats,
    matched: true,
    reason: `active ${spec.label} (${spec.seats} seat${spec.seats === 1 ? "" : "s"})`,
  };
}

/** Env names this module requires. Used by the declared-env test. */
export function requiredProductEnv(): string[] {
  return Object.values(PRODUCT_ENV);
}

/** Sanity: no two tiers may share a price, and every price must reduce to 8. */
export function auditTiers() {
  const prices = Object.values(TIER_SPECS).map((t) => t.price);
  const dupes = prices.filter((p, i) => prices.indexOf(p) !== i);
  const digitalRoot = (n: number) => (n % 9 === 0 ? 9 : n % 9);
  const offPattern = prices.filter((p) => digitalRoot(p) !== 8);
  return { clean: dupes.length === 0 && offPattern.length === 0, dupes, offPattern, prices };
}
