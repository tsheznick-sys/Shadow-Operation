// COMMUNITY FUNDING — self-funding model, no assumed pocket.
// Every number here is env-overridable: no code change to re-price or re-split.

export type FundingInputs = {
  circlePrice: number;
  members: number;
  toolsMonthly: number;
  prizeTarget: number;
  oneTimeMonthly: number; // $27 vault + $79 Pro sales, estimated per month
  reservePct: number;
};

export type FundingModel = {
  inputs: FundingInputs;
  circleRevenue: number;
  totalRevenue: number;
  breakEvenMembers: number;
  recommendedMembers: number;
  prizePool: number;
  reserve: number;
  toolsCovered: number;
  annualBills: number;
  annualFundNeeded: number;
  annualFundPerMonth: number;
  buckets: { name: string; amount: number; pct: number; note: string }[];
  verdict: "below_floor" | "self_funding" | "building_reserve";
};

function n(env: string, fallback: number): number {
  const v = process.env[env];
  if (v === undefined || v === "") return fallback;
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function fundingInputs(membersFromDb?: number): FundingInputs {
  return {
    circlePrice: n("TIER_CIRCLE_PRICE", 19),
    members: membersFromDb ?? n("FUNDING_MEMBERS", 0),
    toolsMonthly: n("FUNDING_TOOLS_MONTHLY", 165),
    prizeTarget: n("FUNDING_PRIZE_TARGET", 500),
    oneTimeMonthly: n("FUNDING_ONE_TIME_MONTHLY", 0),
    reservePct: n("FUNDING_RESERVE_PCT", 12.5),
  };
}

/** Wardley-style arithmetic: what the community must actually carry. */
export function computeFunding(inputs: FundingInputs): FundingModel {
  const circleRevenue = inputs.circlePrice * inputs.members;
  const totalRevenue = circleRevenue + inputs.oneTimeMonthly;

  // Members needed before Circle alone covers tools + prizes (no reserve).
  const breakEvenMembers = Math.ceil((inputs.toolsMonthly + inputs.prizeTarget) / Math.max(inputs.circlePrice, 1));
  // Recommended floor adds the reserve buffer on top.
  const recommendedMembers = Math.ceil(
    (inputs.toolsMonthly + inputs.prizeTarget) / (Math.max(inputs.circlePrice, 1) * (1 - inputs.reservePct / 100))
  );

  const afterTools = Math.max(0, circleRevenue - inputs.toolsMonthly);
  const prizePool = Math.min(inputs.prizeTarget, afterTools);
  const reserve = Math.max(0, afterTools - prizePool);

  // Annual-only bills: 20% cheaper than monthly when prepaid.
  const annualBills =
    n("ANNUAL_TUBEGEN", 29 * 12 * 0.8) +
    n("ANNUAL_HIGGSFIELD", 29 * 12 * 0.8) +
    n("ANNUAL_BUFFER", 60 * 12 * 0.8) +
    n("ANNUAL_OPUSCLIP", 15 * 12 * 0.8);
  const annualFundPerMonth = Math.ceil(annualBills / 12);

  const buckets = [
    {
      name: "Tools & engines",
      amount: Math.min(circleRevenue, inputs.toolsMonthly),
      pct: circleRevenue > 0 ? Math.round((Math.min(circleRevenue, inputs.toolsMonthly) / circleRevenue) * 100) : 0,
      note: "Vercel · Neon · n8n · Claude · Grok · R2 · OpusClip · Higgsfield · Buffer",
    },
    {
      name: "Community prizes",
      amount: prizePool,
      pct: circleRevenue > 0 ? Math.round((prizePool / circleRevenue) * 100) : 0,
      note: "WWS prizes · pod bonuses — scales with members, never fixed if revenue is short",
    },
    {
      name: "Annual renewal fund",
      amount: Math.min(reserve, annualFundPerMonth),
      pct: circleRevenue > 0 ? Math.round((Math.min(reserve, annualFundPerMonth) / circleRevenue) * 100) : 0,
      note: "Pre-funds the annual prepay so month-12 bills never dip into your pocket",
    },
    {
      name: "Reserve / refunds",
      amount: Math.max(0, reserve - Math.min(reserve, annualFundPerMonth)),
      pct: circleRevenue > 0 ? Math.round((Math.max(0, reserve - Math.min(reserve, annualFundPerMonth)) / circleRevenue) * 100) : 0,
      note: "Chargebacks, refunds, one bad month of churn",
    },
  ];

  const verdict: FundingModel["verdict"] =
    inputs.members < recommendedMembers ? (inputs.members < breakEvenMembers ? "below_floor" : "self_funding") : "building_reserve";

  return {
    inputs,
    circleRevenue,
    totalRevenue,
    breakEvenMembers,
    recommendedMembers,
    prizePool,
    reserve,
    toolsCovered: Math.min(circleRevenue, inputs.toolsMonthly),
    annualBills: Math.round(annualBills),
    annualFundNeeded: Math.round(annualBills),
    annualFundPerMonth,
    buckets,
    verdict,
  };
}

/** Autopay is OFF until the owner grants authority explicitly. */
export function autopayState() {
  const authority = (process.env.AUTOPAY_AUTHORITY || "not_granted").toLowerCase();
  const hasWise = Boolean(process.env.WISE_API_KEY);
  return {
    authority,
    hasWise,
    granted: authority === "granted" && hasWise,
    label:
      authority !== "granted"
        ? "Held — Jarvis proposes only, never moves money"
        : hasWise
        ? "Authorised — monthly batch can run on the 1st"
        : "Authority granted but WISE_API_KEY missing — still proposing only",
    holdUntil: process.env.AUTOPAY_HOLD_UNTIL || "owner grants authority in /money",
  };
}
