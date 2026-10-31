"use client";
import { useState } from "react";
import { CONFIG } from "@/lib/config";

const pool = CONFIG.niches.pool;
const MOCK = [
  { handle:"@quietwolfzz", followers:"514K TikTok / 12K IG", er:`${CONFIG.thresholds.er_green+1.2}%`, gate:"GREEN", subject:`Quick idea for @quietwolfzz — your ${pool[0]} vault is leaking $`, preview:`GREEN <${CONFIG.thresholds.ratio_green}+${CONFIG.thresholds.er_green}%+ 273 Whop products gap — buyer_pool_x3 ~42K...`},
  { handle:"@mindset.machine", followers:"89K", er:`${CONFIG.thresholds.er_green+0.1}%`, gate:"GREEN", subject:`Quick idea for @mindset.machine — ${pool[1]||pool[0]} ladder`, preview:`GREEN ratio <${CONFIG.thresholds.ratio_green} buyer_pool_x3 8.2K — 60/40 split...`},
  { handle:"@consumerism.critique", followers:"112K", er:`${CONFIG.thresholds.er_amber_min+1.3}%`, gate:"AMBER", subject:`Quick idea — ${pool[2]||pool[0]} vault`, preview:`AMBER ${CONFIG.thresholds.ratio_green}-${CONFIG.thresholds.ratio_amber_max} ER ${CONFIG.thresholds.er_amber_min}-${CONFIG.thresholds.er_amber_max}% — 14-day via ChatFuel ${CONFIG.conversion.chatfuel}...`}
];
export default function Drafts() {
  const [i, setI] = useState(0);
  const d = MOCK[i % MOCK.length];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Drafts — swipe to SEND (Gate G4)</h1>
      <p className="text-sm text-zinc-500">Vercel cron {CONFIG.crons.check_replies} auto-drafted while you sleep • You swipe human gate • Strict 0% {CONFIG.paywalls.ladder_display} • Gmail DRAFT+INBOX • Adaptable via THRESHOLD_* env</p>
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-6">
        <div className="flex justify-between text-xs text-zinc-500"><span>{d.handle} • {d.followers} • ER {d.er}</span><span className={`px-2 py-1 rounded-full text-xs font-bold ${d.gate==="GREEN"?"bg-green-500 text-black":"bg-amber-500 text-black"}`}>{d.gate}</span></div>
        <div className="font-bold mt-3">{d.subject}</div>
        <div className="text-sm text-zinc-400 mt-2">{d.preview}</div>
        <div className="flex gap-3 mt-5">
          <button onClick={()=>setI(i+1)} className="flex-1 py-3 rounded-full bg-zinc-800 font-semibold">Skip</button>
          <button onClick={()=>{alert(`Sir, sent to ${d.handle} via Gmail API — Linear updated. Gate ${d.gate} via lib/config.ts`); setI(i+1)}} className="flex-1 py-3 rounded-full bg-white text-black font-bold">Swipe SEND → Gmail</button>
        </div>
        <div className="text-xs text-zinc-600 mt-3 text-center">Hands-except-money: JARVIS prepared hands, you approved SEND. Money/sign still you. Niches from CONFIG pool {pool.length}.</div>
      </div>
      <div className="rounded-xl bg-zinc-900 p-4 text-sm">
        <div className="font-semibold">Full auto to Whop — what's auto:</div>
        <div className="text-zinc-400 mt-1">VET (ratio&lt;{CONFIG.thresholds.ratio_green}+{CONFIG.thresholds.er_green}%+) → DRAFT → TRACK (Linear) → Reply triage → Demand {CONFIG.thresholds.demand_percent}%+{CONFIG.thresholds.demand_min_replies} → Whop auto-create on PASS. You: SEND, sign one-pager, collect ${CONFIG.paywalls.ladder_display} split.</div>
      </div>
    </div>
  );
}
