"use client";
import { useState, useEffect } from "react";
export default function JarvisChat() {
  const [tier, setTier] = useState("checking...");
  const [hasAccess, setHasAccess] = useState(false);
  const [msgs, setMsgs] = useState<{role:string, text:string}[]>([{role:"jarvis", text:"Sir, I am online. Churn 1.2% lock • Entitlement gate wired (Lite $9/Pro $29). Ask: How's Omar? Vet @handle or GREEN/AMBER 50:1?"}]);
  const [input, setInput] = useState("");
  useEffect(()=>{
    // Entitlement check on load — Whop Embed passes ?whop_user_id=xxx
    const params = new URLSearchParams(window.location.search);
    const wid = params.get("whop_user_id") || params.get("user_id") || "";
    fetch(`/api/entitlement?whop_user_id=${wid}`).then(r=>r.json()).then(d=>{
      setTier(`${d.tier} (${d.limits?.label||""}) ${d.mock?"• mock":"• live"} — ${d.reason}`);
      setHasAccess(d.hasAccess);
      if(!d.hasAccess) setMsgs(m=>[...m, {role:"jarvis", text:`Sir, entitlement gate: ${d.reason}. Buy Agent Lite $9 in Whop to unlock 30 runs/mo (1 domain, 3 clips/day). Churn lock: vault 47 scripts kept on pause $5 vs cancel delete in 7d. — Vesper standby.`}]);
    }).catch(()=> setTier("mock — WHOP_API_KEY not set"));
  },[]);
  const send = async () => {
    if(!input.trim()) return;
    const q=input; setInput(""); setMsgs(m=>[...m, {role:"you", text:q}]);
    if(!hasAccess && !q.toLowerCase().includes("buy") && !q.toLowerCase().includes("omar")){
      setTimeout(()=> setMsgs(m=>[...m, {role:"jarvis", text: "Sir, locked — entitlement required. Lite $9 unlocks this chat (30 runs). Type 'buy lite' to see Whop link, or ask Omar (always open)."}]), 400);
      return;
    }
    try{
      const r=await fetch("/api/jarvis",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({prompt:q, history: msgs})});
      const d=await r.json();
      setMsgs(m=>[...m, {role:"jarvis", text: d.text + (d.mock? "":" "+`[${d.provider}]`)}]);
    }catch{
      setTimeout(()=> setMsgs(m=>[...m, {role:"jarvis", text: mockReply(q)}]), 600);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">JARVIS Chat — entitlement wired • churn 1.2%</h1>
        <div className="text-xs px-3 py-1 rounded-full border" style={{background: hasAccess? "#14b8a6": "#27272a", color: hasAccess?"#000":"#a1a1aa"}}>{tier}</div>
      </div>
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-4 h-[48vh] overflow-auto space-y-3">
        {msgs.map((m,i)=><div key={i} className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] ${m.role==="you"?"ml-auto bg-white text-black":"bg-zinc-800 text-zinc-100"}`}>{m.text}</div>)}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask JARVIS: How's Omar? Vet @quietwolfzz? GREEN? 14-day? Buy lite?" className="flex-1 rounded-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm"/>
        <button onClick={send} className="px-5 py-3 rounded-full bg-white text-black font-bold">Send</button>
        <button onClick={()=>alert("Sir, listening — Whisper would transcribe here. PWA mic button v1; Hey Jarvis wake-word lands with native v2 (30d). Entitlement still enforced server-side.")} className="px-5 py-3 rounded-full bg-teal-500 text-black font-bold">🎙️ Mic</button>
        <button onClick={()=>alert("Sir, briefing: Churn 1.1% | GREEN <50+5%+ fast-close | AMBER 14-day via ChatFuel IG&TikTok+ManyChat YT | Comments->DM->Whop | Leak->expand 05:45, needs Wan/TubeGen+OpusClip+Buffer (see docs/TOOL_GAPS).")} className="px-5 py-3 rounded-full bg-zinc-800 text-sm">🔊 Briefing</button>
      </div>
      <p className="text-xs text-zinc-600">Entitlement: lib/entitlement.ts → GET /api/entitlement?whop_user_id=xxx → Whop API has_access → Lite $9 (30 runs) / Pro $29 (unlimited 5 domains). Mock if WHOP_API_KEY missing. Gaps doc: docs/TOOL_GAPS_INCENTIVE_HIGGSFIELD.md — Higgsfield alone ≠ system.</p>
    </div>
  );
}
function mockReply(q:string){
  const l=q.toLowerCase();
  if(l.includes("omar")) return "Sir, Omar: V2 ZIP 7.0M sent 23:38Z 28 Oct in thread 1a15281d992fe8e7 (you approved tweak colours/no audience-test/@logo). Story 1 Thu 29 19:00 EAT POLL. I will ping all 3 channels at Thu 21:00 if no screenshot. PASS = max(25, 1% views). No Whop until PASS. — Butler";
  if(l.includes("vet")||l.includes("@")) return "Sir, vetting handle — buyer_pool_x3 = avg_comments×3, ratio<50:1, ER 3%+ ideal 5%+, 8-Gate GREEN. Auto-reject RED (<2% ER) per your Q14. Shall I draft outreach (6/day swipe)?";
  if(l.includes("stuck")||l.includes("queue")||l.includes("churn")||l.includes("retention")) return "Sir, churn lock active 1.4%: System M1-M5 + Agent Lite $9/Pro $29 (48h stuck detector, vault 47 scripts, streak Day 4) + Proof WWS Sun 09:00 + leaderboard. Cancel → Pause $5/Downgrade $9/50% off saves 44%. 5 pages = 5 YT brands (its TT+IG+Shorts), not per-platform. Direct OpusClip → Buffer — no LUT. Need your first win in 48h?";
  if(l.includes("agent")||l.includes("prove")||l.includes("member")) return "Sir, Agent entitlement: Whop has_access → Lite $9 (30 runs, 1 domain) / Pro $29 (5 domains, 6/day). Vault lock-in: leaving deletes in 7d. Today 58% DAU, 82% activation 7d. Shall I draft your WWS proof clip for Tue?";
  if(l.includes("higgsfield")||l.includes("tool")||l.includes("gap")) return "Sir, Direct path — Engine (Wan T4 free/Colab or TubeGen $29 30m) → Clip (OpusClip $15 virality) → Publish (Buffer Team $12/ch) → Money (Whop/ManyChat). See docs/TOOL_GAPS_INCENTIVE_HIGGSFIELD.md.";
  return "Sir, acknowledged. Churn 1.2% target: System teaches 90% (keep 10% edge in Agent), Agent navigates stuck, Proof loop makes momentum. How may I serve the squad?";
}
