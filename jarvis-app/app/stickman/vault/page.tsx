import { PanelTabs } from "../_tabs";
import { PODS, VAULT } from "@/lib/panel";

export const dynamic = "force-dynamic";

export default function VaultPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2 text-[11px] uppercase tracking-widest text-orange-400">Stickman Agent</div>
      <h1 className="text-3xl font-black mb-2">{VAULT.headline}</h1>
      <p className="text-sm text-zinc-400 max-w-3xl mb-5">{VAULT.migration_line}</p>
      <PanelTabs active="vault" />
      <div className="grid gap-3 sm:grid-cols-2 mb-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-sm font-bold mb-2">Inside</h2>
          <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-1">
            {VAULT.contents.map((c) => (<li key={c}>{c}</li>))}
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-sm font-bold mb-2">Pods</h2>
          <ul className="text-xs text-zinc-400 space-y-1">
            <li>Size: {PODS.size}</li>
            <li>Check-in: {PODS.checkin}</li>
            <li>Leaderboard: {PODS.leaderboard}</li>
            <li>Silence: {PODS.silence_rule}</li>
          </ul>
        </div>
      </div>
      <p className="rounded-xl border border-amber-800 bg-amber-950/30 p-3 text-xs text-amber-200">{VAULT.rule}</p>
    </div>
  );
}
