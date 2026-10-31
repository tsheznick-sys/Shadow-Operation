// THE 14-DAY CHALLENGE — engine.
// Free to join, expensive to finish. The work IS the qualification.
// Day plan lives in config/adaptable.json -> trust.engines.do.challenge.days (no code change to re-plan).
import adaptable from "../config/adaptable.json";
import { getSql } from "./db";

export type Phase = "warm-up" | "value" | "money";

export type ChallengeDay = {
  day: number;
  phase: Phase;
  action: string;
  deliverable: string;
  why: string;
};

type ChallengeCfg = {
  cohort_size: number;
  min_completion: number;
  days: ChallengeDay[];
  scoring: Record<string, string>;
  upgrade_trigger: string;
  no_upgrade: string;
};

const cfg = (adaptable as any)?.trust?.engines?.do?.challenge as ChallengeCfg | undefined;

export const DAYS: ChallengeDay[] = cfg?.days?.length ? cfg.days : [];

function n(env: string, fallback: number) {
  const v = process.env[env];
  const p = v === undefined || v === "" ? NaN : Number(v);
  return Number.isFinite(p) ? p : fallback;
}

export const COHORT_SIZE = n("CHALLENGE_COHORT_SIZE", cfg?.cohort_size ?? 53);
export const MIN_COMPLETION = n("CHALLENGE_MIN_COMPLETION", cfg?.min_completion ?? 60);
/** Membership tenure required before joining. The gate is paid time, not eagerness. */
export const MIN_TENURE_DAYS = n("CHALLENGE_MIN_TENURE_DAYS", 14);
/** Zero on purpose: the membership IS the ticket. */
export const ENTRY_FEE = n("CHALLENGE_ENTRY_FEE", 0);
/** Operators join to run their own page, not to buy a course. */
export const AUDIENCE = "operators";
export const FINISHER_DAYS = Math.round((MIN_COMPLETION / 100) * 14); // 60% of 14 = 8.4 -> 8, we require 10
export const FINISHER_MIN = Math.max(FINISHER_DAYS, 10);

export const PHASES: { key: Phase; label: string; days: string; blurb: string }[] = [
  { key: "warm-up", label: "Warm-Up", days: "1–3", blurb: "Pick the niche, audit a rival, write three hooks." },
  { key: "value", label: "Value", days: "4–9", blurb: "Post daily, reply inside 15 minutes, read your own signal." },
  { key: "money", label: "Money", days: "10–14", blurb: "Three slides, a 72-hour clock, an honest verdict." },
];

export function dayOf(day: number): ChallengeDay | undefined {
  return DAYS.find((d) => d.day === day);
}

export function phaseOf(day: number): Phase | undefined {
  return dayOf(day)?.phase;
}

export type Member = {
  id: string;
  handle: string;
  niche: string;
  joined_day: number;
  checked_in: number;
  streak: number;
  score: number;
  status: "active" | "quiet" | "finisher" | "dropped";
  verdict: "PASS" | "AMBER" | "RED" | null;
  tier?: string;
  paid_tenure_days?: number;
  unverified?: number; // days counted but not API-verified
};

/** Is this member allowed in? Paid tenure only — no public sign-ups. */
export function gate(member: { paid_tenure_days: number; tier: string } | null): { allowed: boolean; reason: string } {
  if (!member) return { allowed: false, reason: "not a member — the challenge is for paying members only" };
  if (member.tier === "none" || !member.tier) return { allowed: false, reason: "no active membership" };
  if (member.paid_tenure_days < MIN_TENURE_DAYS) {
    const left = MIN_TENURE_DAYS - member.paid_tenure_days;
    return { allowed: false, reason: `unlocks in ${left} day${left === 1 ? "" : "s"} — tenure is the filter` };
  }
  return { allowed: true, reason: `${member.paid_tenure_days} days paid as ${member.tier}` };
}

/** A finisher: 10+ days logged AND a day-13 verdict recorded. */
export function isFinisher(checkedIn: number, verdict: Member["verdict"]): boolean {
  return checkedIn >= FINISHER_MIN && verdict !== null;
}

/** What Jarvis should say about someone, given their numbers. */
export function coach(m: Pick<Member, "checked_in" | "streak" | "status">): string {
  if (m.checked_in >= FINISHER_MIN) return "finisher — invite to the $28 First Shot";
  if (m.status === "quiet") return "quiet 2 days — one nudge, then leave them alone";
  if (m.checked_in <= 3) return "early — send today's action, nothing else";
  return `${14 - m.checked_in} days left · streak ${m.streak}`;
}

/**
 * What happens at day 15. Two doors only.
 * Finisher + PASS -> First Shot $28 -> Circle $26 -> operator seat.
 * Everyone else -> Lite $17, without shame.
 */
export function nextDoor(m: Pick<Member, "checked_in" | "verdict">): { door: string; price: number; line: string } {
  const finished = isFinisher(m.checked_in, m.verdict);
  if (finished && m.verdict === "PASS") {
    return { door: "First Shot", price: 28, line: "You proved the market wants it. $28, then Circle $26 — and an operator seat on your own page." };
  }
  if (finished && m.verdict === "AMBER") {
    return { door: "re-cycle", price: 0, line: "Close, not there. Another 14 days, free — same room, new niche angle." };
  }
  return {
    door: "Lite",
    price: 17,
    line: "You did not finish, so I will not pretend you did. Cheaper door: Lite $17 — same tools, one domain, 3/day.",
  };
}

/** Completion across a cohort — the only number that predicts upgrades. */
export function cohortStats(members: Member[]) {
  const active = members.filter((m) => m.status !== "dropped");
  const totalDays = active.reduce((a, m) => a + m.checked_in, 0);
  const possible = active.length * 14;
  const completion = possible > 0 ? Math.round((totalDays / possible) * 100) : 0;
  const finishers = active.filter((m) => m.status === "finisher").length;
  return {
    joined: members.length,
    active: active.length,
    completion,
    finishers,
    // the market benchmark this engine is aiming to beat
    target_completion: MIN_COMPLETION,
    beating_target: completion >= MIN_COMPLETION,
  };
}

/** Reads the live cohort from Neon. Returns empty when no DB — never invents people. */
export async function readCohort(): Promise<{ members: Member[]; source: "neon" | "empty" }> {
  try {
    const sql = getSql();
    if (!sql) return { members: [], source: "empty" };
    const rows = (await sql`
      SELECT m.id, m.handle, m.niche, m.joined_day,
             COALESCE(c.checked_in, 0)::int AS checked_in,
             COALESCE(c.streak, 0)::int     AS streak,
             COALESCE(c.score, 0)::int      AS score,
             COALESCE(c.status, 'active')   AS status,
             c.verdict
      FROM challenge_members m
      LEFT JOIN challenge_scores c ON c.member_id = m.id
      ORDER BY score DESC, handle ASC
      LIMIT 200
    `) as unknown as Member[];
    return { members: rows || [], source: "neon" };
  } catch {
    return { members: [], source: "empty" };
  }
}
