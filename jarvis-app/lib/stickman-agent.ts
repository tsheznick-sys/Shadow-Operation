// STICKMAN AGENT — the product inside the community, and the rules that keep it honest.
//
// What the member gets: an agent that takes a niche, scripts it, renders the stickman,
// schedules it to their own pages, and manages the community side. Not a demo, a staff member.
//
// What we refuse to do: hand out an unlimited tap and call it generosity. Every tier has a
// window, a monthly ceiling and a measured cost — because a free tier that costs us money
// per member is not marketing, it is a leak with a login page.
//
// The three structural decisions (2026-10-31, owner-stated):
//   1. FREE carries OUR watermark on every clip they export. Free users distribute our brand;
//      that is the price of free, and it is also the only acquisition channel that costs nothing.
//   2. 20 runs per 5-hour window on free. Generous enough to finish something real, short
//      enough that publishing seriously means paying.
//   3. Nobody publishes freely until they pass rules, policy and disclosure. Machine gate
//      always; G4 human review for the first three publishes, then earned auto-publish.

export type Tier = "free" | "circle" | "pro" | "team";

// MAX WAS DROPPED 2026-10-31. At $71 it sat ABOVE the $62 Team tier, which is the same
// class of error as two tiers priced at $44: a member cannot tell which one is better,
// and the pricing page starts arguing with itself. Three tiers, three different jobs:
//   free   — proves the tool works, distributes our watermark
//   circle — the community, the vault, the agent at 40 runs
//   pro    — the operator: direct publishing, polish, the 2-hour review SLA
// Team ($62) is SEATS, not a bigger agent: three people, one bill. It does not out-rank Pro.

export const WINDOW_HOURS = 5;

/** Runs per 5-hour window. This is the number the member feels. */
export const WINDOW_RUNS: Record<Tier, number> = {
  free: 20,
  circle: 40,
  pro: 80,
  // Team is 3 seats, each with a Pro-shaped window rather than one shared pool —
  // a shared pool means the loudest member spends it by Tuesday.
  team: 80,
};

/**
 * Monthly ceiling. Without this, 20 runs per window is 2,880 runs a month and one power user
 * can spend more than their subscription is worth. Windows are for pacing; the month is for solvency.
 */
export const MONTHLY_RUNS: Record<Tier, number> = {
  free: 300,
  circle: 600,
  pro: 1200,
  team: 1200, // per seat, not per team
};

/**
 * TEAM $62 (owner-stated 2026-10-31): "all on the other tiers, and then the added features
 * for the team version." Team inherits every Pro entitlement for three seats.
 *
 * Flagged honestly, because the arithmetic is uncomfortable: Pro is $53 for one person and
 * Team is $62 for three. A rational buyer never chooses Pro. Guard, recorded not hidden:
 * three real seats claimed within 30 days, or the account reverts to Circle. A team of one
 * is not a team, and a decorative $53 tier is a mess we would have built ourselves.
 */
export const TEAM = {
  seats: 3,
  price: 62,
  inherits: "every Pro entitlement, per seat",
  extra: ["seat management", "shared hook bank", "team ledger view", "one bill, one invoice"],
  claim_window_days: 30,
  degrade_to: "circle",
  guard: "three seats claimed and used within 30 days, or Team reverts — a team of one is not a team",
} as const;

/** Blended cost per run: script generation + free stickman render + storage. No paid polish. */
export const COST_PER_RUN = 0.008;

/** Higgsfield polish is a real cost, so it is a paid action, not a toggle. */
export const POLISH_COST = 0.08;

export const TIER_RULES: Record<Tier, { watermark: boolean; polish: boolean; raw_vault: boolean; pod_priority: boolean; direct_publish: boolean; price: number | null; includes: string }> = {
  free: {
    watermark: true, polish: false, raw_vault: false, pod_priority: false, direct_publish: false, price: 0,
    includes: "20 runs/5h · our content to clip · watermark on every export · downloads, no direct publishing",
  },
  circle: {
    watermark: false, polish: false, raw_vault: true, pod_priority: true, direct_publish: false, price: 44,
    includes: "clean exports, the raw vault, pods, 40 runs/5h, scheduling through our publisher",
  },
  pro: {
    watermark: false, polish: true, raw_vault: true, pod_priority: true, direct_publish: true, price: 53,
    includes: "everything in Circle, polish, 80 runs/5h, DIRECT publishing to their own accounts, 2-hour review SLA until auto-publish is earned",
  },
  team: {
    watermark: false, polish: true, raw_vault: true, pod_priority: true, direct_publish: true, price: 62,
    includes: "everything in Pro for 3 seats, plus seat management, a shared hook bank, the team ledger view and one invoice",
  },
};

