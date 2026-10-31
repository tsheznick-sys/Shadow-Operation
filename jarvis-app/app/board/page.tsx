import { AGENDA, PARTNERS, QUORUM, RULE_NOTE, nicheEvidence, resolve } from "@/lib/board";
import { SEQUENCE, allDesignedSlots, assignedSlots, channelCount, queuedSlots } from "@/lib/pages";

export const dynamic = "force-dynamic";

export default function BoardPage() {
  const live = assignedSlots();
  const queued = queuedSlots();
  const designed = allDesignedSlots();

  // a live example, not a mock: the motion that would launch page 2 today
  const launch = resolve({
    kind: "launch_page",
    motion: `Launch page ${queued[0]?.niche ?? "next"} as page 2`,
    votes: [{ partner: "Owner", vote: "yes" }, { partner: "Content Guy", vote: "yes" }],
  });
  const evidence = nicheEvidence({
    scans: 3, days_observed: 3, er_pct: 0, buyer_pool: 0,
    policy_clear: true, cost_per_asset: 0.21, distinct_from_live: true,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2 text-[11px] uppercase tracking-widest text-lime-400">Board</div>
      <h1 className="text-3xl font-black mb-2">Three partners, and the things one of them may not decide alone.</h1>
      <p className="text-sm text-zinc-400 max-w-3xl mb-6">
        The Content Guy proposes the niche. Jarvis brings the scan, the ratios and the policy check. The owner holds the
        key. No one of those is sufficient — that is the design, not an obstacle.
      </p>

      <div className="grid gap-3 sm:grid-cols-4 mb-6">
        {[
          ["Partners", `${QUORUM} / ${PARTNERS.length}`],
          ["Live pages", `${live.length}`],
          ["Queued", `${queued.length}`],
          ["Channels live", `${channelCount()}`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="text-[11px] uppercase tracking-widest text-zinc-500">{k}</div>
            <div className="mt-1 text-2xl font-black text-lime-400">{v}</div>
          </div>
        ))}
      </div>

      <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-bold mb-2">The motion that is not votable yet</h2>
        <p className="text-xs text-zinc-400 mb-3">
          {launch.tally.yes} yes · {launch.tally.no} no · missing: {launch.tally.missing.join(", ")} —{" "}
          <span className="font-bold text-amber-400">{launch.status}</span>. Needs {launch.need} of 3: {launch.why}.
        </p>
        <div className="rounded-lg border border-amber-800 bg-amber-950/30 p-3">
          <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Evidence missing</div>
          <ul className="mt-1 list-disc pl-5 text-xs text-amber-200">
            {evidence.missing.map((m) => (<li key={m}>{m}</li>))}
          </ul>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-bold">The sequence</h2>
        <p className="text-xs text-zinc-400 mb-3">
          Start with <b className="text-zinc-200">{SEQUENCE.start_with}</b>. {SEQUENCE.rule}. Next niche:{" "}
          {SEQUENCE.next_niche_chosen_by}. Never: {SEQUENCE.never}.
        </p>
        <table className="w-full text-xs">
          <thead className="text-left text-[11px] uppercase tracking-widest text-zinc-500">
            <tr><th className="py-1">#</th><th>Page</th><th>Reader</th><th>Status</th></tr>
          </thead>
          <tbody className="text-zinc-300">
            {designed.map((s, i) => (
              <tr key={s.id} className="border-t border-zinc-800">
                <td className="py-1 text-zinc-500">{i + 1}</td>
                <td className="font-bold">{s.niche}</td>
                <td className="text-zinc-400">{s.audience}</td>
                <td>
                  <span className={s.status === "assigned" ? "text-lime-400" : "text-amber-400"}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-bold mb-2">Standing agenda</h2>
        <ol className="list-decimal pl-5 text-xs text-zinc-400 space-y-1">
          {AGENDA.map((a) => (<li key={a}>{a}</li>))}
        </ol>
      </section>

      <p className="text-[11px] text-zinc-500 italic">{RULE_NOTE}</p>
    </div>
  );
}
