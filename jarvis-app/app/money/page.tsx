import { getSql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { autopayState, computeFunding, fundingInputs } from "@/lib/funding";

export const dynamic = "force-dynamic";

async function getMembers() {
  const sql = getSql();
  if (!sql) return { members: Number(process.env.FUNDING_MEMBERS || 0), source: "env" };
  try {
    const rows: any = await sql`SELECT count(*)::int AS c FROM members WHERE plan = 'circle'`;
    return { members: rows?.[0]?.c || 0, source: "neon" };
  } catch {
    return { members: Number(process.env.FUNDING_MEMBERS || 0), source: "env" };
  }
}

export default async function MoneyPage() {
  const session = getSession();
  const { members, source } = await getMembers();
  const model = computeFunding(fundingInputs(members));
  const pay = autopayState();
  const isOwner = session?.role === "owner";
  const floorGap = Math.max(0, model.recommendedMembers - members);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Community funding</h1>
      <p className="text-sm text-zinc-500 max-w-3xl mb-6">
        The community pays for itself. Circle memberships carry the tools and the prizes; the annual renewal fund is pre-loaded so
        month-12 never lands on your card. Autopay stays held until you grant it, here.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { k: "Active Circle members", v: `${members}`, note: `source: ${source}` },
          { k: "Circle revenue / mo", v: `$${model.circleRevenue.toLocaleString()}`, note: `@ $${model.inputs.circlePrice}/mo` },
          { k: "Self-funding floor", v: `${model.breakEvenMembers}`, note: "tools + prizes, no reserve" },
          { k: "Recommended floor", v: `${model.recommendedMembers}`, note: floorGap > 0 ? `${floorGap} members to go` : "cleared" },
        ].map((c) => (
          <div key={c.k} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">{c.k}</div>
            <div className="text-2xl font-bold mt-1">{c.v}</div>
            <div className="text-[11px] text-zinc-500 mt-1">{c.note}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 mb-6">
        <div className="font-bold text-sm mb-1">Where the money goes each month</div>
        <div className="text-xs text-zinc-500 mb-3">
          Tools ${model.inputs.toolsMonthly}/mo · prize target ${model.inputs.prizeTarget}/mo · annual bills ${model.annualFundNeeded}/yr
        </div>
        <div className="space-y-2">
          {model.buckets.map((b) => (
            <div key={b.name}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">{b.name}</span>
                <span className="font-mono text-zinc-400">
                  ${b.amount.toLocaleString()} · {b.pct}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 mt-1 overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: `${Math.min(100, b.pct)}%` }} />
              </div>
              <div className="text-[11px] text-zinc-600 mt-1">{b.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-sm mb-2">Annual renewal fund</div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Annual prepay is 20% cheaper than monthly. The fund needs{" "}
            <span className="font-mono text-teal-400">${model.annualFundPerMonth}/mo</span> to cover{" "}
            <span className="font-mono">${model.annualFundNeeded}/yr</span> of TubeGen, Higgsfield, Buffer and OpusClip. Until the
            fund covers it, those stay monthly — nothing is charged annually before it is banked.
          </p>
          <div className="mt-3 text-xs text-amber-400">
            Verdict: {model.verdict === "below_floor" ? "below self-funding floor — prizes scale with revenue, never fixed" : model.verdict === "self_funding" ? "self-funding — building reserve" : "reserve building — annual fund can start"}
          </div>
        </div>

        <div className={`rounded-xl border p-4 ${pay.granted ? "border-teal-700 bg-teal-500/5" : "border-zinc-800 bg-zinc-900/40"}`}>
          <div className="font-bold text-sm mb-2">Payments authority</div>
          <div className="text-xs text-zinc-400 mb-3">
            Status: <span className={pay.granted ? "text-teal-400" : "text-amber-400"}>{pay.label}</span>
            <br />
            Hold until: <span className="font-mono">{pay.holdUntil}</span>
          </div>
          {isOwner ? (
            <form action="/api/funding" method="post" className="flex gap-2">
              <button
                formAction="/api/funding"
                name="action"
                value="grant"
                className="rounded-lg bg-teal-500 text-black text-xs font-bold px-3 py-2"
              >
                Grant authority
              </button>
              <button
                formAction="/api/funding"
                name="action"
                value="revoke"
                className="rounded-lg border border-zinc-700 text-xs px-3 py-2"
              >
                Keep held
              </button>
            </form>
          ) : (
            <div className="text-xs text-zinc-500">Only the owner seat can change payments authority.</div>
          )}
          <p className="text-[11px] text-zinc-600 mt-3">
            Granting records an audit row and unlocks the 1st-of-month Wise batch. It never moves money retroactively.
          </p>
        </div>
      </div>
    </div>
  );
}
