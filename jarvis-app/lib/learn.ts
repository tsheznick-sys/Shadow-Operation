// SELF-IMPROVEMENT — Jarvis grades itself, then the operation, then the money.
// Order is enforced in code, not in prose: a stage will not unlock on a claim.
import adaptable from "../config/adaptable.json";
import { getSql } from "./db";

export type Stage = "self" | "operation" | "money";

export type Experiment = {
  id: string;
  stage: Stage;
  page: string;
  variable: string;
  incumbent: string;
  challenger: string;
  started_at: string;
  sample: number;
  incumbent_score: number;
  challenger_score: number;
  outcome: "running" | "promoted" | "killed" | "inconclusive";
  note?: string;
};

export type Tactic = {
  key: string;
  stage: Stage;
  page: string;
  rule: string;
  wins: number;
  losses: number;
  promoted_at: string | null;
  retired_at: string | null;
};

const cfg = (adaptable as any)?.learning ?? {};

function n(env: string, fallback: number) {
  const v = process.env[env];
  const p = v === undefined || v === "" ? NaN : Number(v);
  return Number.isFinite(p) ? p : fallback;
}

export const MIN_SAMPLE = n("LEARN_MIN_SAMPLE", cfg?.sample_rules?.min_sample ?? 30);
export const MIN_DAYS = n("LEARN_MIN_DAYS", cfg?.sample_rules?.min_days ?? 7);
export const HOLDOUT_PCT = n("LEARN_HOLDOUT_PCT", cfg?.sample_rules?.holdout ?? 20);
export const WIN_MARGIN = n("LEARN_WIN_MARGIN", cfg?.sample_rules?.confidence_pct ?? 10);
export const DECAY_DAYS = n("LEARN_DECAY_DAYS", cfg?.playbook?.decay_days ?? 60);

/** A test is readable only when it has enough of the right kind of sample. */
export function readable(sample: number, days: number): { ok: boolean; reason: string } {
  if (days < MIN_DAYS) return { ok: false, reason: `${days}/${MIN_DAYS} days — too early to read` };
  if (sample < MIN_SAMPLE) return { ok: false, reason: `${sample}/${MIN_SAMPLE} samples — too thin to trust` };
  return { ok: true, reason: `${sample} samples over ${days} days` };
}

/**
 * The decision. Beats the incumbent by more than the margin, without losing the
 * primary metric -> promote. Behind -> kill. Between -> inconclusive, which is
 * NOT a win and must never be treated as one.
 */
export function decide(
  incumbent: number,
  challenger: number,
  opts: { sample: number; days: number; primaryLost?: boolean }
): { outcome: Experiment["outcome"]; delta_pct: number; reason: string } {
  const gate = readable(opts.sample, opts.days);
  if (!gate.ok) return { outcome: "running", delta_pct: 0, reason: gate.reason };

  const delta = incumbent > 0 ? ((challenger - incumbent) / incumbent) * 100 : 0;
  const rounded = Math.round(delta * 10) / 10;

  if (opts.primaryLost) {
    return { outcome: "killed", delta_pct: rounded, reason: "won the secondary metric and lost the primary — that is a loss" };
  }
  if (rounded > WIN_MARGIN) {
    return { outcome: "promoted", delta_pct: rounded, reason: `+${rounded}% vs incumbent (needs +${WIN_MARGIN}%)` };
  }
  if (rounded < 0) {
    return { outcome: "killed", delta_pct: rounded, reason: `${rounded}% vs incumbent — behind, archive it` };
  }
  return {
    outcome: "inconclusive",
    delta_pct: rounded,
    reason: `${rounded}% is inside the ${WIN_MARGIN}% margin — no decision, do not ship it`,
  };
}

/** Two independent wins on two different pages before a tactic enters the playbook. */
export function promotable(wins: number, distinctPages: number): boolean {
  return wins >= 2 && distinctPages >= 2;
}

/** Stage gating — the whole point of the order. */
export function stageUnlocked(stage: Stage, state: {
  self: { consecutive_wins: number };
  operation: { cost_falling_cycles: number; g4_rejection_pct: number };
  money: { months_above_floor: number; churn_pct: number };
}): { unlocked: boolean; reason: string } {
  if (stage === "self") return { unlocked: true, reason: "always on — grading its own output is the baseline" };

  if (stage === "operation") {
    return state.self.consecutive_wins >= 3
      ? { unlocked: true, reason: "3 consecutive self-wins" }
      : { unlocked: false, reason: `${state.self.consecutive_wins}/3 consecutive self-wins` };
  }

  const operationReady = state.operation.cost_falling_cycles >= 2 && state.operation.g4_rejection_pct < 10;
  if (!operationReady) {
    return {
      unlocked: false,
      reason: `operation not settled: cost falling for ${state.operation.cost_falling_cycles}/2 cycles, G4 rejection ${state.operation.g4_rejection_pct}% (needs <10%)`,
    };
  }
  return state.money.months_above_floor >= 1 && state.money.churn_pct <= 2.0
    ? { unlocked: true, reason: "a full month above the floor with churn at or under 2.0%" }
    : { unlocked: false, reason: "needs a full month above the member floor with churn <= 2.0%" };
}

/** Tactics that are stale and must be re-tested rather than assumed. */
export function stale(t: Tactic, now = Date.now()): boolean {
  if (!t.promoted_at) return false;
  const age = (now - new Date(t.promoted_at).getTime()) / 86_400_000;
  return age > DECAY_DAYS;
}

export async function readPlaybook(): Promise<{ tactics: Tactic[]; experiments: Experiment[]; source: "neon" | "empty" }> {
  try {
    const sql = getSql();
    if (!sql) return { tactics: [], experiments: [], source: "empty" };
    const tactics = (await sql`
      SELECT key, stage, page, rule, wins, losses, promoted_at, retired_at
      FROM playbook WHERE retired_at IS NULL ORDER BY wins DESC, key ASC LIMIT 200
    `) as unknown as Tactic[];
    const experiments = (await sql`
      SELECT id, stage, page, variable, incumbent, challenger, started_at, sample,
             incumbent_score, challenger_score, outcome, note
      FROM experiments ORDER BY started_at DESC LIMIT 50
    `) as unknown as Experiment[];
    return { tactics: tactics || [], experiments: experiments || [], source: "neon" };
  } catch {
    return { tactics: [], experiments: [], source: "empty" };
  }
}
