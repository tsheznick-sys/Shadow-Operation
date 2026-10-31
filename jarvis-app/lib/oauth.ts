// OAUTH CUSTODY — we hold keys to someone's channel. That is a debt, and it gets written down.
//
// Decided 2026-10-31 (owner-stated): encrypted at rest, revocable, never logged, and we TELL
// them what we hold. The owner's exact words: "tell them and work with the global operation
// laws to govern ourselves on this." So the disclosure is not a checkbox buried in terms —
// it is a panel the member can open at any time, and it is the same law we apply to ourselves.
//
// The operation's own laws that this must satisfy (all existing, none weakened):
//   · 2FA on /money and /admin
//   · the owner-only global pause
//   · every ledger records what happened, and the team ledger records policy events
//   · no credential is ever stored in chat, a log, or a public repo
//   · revenue is never published on a member's behalf without opt-in

export type Grant = {
  member_id: string;
  platform: "youtube" | "tiktok" | "instagram" | "facebook";
  scopes: string[];
  granted_at: string;
  last_used_at?: string;
  revoked_at?: string;
  cipher: "aes-256-gcm";
};

/** Scopes we will ask for, and the ones we refuse to ask for even when the API offers them. */
export const SCOPES = {
  ask: ["upload", "read_own_analytics"],
  never_ask: [
    "read_subscriptions",       // never — we do not need to know who their viewers are
    "manage_comments",          // we do not speak as them
    "delete_content",           // we do not hold a delete key to anyone's channel
    "financial",                // never, at any tier
  ],
  rule: "we ask for the narrowest scope that publishes a video. Anything beyond that is a liability we did not need",
};

export const CUSTODY_LAW = [
  "Encrypted at rest with AES-256-GCM. The key lives in the environment, never in the database.",
  "Never logged. A token that appears in a log is treated as a breach, not a bug.",
  "The member can see exactly which platforms we hold, what scopes, and when each was last used.",
  "Revoked within one hour of churn, and instantly on request — no retention, no export, no argument.",
  "Deleted on request within 24 hours, with a confirmation the member keeps.",
  "Any scope we do not need is never requested, even when the platform offers it.",
  "Read access to a member's analytics is a separate grant from publish access, and either can be revoked alone.",
];

export function canPublish(g: Grant | null): { ok: boolean; reason: string } {
  if (!g) return { ok: false, reason: "no grant — the member has not connected this platform" };
  if (g.revoked_at) return { ok: false, reason: "grant revoked — churn or member request" };
  if (!g.scopes.includes("upload")) return { ok: false, reason: "grant exists but has no upload scope" };
  return { ok: true, reason: "grant active and scoped" };
}

/** What the member is shown. Plain language, no legal fog, and no hiding behind a policy link. */
export function whatWeHold(grants: Grant[]) {
  return grants.map((g) => ({
    platform: g.platform,
    scopes: g.scopes,
    last_used: g.last_used_at ?? "never",
    status: g.revoked_at ? "revoked" : "active",
    plain: g.revoked_at
      ? `We no longer hold any key to your ${g.platform}.`
      : `We can publish to your ${g.platform} and read its analytics. Nothing else, and you can revoke this at any time.`,
  }));
}

/** The audit the team runs. If this returns anything, it is an incident, not a chore. */
export function custodyAudit(grants: Grant[], thirtyDaysAgo: string) {
  const stale = grants.filter((g) => !g.revoked_at && (!g.last_used_at || g.last_used_at < thirtyDaysAgo));
  const overScoped = grants.filter((g) => g.scopes.some((s) => (SCOPES.never_ask as string[]).includes(s)));
  const unencrypted = grants.filter((g) => g.cipher !== "aes-256-gcm");
  return {
    clean: stale.length === 0 && overScoped.length === 0 && unencrypted.length === 0,
    stale: stale.map((g) => `${g.member_id} / ${g.platform}`),
    over_scoped: overScoped.map((g) => `${g.member_id} / ${g.platform} / ${g.scopes.join(",")}`),
    unencrypted: unencrypted.map((g) => `${g.member_id} / ${g.platform}`),
    action: "revoke anything unused for 30 days, strip any scope we never needed, re-encrypt anything that slipped",
  };
}

export const DISCLOSURE = {
  headline: "We hold a key to your channel. Here is exactly what it can and cannot do.",
  body:
    "To publish for you, we need permission to upload to your channel. We ask for upload and our own analytics — nothing else. " +
    "We never read your subscribers, we never manage your comments, and we cannot delete anything. " +
    "The key is encrypted, it never appears in a log, and you can revoke it at any time with one click. " +
    "If you cancel, it is revoked within the hour.",
  show_at: ["first connect", "every 30 days while active", "on any scope change", "on revocation"],
  cannot: ["read your subscriber list", "post as you in comments", "delete any of your content", "access payment data"],
} as const;
