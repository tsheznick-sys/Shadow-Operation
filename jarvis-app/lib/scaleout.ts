// SCALEOUT — a page earns the right to be copied.
// Cloning before proof multiplies losses at exactly the speed it multiplies wins.
import adaptable from "../config/adaptable.json";
import { getSql } from "./db";

export type PageVerdict = {
  keys: string[];
  cost_per_clip: number;
  churn_pct: number;
  buyers: number;
  er_pct: number;
  buyer_pool: number;
  demand_pass: boolean;
  days_live: number;
};

export type Graduation = { graduated: boolean; passed: string[]; failed: string[]; score: number };

const cfg = (adaptable as any)?.scaleout ?? {};

function n(env: string, fallback: number) {
  const v = process.env[env];
  const p = v === undefined || v === "" ? NaN : Number(v);
  return Number.isFinite(p) ? p : fallback;
}

export const PARALLEL_CAP = n("SCALE_PARALLEL_CAP", cfg?.duplication?.parallel_cap ?? 3);
export const MAX_PAGES = n("SCALE_MAX_PAGES", cfg?.duplication?.max_pages ?? 10);
export const GRAD_MIN_DAYS = n("SCALE_GRAD_MIN_DAYS", cfg?.graduation?.min_days ?? 30);
export const GRAD_MIN_BUYERS = n("SCALE_GRAD_MIN_BUYERS", cfg?.graduation?.min_buyers ?? 3);
export const KILL_AFTER_FAILS = n("SCALE_KILL_AFTER_FAILS", cfg?.duplication?.kill_after_fails ?? 2);
export const CLIP_COST_CEILING = n("SCALE_CLIP_COST_CEILING", 0.25);

/** Every condition, checked. A page passes all of them or it is not a template. */
export function graduate(v: PageVerdict): Graduation {
  const checks: [string, boolean, string][] = [
    ["demand test PASS (50+ at 72h)", v.demand_pass, "the market must have said yes before we copy the page"],
    [`30 days live (has ${v.days_live})`, v.days_live >= GRAD_MIN_DAYS, "a page that has not survived a month has not been tested"],
    [`ER >= 5% (has ${v.er_pct}%)`, v.er_pct >= 5, "engagement is the only trusted signal"],
    [`buyer pool x3 >= 3,000 (has ${v.buyer_pool})`, v.buyer_pool >= 3000, "too small a pool cannot fund the page"],
    [`3 paying buyers (has ${v.buyers})`, v.buyers >= GRAD_MIN_BUYERS, "views do not pay a bill"],
    [`churn <= 2.0% (has ${v.churn_pct}%)`, v.churn_pct <= 2.0, "a leaking page is not a template"],
    [`cost per clip <= $${CLIP_COST_CEILING} (has $${v.cost_per_clip})`, v.cost_per_clip <= CLIP_COST_CEILING, "an expensive page cannot be copied profitably"],
    ["playbook has 5 proven hooks", v.keys.length >= 5, "without a hook bank a clone starts from nothing"],
  ];
  const passed = checks.filter(([, ok]) => ok).map(([label]) => label);
  const failed = checks.filter(([, ok]) => !ok).map(([label, , why]) => `${label} — ${why}`);
  return { graduated: failed.length === 0, passed, failed, score: Math.round((passed.length / checks.length) * 100) };
}

/** How many pages may run in parallel right now. The cap lifts on proof, never on ambition. */
export function parallelAllowance(graduatedCount: number, livePages: number): { cap: number; canClone: number; reason: string } {
  // 1 proven page -> 3 live. 2 proven -> 6. 3+ proven -> 10 (the supervision ceiling).
  let cap = PARALLEL_CAP;
  if (graduatedCount >= 2) cap = Math.min(6, MAX_PAGES);
  if (graduatedCount >= 3) cap = MAX_PAGES;
  // No graduation, no clones. The law is enforced here, not just written down.
  if (graduatedCount === 0) {
    return { cap: PARALLEL_CAP, canClone: 0, reason: "no page has graduated — cloning now would multiply an unproven guess" };
  }
  const canClone = Math.max(0, Math.min(cap - livePages, MAX_PAGES - livePages));
  const reason = `${graduatedCount} graduated page${graduatedCount === 1 ? "" : "s"} lifts the cap to ${cap}; ${livePages} live`;
  return { cap, canClone, reason };
}

/** A clone starts at zero and must be told so. */
export function cloneBrief(template: { page: string; niche: string; version: string }) {
  return {
    copies: ["master prompt", "character lock", "hook bank", "cadence", "playbook slice", "template version"],
    never_copies: ["the audience", "the comments", "the credibility"],
    honesty_line: `This page is new. ${template.page} earned its numbers over time — this one starts at zero and we will publish that too.`,
    version: template.version,
    niche: template.niche,
  };
}

export type Lane = { page: string; niche: string; status: "live" | "cloning" | "graduated" | "archived"; revenue: number; cost: number; fails: number };

/** Portfolio view: revenue per page, never an average that hides a dead one. */
export function portfolio(lanes: Lane[]) {
  const live = lanes.filter((l) => l.status !== "archived");
  const revenue = live.reduce((a, l) => a + l.revenue, 0);
  const cost = live.reduce((a, l) => a + l.cost, 0);
  return {
    live: live.length,
    graduated: lanes.filter((l) => l.status === "graduated").length,
    archived: lanes.filter((l) => l.status === "archived").length,
    revenue,
    cost,
    margin: Math.round((revenue - cost) * 100) / 100,
    // a page paying for itself is worth more than a bigger average
    self_funding: live.filter((l) => l.revenue > l.cost).length,
    to_kill: live.filter((l) => l.fails >= KILL_AFTER_FAILS).map((l) => l.page),
  };
}

export async function readPortfolio(): Promise<{ lanes: Lane[]; source: "neon" | "empty" }> {
  try {
    const sql = getSql();
    if (!sql) return { lanes: [], source: "empty" };
    const lanes = (await sql`
      SELECT page, niche, status,
             COALESCE(revenue, 0)::numeric(12,2) AS revenue,
             COALESCE(cost, 0)::numeric(12,2)    AS cost,
             COALESCE(fails, 0)::int             AS fails
      FROM page_portfolio ORDER BY status, page
    `) as unknown as Lane[];
    return { lanes: lanes || [], source: "neon" };
  } catch {
    return { lanes: [], source: "empty" };
  }
}
