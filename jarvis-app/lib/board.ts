// BOARD — three partners, and the short list of things one of them may not decide alone.
//
// Why this exists: the operation has one owner and two partners, and the failure mode of a
// one-owner operation is not laziness — it is a fast, confident decision made by the only
// person in the room. Catch those at the door, before they cost a quarter.
//
// The division of authority:
//   Content Guy  — proposes the niche, the angle, the hook. Reads the audience.
//   Jarvis       — brings the evidence: the daily scan, the ratios, the policy check.
//   Owner        — holds the key: money, price, pause, any override.
// No one of them is sufficient. That is the design, not an obstacle.

export type MotionKind =
  | "launch_page" | "kill_page" | "price_change" | "spend"
  | "niche_choice" | "policy_override" | "cadence" | "angle" | "other";

export type Vote = { partner: string; vote: "yes" | "no" | "abstain"; at?: string };

export type Motion = { kind: MotionKind; motion: string; evidence?: string[]; votes?: Vote[] };

export const PARTNERS = ["Owner", "Content Guy", "Jarvis"] as const;
export const QUORUM = 3;

/** Money, market and policy. One person does not get to move these alone. */
const UNANIMOUS: MotionKind[] = ["launch_page", "kill_page", "price_change", "spend", "niche_choice", "policy_override"];

export function rule(kind: MotionKind): { need: number; why: string } {
  if (UNANIMOUS.includes(kind)) {
    return { need: QUORUM, why: "costs money, moves the market, or touches policy — all three partners" };
  }
  return { need: 2, why: "reversible and cheap — two partners, and the third is told" };
}

/**
 * Tally. A "no" on a unanimous motion is final; an abstain is not a yes.
 * Silence is never consent — an absent vote counts as absent, not as agreement.
 */
export function resolve(m: Motion): { status: "open" | "passed" | "rejected" | "blocked"; tally: { yes: number; no: number; abstain: number; missing: string[] }; need: number; why: string } {
  const { need, why } = rule(m.kind);
  const votes = m.votes ?? [];
  const yes = votes.filter((v) => v.vote === "yes").length;
  const no = votes.filter((v) => v.vote === "no").length;
  const abstain = votes.filter((v) => v.vote === "abstain").length;
  const voted = new Set(votes.map((v) => v.partner));
  const missing = PARTNERS.filter((p) => !voted.has(p));
  const tally = { yes, no, abstain, missing };
  if (no > 0 && UNANIMOUS.includes(m.kind)) return { status: "blocked", tally, need, why };
  if (missing.length > 0) return { status: "open", tally, need, why };
  if (yes >= need) return { status: "passed", tally, need, why };
  return { status: "rejected", tally, need, why };
}

/** What Jarvis must bring to the table before a niche motion is even votable. */
export function nicheEvidence(input: {
  scans: number; days_observed: number; er_pct: number; buyer_pool: number;
  policy_clear: boolean; cost_per_asset: number; distinct_from_live: boolean;
}): { ready: boolean; missing: string[] } {
  const missing: string[] = [];
  if (input.scans < 7) missing.push(`7 daily scans (has ${input.scans})`);
  if (input.days_observed < 14) missing.push(`14 days of observation (has ${input.days_observed})`);
  if (input.er_pct < 5) missing.push(`ER >= 5% (has ${input.er_pct}%)`);
  if (input.buyer_pool < 3000) missing.push(`buyer pool x3 >= 3,000 (has ${input.buyer_pool})`);
  if (!input.policy_clear) missing.push("policy clear — the niche is not in a removal bucket");
  if (input.cost_per_asset > 3) missing.push(`cost per asset <= $3 (has $${input.cost_per_asset})`);
  if (!input.distinct_from_live) missing.push("distinct from every live page (lib/pages.ts distinctness)");
  return { ready: missing.length === 0, missing };
}

/** The standing agenda. Same three questions every time, so nobody avoids one. */
export const AGENDA = [
  "Numbers: what did the scan say, what did the ratios say, what did churn say.",
  "The next niche: proposal from the Content Guy, evidence from Jarvis, distinctness from lib/pages.ts.",
  "What we are killing: a page, a tool, an idea. Something is always on the block.",
  "What we are not doing, and why — recorded, so it is not re-argued in three weeks.",
];

export const RULE_NOTE =
  "A motion is not carried by enthusiasm. launch_page, kill_page, price_change, spend, niche_choice and policy_override need all three partners; an abstain is not a yes; silence is not consent.";
