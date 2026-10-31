// ENTITLEMENT — does this member have access, and to what.
//
// Rewritten 2026-10-31. The old version had four defects, all of which let a paying member
// read as unentitled or vice versa:
//   1. Tier type was none|lite|pro|team — there was no CIRCLE, so a $44 buyer fell through to
//      "any active membership counts as lite". A $44 member got the $17 product.
//   2. It called Whop API v2. v1 is the current surface.
//   3. tierLimits() returned runs: 9999 — contradicting the real agent caps (40/80/80 per
//      5-hour window) and quietly promising unlimited rendering to a $44 buyer.
//   4. The locked label said "buy Lite $9", a price retired twice over.
//
// All product→tier mapping now comes from lib/tiers.ts.
import { AgentTier, FREE_SPEC, Resolution, TIER_SPECS, resolveProduct } from "./tiers";

export type { AgentTier };

export interface Entitlement extends Resolution {
  hasAccess: boolean;
  productId?: string;
  expiresAt?: string;
  mock: boolean;
}

const NO_ACCESS = (reason: string, mock = false): Entitlement => ({
  tier: "free",
  watermark: FREE_SPEC.watermark,
  runs_window: FREE_SPEC.runs_window,
  runs_month: FREE_SPEC.runs_month,
  seats: 1,
  matched: false,
  hasAccess: false,
  mock,
  reason,
});

export async function checkEntitlement(whopUserId?: string, whopToken?: string): Promise<Entitlement> {
  if (!process.env.WHOP_API_KEY) {
    return NO_ACCESS("WHOP_API_KEY missing — no access granted. This refuses rather than assuming.", true);
  }
  if (!whopUserId) {
    return NO_ACCESS("No whop_user_id — pass from the Whop embed (?user_id=xxx) or the x-whop-user-token header.", true);
  }
  try {
    // v1 is the current Whop API surface. v2 was retired.
    const res = await fetch(`https://api.whop.com/api/v1/memberships?user_id=${encodeURIComponent(whopUserId)}&status=active`, {
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}`, "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Whop ${res.status}`);
    const data: any = await res.json();
    const memberships: any[] = data.data || data.memberships || [];

    // Highest tier wins, regardless of the order Whop returns them in. A member holding both
    // a Circle and a Team membership must not be read as Circle because it came first.
    const RANK: Record<AgentTier, number> = { free: 0, circle: 1, pro: 2, team: 3 };
    let best: Entitlement | null = null;
    for (const m of memberships) {
      const pid = m.product_id || m.product?.id || m.product || "";
      const r = resolveProduct(pid, process.env);
      if (!r.matched) continue;
      const candidate: Entitlement = { ...r, hasAccess: true, productId: pid, expiresAt: m.expires_at, mock: false };
      if (!best || RANK[candidate.tier] > RANK[best.tier]) best = candidate;
    }
    if (best) return best;

    return {
      ...NO_ACCESS(`no active membership for ${whopUserId} — ${memberships.length} active found, none matching a configured product`),
      mock: false,
    };
  } catch (e: any) {
    // A failed check is a deny, never an allow, and it says so rather than looking like free.
    return NO_ACCESS(`Whop check failed: ${e?.message?.slice(0, 120)} — denied`, true);
  }
}

/**
 * The limits the agent actually enforces.
 *
 * These are READ from lib/tiers.ts, not restated. The first draft of this rewrite hardcoded
 * 40/80/1200 here — which is the same drift this whole file exists to remove, just moved one
 * function down. If you find yourself typing a price or a cap outside lib/tiers.ts, stop.
 */
export function tierLimits(tier: AgentTier) {
  if (tier === "free") {
    return { runs_window: FREE_SPEC.runs_window, runs_month: FREE_SPEC.runs_month, seats: 1, watermark: true, vault: false, label: "Free · watermark on" };
  }
  const spec = TIER_SPECS[tier];
  return {
    runs_window: spec.runs_window,
    runs_month: spec.runs_month,
    seats: spec.seats,
    watermark: spec.watermark,
    vault: spec.vault,
    label: spec.label,
  };
}
