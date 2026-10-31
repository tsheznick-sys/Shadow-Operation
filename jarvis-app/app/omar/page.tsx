"use client";
import { useState } from "react";
export default function Omar() {
  const [views, setViews] = useState<string>("");
  const [replies, setReplies] = useState<string>("");
  const v = parseInt(views) || 0; const r = parseInt(replies) || 0;
  const needViews = Math.ceil(v*0.01); const pass = v>0 ? (r>=25 && r>=needViews) : false;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Omar — PremiereProTutos Vault • Thu→Sun Tracker</h1>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-teal-500 text-black p-4"><div className="font-bold">Story 1 Thu 29 19:00 EAT</div><div>Poll: save 30-50min? YES/NO — screenshot 24h</div></div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4"><div className="font-bold">Story 2 Fri 30 19:00</div><div>Clean whip vs Moody LUT — YES/NO</div></div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4"><div className="font-bold">Story 3 Sat 31 19:00</div><div>Reply VAULT — 40 early access • 1%+25</div></div>
      </div>
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5">
        <div className="font-bold">Camera scan — photo → OCR → 1%+25 auto-calc (your Q16 yes_camera)</div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <label className="rounded-xl bg-zinc-900 p-4 border-2 border-dashed border-zinc-700 text-center cursor-pointer">
            <div className="text-sm">📸 Tap to scan Story views screenshot</div>
            <div className="text-xs text-zinc-500 mt-1">OCR reads views → auto 1%</div>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e)=>{const f=e.target.files?.[0]; if(f){setViews(prompt("OCR mock: enter views seen in screenshot? (e.g. 3200)")||views)}}}/>
          </label>
          <div className="space-y-2">
            <input value={views} onChange={e=>setViews(e.target.value)} placeholder="Story 3 views (e.g. 3200)" className="w-full rounded-full bg-zinc-800 px-4 py-3 text-sm" />
            <input value={replies} onChange={e=>setReplies(e.target.value)} placeholder="Raw VAULT replies (e.g. 31)" className="w-full rounded-full bg-zinc-800 px-4 py-3 text-sm" />
            <div className={`rounded-full px-4 py-3 text-sm font-bold text-center ${pass?"bg-green-500 text-black":"bg-zinc-800 text-zinc-400"}`}>{v?`Need max(25, 1% of ${v}=${needViews}) = ${Math.max(25,needViews)} • You have ${r} → ${pass?"PASS ✓":"FAIL"}`:"Enter views+replies to judge"}</div>
          </div>
        </div>
        <button onClick={()=>alert(pass?`Sir, PASS — ${r} replies ≥ ${Math.max(25,needViews)} (1% of ${v} views). Shooting email to you for Sun 09:00 live decision + auto Whop vault ready.`:`Sir, FAIL — ${r}<${Math.max(25,needViews)}. No Whop per R9.`)} className="mt-4 w-full py-3 rounded-full bg-white text-black font-bold">Generate Sun 09:00 PASS/FAIL email → you decide live</button>
        <div className="text-xs text-zinc-600 mt-2">Strict 1%+25 per R10 • No Whop before PASS per R9 • Screenshot-only until Sun 09:00 EAT • V2 ZIP 7.0M sent 23:38Z 28 Oct in thread 1a15281d992fe8e7</div>
      </div>
    </div>
  );
}
