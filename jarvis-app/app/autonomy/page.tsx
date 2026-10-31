import { getSession, ROLE_LABEL, type Role } from "@/lib/auth";
import { LANES, laneAutonomy, overallAutonomy, canAct } from "@/lib/autonomy";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function completeness(): Promise<Record<string, number>> {
  const sql = getSql();
  if (!sql) return {};
  try {
    const rows: any = await sql`SELECT role, completeness FROM team_profiles`;
    return Object.fromEntries(rows.map((r: any) => [r.role, r.completeness]));
  } catch {
    return {};
  }
}

export default async function AutonomyPage() {
  const session = getSession();
  const seats = await completeness();
  const overall = overallAutonomy();
  const isOwner = session?.role === "owner";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Autonomy matrix</h1>
      <p className="text-sm text-zinc-500 max-w-3xl mb-5">
        How much Jarvis may do without a human, lane by lane. Recommended defaults, each clamped to a floor so no env change can
        quietly hand over something dangerous.
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-teal-700 bg-teal-500/5 p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">Overall operation</div>
          <div className="text-3xl font-bold mt-1 text-teal-400">{overall.score}%</div>
          <div className="text-xs text-zinc-400 mt-1">{overall.label}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">Excluded from the score</div>
          <div className="text-sm font-semibold mt-2">Money movement</div>
          <div className="text-xs text-zinc-500 mt-1">
            Kept out deliberately — it is capped at 40% and never recommended higher.
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">Seat gate</div>
          <div className="text-sm font-semibold mt-2">60% interview</div>
          <div className="text-xs text-zinc-500 mt-1">
            A lane that depends on an interview stays supervised until that seat is briefed.
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {LANES.map((lane) => {
          const pct = laneAutonomy(lane.key);
          const gate = canAct(lane.key, seats);
          const colour = pct >= 85 ? "bg-teal-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500";
          return (
            <div key={lane.key} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="font-semibold text-sm">{lane.label}</span>{" "}
                  <span className="text-[11px] font-mono text-zinc-600">{lane.workflow}</span>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  {pct}% · floor {lane.floor}%
                </div>
              </div>

              <div className="h-1.5 w-full rounded-full bg-zinc-800 mt-2 overflow-hidden">
                <div className={`h-full ${colour}`} style={{ width: `${pct}%` }} />
              </div>

              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{lane.why}</p>

              <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
                <span className={`rounded px-2 py-0.5 ${gate.allowed ? "bg-teal-500/15 text-teal-300" : "bg-red-500/15 text-red-300"}`}>
                  {gate.allowed ? "acts" : "waits"} — {gate.reason}
                </span>
                {lane.needs.map((n) => (
                  <span key={n} className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-400">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="font-bold text-sm mb-2">Where the parameters belong</div>
        <div className="grid md:grid-cols-2 gap-4 text-xs text-zinc-400">
          <div>
            <div className="text-teal-400 font-semibold mb-1">Set now, rarely touched</div>
            <ul className="space-y-1">
              <li>· money 40% — raise only after 90 days of clean ledger</li>
              <li>· voice 60% — calls cost attention, not just money</li>
              <li>· publish 70% — unlocks to 85% after 30 clean G4 approvals</li>
            </ul>
          </div>
          <div>
            <div className="text-teal-400 font-semibold mb-1">Set from data, reviewed monthly</div>
            <ul className="space-y-1">
              <li>· research 95% — veto only, never a queue</li>
              <li>· clip_polish 90% — mechanical, reversible</li>
              <li>· sequence 85% — one review per cycle is enough</li>
            </ul>
          </div>
        </div>
        {isOwner ? (
          <p className="text-[11px] text-zinc-600 mt-3">
            Override any lane in Vercel with{" "}
            <span className="font-mono">AUTONOMY_&lt;LANE&gt;</span> (e.g. AUTONOMY_PUBLISH=85). Values are clamped to the floor
            above; the UI shows the effective number.
          </p>
        ) : null}
      </div>

      <div className="mt-4 text-xs text-zinc-600">
        Seats seen:{" "}
        {Object.keys(seats).length === 0
          ? "none yet — interviews not saved to Neon"
          : Object.entries(seats)
              .map(([r, c]) => `${ROLE_LABEL[r as Role]} ${c}%`)
              .join(" · ")}
      </div>
    </div>
  );
}
