"use client";
import { useState } from "react";

const MOCK = [
  { handle: "@quietwolfzz", followers: "514K TikTok / 12K IG", er: "6.2%", gate: "GREEN", subject: "Quick idea for @quietwolfzz — your Wolf vault is leaking $", preview: "4.85% ER, 273 Whop video products gap — your buyer pool ~42K × 3..." },
  { handle: "@mindset.machine", followers: "89K", er: "5.1%", gate: "GREEN", subject: "Quick idea for @mindset.machine — Dark Psych ladder", preview: "Your comment buyer_pool_x3 is 8.2K — 60/40 split, no risk..." },
  { handle: "@consumerism.critique", followers: "112K", er: "4.3%", gate: "AMBER", subject: "Quick idea — Consumerism critique vault", preview: "AMBER: ratio 48:1, ER just under 5% — still 60/40..." }
];

export default function Drafts() {
  const [i, setI] = useState(0);
  const d = MOCK[i % MOCK.length];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Drafts — swipe to SEND (Gate G4)</h1>
      <p className="text-sm text-zinc-500">Vercel cron auto-drafted while you sleep • You swipe human gate • Strict 0%550 • Gmail DRAFT+INBOX</p>
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-6">
        <div className="flex justify-between text-xs text-zinc-500"><span>{d.handle} • {d.followers} • ER {d.er}</span><span className={`px-2 py-1 rounded-full text-xs font-bold ${d.gate==="GREEN"?"bg-green-500 text-black":"bg-amber-500 text-black"}`}>{d.gate}</span></div>
        <div className="font-bold mt-3">{d.subject}</div>
        <div className="text-sm text-zinc-400 mt-2">{d.preview}</div>
        <div className="flex gap-3 mt-5">
          <button onClick={()=>setI(i+1)} className="flex-1 py-3 rounded-full bg-zinc-800 font-semibold">Skip</button>
          <button onClick={()=>{alert(`Sir, sent to ${d.handle} via Gmail API — Linear updated.`); setI(i+1)}} className="flex-1 py-3 rounded-full bg-white text-black font-bold">Swipe SEND → Gmail</button>
        </div>
        <div className="text-xs text-zinc-600 mt-3 text-center">Hands-except-money: JARVIS prepared hands, you approved SEND. Money/sign still you.</div>
      </div>
      <div className="rounded-xl bg-zinc-900 p-4 text-sm">
        <div className="font-semibold">Full auto to Whop — what’s auto:</div>
        <div className="text-zinc-400 mt-1">VET → DRAFT → TRACK (Linear) → Reply triage → Demand test copy → Whop auto-create on PASS (1%+25). You: SEND, sign one-pager, collect split.</div>
      </div>
    </div>
  );
}
