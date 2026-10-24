
import React, { useEffect, useState } from "react";
import axios from "axios";
export default function Auth(){
  const [creators,setCreators]=useState([]); const [form,setForm]=useState({email:"",handle:""});
  const load = ()=> axios.get("/api/auth/").then(r=>setCreators(r.data.creators||[]));
  useEffect(()=>load(),[]);
  const create = ()=>{
    if(!form.email||!form.handle) return;
    axios.post("/api/auth/", form).then(load);
    setForm({email:"",handle:""});
  };
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-black">Auth <span className="text-gold">— Creators</span></h1>
      <p className="text-xs text-white/50">CreatorAccount (Auth v1) • shared DB • Whop user sync • niche tagging</p>
      <div className="flex gap-2">
        <input placeholder="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="bg-white/5 border border-white/20 rounded px-3 py-1.5 text-xs flex-1" />
        <input placeholder="handle @shadow..." value={form.handle} onChange={e=>setForm({...form,handle:e.target.value})} className="bg-white/5 border border-white/20 rounded px-3 py-1.5 text-xs flex-1" />
        <button onClick={create} className="bg-white text-black px-3 py-1.5 rounded text-xs font-bold">Create</button>
      </div>
      <div className="text-xs grid gap-2">
        {creators.map(c=><div key={c.id} className="border border-white/10 rounded p-2 bg-white/[0.03] flex justify-between"><span>{c.handle} • {c.email}</span><span className="text-white/40">{c.status}</span></div>)}
        {creators.length===0 && <div className="text-white/30 border border-dashed border-white/20 rounded p-4">No creators yet</div>}
      </div>
    </div>
  );
}
