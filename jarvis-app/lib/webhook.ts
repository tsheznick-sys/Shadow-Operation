// WHOP WEBHOOK — the event that makes a purchase mean something.
//
// Before this file there was no webhook at all. A member could pay $44 and NOTHING happened:
// no tier, no vault, no agent, no pod, no row in agent_members. The whole product sits
// downstream of an event we never received.
import { createHmac, timingSafeEqual } from "crypto";

export type WhopEvent =
  | "membership_created" | "membership_cancelled" | "membership_deactivated"
  | "payment_succeeded" | "payment_failed" | "unknown";

export const HANDLED: WhopEvent[] = [
  "membership_created", "membership_cancelled", "membership_deactivated", "payment_succeeded", "payment_failed",
];

/** Header names vary by provider version; we accept the documented one and one fallback. */
const SIG_HEADERS = ["whop-signature", "x-whop-signature", "whop-hook-signature"];

export function verifySignature(rawBody: string, headers: Headers, secret: string | undefined): { ok: boolean; reason: string } {
  if (!secret) return { ok: false, reason: "WHOP_WEBHOOK_SECRET is not configured — refusing every event rather than trusting unverified money" };
  const provided = SIG_HEADERS.map((h) => headers.get(h)).find((v) => !!v) ?? "";
  if (!provided) return { ok: false, reason: `no signature header (looked for ${SIG_HEADERS.join(", ")})` };
  // Accept both "sha256=hex" and bare hex.
  const given = provided.startsWith("sha256=") ? provided.slice(7) : provided;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  if (given.length !== expected.length) return { ok: false, reason: "signature length mismatch" };
  const ok = timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  return ok ? { ok: true, reason: "verified" } : { ok: false, reason: "signature does not match the body" };
}

/** Map a provider payload to the tier we store. Unknown products mean unknown tier, never a guess. */
export function tierFromProduct(productId: string | undefined, env = process.env): "free" | "circle" | "pro" | "team" {
  if (!productId) return "free";
  if (productId === env.WHOP_PRODUCT_PRO_ID) return "pro";
  if (productId === env.WHOP_PRODUCT_CIRCLE_ID) return "circle";
  if (productId === env.WHOP_PRODUCT_TEAM_ID) return "team";
  return "free";
}

/** What we do with each event. Pure, so it can be tested without a database or a network. */
export function planFor(event: WhopEvent, payload: any): {
  action: "upsert_member" | "revoke_access" | "mark_payment_failed" | "ignore";
  tier?: "free" | "circle" | "pro" | "team";
  revoke_oauth?: boolean;
  reason: string;
} {
  const productId = payload?.data?.product_id ?? payload?.product_id;
  switch (event) {
    case "membership_created":
      return { action: "upsert_member", tier: tierFromProduct(productId), reason: "paid access begins" };
    case "payment_succeeded":
      return { action: "upsert_member", tier: tierFromProduct(productId), reason: "renewal confirmed" };
    case "payment_failed":
      // Deliberately NOT an immediate revoke: a failed card is usually a retry, not a churn.
      return { action: "mark_payment_failed", reason: "dunning — 3 days grace before access changes" };
    case "membership_cancelled":
    case "membership_deactivated":
      // The one-hour revoke law in lib/oauth.ts finally has a caller.
      return { action: "revoke_access", revoke_oauth: true, reason: "cancelled — OAuth revoked, no retention of keys" };
    default:
      return { action: "ignore", reason: "event not handled" };
  }
}
