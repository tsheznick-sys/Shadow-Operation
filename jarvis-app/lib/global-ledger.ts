// GLOBAL LIVE LEDGER — every brand, every platform, one honest feed.
// Public by default, 24h lag, failures included. Nothing here is ever hand-typed.
import { ledgerLagHours } from "./ledger";

export type BrandLine = {
  brand: string;
  platform: string;
  views: number;
  er_pct: number;
  comments: number;
  replies: number;
  posts: number;
  last_day: number;
  trend: number; // views today vs the day before
};

export type GlobalTotals = {
  brands: number;
  channels: number;
  posts: number;
  views: number;
  comments: number;
  replies: number;
  buyers: number;
  revenue: number;
  days_live: number;
};

const EMPTY: GlobalTotals = {
  brands: 0, channels: 0, posts: 0, views: 0, comments: 0, replies: 0, buyers: 0, revenue: 0, days_live: 0,
};

export function ledgerLayers() {
  return {
    lag_hours: ledgerLagHours(),
    public: (process.env.PROOF_PUBLIC || "true").toLowerCase() !== "false",
    show_failures: (process.env.PROOF_INCLUDE_FAILURES || "true").toLowerCase() !== "false",
    refresh_seconds: Number(process.env.LEDGER_REFRESH_SECONDS || 60),
  };
}

/** Per-brand line: cumulative numbers plus the last recorded day and its trend. */
export async function readGlobal(): Promise<{
  lines: BrandLine[];
  totals: GlobalTotals;
  latest: { brand: string; platform: string; day: number; views: number; note: string }[];
  source: "neon" | "empty";
}> {
  try {
    const { getSql } = await import("./db");
    const sql = getSql();
    if (!sql) return { lines: [], totals: EMPTY, latest: [], source: "empty" };

    const lag = ledgerLagHours();
    const lines = (await sql`
      WITH scoped AS (
        SELECT * FROM public_ledger
        WHERE recorded_at <= now() - (${lag} || ' hours')::interval
      ),
      last AS (
        SELECT DISTINCT ON (brand, platform) brand, platform, views, day
        FROM scoped ORDER BY brand, platform, day DESC
      ),
      prev AS (
        SELECT DISTINCT ON (brand, platform) brand, platform, views
        FROM scoped
        WHERE day < (SELECT MAX(day) FROM scoped)
        ORDER BY brand, platform, day DESC
      )
      SELECT
        s.brand,
        s.platform,
        COALESCE(SUM(s.views), 0)::bigint          AS views,
        COALESCE(AVG(NULLIF(s.er_pct, 0)), 0)::numeric(6,2) AS er_pct,
        COALESCE(SUM(s.comments), 0)::int          AS comments,
        COALESCE(SUM(s.replies), 0)::int           AS replies,
        COALESCE(SUM(s.posted), 0)::int            AS posts,
        COALESCE(MAX(s.day), 0)::int               AS last_day,
        CASE WHEN COALESCE(p.views, 0) > 0
             THEN ROUND(((COALESCE(l.views, 0) - p.views)::numeric / p.views) * 100)::int
             ELSE 0 END                            AS trend
      FROM scoped s
      LEFT JOIN last l ON l.brand = s.brand AND l.platform = s.platform
      LEFT JOIN prev p ON p.brand = s.brand AND p.platform = s.platform
      GROUP BY s.brand, s.platform, l.views, p.views
      ORDER BY views DESC
    `) as unknown as BrandLine[];

    const t = (await sql`
      SELECT
        COUNT(DISTINCT brand)::int      AS brands,
        COUNT(DISTINCT platform)::int   AS channels,
        COALESCE(SUM(posted), 0)::int   AS posts,
        COALESCE(SUM(views), 0)::bigint AS views,
        COALESCE(SUM(comments), 0)::int AS comments,
        COALESCE(SUM(replies), 0)::int  AS replies,
        0::int                          AS buyers,
        0::int                          AS revenue,
        COALESCE(MAX(day), 0)::int      AS days_live
      FROM public_ledger
      WHERE recorded_at <= now() - (${lag} || ' hours')::interval
    `) as unknown as GlobalTotals[];

    const latest = (await sql`
      SELECT brand, platform, day, views, COALESCE(note, '') AS note
      FROM public_ledger
      WHERE recorded_at <= now() - (${lag} || ' hours')::interval
      ORDER BY recorded_at DESC, day DESC
      LIMIT 12
    `) as unknown as { brand: string; platform: string; day: number; views: number; note: string }[];

    return { lines: lines || [], totals: t?.[0] || EMPTY, latest: latest || [], source: "neon" };
  } catch {
    return { lines: [], totals: EMPTY, latest: [], source: "empty" };
  }
}
