// STANDARD — price to performance, in the long term, at speed, with the value held.
//
// Why this file exists:
//   The operation does not fail from lack of ideas. It fails from paying full price for
//   partial output, and from calling speed a win when the fast thing was blocked anyway.
//   So every purchase, page, tool and workflow is judged on five ratios — not on vibes,
//   not on a dashboard that averages a dead page into a live one.
//
// The five, in the order they can kill you:
//   1. COST PER ASSET      what one usable clip actually costs
//   2. PAYBACK             how many members it takes to pay the stack
//   3. LTV / CAC           does a member pay back three times what they cost
//   4. SPEED (GATED)       assets that SHIPPED per hour — blocked assets score zero
//   5. LEVERAGE            how many pieces one idea becomes. This is the whole moat.
//
// Long term is a constraint, not an aspiration: a page that pays back in 3 months but
// churns in 10 does not "outperform" — it just fails slower. Hence LTV, not revenue.

export type Inputs = {
  /** monthly spend on tools/render/publish */
  stack: number;
  /** monthly fixed cost that exists whether or not this page runs */
  fixed: number;
  /** net per member after platform + card fees */
  net_per_member: number;
  /** monthly churn as a percentage, e.g. 2.0 */
  churn_pct: number;
  /** assets that passed the gate this month */
  assets_shipped: number;
  /** assets produced this month, including blocked/retried */
  assets_produced: number;
  /** hours of human time this month */
  hours: number;
  /** surfaces fed by those assets (6 channels x pages) */
  surfaces: number;
  /** distinct IDEAS scripted this month. Leverage is measured per idea, never per clip —
   *  a clip that feeds one surface is just a clip. One idea must feed many surfaces. */
  ideas: number;
  /** recognised revenue this month */
  revenue: number;
};

export const CEILINGS = {
  /** the stack may never be more than this share of revenue — past it you are working for SaaS */
  stack_share_max: 0.3,
  /** a member must return 3x their cost, or acquisition is just buying churn */
  ltv_cac_min: 3,
  /** the member must get at least 3x the price in usable output, or $44 is a resentment */
  price_to_value_min: 3,
  /** effective assets per human hour — below this, you are the bottleneck */
  assets_per_hour_min: 2,
  /** one asset must feed at least this many surfaces, or every surface is a separate job */
  leverage_min: 3,
  /** payback in members. Above this the stack is a subscription, not a tool */
  payback_members_max: 12,
};

export type Row = { metric: string; value: number; unit: string; ceiling: string; pass: boolean; why: string };

export function costPerAsset(i: Inputs) {
  return i.assets_shipped > 0 ? round2(i.stack / i.assets_shipped) : Infinity;
}

export function paybackMembers(i: Inputs) {
  return i.net_per_member > 0 ? round2(i.stack / i.net_per_member) : Infinity;
}

export function ltv(i: Inputs) {
  return i.churn_pct > 0 ? round2(i.net_per_member / (i.churn_pct / 100)) : Infinity;
}

export function memberCost(i: Inputs) {
  // Our CAC is time and tooling, not ad spend — so it is the stack divided by the members
  // it actually produced. A page that added zero members has infinite CAC by definition.
  const members = i.revenue > 0 && i.net_per_member > 0 ? Math.max(1, Math.round(i.revenue / i.net_per_member)) : 0;
  return members > 0 ? round2((i.stack + i.fixed) / members) : Infinity;
}

/** Blocked assets are not speed. They are cost. */
export function gatedSpeed(i: Inputs) {
  return i.hours > 0 ? round2(i.assets_shipped / i.hours) : 0;
}

/**
 * Leverage = pieces produced from one idea.
 * One script should become a longform, a batch of shorts and a social cut — the render is
 * cheap, the thinking is not. Below 3 pieces per idea you are paying for ideas, not using them.
 */
export function leverage(i: Inputs) {
  return i.ideas > 0 ? round2(i.assets_shipped / i.ideas) : 0;
}

export function priceToValue(price: number, monthlyValue: number) {
  return price > 0 ? round2(monthlyValue / price) : 0;
}

/**
 * The scorecard. Five rows, each either passes or names the reason it failed.
 * A single failed row means the thing does not ship — not that it ships with a warning.
 */
