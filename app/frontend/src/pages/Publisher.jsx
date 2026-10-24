
import React, { useEffect, useState } from "react";
import axios from "axios";
export default function Publisher(){
  const [items,setItems]=useState([]); const [posts,setPosts]=useState([]); const [video,setVideo]=useState(null);
  const load = ()=>{
    axios.get("/api/content/").then(r=>setItems(r.data.content||[])).catch(()=>{});
    axios.get("/api/publish/").then(r=>setPosts(r.data.queue||[])).catch(()=>{});
    axios.get("/api/video/status").then(r=>setVideo(r.data)).catch(()=>{});
  };
  useEffect(()=>{ load(); },[]);
  const seed = ()=> axios.post("/api/content/seed-day1").then(load);
  const gen = ()=> axios.post("/api/video/generate-day1").then(load);
  const schedule = ()=> axios.post("/api/publish/schedule-day1").then(load);
  const approve = (id)=> axios.post(`/api/publish/approve/${id}`).then(load);
  const getContent = (cid)=> items.find(c=>c.id===cid) || {};
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-black">Publisher <span className="text-gold">— 6 HSO • Veo3</span></h1>
          <p className="text-xs text-white/50">3 owned pages @shadow.cinema.ai / @shadow.edits.ai / @vault.prompt.lab • G4 approve + 25/day cap</p>
          {video && <div className="text-[11px] mt-2 font-mono bg-white/5 border border-white/10 rounded px-2 py-1">veo: {video.veo_configured?"✅ "+video.key_prefix:"❌"} • {video.fallback}</div>}
        </div>
        <div className="flex gap-2">
          <button onClick={seed} className="bg-white text-black px-3 py-1.5 rounded text-xs font-bold">Seed Day 1 (6)</button>
          <button onClick={gen} className="bg-gold text-black px-3 py-1.5 rounded text-xs font-bold">Generate Videos</button>
          <button onClick={schedule} className="bg-white/10 border border-white/20 px-3 py-1.5 rounded text-xs">Schedule → queue</button>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold mb-2">Content Queue — {items.length} HSO</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {items.map(c=>(
            <div key={c.id} className="border border-gold/20 rounded-xl p-3 bg-white/[0.03] text-xs space-y-2">
              <div className="text-[10px] tracking-widest text-white/40">{c.page} • {c.platform} • {c.prompt_id}</div>
              <div className="font-bold text-gold leading-tight">{c.hook}</div>
              <div className="text-white/70 line-clamp-2">{c.story}</div>
              <div className="text-white/40 italic">{c.offer}</div>
              <div className="text-[10px] font-mono bg-black border border-white/10 px-1 py-1 rounded truncate">{c.render_path||"no render — POST /api/video/generate-day1"}</div>
              {c.render_path && <a href={`/${c.render_path}`} target="_blank" className="text-gold underline text-[11px]">preview {c.render_path}</a>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold mb-2">Publish Queue — {posts.length} <span className="text-gold">pending_approval</span> <span className="text-white/40 font-normal">G4</span></h2>
        {posts.length===0? <div className="text-xs text-white/40 border border-dashed border-white/20 rounded p-4">Empty — click Schedule → queue to move Content → Publish</div>:
        <div className="grid md:grid-cols-3 gap-3">
          {posts.map(p=>{
            const c=getContent(p.content_id);
            return (
              <div key={p.id} className="border border-white/10 rounded-xl p-3 text-xs bg-white/[0.02] flex flex-col gap-2">
                <div className="font-semibold text-white">{c.hook||c.prompt_id||p.id}</div>
                <div className="text-white/60">{c.story||""}</div>
                <div className="text-[10px] text-white/30">Post #{p.id} • {p.platform} • {p.status}</div>
                <button onClick={()=>approve(p.id)} className="bg-black text-gold border border-gold px-2 py-1 rounded text-xs mt-auto">Approve → posted</button>
              </div>
            )
          })}
        </div>
        }
      </div>
    </div>
  );
}