/**
 * Publishing path by tier (owner-stated 2026-10-31).
 *   free   — download, post by hand. The watermark travels with it; that is the point.
 *   circle — scheduled through OUR publisher. We never hold a member's platform tokens.
 *   pro    — direct OAuth to their own accounts, with the 2-hour human review SLA until
 *            they have earned auto-publish.
 * The rule behind it: the more access we take on, the more we must be paid to carry it.
 */
export type PublishPath = "manual_download" | "buffer_scheduled" | "oauth_direct";

export function publishPath(tier: Tier, passes = 0): { path: PublishPath; review: string; sla_hours: number | null; why: string } {
  if (tier === "free") {
    return { path: "manual_download", review: "none — they post it themselves", sla_hours: null,
      why: "free keeps the watermark, and the download is the advert" };
  }
  if (tier === "circle") {
    return { path: "buffer_scheduled", review: "machine gate only", sla_hours: null,
      why: "scheduled through our publisher, so we never hold a member's platform tokens" };
  }
  const earned = passes >= 3;
  return {
    path: "oauth_direct",
    review: earned ? "earned auto-publish" : "G4 human review, 2 hours",
    sla_hours: earned ? null : 2,
    why: earned
      ? "three clean publishes — the machine gate is enough now"
      : "the 2-hour SLA exists only where the risk is: first three publishes",
  };
}

/**
 * The shortcut the owner approved: supporters may skip the $28 -> $17 funnel entirely and
 * join the community directly at $44. It is a door, not a discount — the price is identical,
 * only the path is shorter. Recorded, because "we skipped the funnel" must never become
 * "we discounted the price" by the time it reaches a spreadsheet.
 */
/**
 * WHEN FREE OPENS (decided 2026-10-31, owner delegated the choice).
 *
 * Not day one, and not a waitlist that never moves. Waves of 25, and the first wave is the
 * people who already finished the 14-day challenge: they have intent, they cost nothing to
 * acquire, and they are the least likely to submit something that earns us a strike.
 *
 * Each wave is measured before the next opens — support load, blocked-asset rate, watermark
 * click-through. If a wave produces more blocks than clips, the next wave does not open.
 */
export const FREE_WAVES = {
  size: 25,
  wave_1: "challenge finishers only — proven intent, zero acquisition cost",
  gate_to_next: "previous wave: <= 10% blocked assets, support load sustainable, watermark CTR measured",
  stop_rule: "more blocked assets than published clips in a wave means the free tier is teaching the wrong behaviour",
  never: "open every free seat at once to advertise a community whose first page has not proven itself",
} as const;

export const FUNNEL_SHORTCUT = {
  allowed: true,
  path: "direct_community",
  from: ["cold_audience", "referral", "existing_supporter"],
  price: 44,
  discount: 0,
  why: "a supporter who already trusts us should not be walked through a funnel that exists to build trust",
  still_applies: ["free tier exists", "the $28 First Shot remains for cold traffic", "no percentage discount at any path"],
} as const;

/**
 * Watermark policy. Free exports carry it; paid exports do not.
 *
 * It is not a nuisance — it is the acquisition engine. Every free clip that gets posted is a
 * branded sample on someone else's channel, paid for by their labour rather than our ad budget.
 */
export function watermarkFor(tier: Tier) {
  if (!TIER_RULES[tier].watermark) return { apply: false as const, label: null };
  return {
    apply: true as const,
    label: "STICKMAN",
    position: "bottom-right, 40% opacity, static",
    // never on the face — the drawing is the product
    never_covers: "the character or the caption",
    rationale: "free users distribute our brand at their cost, not ours",
  };
}

/** The gate. Nobody publishes freely until this passes. No exceptions, no 'just this once'. */
export type PublishAttempt = {
  tier: Tier;
  member_id: string;
  passes: number;
  rules_ok: boolean;
  policy_ok: boolean;
  disclosure_ok: boolean;
  flagged: boolean;
};

