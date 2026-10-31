// PAGES — the one-niche law, enforced in code instead of hoped for in a doc.
//
// THE MESS THIS FIXES (2026-10-31):
//   6 pages were pointed at the same niche. That is three failures at once:
//     1. YouTube 16 Jul 2026: "multiple channels running the same template is exactly
//        the mass-produced-templates bucket, just distributed."
//     2. Our own lock: zero graduation = zero clones. A clone may copy the SYSTEM,
//        never the market the system already occupies.
//     3. Money: six pages competing for one audience bid up the same attention and
//        split the same buyer pool. Cost multiplies; demand does not.
//
// THE FIX:
//   A page = one niche + one audience + one angle + one visual world.
//   Its 6 channels are SURFACES of that page — not 6 pages, and not 6 chances to
//   repost the same cut. 5 pages x 6 channels = 30 channels.
//
//   And the hard part: you cannot get 6 distinct pages out of this pool, because 4 of
//   the 7 niches are the same audience wearing different labels. Psychology, Dark
//   Psychology, Mindset, Wolf Mindset and Self-Improvement all sell "why you behave
//   this way" to the same reader. So the 6th slot is HELD, not assigned. A page that
//   cannot be explained as a different reader with a different reason to subscribe is
//   not a page — it is a duplicate with extra hosting costs.

export type Status = "assigned" | "held";

export type PageSlot = {
  id: string;
  niche: string;
  cluster: string;
  /** who is reading, in one sentence — not a demographic, a motive */
  audience: string;
  /** the repeatable question this page answers. If two pages answer the same question, one is a clone. */
  angle: string;
  /** the look that cannot be confused at thumbnail size */
  visual: string;
  status: Status;
  reason?: string;
};

/** The six surfaces of ONE page. Two YouTube channels, and Longform is page 1. */
export const CHANNELS = [
  { platform: "youtube", kind: "longform", role: "PAGE 1 — the searchable asset, the one that ranks", cut: "edited" },
  { platform: "youtube", kind: "shorts", role: "discovery engine, feeds the longform page", cut: "edited" },
  { platform: "tiktok", kind: "short", role: "cold discovery, fastest reach decay", cut: "edited" },
  { platform: "instagram", kind: "reel", role: "community + DMs, where the Circle is sold", cut: "edited" },
  { platform: "facebook", kind: "reel", role: "reels + the older buyer, underpriced attention", cut: "edited" },
  { platform: "x", kind: "thread", role: "discovery + threads, the cheapest idea test", cut: "edited" },
] as const;

export const CHANNELS_PER_PAGE = CHANNELS.length; // 6

/**
 * Five pages, five genuinely different readers.
 * Slot 6 is held on purpose — see HELD_REASON.
 */
export const SLOTS: PageSlot[] = [
  {
    id: "p1",
    niche: "Consumerism",
    cluster: "price",
    audience: "people who feel they are being quietly overcharged and want the receipt",
    angle: "why this costs what it costs — unit economics of ordinary things",
    visual: "flat vector, catalogue colours, price tags as a recurring motif",
    status: "assigned",
  },
  {
    id: "p2",
    niche: "Marketing History",
    cluster: "case",
    audience: "small operators who want the campaign that actually worked, not theory",
    angle: "how this campaign was really built — the brief, the budget, the mistake",
    visual: "archive collage, newsprint, one red underline",
    status: "assigned",
  },
  {
    id: "p3",
    niche: "Psychology",
    cluster: "behavior",
    audience: "curious people who want to understand their own reflexes",
    angle: "why your brain does this — one mechanism per episode",
    visual: "stickman, locked frame, no LUT",
    status: "assigned",
  },
  {
    id: "p4",
    niche: "Self-Improvement",
    cluster: "system",
    audience: "people who have already failed at motivation and want a system instead",
    angle: "the system, not the willpower — habits treated as engineering",
    visual: "whiteboard, grids, hand-drawn arrows",
    status: "assigned",
  },
  {
    id: "p5",
    niche: "Dark Psychology",
    cluster: "power",
    audience: "people negotiating power at work or in family, and losing",
    angle: "the influence mechanic being used on you right now",
    visual: "single hard key light, deep shadow, noir palette",
    status: "assigned",
  },
  {
    id: "p6",
    niche: "—",
    cluster: "unassigned",
    audience: "—",
    angle: "—",
    visual: "—",
    status: "held",
    reason:
      "Mindset / Wolf Mindset are not a sixth reader — they are the Self-Improvement reader after midnight. " +
      "A sixth page needs a sixth reader proven by the daily scan, not a sixth label invented to fill a grid.",
  },
];