export function scorecard(i: Inputs): { pass: boolean; score: number; rows: Row[]; verdict: string } {
  const cpa = costPerAsset(i);
  const payback = paybackMembers(i);
  const life = ltv(i);
  const cac = memberCost(i);
  const speed = gatedSpeed(i);
  const lev = leverage(i);
  const share = i.revenue > 0 ? i.stack / i.revenue : 1;
  const retain = i.churn_pct > 0 ? life / Math.max(cac, 0.01) : 0;
  // when there are no members yet, LTV/CAC is not measurable — say so instead of pretending
  const noMembers = !Number.isFinite(cac);

  const rows: Row[] = [
    {
      metric: "cost per asset",
      value: cpa,
      unit: "$",
      ceiling: "$3.00",
      pass: cpa <= 3,
      why: "the render is supposed to be cheaper than the edit",
    },
    {
      metric: "payback",
      value: payback,
      unit: "members",
      ceiling: `<= ${CEILINGS.payback_members_max}`,
      pass: payback <= CEILINGS.payback_members_max,
      why: "if the stack needs more members than you can get, the stack is the business",
    },
    {
      metric: "LTV / CAC",
      value: noMembers ? 0 : round2(retain),
      unit: "x",
      ceiling: `>= ${CEILINGS.ltv_cac_min}x`,
      pass: noMembers ? false : retain >= CEILINGS.ltv_cac_min,
      why: noMembers ? "no paying member yet — unmeasurable, and unmeasurable is not a pass" : "under 3x you are buying churn",
    },
    {
      metric: "gated speed",
      value: speed,
      unit: "shipped/hr",
      ceiling: `>= ${CEILINGS.assets_per_hour_min}`,
      pass: speed >= CEILINGS.assets_per_hour_min,
      why: `${i.assets_produced - i.assets_shipped} blocked or retried assets counted as zero`,
    },
    {
      metric: "leverage",
      value: lev,
      unit: "assets/idea",
      ceiling: `>= ${CEILINGS.leverage_min}`,
      pass: lev >= CEILINGS.leverage_min,
      why: "one idea must become at least three pieces, or every piece is a new idea",
    },
    {
      metric: "stack share",
      value: round2(share * 100),
      unit: "% of revenue",
      ceiling: `<= ${CEILINGS.stack_share_max * 100}%`,
      pass: share <= CEILINGS.stack_share_max,
      why: "past 30% the tools own the upside, not you",
    },
  ];

  const passed = rows.filter((r) => r.pass).length;
  const failed = rows.filter((r) => !r.pass);
  return {
    pass: failed.length === 0,
    score: Math.round((passed / rows.length) * 100),
    rows,
    verdict: failed.length === 0 ? "passes — ship it" : `fails ${failed.length}: ${failed.map((f) => f.metric).join(", ")}`,
  };
}

/**
 * Worst-first. The portfolio is judged by its weakest page, never its average —
 * an average is how one dead page hides behind four alive ones.
 */
export function worstFirst(pages: { page: string; revenue: number; cost: number; churn_pct: number }[]) {
  const withMargin = pages
    .map((p) => ({ ...p, margin: round2(p.revenue - p.cost) }))
    .sort((a, b) => a.margin - b.margin);
  return {
    worst: withMargin[0] ?? null,
    negative: withMargin.filter((p) => p.margin < 0),
    // deliberately not an average: summing revenue across pages flatters the portfolio
    total: round2(withMargin.reduce((s, p) => s + p.margin, 0)),
  };
}

/** Break-even at a given price, net of Whop's 3% + 2.7% + $0.30. Kept here so pages can ask. */
export function netPerMember(price: number, platform_pct = 3, card_pct = 2.7, flat = 0.3) {
  return round2(price * (1 - (platform_pct + card_pct) / 100) - flat);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export const RATIONALE = [
  "Price to performance is the ratio you can defend in a board meeting: dollars out over usable assets in.",
  "Long term is churn, not revenue. A $44 member who leaves in 10 months is worth half a $44 member who stays 50.",
  "Speed only counts after the gate. The fastest way to fail is to ship everything.",
  "Leverage is the only honest form of speed: one scan, one script, two cuts, six surfaces.",
];
