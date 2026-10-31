import {
  COHORT_SIZE, DAYS, ENTRY_FEE, MIN_COMPLETION, MIN_TENURE_DAYS, PHASES,
  coach, cohortStats, nextDoor, readCohort,
} from "@/lib/challenge";

export const dynamic = "force-dynamic";

export default async function ChallengePage() {
  const { members, source } = await readCohort();
  const stats = cohortStats(members);
  const live = source === "neon" && members.length > 0;
  const today = DAYS[0];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2 text-[11px] uppercase tracking-widest text-teal-400">The 14-Day Challenge · operators only</div>
      <h1 className="text-3xl font-black mb-2">Free to join. Expensive to finish.</h1>
      <p className="text-sm text-zinc-400 max-w-3xl mb-4">
        Fourteen days, one action a day, ending in <span className="text-zinc-200">your own</span> 72-hour demand test.
        Nothing is explained to you — you produce the number yourself. That is why it sticks.
      </p>
      <p className="text-sm text-zinc-400 max-w-3xl mb-6">
        This is for people who want to <span className="text-teal-300 font-semibold">run a page on this system</span> —
        operators, not spectators. Finish it and you are offered a seat running your own page, not a certificate.
      </p>

      <div className="rounded-2xl border border-teal-700/40 bg-teal-500/5 p-4 mb-6">
        <div className="text-xs uppercase tracking-wide text-teal-400 mb-1">The gate</div>
        <div className="text-sm text-zinc-300">
          <span className="font-bold">{MIN_TENURE_DAYS} days of paid membership</span> unlocks the room.
          {" "}Entry fee <span className="font-bold text-teal-300">${ENTRY_FEE}</span> — the membership is the ticket.
        </div>
        <p className="text-[11px] text-zinc-500 mt-1">
          Tenure is the one filter money cannot shortcut: tourists do not pay for two weeks to get in.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          ["Cohort cap", String(COHORT_SIZE)],
          ["Joined", live ? String(stats.joined) : "—"],
          ["Active", live ? String(stats.active) : "—"],
          ["Finishers", live ? String(stats.finishers) : "—"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">{k}</div>
            <div className="text-xl font-bold text-zinc-100">{v}</div>
          </div>
        ))}
      </div>

      {!live ? (
        <div className="rounded-2xl border border-amber-600/40 bg-amber-500/5 p-5 mb-6">
          <div className="font-bold text-amber-400 text-sm mb-1">No cohort open yet — and the page says so.</div>
          <p className="text-xs text-zinc-400">
            The engine is built and Jarvis runs it daily. The first cohort opens when the five pages go live. We do not
            show fake members or invented completion rates to make the room look full.
          </p>
        </div>
      ) : null}

      {live ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 mb-6">
          <div className="flex items-baseline justify-between mb-2">
            <div className="font-bold text-sm">Cohort completion</div>
            <div className={`text-sm font-bold ${stats.beating_target ? "text-teal-400" : "text-amber-400"}`}>
              {stats.completion}% <span className="text-zinc-500 font-normal">/ target {MIN_COMPLETION}%</span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full ${stats.beating_target ? "bg-teal-400" : "bg-amber-400"}`}
              style={{ width: `${Math.min(100, stats.completion)}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            Completion is the only metric that predicts upgrades. 60%+ outranks member count every time.
          </p>
        </div>
      ) : null}

      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {PHASES.map((p, i) => (
          <div key={p.key} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">
              Phase {i + 1} · days {p.days}
            </div>
            <div className="font-bold text-zinc-100 mb-1">{p.label}</div>
            <p className="text-xs text-zinc-400">{p.blurb}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-800 overflow-hidden mb-6">
        <table className="w-full text-xs">
          <thead className="bg-zinc-900/70 text-zinc-400">
            <tr>
              <th className="text-left p-2.5 w-10">#</th>
              <th className="text-left p-2.5">The one action</th>
              <th className="text-left p-2.5">You submit</th>
              <th className="text-left p-2.5">Why it counts</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((d) => (
              <tr key={d.day} className="border-t border-zinc-900">
                <td className="p-2.5 text-zinc-600">{d.day}</td>
                <td className="p-2.5 text-zinc-200">{d.action}</td>
                <td className="p-2.5 text-zinc-400">{d.deliverable}</td>
                <td className="p-2.5 text-zinc-500">{d.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {live ? (
        <div className="rounded-2xl border border-zinc-800 overflow-hidden mb-6">
          <div className="bg-zinc-900/70 px-3 py-2 text-xs font-bold text-zinc-300">Cohort board</div>
          <table className="w-full text-xs">
            <thead className="text-zinc-500">
              <tr>
                <th className="text-left p-2.5">Member</th>
                <th className="text-left p-2.5">Niche</th>
                <th className="text-right p-2.5">Days</th>
                <th className="text-right p-2.5">Streak</th>
                <th className="text-right p-2.5">Score</th>
                <th className="text-left p-2.5">Jarvis says</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-zinc-900">
                  <td className="p-2.5 text-zinc-200">@{m.handle}</td>
                  <td className="p-2.5 text-zinc-500">{m.niche}</td>
                  <td className="p-2.5 text-right text-zinc-300">{m.checked_in}/14</td>
                  <td className="p-2.5 text-right text-zinc-300">{m.streak}</td>
                  <td className="p-2.5 text-right font-bold text-teal-400">{m.score}</td>
                  <td className="p-2.5 text-zinc-500">{coach(m)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="rounded-2xl border border-teal-700/40 bg-teal-500/5 p-5">
        <div className="font-bold text-teal-300 text-sm mb-1">Day 15 — two doors, no third</div>
        <div className="grid md:grid-cols-2 gap-3 mt-2">
          <div className="rounded-xl border border-teal-700/40 bg-black/20 p-3">
            <div className="text-[10px] uppercase tracking-wide text-teal-400 mb-1">Finished + PASS (50+)</div>
            <p className="text-xs text-zinc-300">{nextDoor({ checked_in: 14, verdict: "PASS" }).line}</p>
          </div>
          <div className="rounded-xl border border-zinc-700 bg-black/20 p-3">
            <div className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">Did not finish</div>
            <p className="text-xs text-zinc-300">{nextDoor({ checked_in: 6, verdict: null }).line}</p>
          </div>
        </div>
        <p className="text-[11px] text-zinc-500 mt-3">
          <span className="text-amber-300">AMBER (25–49)</span> gets another cycle, free.{" "}
          <span className="text-red-300">RED (&lt;25)</span> gets a new niche — never a discount.
          Numbers are reconciled against the platform API; a claim more than 20% off does not count.
        </p>
      </div>

      <p className="text-[11px] text-zinc-600 mt-4">
        Day 1 is: <span className="text-zinc-400">{today?.action}</span>
      </p>
    </div>
  );
}
