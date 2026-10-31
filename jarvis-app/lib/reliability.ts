// RELIABILITY — three separate numbers, never one headline.
// A single "98%" hides which part is failing, and the part that fails silently
// is the only one that costs money.
import { getSql } from "./db";
import { targets } from "./verify-rules";

export type Metric = {
  key: "correct_or_caught" | "end_to_end" | "money";
  label: string;
  target: number;
  actual: number | null;
  measured: number;
  breached: boolean;
  note: string;
};

/** The 8 verified stages the 17 workflows are grouped into, so 98% is reachable. */
export const STAGES = [
  { n: 1, key: "research", workflows: "WF1", deterministic: false },
  { n: 2, key: "script+policy", workflows: "WF2 + policy gate", deterministic: false },
  { n: 3, key: "render+polish", workflows: "WF2/WF3", deterministic: true },
  { n: 4, key: "split+approve", workflows: "WF3/WF4", deterministic: false },
  { n: 5, key: "publish", workflows: "WF4 Buffer", deterministic: true },
  { n: 6, key: "demand+sequence", workflows: "WF5/WF5A/WF10/WF11", deterministic: false },
  { n: 7, key: "money", workflows: "WF8 Wise/Whop", deterministic: true },
  { n: 8, key: "proof+learn", workflows: "WF9/WF15/WF16", deterministic: false },
];

/**
 * Why 8 stages and not 17: a 98% per-step chain across 17 steps is 70.9% end-to-end,
 * and would need 99.881% per step to hit target. Grouping to 8 verified stages makes
 * 98% arithmetically reachable instead of hopeless.
 */
export function stageMath(perStep = 0.98, stages = STAGES.length) {
  return {
    stages,
    per_step: perStep,
    end_to_end: Math.round(Math.pow(perStep, stages) * 10000) / 100,
    needed_per_step: Math.round(Math.pow(0.98, 1 / stages) * 1e6) / 1e4,
  };
}

export function buildMetrics(rows: {
  outbound_total: number;
  outbound_ok: number;
  outbound_blocked: number;
  runs_total: number;
  runs_ok: number;
  money_total: number;
  money_ok: number;
}): Metric[] {
  const t = targets();

  // Correct-or-caught: correct OR blocked before shipping. A caught error counts as a win.
  const cocDen = rows.outbound_total || 0;
  const cocNum = (rows.outbound_ok || 0) + (rows.outbound_blocked || 0);
  const coc = cocDen > 0 ? Math.round((cocNum / cocDen) * 10000) / 100 : null;

  const e2e = rows.runs_total > 0 ? Math.round((rows.runs_ok / rows.runs_total) * 10000) / 100 : null;
  const money = rows.money_total > 0 ? Math.round((rows.money_ok / rows.money_total) * 10000) / 100 : null;

  return [
    {
      key: "correct_or_caught",
      label: "Correct or caught",
      target: t.correct_or_caught,
      actual: coc,
      measured: cocDen,
      breached: coc !== null && coc < t.correct_or_caught,
      note: "correct, or stopped before it shipped. Caught errors count as wins — silent failures do not.",
    },
    {
      key: "end_to_end",
      label: "End-to-end runs",
      target: t.end_to_end,
      actual: e2e,
      measured: rows.runs_total || 0,
      breached: e2e !== null && e2e < t.end_to_end,
      note: "full 8-stage runs completing correctly. Measured per run, not per step.",
    },
    {
      key: "money",
      label: "Money actions",
      target: 100,
      actual: money,
      measured: rows.money_total || 0,
      breached: money !== null && money < 100,
      note: "prices, payouts, entitlements, refunds, ledger rows. 100 or it is a bug, not variance.",
    },
  ];
}

export async function readReliability() {
  const empty = { outbound_total: 0, outbound_ok: 0, outbound_blocked: 0, runs_total: 0, runs_ok: 0, money_total: 0, money_ok: 0 };
  try {
    const sql = getSql();
    if (!sql) return { rows: empty, metrics: buildMetrics(empty), source: "empty" as const };
    const [r]: any = await sql`
      SELECT
        COALESCE(SUM(outbound_total), 0)::int   AS outbound_total,
        COALESCE(SUM(outbound_ok), 0)::int      AS outbound_ok,
        COALESCE(SUM(outbound_blocked), 0)::int AS outbound_blocked,
        COALESCE(SUM(runs_total), 0)::int       AS runs_total,
        COALESCE(SUM(runs_ok), 0)::int          AS runs_ok,
        COALESCE(SUM(money_total), 0)::int      AS money_total,
        COALESCE(SUM(money_ok), 0)::int         AS money_ok
      FROM reliability_daily
      WHERE day >= now() - interval '7 days'
    `;
    const rows = r || empty;
    return { rows, metrics: buildMetrics(rows), source: "neon" as const };
  } catch {
    return { rows: empty, metrics: buildMetrics(empty), source: "empty" as const };
  }
}
