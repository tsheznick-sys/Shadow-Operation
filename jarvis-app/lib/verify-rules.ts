// RULE-BASED VERIFICATION — every step, every time.
// Most real failures are format and fact, not judgment. Rules catch those cheaply
// and deterministically, which is why this is the verification budget we chose.
//
// A rule failure retries ONCE, then escalates to a human. It never silently passes.

export type RuleResult = { ok: boolean; rule: string; detail: string };
export type Verdict = { pass: boolean; rules: RuleResult[]; failed: string[]; action: "ship" | "retry" | "escalate" };

type Rule = (value: any, ctx?: any) => RuleResult;

const R = {
  ok: (rule: string): RuleResult => ({ ok: true, rule, detail: "ok" }),
  bad: (rule: string, detail: string): RuleResult => ({ ok: false, rule, detail }),
};

/** Value is present and not empty. */
export const present: Rule = (v) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "")
    ? R.bad("present", "empty or missing")
    : R.ok("present");

export const isString = (min = 1, max = 100_000): Rule => (v) =>
  typeof v === "string" && v.length >= min && v.length <= max
    ? R.ok("string")
    : R.bad("string", `expected ${min}-${max} chars`);

export const isNumber = (min = -Infinity, max = Infinity): Rule => (v) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max
    ? R.ok("number")
    : R.bad("number", `${v} outside ${min}..${max}`);

export const isUrl: Rule = (v) => {
  try {
    const u = new URL(String(v));
    return u.protocol === "http:" || u.protocol === "https:"
      ? R.ok("url")
      : R.bad("url", "not http(s)");
  } catch {
    return R.bad("url", "not a parseable URL");
  }
};

/** A price must match the live config exactly — a typo here is a real refund. */
export const priceMatches =
  (expected: number): Rule =>
  (v) =>
    Number(v) === expected ? R.ok("price") : R.bad("price", `expected ${expected}, got ${v}`);

/** Arithmetic that must add up. */
export const sumsTo =
  (target: number, tolerance = 0.01): Rule =>
  (parts: number[]) => {
    if (!Array.isArray(parts)) return R.bad("sum", "expected an array");
    const total = parts.reduce((a, b) => a + Number(b || 0), 0);
    return Math.abs(total - target) <= tolerance
      ? R.ok("sum")
      : R.bad("sum", `${total.toFixed(2)} != ${target.toFixed(2)}`);
  };

/** Nothing may be published that reads as financial/health/legal advice. */
const BANNED = [
  /\byou should (invest|buy|sell|put|save)\b/i,
  /\bguaranteed (returns?|profit|income)\b/i,
  /\b(get|become) rich (quick|fast)\b/i,
  /\b(financial|investment|medical|legal) advice\b/i,
  /\bthis (stock|crypto|fund) will\b/i,
];

export const noAdvice: Rule = (v) => {
  const text = String(v || "");
  const hit = BANNED.find((re) => re.test(text));
  return hit ? R.bad("no_advice", `matches banned pattern ${hit}`) : R.ok("no_advice");
};

/** Policy gate for anything leaving for a public platform. */
export const policySafe: Rule = (v, ctx) => {
  const text = String(v || "");
  const problems: string[] = [];
  if (text.length < 200) problems.push("under 200 chars — reads as a template, not original input");
  if (/\b(?:stock (?:footage|video)|text-to-speech|slideshow)\b/i.test(text))
    problems.push("describes a slideshow/TTS format — the named non-monetisable bucket");
  if (!/disclos/i.test(text) && ctx?.public) problems.push("no AI disclosure line");
  return problems.length ? R.bad("policy_safe", problems.join("; ")) : R.ok("policy_safe");
};

/** Runs a set of rules and returns the decision, not just a boolean. */
export function runRules(value: any, rules: Rule[], ctx?: any, attempt = 0): Verdict {
  const results = rules.map((r) => {
    try {
      return r(value, ctx);
    } catch (err: any) {
      return R.bad("rule_threw", String(err?.message || err));
    }
  });
  const failed = results.filter((r) => !r.ok).map((r) => `${r.rule}: ${r.detail}`);
  const pass = failed.length === 0;
  const action: Verdict["action"] = pass ? "ship" : attempt === 0 ? "retry" : "escalate";
  return { pass, rules: results, failed, action };
}

/** The standard suite applied before anything outbound ships. */
export const OUTBOUND_RULES: Rule[] = [present, noAdvice];

/** The standard suite before anything public ships. */
export const PUBLIC_RULES: Rule[] = [present, noAdvice, policySafe];

export function targets() {
  return {
    correct_or_caught: Number(process.env.RELIABILITY_TARGET_CORRECT || 98),
    end_to_end: Number(process.env.RELIABILITY_TARGET_E2E || 98),
    money: 100,
  };
}
