import { PanelTabs } from "../_tabs";
import { PERFORMANCE_METRICS } from "@/lib/panel";

export const dynamic = "force-dynamic";

export default function PerformancePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2 text-[11px] uppercase tracking-widest text-orange-400">Stickman Agent</div>
      <h1 className="text-3xl font-black mb-2">What actually moved.</h1>
      <p className="text-sm text-zinc-400 max-w-3xl mb-5">
        Six numbers, ordered by how badly they can hurt — not by how good they look. Views are shown last, because views without retention are a screenshot, not a result.
      </p>
      <PanelTabs active="performance" />
      <div className="grid gap-3 sm:grid-cols-2">
        {PERFORMANCE_METRICS.map((m, i) => (
          <div key={m.key} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="text-[11px] uppercase tracking-widest text-zinc-500">#{i + 1}</div>
            <div className="text-sm font-bold text-orange-400">{m.label}</div>
            <p className="mt-1 text-xs text-zinc-400">{m.note}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-zinc-500 italic">
        No cross-page totals. A member with two pages sees two lines, because an average is how one dead page hides.
      </p>
    </div>
  );
}
