import { STAGES, readReliability, stageMath } from "@/lib/reliability";

export const dynamic = "force-dynamic";

export default async function ReliabilityPage() {
  const { metrics, rows, source } = await readReliability();
  const math = stageMath();
  const naive = stageMath(0.98, 17);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2 text-[11px] uppercase tracking-widest text-teal-400">Reliability</div>
      <h1 className="text-3xl font-black mb-2">Three numbers. Never one headline.</h1>
      <p className="text-sm text-zinc-400 max-w-3xl mb-6">
        A single &ldquo;98%&rdquo; hides which part is failing — and the part that fails silently is the only one that
        costs money. So this board reports three separate targets and refuses to average them.
      </p>

      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {metrics.map((m) => {
          const pct = m.actual ?? 0;
          const c = m.actual === null ? "border-zinc-800 bg-zinc-900/40" : m.breached
            ? "border-red-600/50 bg-red-500/5"
            : "border-teal-700/50 bg-teal-500/5";
          return (
            <div key={m.key} className={`rounded-2xl border p-4 ${c}`}>
              <div className="text-[10px] uppercase tracking-wide text-zinc-500">{m.label}</div>
              <div className="flex items-baseline gap-2 mt-1">
                <div className={`text-3xl font-black ${m.actual === null ? "text-zinc-600" : m.breached ? "text-red-400" : "text-teal-400"}`}>
                  {m.actual === null ? "—" : `${m.actual}%`}
                </div>
                <div className="text-xs text-zinc-500">/ {m.target}%</div>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 mt-2 overflow-hidden">
                <div
                  className={`h-full ${m.breached ? "bg-red-500" : "bg-teal-400"}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">{m.note}</p>
              <p className="text-[10px] text-zinc-600 mt-1">
                {m.measured > 0 ? `${m.measured} actions measured · last 7 days` : "no actions measured yet"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-amber-700/40 bg-amber-500/5 p-4 mb-6">
        <div className="font-bold text-amber-300 text-sm mb-1">Why the chain was regrouped into 8 stages</div>
        <div className="grid md:grid-cols-2 gap-4 text-xs mt-2">
          <div className="text-zinc-400">
            <div className="text-[10px] uppercase tracking-wide text-red-400 mb-1">17 steps at 98% each</div>
            <div className="font-mono text-red-300 text-lg">{naive.end_to_end}% end-to-end</div>
            <p className="mt-1 text-zinc-500">
              To hit 98% across 17 steps every step must be <span className="text-zinc-300">{naive.needed_per_step}%</span>. Not a model you can buy.
            </p>
          </div>
          <div className="text-zinc-400">
            <div className="text-[10px] uppercase tracking-wide text-teal-400 mb-1">8 grouped, verified stages</div>
            <div className="font-mono text-teal-300 text-lg">{math.end_to_end}% end-to-end</div>
            <p className="mt-1 text-zinc-500">
              Needs <span className="text-zinc-300">{math.needed_per_step}%</span> per stage — which is what a rule gate plus one retry delivers.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 overflow-hidden mb-6">
        <div className="bg-zinc-900/70 px-3 py-2 text-xs font-bold text-zinc-300">The 8 verified stages</div>
        <table className="w-full text-xs">
          <thead className="text-zinc-500">
            <tr>
              <th className="text-left p-2.5 w-8">#</th>
              <th className="text-left p-2.5">Stage</th>
              <th className="text-left p-2.5">Workflows</th>
              <th className="text-left p-2.5">Verification</th>
            </tr>
          </thead>
          <tbody>
            {STAGES.map((s) => (
              <tr key={s.key} className="border-t border-zinc-900">
                <td className="p-2.5 text-zinc-600">{s.n}</td>
                <td className="p-2.5 text-zinc-200">{s.key}</td>
                <td className="p-2.5 text-zinc-500">{s.workflows}</td>
                <td className="p-2.5">
                  {s.deterministic ? (
                    <span className="text-teal-400">deterministic — rules + retry</span>
                  ) : (
                    <span className="text-amber-400">judgment — rules + retry + escalate</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-zinc-200 mb-1">How a check works</div>
          <p className="text-zinc-400">
            Every step runs the rule suite: schema, range, URL resolves, numbers reconcile, price matches config,
            arithmetic agrees, no advice phrasing. Pass → ship. Fail → retry once → escalate to a person.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-zinc-200 mb-1">It never silently passes</div>
          <p className="text-zinc-400">
            A failed rule cannot be waved through by confidence. That single property is what turns a 9% industry
            silent-failure rate into a measurable one.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-zinc-200 mb-1">Money is not 98%</div>
          <p className="text-zinc-400">
            Prices, payouts, entitlements, refunds and ledger rows are held to <span className="text-red-400 font-semibold">100%</span>
            {" "}behind a human gate. 98% on money is an argument for losing money twice.
          </p>
        </div>
      </div>

      <p className="text-[11px] text-zinc-600 mt-4">
        Source: {source === "neon" ? "live telemetry (7-day rolling)" : "no data yet — the board shows “—” rather than a flattering placeholder"}
        {" · "}
        outbound {rows.outbound_total} · runs {rows.runs_total} · money {rows.money_total}
      </p>
    </div>
  );
}
