
import React, { useEffect, useState } from "react";
import axios from "axios";
export default function ManyChat(){
  const [flows,setFlows]=useState([]); const [subs,setSubs]=useState([]); const [check,setCheck]=useState(null);
  const load = ()=>{
    axios.get("/api/flows/").then(r=>setFlows(r.data.flows||[]));
    axios.get("/api/subscribers/").then(r=>setSubs(r.data.subscribers||[]));
    axios.get("/health").then(r=>setCheck(r.data.services?.manychat||r.data)).catch(()=>{});
  };
  useEffect(()=>load(),[]);
  const seed = ()=> axios.post("/api/flows/seed-demo").then(load);
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-black">ManyChat <span className="text-gold">— 8 platforms</span></h1>
          <p className="text-xs text-white/50">Messenger / IG / WhatsApp / Telegram / TikTok / X / YouTube / Discord / Whop • Verify <code>shadow_manychat_verify_2024</code></p>
          {check && <div className="text-[11px] font-mono bg-white/5 border border-white/10 rounded px-2 py-1 mt-2">{check.gates||JSON.stringify(check)}</div>}
        </div>
        <button onClick={seed} className="bg-gold text-black px-3 py-1.5 rounded text-xs font-bold">Seed Demo Flows (4)</button>
      </div>

      <div>
        <h2 className="text-sm font-bold">Flows — {flows.length}</h2>
        <div className="grid md:grid-cols-2 gap-3 mt-2">
          {flows.map(f=>(
            <div key={f.id} className="border border-white/10 rounded-xl p-3 bg-white/[0.03] text-xs">
              <div className="font-bold">{f.name} <span className="text-white/40">• {f.trigger_type}:{f.trigger_value} • {f.status}</span></div>
              <div className="text-white/50">platform {f.platform}</div>
              <div className="text-[10px] font-mono bg-black border border-white/10 rounded px-1 py-1 mt-1 break-all">{f.nodes_json?.slice(0,140)}...</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold">Subscribers — {subs.length}</h2>
        {subs.length===0? <div className="text-xs text-white/40 border border-dashed border-white/20 rounded p-4">No subscribers yet — create via POST /api/subscribers or webhook</div>:
          <div className="text-xs grid gap-2">{subs.map(s=><div key={s.id} className="border border-white/10 rounded p-2 bg-white/[0.02]">{s.platform} {s.platform_user_id} — {s.name}</div>)}</div>
        }
      </div>

      <div className="text-xs border border-white/10 rounded-xl p-3 bg-white/[0.02] space-y-2">
        <div className="font-bold">Webhook verify URLs (copy to Meta App):</div>
        <div className="font-mono text-[11px] bg-black border border-white/10 rounded px-2 py-2">
          GET /webhooks/messenger?hub_mode=subscribe&hub_verify_token=shadow_manychat_verify_2024&hub_challenge=123<br/>
          GET /webhooks/instagram?hub_mode=subscribe&hub_verify_token=shadow_manychat_verify_2024&hub_challenge=123<br/>
          POST /webhooks/whop → Whop purchase → Subscriber.whop_purchased
        </div>
      </div>
    </div>
  );
}
