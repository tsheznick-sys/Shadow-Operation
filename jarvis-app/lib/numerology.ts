// NUMEROLOGY — the 8-aligned pricing rule, encoded.
//
// Every price in the ladder reduces digit-wise to 8 (the Life Path 8), EXCEPT the
// first shot at $28, which reduces to 1 (the Leader — a deliberate opening move).
//
// The arithmetic shortcut: a number's digital root is n % 9 (with 9 in place of 0).
// So "reduces to 8" === n % 9 === 8. That makes the rule testable instead of tribal.
//
//   17 -> 1+7=8   26 -> 2+6=8   35 -> 3+5=8   44 -> 4+4=8
//   53 -> 5+3=8   62 -> 6+2=8   89 -> 8+9=17->8   710 -> 7+1+0=8
//
//   28 -> 2+8=10->1   (the only non-8 in the system, by design)

export const EIGHT = 8;
export const DIGITAL_ROOT_8 = (n: number): boolean => Number.isInteger(n) && n > 0 && n % 9 === EIGHT;

/** Add the digits repeatedly until one digit remains. */
export function digitalRoot(n: number): number {
  if (!Number.isFinite(n)) return NaN;
  let x = Math.abs(Math.trunc(n));
  if (x === 0) return 0;
  const r = x % 9;
  return r === 0 ? 9 : r;
}

/** Plain digit sum — for explaining a price to a human. */
export function digitSum(n: number): number {
  return String(Math.abs(Math.trunc(n)))
    .split("")
    .reduce((a, d) => a + Number(d), 0);
}

/** The smallest integer >= n whose digital root is 8. Never rounds down: a floor must stay a floor. */
export function nextEight(n: number): number {
  let x = Math.max(1, Math.ceil(n));
  while (x % 9 !== EIGHT) x += 1;
  return x;
}

/** True when every entry reduces to 8. */
export function allEight(values: number[]): boolean {
  return values.every(DIGITAL_ROOT_8);
}

/** Human-readable proof, e.g. "89 → 8+9=17 → 1+7=8". */
export function explain(n: number): string {
  const ds = digitSum(n);
  const root = digitalRoot(n);
  if (ds <= 9) return `${n} → ${ds} (${root === EIGHT ? "8 ✓" : "not 8"})`;
  return `${n} → ${ds} → ${root}${root === EIGHT ? " ✓" : " ✗"}`;
}

/** The live ladder. Keep in sync with config/adaptable.json paywalls (scripts/check_numerology.py enforces it). */
export const LADDER = {
  first_shot: 28,
  lite: 17,
  good: 35,
  better: 89,
  pro: 53,
  circle: 44,
  team: 62,
  save_pause: 8,
  save_discount: 0, // percentage discounts removed at $44 — see paywalls.save_math
  hidden_test_tier: 9,
} as const;

export const LADDER_EXPLAINED: Record<keyof typeof LADDER, string> = {
  first_shot: "2+8=10 → 1 — the Leader, the opening move (deliberate exception)",
  lite: "1+7=8 — daily-use rung for impulse",
  good: "3+5=8 — first real build",
  better: "8+9=17 → 1+7=8 — the workhorse",
  pro: "5+3=8 — recurring authority (moved off 44 when Circle took it)",
  circle: "4+4=8 — the membership that funds everything",
  team: "6+2=8 — three seats",
  save_pause: "8 — the only sub-$17 price, existing members only",
  save_discount: "removed — no percentage discount at a premium price",
  hidden_test_tier: "9 — never advertised, private A/B control",
};
