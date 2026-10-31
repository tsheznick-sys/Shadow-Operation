import { fmt, ledgerLagHours, readLedger } from "@/lib/ledger";

export const dynamic = "force-dynamic";

export default async function ProofPage() {
  const { rows, totals, source } = await readLedger();
  const lag = ledgerLagHours();
  const live = source === "neon" && rows.length > 0;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2 text-[11px] uppercase tracking-widest text-teal-400">The Open Ledger</div>
      <h1 className="text-3xl font-black mb-2">Every number, including the bad ones.</h1>
      <p className="text-sm text-zinc-400 max-w-3xl mb-1">
        These are the real numbers of the real channels — views, engagement, comments, replies and revenue. Nothing is
        hand-typed, nothing is cherry-picked, and failures stay visible.
      </p>
      <p className="text-xs text-zinc-600 max-w-3xl mb-6">
        Refreshed from Neon with a {lag}-hour lag so no number can be edited afterwards.{" "}
        <span className="text-zinc-500">
          Check any channel yourself — that is the whole point. Screenshots can be faked; a live channel cannot.
        </span>
      </p>

      {!live ? (
        <div className="rounded-2xl border border-amber-600/40 bg-amber-500/5 p-5 mb-6">
          <div className="font-bold text-amber-400 text-sm mb-1">Ledger is empty — and we say so.</div>
          <p className="text-xs text-zinc-400">
            No rows are published yet. Rather than fill this page with invented numbers, it stays empty until WF9 writes
            the first real day. That is the difference between this and a screenshot.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          ["Brands live", fmt(totals.brands)],
          ["Channels", fmt(totals.channels)],
          ["Posts shipped", fmt(totals.posts_shipped)],
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

      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-zinc-900/70 text-zinc-400">
            <tr>
              <th className="text-left p-2.5">Brand</th>
              <th className="text-left p-2.5">Platform</th>
              <th className="text-right p-2.5">Day</th>
              <th className="text-right p-2.5">Posted</th>
              <th className="text-right p-2.5">Views</th>
              <th className="text-right p-2.5">ER %</th>
              <th className="text-right p-2.5">Comments</th>
              <th className="text-right p-2.5">Replies</th>
              <th className="text-left p-2.5">Note</th>
            </tr>
          </thead>
          <tbody>
            {live ? (
              rows.map((r, i) => (
                <tr key={`${r.brand}-${r.platform}-${r.day}-${i}`} className="border-t border-zinc-900">
                  <td className="p-2.5 text-zinc-200">{r.brand}</td>
                  <td className="p-2.5 text-zinc-400">{r.platform}</td>
                  <td className="p-2.5 text-right text-zinc-500">{r.day}</td>
                  <td className="p-2.5 text-right text-zinc-300">{r.posted}</td>
                  <td className="p-2.5 text-right text-zinc-300">{fmt(r.views)}</td>
                  <td className={`p-2.5 text-right ${Number(r.er_pct) >= 5 ? "text-teal-400" : "text-amber-400"}`}>
                    {Number(r.er_pct).toFixed(2)}
                  </td>
                  <td className="p-2.5 text-right text-zinc-300">{fmt(r.comments)}</td>
                  <td className="p-2.5 text-right text-zinc-300">{fmt(r.replies)}</td>
                  <td className="p-2.5 text-zinc-500">{r.note}</td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-zinc-900">
                <td colSpan={9} className="p-6 text-center text-zinc-600">
                  Awaiting the first day from WF9. Nothing is fabricated to fill this space.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl border border-teal-700/40 bg-teal-500/5 p-4">
          <div className="font-bold text-teal-300 mb-1">Why this exists</div>
          <p className="text-zinc-400">
            Every competitor gives away 300+ prompts and a full AI stack. Free information is worthless in 2026 — so the
            only ground left is proof a buyer can check themselves.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-zinc-200 mb-1">What it will not do</div>
          <p className="text-zinc-400">
            No borrowed case studies. Niche results do not transfer — a finance channel&apos;s win is not proof for a
            psychology channel. This ledger only ever shows our own channels.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-zinc-200 mb-1">Failures included</div>
          <p className="text-zinc-400">
            A day that flopped stays on the page with a note. If a brand gets RED on the demand test, it is published as
            RED. Trust is the absence of hiding, not the presence of wins.
          </p>
        </div>
      </div>
    </div>
  );
}