export const HELD_REASON = SLOTS.find((s) => s.status === "held")?.reason ?? "";

/** Niches that must never run. Policy, not taste. */
export const BANNED_NICHES = ["finance", "investing", "credit", "debt", "health", "medical", "legal", "crypto", "trading"];

export type Conflict = { kind: "banned" | "duplicate" | "overlap"; detail: string };

/** Normalise before comparing, or "Self Improvement" slips past "Self-Improvement". */
export function nicheKey(niche: string) {
  return niche.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Two pages may not answer the same question. Sharing the cluster is fatal;
 * sharing two of three of (audience, angle, visual) is fatal; sharing one is a warning.
 */
export function distinctness(a: PageSlot, b: PageSlot): { shared: string[]; verdict: "ok" | "warn" | "block" } {
  if (nicheKey(a.niche) === nicheKey(b.niche)) {
    return { shared: ["niche"], verdict: "block" };
  }
  const shared: string[] = [];
  if (a.cluster === b.cluster) shared.push("cluster");
  if (a.angle.trim().toLowerCase() === b.angle.trim().toLowerCase()) shared.push("angle");
  if (a.visual.trim().toLowerCase() === b.visual.trim().toLowerCase()) shared.push("visual");
  if (shared.includes("cluster") || shared.length >= 2) return { shared, verdict: "block" };
  if (shared.length === 1) return { shared, verdict: "warn" };
  return { shared, verdict: "ok" };
}

/** Can this page exist? Called before a clone, before a create, before a relaunch. */
export function canAddPage(candidate: PageSlot, existing: PageSlot[]): { ok: boolean; conflicts: Conflict[] } {
  const conflicts: Conflict[] = [];
  const key = nicheKey(candidate.niche);
  if (BANNED_NICHES.some((b) => key.includes(b))) {
    conflicts.push({ kind: "banned", detail: `"${candidate.niche}" is in the permanently-removal bucket — no page, ever` });
  }
  for (const other of existing) {
    if (other.id === candidate.id) continue;
    const d = distinctness(candidate, other);
    if (d.verdict === "block") {
      conflicts.push({
        kind: d.shared.includes("niche") ? "duplicate" : "overlap",
        detail: `${candidate.niche} vs ${other.niche} — shares ${d.shared.join(", ")}; that is one page with two hosting bills`,
      });
    }
  }
  return { ok: conflicts.length === 0, conflicts };
}

/** Live pages the operation is actually allowed to run right now. */
export function assignedSlots(): PageSlot[] {
  return SLOTS.filter((s) => s.status === "assigned");
}

export function pageCount() {
  return assignedSlots().length;
}

export function channelCount() {
  return pageCount() * CHANNELS_PER_PAGE;
}

/**
 * The audit. Every page against every other page, and every page against the banned list.
 * An operation that cannot pass this has no business buying hosting.
 */
export function auditPages(slots: PageSlot[] = assignedSlots()) {
  const violations: string[] = [];
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const d = distinctness(slots[i], slots[j]);
      if (d.verdict === "block") violations.push(`${slots[i].niche} / ${slots[j].niche} share ${d.shared.join("+")}`);
    }
  }
  for (const s of slots) {
    const key = nicheKey(s.niche);
    if (BANNED_NICHES.some((b) => key.includes(b))) violations.push(`${s.niche} is a banned niche`);
  }
  return {
    clean: violations.length === 0,
    violations,
    pages: slots.length,
    channels: slots.length * CHANNELS_PER_PAGE,
    held: SLOTS.filter((s) => s.status === "held").length,
  };
}
