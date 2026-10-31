// ADAPTABLE CONFIG — single source of truth, fully env-overrideable
// Edit via .env.local or Vercel env, NO code change needed to re-niche/re-price/re-threshold

import adaptableDefaults from "../config/adaptable.json";

function n(env: string, fallback: number) {
  const v = process.env[env];
  return v !== undefined && v !== "" ? Number(v) : fallback;
}
function s(env: string, fallback: string) {
  const v = process.env[env];
  return v !== undefined && v !== "" ? v : fallback;
}
function arr(env: string, fallback: string[]) {
  const v = process.env[env];
  return v ? v.split(",").map(x=>x.trim()).filter(Boolean) : fallback;
}

const a: any = adaptableDefaults;

export const CONFIG = {
  niches: {
    pool: arr("NICHES_POOL", a.niches.default_pool),
    strategy: s("NICHES_STRATEGY", a.niches.strategy),
    source: a.niches.source,
  },
  thresholds: {
    ratio_green: n("THRESHOLD_RATIO_GREEN", a.thresholds.ratio_green),
    ratio_amber_max: n("THRESHOLD_RATIO_AMBER_MAX", a.thresholds.ratio_amber_max),
    er_green: n("THRESHOLD_ER_GREEN", a.thresholds.er_green),
    er_amber_min: n("THRESHOLD_ER_AMBER_MIN", a.thresholds.er_amber_min),
    er_amber_max: n("THRESHOLD_ER_AMBER_MAX", a.thresholds.er_amber_max),
    er_red_min: n("THRESHOLD_ER_RED_MIN", a.thresholds.er_red_min),
    buyer_pool_min: n("THRESHOLD_BUYER_POOL_MIN", a.thresholds.buyer_pool_min),
    demand_percent: n("THRESHOLD_DEMAND_PERCENT", a.thresholds.demand_percent),
    demand_min_replies: n("THRESHOLD_DEMAND_MIN_REPLIES", a.thresholds.demand_min_replies),
    comment_to_dm_window_hours: n("THRESHOLD_DM_WINDOW_HOURS", a.thresholds.comment_to_dm_window_hours),
  },
  content: {
    channels: arr("PLATFORMS", (a.content.channels||[])),
    x_daily: n("BUFFER_X_DAILY", 2),
    serious_daily: n("BUFFER_SERIOUS_DAILY", 6),
    x_mode: s("X_MODE", a.content.x_mode),
    engine: s("CONTENT_ENGINE", a.content.engine),
    words_per_longform: n("CONTENT_WORDS_LONGFORM", a.content.words_per_longform),
    scripts_per_domain: n("CONTENT_SCRIPTS_PER_DOMAIN", a.content.scripts_per_domain),
  },
  conversion: {
    chatfuel: s("CHATFUEL_SCOPE", a.conversion.chatfuel),
    manychat_yt: a.conversion.manychat,
    hard_rules_ref: "reference/SHADOW_OPERATION_RULES.md",
  },
  paywalls: {
    ladder_display: s("WHOP_LADDER_PRICES", a.paywalls.ladder),
    good: s("TIER_GOOD_PRICE", "27"),
    better: s("TIER_BETTER_PRICE", "79"),
    best: s("TIER_BEST_PRICE", "79"),
    circle: s("TIER_CIRCLE_PRICE", "19"),
    lite: s("TIER_LITE_PRICE", "9"),
    pro: s("TIER_PRO_PRICE", "29"),
    team: s("TIER_TEAM_PRICE", "59"),
    good_label: "GOOD",
    better_label: "BETTER",
    best_label: "BEST",
  },
  scale: {
    pages_count: n("PAGES_COUNT", a.scale.pages_count || 5),
    pages_label: s("PAGES_LABEL", "YT brands"),
    mvp_monthly: n("COST_MVP_MONTHLY", a.scale.mvp ? 61 : 61),
    scale_monthly: n("COST_SCALE_MONTHLY", 189),
  },
  social: {
    master_email: s("SOCIAL_MASTER_EMAIL", a.accounts.social_master),
    admin_email: s("ADMIN_EMAIL", a.accounts.admin_master),
  },
  voice: {
    jive_number_env: "JIVE_JARVIS_NUMBER",
    jive_display: a.voice.vesper.includes("+254") ? "+25418XXXX710 (env only)" : "env JIVE_JARVIS_NUMBER",
  },
  crons: {
    check_replies: s("CRON_CHECK_REPLIES", "*/15 * * * *"),
    daily_brief: s("CRON_DAILY_BRIEF", "45 5 * * *"),
  },
} as const;

export function gateFromMetrics(ratio: number, er: number) {
  const t = CONFIG.thresholds;
  if (ratio < t.ratio_green && er >= t.er_green) return "GREEN";
  if (ratio <= t.ratio_amber_max && er >= t.er_amber_min && er < t.er_amber_max + 0.01) return "AMBER";
  return "RED";
}
