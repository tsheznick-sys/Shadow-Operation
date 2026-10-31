// PANEL — the four screens inside Whop, in the Whop-AI shape: one column, quotas on top,
// the next action always visible, nothing that needs a manual.
//
// Built because the owner asked for "all of them". The four screens are not four products,
// they are four questions a member asks in order:
//   1. HOME        — am I getting what I pay for? (quota, queue, next action)
//   2. CREATE      — can I make the thing? (script → render → cut → schedule)
//   3. PERFORMANCE — is it working? (views, ER, buyer pool, revenue, what died)
//   4. VAULT       — what do I get for being inside Whop? (raw cuts, scripts, ledger, pods)

export const TABS = [
  { href: "/stickman", key: "home", label: "Home", question: "am I getting what I pay for?" },
  { href: "/stickman/create", key: "create", label: "Create", question: "can I make the thing?" },
  { href: "/stickman/performance", key: "performance", label: "Performance", question: "is it working?" },
  { href: "/stickman/vault", key: "vault", label: "Vault", question: "what do I get for staying?" },
] as const;

/** The home screen's single job: name the one next action and make everything else secondary. */
export const HOME = {
  quota_label: "runs this window",
  reset_copy: "resets every 5 hours — the window is the pace, the month is the ceiling",
  next_action_rules: [
    "no asset today → create one, the agent has a script waiting from the morning scan",
    "asset ready, not scheduled → schedule it, an unscheduled asset is a diary entry",
    "first 3 publishes → say so plainly, and show how long the review will take",
    "earned → tell them they earned it, and what it took",
  ],
  never_shows: ["a dashboard of numbers with no action", "a streak that shames a paused member", "a quota that resets silently"],
};

/** The create flow. Every step is a gate, not a suggestion. */
export const CREATE_STEPS = [
  { step: 1, name: "Niche", detail: "the member picks from their page's niche — not a free-text box, or the distinctness rule becomes decorative" },
  { step: 2, name: "Idea", detail: "the agent offers three from the morning scan, each with the mechanism it explains" },
  { step: 3, name: "Script", detail: "one mechanism, one hook, one payoff. Rules check it before a single frame renders" },
  { step: 4, name: "Render", detail: "stickman, locked character, free engine. One frame is the character lock for the whole page" },
  { step: 5, name: "Cut", detail: "longform is the source; shorts and social cuts are cut from it, not re-scripted" },
  { step: 6, name: "Gate", detail: "rules, policy, disclosure. Blocked assets do not move to step 7 — they do not move" },
  { step: 7, name: "Schedule", detail: "five surfaces, or fewer. The agent never posts to a surface the member has not connected" },
] as const;

/** Performance: what moves the business, in the order it kills you. */
export const PERFORMANCE_METRICS = [
  { key: "views", label: "Views", note: "vanity until it is paired with retention — shown last, never first" },
  { key: "retention", label: "Retention at 30s", note: "the only number that predicts the algorithm's patience" },
  { key: "er", label: "Engagement rate", note: "5% is the graduation line; below it the page is not a template" },
  { key: "pool", label: "Buyer pool x3", note: "comments x3 >= 3,000 or there is nobody to sell to" },
  { key: "revenue", label: "Revenue per page", note: "never aggregated across pages — an average hides a dead one" },
  { key: "churn", label: "Churn", note: "the only long-term metric. 2%/mo is the target, 5.8% is the market" },
];

/** The vault — the reason to be inside Whop rather than on YouTube. */
export const VAULT = {
  headline: "The cut that never leaves this room.",
  contents: [
    "RAW cuts — unedited, including the takes that failed. No platform can demonetise them here.",
    "the scripts, in full, with the mechanism named",
    "the policy log — every asset a public gate blocked, and why",
    "the pod board and the community ledger",
  ],
  migration_line: "The public version is the advert. This is the product.",
  rule: "raw never appears on a public surface — the database refuses to attach it to one",
};

/** Pods, re-stated so the panel and the retention page cannot drift apart. */
export const PODS = {
  size: 5,
  checkin: "daily, one number — what posted and what it did",
  leaderboard: "05:45, posted to the pod chat",
  silence_rule: "3 quiet days → a human message, not a bot nudge. A bot nudge is how people leave.",
} as const;

export function tierLabel(tier: "free" | "circle" | "pro") {
  return tier === "free" ? "Free" : tier === "circle" ? "Circle $44" : "Pro $53";
}
