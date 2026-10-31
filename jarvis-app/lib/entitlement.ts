// Entitlement gate — wired into ZIP jarvis_self_3man_bundle.zip
// Checks Whop has_access before unlocking Agent. Falls back to mock if WHOP_API_KEY missing.
// Usage: import { checkEntitlement } from "@/lib/entitlement"; const e = await checkEntitlement(whopUserId)
export type Tier = "none" | "lite" | "pro" | "team";
export interface Entitlement { tier: Tier; hasAccess: boolean; productId?: string; expiresAt?: string; mock: boolean; reason: string }

const PRODUCT_MAP: Record<string, Tier> = {
  // Set these in Vercel env → WHOP_PRODUCT_LITE_ID, WHOP_PRODUCT_PRO_ID, WHOP_PRODUCT_TEAM_ID
  lite: "lite",
  pro: "pro",
  team: "team",
};

export async function checkEntitlement(whopUserId?: string, whopToken?: string): Promise<Entitlement> {
  if (!process.env.WHOP_API_KEY) {
    return { tier: "none", hasAccess: false, mock: true, reason: "WHOP_API_KEY missing — set in Vercel env. Mock: no access." };
  }
  if (!whopUserId) {
    return { tier: "none", hasAccess: false, mock: true, reason: "No whop_user_id — pass from Whop Embed ?user_id=xxx or header x-whop-user-token" };
  }
  try {
    // Whop API: verify membership — https://dev.whop.com/api-reference/list-memberships
    const res = await fetch(`https://api.whop.com/api/v2/memberships?user_id=${encodeURIComponent(whopUserId)}&status=active`, {
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}`, "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Whop ${res.status}`);
    const data: any = await res.json();
    const memberships: any[] = data.data || data.memberships || [];
    // Determine tier by product id match
    for (const m of memberships) {
      const pid = m.product_id || m.product || "";
      const tierEnvLite = process.env.WHOP_PRODUCT_LITE_ID;
      const tierEnvPro = process.env.WHOP_PRODUCT_PRO_ID;
      const tierEnvTeam = process.env.WHOP_PRODUCT_TEAM_ID;
      if (tierEnvPro && pid === tierEnvPro) return { tier: "pro", hasAccess: true, productId: pid, expiresAt: m.expires_at, mock: false, reason: `active pro ${pid}` };
      if (tierEnvTeam && pid === tierEnvTeam) return { tier: "team", hasAccess: true, productId: pid, expiresAt: m.expires_at, mock: false, reason: `active team ${pid}` };
      if (tierEnvLite && pid === tierEnvLite) return { tier: "lite", hasAccess: true, productId: pid, expiresAt: m.expires_at, mock: false, reason: `active lite ${pid}` };
      // fallback: any active whop membership counts as lite if env not set
      if (!tierEnvLite && !tierEnvPro && memberships.length > 0) return { tier: "lite", hasAccess: true, productId: pid, expiresAt: m.expires_at, mock: false, reason: `active fallback ${pid}` };
    }
    return { tier: "none", hasAccess: false, mock: false, reason: `no active membership for ${whopUserId} — ${memberships.length} active found` };
  } catch (e: any) {
    return { tier: "none", hasAccess: false, mock: true, reason: `Whop check failed: ${e?.message?.slice(0,120)} — mock deny` };
  }
}

export function tierLimits(tier: Tier) {
  if (tier === "pro" || tier === "team") return { runs: 9999, domains: 5, clipsPerDay: 6, label: "Pro unlimited" };
  if (tier === "lite") return { runs: 30, domains: 1, clipsPerDay: 3, label: "Lite 30/mo" };
  return { runs: 0, domains: 0, clipsPerDay: 0, label: "Locked — buy Lite $9" };
}
