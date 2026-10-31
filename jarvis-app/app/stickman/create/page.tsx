import { PanelTabs } from "../_tabs";
import { CREATE_STEPS } from "@/lib/panel";

export const dynamic = "force-dynamic";

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2 text-[11px] uppercase tracking-widest text-orange-400">Stickman Agent</div>
      <h1 className="text-3xl font-black mb-2">Script to scheduled. Seven steps, six of them gates.</h1>
      <p className="text-sm text-zinc-400 max-w-3xl mb-5">
        The member does not assemble a pipeline. They answer one question at a time and the agent moves the asset forward — or refuses to.
      </p>
      <PanelTabs active="create" />
      <ol className="space-y-2">
        {CREATE_STEPS.map((s) => (
          <li key={s.step} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-400 text-xs font-black text-black">{s.step}</span>
              <span className="text-sm font-bold">{s.name}</span>
            </div>
            <p className="mt-1 pl-9 text-xs text-zinc-400">{s.detail}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[11px] text-zinc-500 italic">
        A blocked asset does not move to the next step. That is the whole difference between a pipeline and a funnel.
      </p>
    </div>
  );
}
