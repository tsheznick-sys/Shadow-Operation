// AUTONOMY MATRIX — how much Jarvis may do without a human in each lane.
// The owner asked: "some things fully autonomous, 80-90% on the operation — recommend where
// the parameters belong." This file IS that recommendation, and it is env-overridable.

export type Lane = {
  key: string;
  label: string;
  workflow: string;
  recommended: number; // default autonomy %
  floor: number; // never go below this without an explicit owner override
  why: string;
  needs: string[];
};

/** Recommended defaults. Rationale is in `why` — every number is a decision, not a vibe. */
export const LANES: Lane[] = [
  {
    key: "research",
    label: "Research & niche ranking",
    workflow: "WF1",
    recommended: 95,
    floor: 70,
    why: "Wrong niches cost months, but Jarvis is already better at scanning the internet than a human is. Keep a 5% human veto, not a review queue.",
    needs: ["THRESHOLD_*", "NICHES_POOL"],
  },
  {
    key: "render",
    label: "Script + render (longform/Shorts)",
    workflow: "WF2 / WF3",
    recommended: 80,
    floor: 60,
    why: "The engine is deterministic once the character lock is set. The risk is drift in tone, not ruin — 80% means Jarvis picks, you spot-check.",
    needs: ["stickman character lock", "Content interview"],
  },
  {
    key: "clip_polish",
    label: "Clipping + Higgsfield polish",
    workflow: "WF3",
    recommended: 90,
    floor: 75,
    why: "Mechanical and reversible: a bad clip is deleted, not compensated. Only escalate when virality scores fall below the floor three times running.",
    needs: ["OPUSCLIP_API_KEY", "HIGGSFIELD_API_KEY"],
  },
  {
    key: "publish",
    label: "Publish to Buffer",
    workflow: "WF4",
    recommended: 70,
    floor: 40,
    why: "Public and permanent — a wrong post costs trust. G4 stays mandatory until 30 consecutive clean approvals, then this can rise.",
    needs: ["Content interview", "G4 rubric"],
  },
  {
    key: "dm_green",
    label: "GREEN fast-close DMs",
    workflow: "WF5",
    recommended: 75,
    floor: 50,
    why: "Money conversations are where a wrong sentence is expensive. Autonomy climbs only after the Social interview is complete and the objection library is populated.",
    needs: ["Social interview", "objection library", "banned claims"],
  },
  {
    key: "sequence",
    label: "Monthly 14-day sequence",
    workflow: "WF10",
    recommended: 85,
    floor: 65,
    why: "Built once per cycle, reviewed once per cycle — the cost of a mistake is a slow month, not a bad day.",
    needs: ["Growth Operator guide", "slide style brief"],
  },
  {
    key: "retention",
    label: "Save offers",
    workflow: "WF8",
    recommended: 90,
    floor: 75,
    why: "A save offer is a discount, not a promise. Capped at one per 30 days, so the downside is bounded.",
    needs: ["TIER_* prices"],
  },
  {
    key: "money",
    label: "Moving money (Wise)",
    workflow: "WF8 autopay",
    recommended: 40,
    floor: 0,
    why: "Never fully autonomous by recommendation. Raise slowly — 40% means Jarvis prepares and you approve; 0% means it never asks.",
    needs: ["AUTOPAY_AUTHORITY", "WISE_API_KEY", "2FA on /money"],
  },
  {
    key: "voice",
    label: "Voice broadcast + remote fixes",
    workflow: "WF7",
    recommended: 60,
    floor: 30,
    why: "It calls your phone. Annoyance has a real cost, and so does an unwanted emergency fix at 3am.",
    needs: ["VAPI_API_KEY", "JIVE_JARVIS_NUMBER"],
  },
];

export function laneAutonomy(key: string): number {
  const lane = LANES.find((l) => l.key === key);
  if (!lane) return 0;
  const raw = process.env[`AUTONOMY_${key.toUpperCase()}`];
  const parsed = raw ? Number(raw) : NaN;
  if (!Number.isFinite(parsed)) return lane.recommended;
  return Math.max(lane.floor, Math.min(100, parsed));
}

/** Overall operating autonomy — the owner's "80-90% on the operation" target. */
export function overallAutonomy(): { score: number; label: string } {
  const weighted = LANES.filter((l) => l.key !== "money");
  const score = Math.round(weighted.reduce((sum, l) => sum + laneAutonomy(l.key), 0) / weighted.length);
  const label = score >= 90 ? "near-autonomous" : score >= 80 ? "autonomous with watch points" : score >= 60 ? "supervised" : "hands-on";
  return { score, label };
}

export function canAct(laneKey: string, seatCompleteness: Record<string, number>): { allowed: boolean; reason: string } {
  const lane = LANES.find((l) => l.key === laneKey);
  if (!lane) return { allowed: false, reason: "unknown lane" };

  const pct = laneAutonomy(laneKey);
  const needs = lane.needs || [];

  // A lane that depends on an interview cannot run unsupervised until that seat is briefed.
  const gateSeat = needs.find((n) => n.includes("interview"));
  if (gateSeat) {
    const seat = gateSeat.toLowerCase().includes("content") ? "content" : "social";
    const done = seatCompleteness[seat] ?? 0;
    if (done < 60) return { allowed: false, reason: `${seat} interview at ${done}% — below 60%` };
  }

  if (pct <= 0) return { allowed: false, reason: "authority held" };
  if (pct >= 85) return { allowed: true, reason: `autonomous (${pct}%)` };
  if (pct >= 60) return { allowed: true, reason: `acts, then reports (${pct}%)` };
  return { allowed: false, reason: `proposes only (${pct}%)` };
}
