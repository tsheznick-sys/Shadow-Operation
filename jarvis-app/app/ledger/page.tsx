import { fmt } from "@/lib/ledger";
import { ledgerLayers, readGlobal, readRevenue } from "@/lib/global-ledger";

export const dynamic = "force-dynamic";

export default async function LedgerPage() {
  const { lines, totals, latest, source } = await readGlobal();
  const layers = ledgerLayers();
  const live = source === "neon" && lines.length > 0;
  const shared = await readRevenue("public");

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <div className="text-[11px] uppercase tracking-widest text-teal-400">Global Live Ledger</div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className={`inline-block h-2 w-2 rounded-full ${live ? "bg-teal-400 animate-pulse" : "bg-zinc-600"}`} />
          {live ? "live" : "no data"} · totals {Math.round(layers.totals_refresh_seconds / 60)}m · audited rows {layers.lag_hours}h
        </div>
      </div>

      <h1 className="text-3xl font-black mb-2">Every brand. Every platform. Every day.</h1>
      <p className="text-sm text-zinc-400 max-w-3xl mb-6">
        One public ledger for the whole operation. It is written by Jarvis from Buffer, Instagram, TikTok and YouTube
        analytics — never typed by a human. Totals refresh every {Math.round(layers.totals_refresh_seconds / 60)}{" "}
        minutes because a cumulative number cannot be cherry-picked; the audited daily rows stay sealed for{" "}
        {layers.lag_hours} hours so no single day can be edited after the fact.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          ["Brands", fmt(totals.brands)],
          ["Channels", fmt(totals.channels)],
          ["Posts shipped", fmt(totals.posts)],
          ["Days live", fmt(totals.days_live)],
          ["Views", fmt(totals.views)],
          ["Comments", fmt(totals.comments)],
          ["Replies", fmt(totals.replies)],
          ["Paid buyers", fmt(totals.buyers)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">{k}</div>
            <div className="text-xl font-bold text-zinc-100">{v}</div>
          </div>
        ))}
      </div>

      {!live ? (
        <div className="rounded-2xl border border-amber-600/40 bg-amber-500/5 p-5 mb-6">
          <div className="font-bold text-amber-400 text-sm mb-1">The ledger is empty, and it says so.</div>
          <p className="text-xs text-zinc-400">
            No brand has published a day yet. Rather than seed this page with invented traffic, it stays empty until WF9
            writes the first real row. An empty honest ledger is worth more than a full dishonest one.
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-800 overflow-hidden mb-6">
        <div className="bg-zinc-900/70 px-3 py-2 text-xs font-bold text-zinc-300">All brands</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-zinc-500">
              <tr>
                <th className="text-left p-2.5">Brand</th>
                <th className="text-left p-2.5">Platform</th>
                <th className="text-right p-2.5">Posts</th>
                <th className="text-right p-2.5">Views</th>
                <th className="text-right p-2.5">ER %</th>
                <th className="text-right p-2.5">Comments</th>
                <th className="text-right p-2.5">Replies</th>
                <th className="text-right p-2.5">Trend</th>
                <th className="text-right p-2.5">Last day</th>
              </tr>
            </thead>
            <tbody>
              {live ? (
                lines.map((l) => (
                  <tr key={`${l.brand}-${l.platform}`} className="border-t border-zinc-900">
                    <td className="p-2.5 text-zinc-200">{l.brand}</td>
                    <td className="p-2.5 text-zinc-500">{l.platform}</td>
                    <td className="p-2.5 text-right text-zinc-300">{fmt(l.posts)}</td>
                    <td className="p-2.5 text-right text-zinc-100 font-semibold">{fmt(l.views)}</td>
                    <td className={`p-2.5 text-right ${Number(l.er_pct) >= 5 ? "text-teal-400" : "text-amber-400"}`}>
                      {Number(l.er_pct).toFixed(2)}
                    </td>
                    <td className="p-2.5 text-right text-zinc-300">{fmt(l.comments)}</td>
                    <td className="p-2.5 text-right text-zinc-300">{fmt(l.replies)}</td>
                    <td className={`p-2.5 text-right ${l.trend > 0 ? "text-teal-400" : l.trend < 0 ? "text-red-400" : "text-zinc-500"}`}>
                      {l.trend > 0 ? "+" : ""}
                      {l.trend}%
                    </td>
                    <td className="p-2.5 text-right text-zinc-600">{l.last_day}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-zinc-900">
                  <td colSpan={9} className="p-8 text-center text-zinc-600">
                    Awaiting the first day from WF9. Nothing is fabricated to fill this space.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {live && latest.length ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 mb-6">
          <div className="text-xs font-bold text-zinc-300 mb-2">Latest entries</div>
          <ul className="space-y-1 text-[11px] text-zinc-500">
            {latest.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-zinc-600">day {e.day}</span>
                <span className="text-zinc-300">{e.brand}</span>
                <span>·</span>
                <span>{e.platform}</span>
                <span>·</span>
                <span>{fmt(e.views)} views</span>
                {e.note ? <span className="text-zinc-600">· {e.note}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
          <div className="text-xs font-bold text-zinc-300">Revenue</div>
          <div className="text-[11px] text-zinc-500">admin only · per-brand opt-in</div>
        </div>
        {shared.rows.length ? (
          <ul className="space-y-1 text-xs">
            {shared.rows.map((r) => (
              <li key={r.brand} className="flex justify-between text-zinc-400">
                <span className="text-zinc-200">{r.brand}</span>
                <span>
                  ${fmt(Number(r.revenue))} · {fmt(r.buyers)} buyers <span className="text-teal-500">· shared by choice</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-500">
            No brand has chosen to publish its revenue yet — so none is shown. Publishing someone&apos;s numbers without
            their consent is not transparency, it is a leak. The owner sees every brand in <span className="font-mono text-zinc-400">/money</span>.
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl border border-teal-700/40 bg-teal-500/5 p-4">
          <div className="font-bold text-teal-300 mb-1">Why public</div>
          <p className="text-zinc-400">
            Every competitor in this niche hands out free templates and screenshots their wins. A ledger cannot be
            screenshotted into a lie — anyone can open the channel and check.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-zinc-200 mb-1">Failures stay</div>
          <p className="text-zinc-400">
            {layers.show_failures
              ? "A flop stays on the page with its note. A RED demand test is published as RED."
              : "Failure rows are currently hidden — turning this off weakens the only signal that matters."}
          </p>
          <p className="text-[11px] text-zinc-600 mt-1">
            Revenue is the one exception: it is admin-only until a brand opts itself in.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-zinc-200 mb-1">Embed it anywhere</div>
          <p className="text-zinc-400">
            <span className="font-mono text-teal-300">GET /api/ledger</span> returns the same numbers as JSON, so the five
            pages — and any prospect — can pull live proof instead of being shown a slide.
          </p>
        </div>
      </div>
    </div>
  );
}
