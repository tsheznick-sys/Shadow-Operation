
import React, { useState } from "react";
import Publisher from "./pages/Publisher.jsx";
import Funnel from "./pages/Funnel.jsx";
import ManyChat from "./pages/ManyChat.jsx";
import Auth from "./pages/Auth.jsx";

const tabs = [
  { id: "publisher", label: "Publisher", icon: "🎬", desc: "6 HSO • Veo3 • Queue" },
  { id: "funnel", label: "Funnel", icon: "🔗", desc: "Tripwire • Whop • Pages" },
  { id: "manychat", label: "ManyChat", icon: "💬", desc: "Flows • 8 platforms" },
  { id: "auth", label: "Auth", icon: "🔐", desc: "Creators • Accounts" },
];

export default function Shell() {
  const [active, setActive] = useState("publisher");
  const [health, setHealth] = React.useState(null);
  React.useEffect(()=>{ fetch("/health").then(r=>r.json()).then(setHealth).catch(()=>{}); },[]);
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur sticky top-0 h-screen p-4 flex flex-col gap-4">
        <div>
          <div className="text-gold font-black tracking-widest text-sm">SHADOW OPS</div>
          <div className="text-xs text-white/60 -mt-1">Unified v2 • Single backend+DB</div>
          <div className="mt-2 text-[10px] font-mono bg-white/5 rounded px-2 py-1 border border-white/10">
            <div>BE: <span className="text-emerald-400">{health?.status || "loading"}</span> 8000</div>
            <div>DB: unified sqlite→postgres</div>
            <div>Pay: Whop (Stripe off)</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setActive(t.id)} className={`text-left px-3 py-2.5 rounded-lg border text-sm flex items-center gap-2 ${active===t.id?"bg-white text-black border-white font-semibold":"bg-white/5 border-white/10 hover:bg-white/10 text-white/80"}`}>
              <span>{t.icon}</span> {t.label} <span className="ml-auto text-[10px] opacity-60">{t.desc}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto text-[11px] leading-3 text-white/40 border-t border-white/10 pt-3">
          One backend: <code className="bg-white/10 px-1 rounded">app/backend</code> <br/>
          One frontend: <code className="bg-white/10 px-1 rounded">app/frontend</code> <br/>
          <a href="/docs" target="_blank" className="text-gold underline">API Docs /docs</a> • <a href="/health" target="_blank" className="text-gold underline">/health</a>
        </div>
      </aside>
      <main className="flex-1 bg-gradient-to-b from-neutral-950 to-black">
        {active==="publisher" && <Publisher />}
        {active==="funnel" && <Funnel />}
        {active==="manychat" && <ManyChat />}
        {active==="auth" && <Auth />}
      </main>
    </div>
  );
}
