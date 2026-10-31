// THE OPEN LEDGER — public proof, fed from Neon.
// Honest by design: it shows the failures too. A ledger that only shows wins is a screenshot.
export type LedgerRow = {
  brand: string;
  platform: string;
  day: number;
  views: number;
  er_pct: number;
  comments: number;
  replies: number;
  posted: number;
  note: string;
};

export type LedgerTotals = {
  brands: number;
  channels: number;
  days_live: number;
  posts_shipped: number;
  views: number;
  comments: number;
  replies: number;
  buyers: number;
  revenue: number;
};

export function ledgerLagHours(): number {
  const v = Number(process.env.PROOF_LAG_HOURS || 24);
  return Number.isFinite(v) ? v : 24;
}

export function includeFailures(): boolean {
  return (process.env.PROOF_INCLUDE_FAILURES || "true").toLowerCase() !== "false";
}

export function isPublic(): boolean {
  return (process.env.PROOF_PUBLIC || "true").toLowerCase() !== "false";
}

/**
 * Reads the public ledger from Neon when it exists.
 * Returns the empty shape when the DB is not wired — never invents numbers.
 */
export async function readLedger(): Promise<{ rows: LedgerRow[]; totals: LedgerTotals; source: "neon" | "empty" }> {
  const empty: LedgerTotals = {
    brands: 0, channels: 0, days_live: 0, posts_shipped: 0,
    views: 0, comments: 0, replies: 0, buyers: 0, revenue: 0,
  };
  try {
    const { getSql } = await import("./db");
    const sql = getSql();
    if (!sql) return { rows: [], totals: empty, source: "empty" };

    const rows = (await sql`
      SELECT brand, platform, day, views, er_pct, comments, replies, posted, note
      FROM public_ledger
      WHERE recorded_at <= now() - (${ledgerLagHours()} || ' hours')::interval
      ORDER BY brand, day
    `) as unknown as LedgerRow[];

    const t = (await sql`
      SELECT
        COUNT(DISTINCT brand)::int        AS brands,
        COUNT(DISTINCT platform)::int     AS channels,
        COALESCE(MAX(day), 0)::int        AS days_live,
        COALESCE(SUM(posted), 0)::int     AS posts_shipped,
        COALESCE(SUM(views), 0)::int      AS views,
        COALESCE(SUM(comments), 0)::int   AS comments,
        COALESCE(SUM(replies), 0)::int    AS replies,
        0::int                            AS buyers,
        0::int                            AS revenue
      FROM public_ledger
      WHERE recorded_at <= now() - (${ledgerLagHours()} || ' hours')::interval
    `) as unknown as LedgerTotals[];

    return { rows: rows || [], totals: t?.[0] || empty, source: "neon" };
  } catch {
    return { rows: [], totals: empty, source: "empty" };
  }
}

export function fmt(n: number): string {
  return n.toLocaleString("en-US");
}
