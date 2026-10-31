"use client";
import { useState } from "react";
export default function JarvisChat() {
  const [msgs, setMsgs] = useState<{role:string, text:string}[]>([{role:"jarvis", text:"Sir, I am online. Cloud-only v1 on Vercel + Neon. Squad 3-5 equal approve, you control money. Ask: How's Omar? or Vet @handle"}]);
  const [input, setInput] = useState("");
  const send = async () => {
    if(!input.trim()) return;
    const q=input; setInput(""); setMsgs(m=>[...m, {role:"you", text:q}]);
    // mock agent — real hits /api/jarvis
    setTimeout(()=> setMsgs(m=>[...m, {role:"jarvis", text: mockReply(q)}]), 600);
  };
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">JARVIS Chat — chat-first, mic button, TTS briefing 08:45 EAT</h1>
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-4 h-[48vh] overflow-auto space-y-3">
        {msgs.map((m,i)=><div key={i} className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] ${m.role==="you"?"ml-auto bg-white text-black":"bg-zinc-800 text-zinc-100"}`}>{m.text}</div>)}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask JARVIS: How's Omar? Vet @quietwolfzz? Draft 6 for today?" className="flex-1 rounded-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm"/>
        <button onClick={send} className="px-5 py-3 rounded-full bg-white text-black font-bold">Send</button>
        <button onClick={()=>alert("Sir, listening — Whisper would transcribe here. PWA mic button v1; Hey Jarvis wake-word lands with native v2 (30d) — per your Q9.")} className="px-5 py-3 rounded-full bg-teal-500 text-black font-bold">🎙️ Mic</button>
        <button onClick={()=>alert("Sir, briefing: 1,462 GREEN, 200/200 LIVE, Omar Story 1 Thu 19:00, 6 drafts await. All bros notified via Telegram+Gmail+Signal. — Butler voice (ElevenLabs) would speak here.")} className="px-5 py-3 rounded-full bg-zinc-800 text-sm">🔊 Briefing</button>
      </div>
      <p className="text-xs text-zinc-600">Hosted & connected: Vercel Cron every 15 min → Gmail check → Hard Rule 1 → draft → Linear • Agent primarily: gpt-4o-mini brain • Handles: Gmail/Linear/Whop/ManyChat • Hands-except-money</p>
    </div>
  );
}
function mockReply(q:string){
  const l=q.toLowerCase();
  if(l.includes("omar")) return "Sir, Omar: V2 ZIP 7.0M sent 23:38Z 28 Oct in thread 1a15281d992fe8e7 (you approved tweak colours/no audience-test/@logo). Story 1 Thu 29 19:00 EAT POLL. I will ping all 3 channels at Thu 21:00 if no screenshot. PASS = max(25, 1% views). No Whop until PASS. — Butler";
  if(l.includes("vet")||l.includes("@")) return "Sir, vetting handle — buyer_pool_x3 = avg_comments×3, ratio<50:1, ER 3%+ ideal 5%+, 8-Gate GREEN. Auto-reject RED (<2% ER) per your Q14. Shall I draft outreach (6/day swipe)?";
  if(l.includes("draft")) return "Sir, 6 drafts auto-drafted overnight while you slept (auto_while_sleep). Open /drafts swipe deck — human gate preserved (Q15).";
  return "Sir, acknowledged. I am your cloud brain — Vercel+Neon, forever memory, all ops unified, proactive all 3 channels. How may I serve the squad?";
}