export function gateBeforePublish(a: PublishAttempt): {
  allow: boolean;
  requires_human: boolean;
  reason: string;
  watermark: boolean;
} {
  const wm = watermarkFor(a.tier).apply;
  if (!a.rules_ok) return { allow: false, requires_human: false, reason: "failed a rule check — fix the asset, the gate does not negotiate", watermark: wm };
  if (!a.policy_ok) return { allow: false, requires_human: false, reason: "failed the policy check — this is the bucket that gets channels removed", watermark: wm };
  if (!a.disclosure_ok) return { allow: false, requires_human: false, reason: "AI disclosure missing — required on every public surface", watermark: wm };
  // Earned auto-publish: three clean publishes, then the machine gate alone.
  // The 2-hour human SLA is a PRO entitlement, not a universal one. A Circle member is
  // scheduled through our publisher and needs no human in the loop; a free member posts by hand.
  if (a.tier === "pro" && (a.passes < 3 || a.flagged)) {
    return {
      allow: true,
      requires_human: true,
      reason: a.flagged ? "flagged for G4 review, 2-hour SLA" : `publish ${a.passes + 1} of the first 3 — G4 reviews within 2 hours`,
      watermark: wm,
    };
  }
  return { allow: true, requires_human: false, reason: "rules, policy and disclosure passed — no human needed on this tier", watermark: wm };
}

export type Quota = { used_in_window: number; used_this_month: number; window_started: string; month: string };

export function quotaCheck(tier: Tier, q: Quota, now = new Date()): {
  allowed: boolean;
  remaining_window: number;
  remaining_month: number;
  resets_in_mins: number;
  reason: string | null;
} {
  const winMs = WINDOW_HOURS * 3600_000;
  const started = new Date(q.window_started).getTime();
  const elapsed = now.getTime() - started;
  if (!Number.isFinite(started) || elapsed >= winMs) {
    // window expired: it resets, and the counter resets with it
    return { allowed: q.used_this_month < MONTHLY_RUNS[tier], remaining_window: WINDOW_RUNS[tier], remaining_month: MONTHLY_RUNS[tier] - q.used_this_month, resets_in_mins: 0, reason: null };
  }
  const remaining_window = Math.max(0, WINDOW_RUNS[tier] - q.used_in_window);
  const remaining_month = Math.max(0, MONTHLY_RUNS[tier] - q.used_this_month);
  const resets_in_mins = Math.ceil((winMs - elapsed) / 60000);
  if (remaining_window <= 0) {
    return { allowed: false, remaining_window, remaining_month, resets_in_mins, reason: `window spent — resets in ${resets_in_mins} min` };
  }
  if (remaining_month <= 0) {
    return { allowed: false, remaining_window, remaining_month, resets_in_mins, reason: `monthly ceiling reached at ${MONTHLY_RUNS[tier]} runs — the window resets, the month does not` };
  }
  return { allowed: true, remaining_window, remaining_month, resets_in_mins, reason: null };
}

/** What this member costs us. If this number is not comfortably under the price, the tier is a loss. */
export function tierCost(tier: Tier) {
  const runs = MONTHLY_RUNS[tier];
  const cost = round2(runs * COST_PER_RUN);
  const price = TIER_RULES[tier].price ?? 0;
  const net = price > 0 ? round2(price * 0.943 - 0.3) : 0; // Whop 3% + 2.7% + $0.30
  return {
    runs,
    cost,
    price,
    net,
    share: net > 0 ? round2((cost / net) * 100) : null,
    // the ceiling from lib/standard.ts: stack share must stay under 30%
    verdict: net === 0 ? "free tier — a marketing cost, budgeted separately" : cost / net <= 0.3 ? "solvent" : "losing money on every member",
  };
}

/** Worst case if every member maxes their allowance. The number that decides whether we can scale. */
export function worstCase(members: Partial<Record<Tier, number>>) {
  let cost = 0;
  let revenue = 0;
  for (const [t, n] of Object.entries(members) as [Tier, number][]) {
    const c = tierCost(t);
    cost += c.cost * n;
    revenue += c.net * n;
  }
  return { cost: round2(cost), revenue: round2(revenue), share: revenue > 0 ? round2((cost / revenue) * 100) : null, verdict: revenue > 0 && cost / revenue <= 0.3 ? "inside the ceiling" : "over the ceiling" };
}

export const WHAT_THE_AGENT_DOES = [
  "Takes a niche and returns a scripted, rendered stickman video — the same engine our own pages use",
  "Cuts the longform into the shorts and the social cuts, so one idea feeds every surface",
  "Schedules to the member's own channels and tracks what posted, what failed and why",
  "Audits every export against rules, policy and disclosure before it can go out",
  "Runs the community side: pods, streaks, next action, and the public ledger",
  "Free tier receives our content to clip — with our watermark, on purpose",
];

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
