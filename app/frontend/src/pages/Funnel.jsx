
import React, { useEffect, useState } from "react";
import axios from "axios";
export default function Funnel(){
  const [funnels,setFunnels]=useState([]); const [pages,setPages]=useState([]);
  const load = ()=>{
    axios.get("/api/funnels/").then(r=>setFunnels(r.data.funnels||[]));
    axios.get("/api/pages/").then(r=>setPages(r.data.pages||[]));
  };
  useEffect(()=>load(),[]);
  const seed = ()=> axios.post("/api/funnels/seed-tripwire").then(load);
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-black">Funnel <span className="text-gold">— Tripwire Whop</span></h1>
          <p className="text-xs text-white/50">Brunson Value Ladder • Whop replaces Stripe • ?ref creator tracking</p>
        </div>
        <button onClick={seed} className="bg-gold text-black px-3 py-1.5 rounded text-xs font-bold">Seed Vault Tripwire (4 pages)</button>
      </div>

      <div>
        <h2 className="text-sm font-bold">Funnels — {funnels.length}</h2>
        <div className="grid md:grid-cols-2 gap-3 mt-2">
          {funnels.map(f=>(
            <div key={f.id} className="border border-white/10 rounded-xl p-3 bg-white/[0.03] text-xs">
              <div className="font-bold">{f.name} <span className="text-white/40">{f.funnel_type} • {f.status}</span></div>
              <div className="text-white/50">AOV $42 • {f.whop_store_url||f.whop}</div>
              <div className="text-[11px] font-mono bg-black border border-white/10 rounded px-2 py-1 mt-2">{f.whop_store_url||""}</div>
              {f.steps_detail && <div className="text-[11px] text-white/40 mt-1">{f.steps_detail.length} steps</div>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold">Pages — {pages.length} <span className="text-white/40">Builder JSON + Whop checkout</span></h2>
        <div className="grid md:grid-cols-2 gap-3 mt-2">
          {pages.map(p=>(
            <div key={p.id} className="border border-white/10 rounded-xl p-3 bg-white/[0.02] text-xs space-y-1">
              <div className="font-bold">{p.title} <span className="text-white/40">/{p.slug}</span></div>
              <div className="text-gold">{p.headline}</div>
              <div className="text-white/60">{p.story}</div>
              <div className="text-white/40 italic">{p.offer}</div>
              <div className="text-[10px] font-mono bg-black border border-white/10 rounded px-1 py-1 break-all">{p.builder_json?.slice(0,180)}...</div>
              <div className="text-[10px]">{p.published?"● published":"○ draft"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
