import { PanelTabs } from "./_tabs";
import {
  COST_PER_RUN, FUNNEL_SHORTCUT, MONTHLY_RUNS, TIER_RULES, WINDOW_HOURS, WINDOW_RUNS,
  WHAT_THE_AGENT_DOES, gateBeforePublish, publishPath, quotaCheck, tierCost, watermarkFor, worstCase,
} from "@/lib/stickman-agent";

export const dynamic = "force-dynamic";

const TIERS = ["free", "circle", "pro"] as const;

export default function StickmanAgentPage() {
  const demoGate = gateBeforePublish({
    tier: "pro", member_id: "demo", passes: 1,
    rules_ok: true, policy_ok: true, disclosure_ok: true, flagged: false,
  });
  const demoBlock = gateBeforePublish({
    tier: "pro", member_id: "demo", passes: 4,
    rules_ok: true, policy_ok: false, disclosure_ok: true, flagged: false,
  });
  const demoQuota = quotaCheck("free", {
    used_in_window: 20, used_this_month: 40,
    window_started: new Date(Date.now() - 60 * 60 * 1000).toISOString(), month: "2026-10",
  });
  const wc = worstCase({ free: 100, circle: 26, pro: 6 });
  const wm = watermarkFor("free");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2 text-[11px] uppercase tracking-widest text-orange-400">Stickman Agent</div>
      <h1 className="text-3xl font-black mb-2">The agent is the product. The videos are the advert.</h1>
      <p className="text-sm text-zinc-400 max-w-3xl mb-6">
        A member does not buy access to a library. They buy a staff member that scripts, renders, cuts, schedules and
        audits — the same engine our own page runs on. Free gets 20 runs per {WINDOW_HOURS}-hour window, our content to
        clip, and our watermark on everything they export.
      </p>

      <PanelTabs active="home" />
      <div className="grid gap-3 sm:grid-cols-4 mb-6">
        {[
          ["Free window", `${WINDOW_RUNS.free} runs / ${WINDOW_HOURS}h`],
          ["Cost per run", `$${COST_PER_RUN}`],
          ["Watermark", wm.apply ? "yes — STICKMAN" : "no"],
          ["Worst-case cost share", `${wc.share}%`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="text-[11px] uppercase tracking-widest text-zinc-500">{k}</div>
            <div className="mt-1 text-xl font-black text-orange-400">{v}</div>
          </div>
        ))}
      </div>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-bold">Tiers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-[11px] uppercase tracking-widest text-zinc-500">
              <tr>
                <th className="py-1">Tier</th><th>Price</th><th>Window</th><th>Month cap</th>
                <th>Watermark</th><th>Cost to us</th><th>Share of net</th><th>Verdict</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {TIERS.map((t) => {
                const c = tierCost(t);
                return (
                  <tr key={t} className="border-t border-zinc-800">
                    <td className="py-1 font-bold uppercase">{t}</td>
                    <td>{TIER_RULES[t].price === 0 ? "free" : `$${TIER_RULES[t].price}`}</td>
                    <td>{WINDOW_RUNS[t]} / {WINDOW_HOURS}h</td>
                    <td>{MONTHLY_RUNS[t]}</td>
                    <td>{TIER_RULES[t].watermark ? "yes" : "no"}</td>
                    <td>${c.cost}</td>
                    <td>{c.share === null ? "—" : `${c.share}%`}</td>
                    <td className={c.verdict === "solvent" || c.verdict.startsWith("free") ? "text-lime-400" : "text-red-400"}>
                      {c.verdict}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-zinc-500">
          Worst case at 100 free · 26 Circle · 6 Pro: ${wc.cost}/mo against ${wc.revenue}/mo net —{" "}
          <b className="text-zinc-300">{wc.verdict}</b>. Windows pace a member; the monthly cap keeps us solvent.
        </p>
      </section>

      <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-bold mb-2">Who can publish, and how</h2>
        <table className="w-full text-xs">
          <thead className="text-left text-[11px] uppercase tracking-widest text-zinc-500">
            <tr><th className="py-1">Tier</th><th>Path</th><th>Human review</th><th>Why</th></tr>
          </thead>
          <tbody className="text-zinc-300">
            {TIERS.map((t) => {
              const pp = publishPath(t, 0);
              return (
                <tr key={t} className="border-t border-zinc-800">
                  <td className="py-1 font-bold uppercase">{t}</td>
                  <td className="text-orange-400">{pp.path.replace(/_/g, " ")}</td>
                  <td>{pp.review}</td>
                  <td className="text-zinc-500">{pp.why}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-2 text-[11px] text-zinc-500">
          The 2-hour SLA is a Pro entitlement, and it only exists until auto-publish is earned. Circle is scheduled through our
          publisher so we never hold a member&apos;s platform tokens. Free posts by hand — the watermark travels with it.
        </p>
      </section>

      <section className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-sm font-bold mb-2">What it does</h2>
          <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-1">
            {WHAT_THE_AGENT_DOES.map((w) => (<li key={w}>{w}</li>))}
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-sm font-bold mb-2">The gate, live</h2>
          <div className={`rounded-lg border p-3 mb-2 ${demoGate.requires_human ? "border-amber-800 bg-amber-950/30" : "border-lime-800 bg-lime-950/30"}`}>
            <div className="text-[11px] uppercase tracking-widest text-zinc-500">clean asset, publish 2</div>
            <p className="text-xs mt-1 text-zinc-200">{demoGate.allow ? "allowed" : "blocked"} · {demoGate.reason}</p>
          </div>
          <div className="rounded-lg border border-red-800 bg-red-950/30 p-3 mb-2">
            <div className="text-[11px] uppercase tracking-widest text-zinc-500">policy failure, earned auto-publish</div>
            <p className="text-xs mt-1 text-red-200">{demoBlock.allow ? "allowed" : "BLOCKED"} · {demoBlock.reason}</p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3">
            <div className="text-[11px] uppercase tracking-widest text-zinc-500">quota, 20 used this window</div>
            <p className="text-xs mt-1 text-zinc-300">{demoQuota.allowed ? "allowed" : "denied"} · {demoQuota.reason}</p>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-bold mb-2">The door we agreed to open</h2>
        <p className="text-xs text-zinc-400">
          A supporter can skip the $28 → $17 flow and join the community directly at{" "}
          <b className="text-zinc-200">${FUNNEL_SHORTCUT.price}</b>. {FUNNEL_SHORTCUT.why}. Discount:{" "}
          <b className="text-zinc-200">{FUNNEL_SHORTCUT.discount}%</b> — the price is identical, only the path is shorter.
          Cold traffic still starts at the First Shot.
        </p>
      </section>

      <p className="text-[11px] text-zinc-500 italic">{wm.rationale} — {wm.position}, never covering {wm.never_covers}.</p>
    </div>
  );
}
