// COMMUNITY FUNDING — self-funding model, no assumed pocket.
// Prices follow the 8-aligned ladder (see lib/numerology.ts): break-even and
// recommended counts are snapped UP to the next 8, never down.
// Every number here is env-overridable: no code change to re-price or re-split.

import { nextEight } from "./numerology";

// ── THE FIX: compute on NET, not gross ───────────────────────────────────────
// The old model divided gross Circle revenue by the price. Whop takes 3% + Stripe
// 2.7% + $0.30 on every charge, so at 35 members the community was $27 short of
// its own $710 prize pool. Every member count below is solved on money that
// actually reaches the account.
export const PROCESSOR_PCT = 0.03 + 0.027;
export const PROCESSOR_FIXED = 0.30;

/** What lands in the account for one Circle charge. */
export function netPerMember(price: number): number {
  return Math.max(0, price - (price * PROCESSOR_PCT + PROCESSOR_FIXED));
}

/** How much the processor takes across a cohort — shown, never hidden. */
export function feeDrag(price: number, members: number): number {
  return price * members - netPerMember(price) * members;
}

export type FundingInputs = {
  circlePrice: number;
  members: number;
  toolsMonthly: number;
  prizeTarget: number;
  oneTimeMonthly: number; // $28 first shot + $35 GOOD + $89 BETTER sales, estimated per month
  reservePct: number;
};

export type FundingModel = {
  inputs: FundingInputs;
  circleRevenue: number;
  totalRevenue: number;
  breakEvenMembers: number;
  recommendedMembers: number;
  breakEvenRaw: number;
  recommendedRaw: number;
  netPerMember: number;
  netRevenue: number;
  feeDrag: number;
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
    circlePrice: n("TIER_CIRCLE_PRICE", 26),
    members: membersFromDb ?? n("FUNDING_MEMBERS", 0),
    toolsMonthly: n("FUNDING_TOOLS_MONTHLY", 165),
    prizeTarget: n("FUNDING_PRIZE_TARGET", 710),
    oneTimeMonthly: n("FUNDING_ONE_TIME_MONTHLY", 0),
    reservePct: n("FUNDING_RESERVE_PCT", 12.5),
  };
}

/** Wardley-style arithmetic: what the community must actually carry. */
export function computeFunding(inputs: FundingInputs): FundingModel {
  const annualBillsEarly =
    n("ANNUAL_TUBEGEN", 29 * 12 * 0.8) +
    n("ANNUAL_HIGGSFIELD", 29 * 12 * 0.8) +
    n("ANNUAL_BUFFER", 60 * 12 * 0.8) +
    n("ANNUAL_OPUSCLIP", 15 * 12 * 0.8);
  const annualFundPerMonth = Math.ceil(annualBillsEarly / 12);

  const circleRevenue = inputs.circlePrice * inputs.members;
  const totalRevenue = circleRevenue + inputs.oneTimeMonthly;

  // NET per member — the only number that can pay a bill.
  const perMemberNet = netPerMember(inputs.circlePrice);

  // Break-even: tools + prizes must be covered by money that actually arrives.
  const breakEvenRaw = Math.ceil((inputs.toolsMonthly + inputs.prizeTarget) / Math.max(perMemberNet, 1));
  // Recommended: tools + prizes + the annual fund, plus a 10% buffer so one bad
  // month does not put the operation back on the owner's card.
  const recommendedRaw = Math.ceil(
    ((inputs.toolsMonthly + inputs.prizeTarget + annualFundPerMonth) * 1.1) / Math.max(perMemberNet, 1)
  );
  // Snap UP to the next 8-aligned member count (never down — a floor has to stay a floor).
  const breakEvenMembers = nextEight(breakEvenRaw);
  const recommendedMembers = nextEight(Math.max(recommendedRaw, breakEvenMembers));

  const netRevenue = perMemberNet * inputs.members;
  const feesPaid = feeDrag(inputs.circlePrice, inputs.members);
  const afterTools = Math.max(0, netRevenue - inputs.toolsMonthly);
  const prizePool = Math.min(inputs.prizeTarget, afterTools);
  const reserve = Math.max(0, afterTools - prizePool);

  // Annual-only bills: 20% cheaper than monthly when prepaid.
  const annualBills = annualBillsEarly;
  const buckets = [
    {
      name: "Tools & engines",
      amount: Math.min(netRevenue, inputs.toolsMonthly),
      pct: netRevenue > 0 ? Math.round((Math.min(netRevenue, inputs.toolsMonthly) / netRevenue) * 100) : 0,
      note: "Vercel · Neon · n8n · Claude · Grok · R2 · OpusClip · Higgsfield · Buffer",
    },
    {
      name: "Community prizes",
      amount: prizePool,
      pct: netRevenue > 0 ? Math.round((prizePool / netRevenue) * 100) : 0,
      note: "WWS prizes · pod bonuses — scales with members, never fixed if revenue is short",
    },
    {
      name: "Annual renewal fund",
      amount: Math.min(reserve, annualFundPerMonth),
      pct: netRevenue > 0 ? Math.round((Math.min(reserve, annualFundPerMonth) / netRevenue) * 100) : 0,
      note: "Pre-funds the annual prepay so month-12 bills never dip into your pocket",
    },
    {
      name: "Reserve / refunds",
      amount: Math.max(0, reserve - Math.min(reserve, annualFundPerMonth)),
      pct: netRevenue > 0 ? Math.round((Math.max(0, reserve - Math.min(reserve, annualFundPerMonth)) / netRevenue) * 100) : 0,
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
    breakEvenRaw,
    recommendedRaw,
    netPerMember: Math.round(perMemberNet * 100) / 100,
    netRevenue: Math.round(netRevenue * 100) / 100,
    feeDrag: Math.round(feesPaid * 100) / 100,
    prizePool,
    reserve,
    toolsCovered: Math.min(netRevenue, inputs.toolsMonthly),
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
