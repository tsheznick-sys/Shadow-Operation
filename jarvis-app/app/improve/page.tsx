import { DECAY_DAYS, HOLDOUT_PCT, MIN_DAYS, MIN_SAMPLE, WIN_MARGIN, readPlaybook, stale } from "@/lib/learn";

export const dynamic = "force-dynamic";

const STAGES = [
  {
    key: "1 · SELF",
    title: "Jarvis grades Jarvis",
    unlocks: "always on",
    what: "Hook retention, ER, comment quality, objection rate — measured against what the market actually did.",
    gate: "3 consecutive cycles where the promoted change beat the incumbent",
  },
  {
    key: "2 · OPERATION",
    title: "The machine gets cheaper",
    unlocks: "after 3 self-wins",
    what: "Render pass rate, G4 rejection, publish cadence, cost per clip, duplicate-question rate.",
    gate: "cost per clip falls 2 cycles AND G4 rejection under 10%",
  },
  {
    key: "3 · MONEY",
    title: "Then it touches prices",
    unlocks: "after the operation settles",
    what: "Pricing, offers, the 14-day sequence, the save menu. The only stage where money moves.",
    gate: "a full month above the floor (53 members) with churn ≤ 2.0%",
  },
];

export default async function ImprovePage() {
  const { tactics, experiments, source } = await readPlaybook();
  const live = source === "neon";
  const running = experiments.filter((e) => e.outcome === "running");
  const promoted = experiments.filter((e) => e.outcome === "promoted");
  const killed = experiments.filter((e) => e.outcome === "killed");
  const inconclusive = experiments.filter((e) => e.outcome === "inconclusive");
  const staleCount = tactics.filter((t) => stale(t)).length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2 text-[11px] uppercase tracking-widest text-teal-400">Self-Improvement Loop</div>
      <h1 className="text-3xl font-black mb-2">It fixes itself before it fixes the business.</h1>
      <p className="text-sm text-zinc-400 max-w-3xl mb-1">
        Weekly: observe → hypothesise → change <span className="text-zinc-200">one</span> variable → read the result →
        promote or kill → write the playbook.
      </p>
      <p className="text-xs text-zinc-500 max-w-3xl mb-6">
        The law: <span className="text-amber-300">no change without a measured before and after.</span> A hunch may be
        tested, never shipped. Self first — a system that cannot correct its own output will scale its mistakes.
      </p>

      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {STAGES.map((s, i) => (
          <div
            key={s.key}
            className={`rounded-xl border p-4 ${i === 0 ? "border-teal-700 bg-teal-500/5" : "border-zinc-800 bg-zinc-900/40"}`}
          >
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">{s.key}</div>
            <div className="font-bold text-zinc-100 mb-1">{s.title}</div>
            <p className="text-xs text-zinc-400 mb-2">{s.what}</p>
            <div className="text-[10px] uppercase tracking-wide text-zinc-600 mb-0.5">Unlocks</div>
            <div className="text-[11px] text-zinc-400">{s.unlocks}</div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-600 mt-2 mb-0.5">Gate to reach it</div>
            <div className="text-[11px] text-amber-300/80">{s.gate}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          ["Running tests", String(running.length)],
          ["Promoted", String(promoted.length)],
          ["Killed", String(killed.length)],
          ["Inconclusive", String(inconclusive.length)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">{k}</div>
            <div className="text-xl font-bold text-zinc-100">{v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 mb-6 text-xs">
        <div className="font-bold text-zinc-200 mb-2">The rules that make a result readable</div>
        <div className="grid md:grid-cols-4 gap-3 text-zinc-400">
          <div>
            <span className="text-zinc-200 font-semibold">{MIN_SAMPLE}</span> samples minimum
          </div>
          <div>
            <span className="text-zinc-200 font-semibold">{MIN_DAYS}</span> days minimum
          </div>
          <div>
            <span className="text-zinc-200 font-semibold">{HOLDOUT_PCT}%</span> holdout keeps the incumbent
          </div>
          <div>
            must win by <span className="text-zinc-200 font-semibold">+{WIN_MARGIN}%</span>
          </div>
        </div>
        <p className="text-[11px] text-zinc-600 mt-2">
          One variable per test. Two changes and the result is unreadable, whoever wrote it.
        </p>
      </div>

      {!live ? (
        <div className="rounded-2xl border border-amber-600/40 bg-amber-500/5 p-5 mb-6">
          <div className="font-bold text-amber-400 text-sm mb-1">No experiments logged yet — and it says so.</div>
          <p className="text-xs text-zinc-400">
            WF15 opens the first test when the pages go live. Until then this board stays empty rather than showing
            invented wins. An improvement loop with fabricated results is worse than none.
          </p>
        </div>
      ) : null}

      {live && experiments.length ? (
        <div className="rounded-2xl border border-zinc-800 overflow-hidden mb-6">
          <div className="bg-zinc-900/70 px-3 py-2 text-xs font-bold text-zinc-300">Experiment log</div>
          <table className="w-full text-xs">
            <thead className="text-zinc-500">
              <tr>
                <th className="text-left p-2.5">Stage</th>
                <th className="text-left p-2.5">Page</th>
                <th className="text-left p-2.5">Variable</th>
                <th className="text-left p-2.5">Challenger</th>
                <th className="text-right p-2.5">Δ</th>
                <th className="text-right p-2.5">n</th>
                <th className="text-left p-2.5">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((e) => {
                const delta = e.incumbent_score > 0
                  ? Math.round(((e.challenger_score - e.incumbent_score) / e.incumbent_score) * 100)
                  : 0;
                return (
                  <tr key={e.id} className="border-t border-zinc-900">
                    <td className="p-2.5 text-zinc-500">{e.stage}</td>
                    <td className="p-2.5 text-zinc-300">{e.page}</td>
                    <td className="p-2.5 text-zinc-400">{e.variable}</td>
                    <td className="p-2.5 text-zinc-400">{e.challenger}</td>
                    <td className={`p-2.5 text-right ${delta > 0 ? "text-teal-400" : delta < 0 ? "text-red-400" : "text-zinc-500"}`}>
                      {delta > 0 ? "+" : ""}
                      {delta}%
                    </td>
                    <td className="p-2.5 text-right text-zinc-500">{e.sample}</td>
                    <td className="p-2.5">
                      <span
                        className={
                          e.outcome === "promoted"
                            ? "text-teal-400"
                            : e.outcome === "killed"
                            ? "text-red-400"
                            : e.outcome === "inconclusive"
                            ? "text-amber-400"
                            : "text-zinc-400"
                        }
                      >
                        {e.outcome}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-xs font-bold text-zinc-300">Playbook</div>
          <div className="text-[11px] text-zinc-500">
            {tactics.length} live · {staleCount} due for re-test ({DECAY_DAYS}-day decay)
          </div>
        </div>
        {tactics.length ? (
          <ul className="space-y-1 text-xs">
            {tactics.map((t) => (
              <li key={t.key} className="flex flex-wrap gap-2 text-zinc-400">
                <span className="text-zinc-200">{t.rule}</span>
                <span className="text-zinc-600">· {t.page}</span>
                <span className={t.wins >= 2 ? "text-teal-400" : "text-zinc-500"}>
                  {t.wins}W / {t.losses}L
                </span>
                {stale(t) ? <span className="text-amber-400">re-test due</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-500">
            Empty. A tactic enters only after <span className="text-zinc-300">2 independent wins on 2 different pages</span>
            , and leaves after 2 losses — archived, never deleted, so a dead idea is not retried in six months.
          </p>
        )}
      </div>

      <p className="text-[11px] text-zinc-600 mt-4">
        Promoting a tactic is automatic at 95% autonomy. <span className="text-amber-300">Changing a price is never
        automatic</span> — Jarvis proposes it to the owner with the data attached.
      </p>
    </div>
  );
}
