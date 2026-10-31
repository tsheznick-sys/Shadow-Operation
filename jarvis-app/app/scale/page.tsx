import { CLIP_COST_CEILING, GRAD_MIN_BUYERS, GRAD_MIN_DAYS, KILL_AFTER_FAILS, MAX_PAGES, PARALLEL_CAP, cloneBrief, parallelAllowance, portfolio, readPortfolio } from "@/lib/scaleout";

export const dynamic = "force-dynamic";

export default async function ScalePage() {
  const { lanes, source } = await readPortfolio();
  const live = source === "neon" && lanes.length > 0;
  const p = portfolio(lanes);
  const allowance = parallelAllowance(p.graduated, p.live);
  const brief = cloneBrief({ page: "Page A", niche: "Finance behaviour", version: "v1" });

  const gates: [string, string][] = [
    ["Demand test", "50+ comments at 72h"],
    ["Time live", `${GRAD_MIN_DAYS} days`],
    ["Engagement", "ER ≥ 5% (7-day rolling)"],
    ["Buyer pool", "avg comments × 3 ≥ 3,000"],
    ["Real buyers", `${GRAD_MIN_BUYERS} paying`],
    ["Churn", "≤ 2.0%"],
    ["Cost per clip", `≤ $${CLIP_COST_CEILING}`],
    ["Hook bank", "5 proven hooks"],
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2 text-[11px] uppercase tracking-widest text-teal-400">Scale-Out</div>
      <h1 className="text-3xl font-black mb-2">A page earns the right to be copied.</h1>
      <p className="text-sm text-zinc-400 max-w-3xl mb-6">
        Cloning before proof multiplies losses at exactly the speed it multiplies wins. So a page graduates first, its
        template is frozen, and only then does it run in parallel.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          ["Live pages", `${p.live}/${MAX_PAGES}`],
          ["Graduated", String(p.graduated)],
          ["Self-funding", String(p.self_funding)],
          ["Margin", `$${p.margin.toLocaleString("en-US")}`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">{k}</div>
            <div className="text-xl font-bold text-zinc-100">{v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-teal-700/40 bg-teal-500/5 p-4 mb-6">
        <div className="text-xs uppercase tracking-wide text-teal-400 mb-1">Parallel allowance</div>
        <div className="text-sm text-zinc-200">
          Cap <span className="font-bold text-teal-300">{allowance.cap} pages</span> · can clone{" "}
          <span className="font-bold text-teal-300">{allowance.canClone}</span> now
        </div>
        <p className="text-[11px] text-zinc-500 mt-1">{allowance.reason}</p>
        <p className="text-[11px] text-zinc-600 mt-1">
          The cap lifts on proof, never on ambition: {PARALLEL_CAP} → 6 → {MAX_PAGES} pages.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 overflow-hidden mb-6">
        <div className="bg-zinc-900/70 px-3 py-2 text-xs font-bold text-zinc-300">Portfolio — revenue per page, never an average</div>
        <table className="w-full text-xs">
          <thead className="text-zinc-500">
            <tr>
              <th className="text-left p-2.5">Page</th>
              <th className="text-left p-2.5">Niche</th>
              <th className="text-left p-2.5">Status</th>
              <th className="text-right p-2.5">Revenue</th>
              <th className="text-right p-2.5">Cost</th>
              <th className="text-left p-2.5">Self-funding</th>
            </tr>
          </thead>
          <tbody>
            {live ? (
              lanes.map((l) => (
                <tr key={l.page} className="border-t border-zinc-900">
                  <td className="p-2.5 text-zinc-200">{l.page}</td>
                  <td className="p-2.5 text-zinc-500">{l.niche}</td>
                  <td className="p-2.5 text-zinc-400">{l.status}</td>
                  <td className="p-2.5 text-right text-zinc-300">${Number(l.revenue).toLocaleString("en-US")}</td>
                  <td className="p-2.5 text-right text-zinc-500">${Number(l.cost).toLocaleString("en-US")}</td>
                  <td className={`p-2.5 ${l.revenue > l.cost ? "text-teal-400" : "text-amber-400"}`}>
                    {l.revenue > l.cost ? "yes" : "no"}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-zinc-900">
                <td colSpan={6} className="p-8 text-center text-zinc-600">
                  No page has graduated yet. Nothing is cloned until one does.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-sm text-zinc-100 mb-2">Graduation gates — all eight</div>
          <ul className="space-y-1 text-xs">
            {gates.map(([k, v]) => (
              <li key={k} className="flex justify-between text-zinc-400">
                <span>{k}</span>
                <span className="text-zinc-500">{v}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-zinc-600 mt-2">
            Miss one and the page stays a page. Not a template, not a clone.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-sm text-zinc-100 mb-2">What a clone copies — and what it cannot</div>
          <div className="text-[10px] uppercase tracking-wide text-teal-400 mb-1">Copies</div>
          <p className="text-xs text-zinc-400 mb-2">{brief.copies.join(" · ")}</p>
          <div className="text-[10px] uppercase tracking-wide text-red-400 mb-1">Never copies</div>
          <p className="text-xs text-zinc-400 mb-2">{brief.never_copies.join(" · ")}</p>
          <p className="text-[11px] text-zinc-500 italic">“{brief.honesty_line}”</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-zinc-200 mb-1">Isolation</div>
          <p className="text-zinc-400">
            One credential set, one R2 prefix, one Buffer group and one budget per page. A bad page cannot poison the
            others — which is the only reason running them in parallel is safe.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-zinc-200 mb-1">Kill rule</div>
          <p className="text-zinc-400">
            A clone that fails its 72h demand test {KILL_AFTER_FAILS}× is archived, not nursed. The sunk cost is bounded by
            design — no page gets rescued out of sentiment.
          </p>
          {p.to_kill.length ? <p className="text-red-400 mt-1">Due to archive: {p.to_kill.join(", ")}</p> : null}
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-zinc-200 mb-1">Niche distance</div>
          <p className="text-zinc-400">
            A new page must sit at least two niches away until the playbook holds 5 proven hooks per niche. Otherwise the
            clones compete for the same audience and the same comments.
          </p>
        </div>
      </div>
    </div>
  );
}
