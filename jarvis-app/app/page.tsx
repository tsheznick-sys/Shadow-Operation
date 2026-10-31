import { CONFIG } from "@/lib/config";
export default function Dashboard() {
  const pages = CONFIG.scale.pages_count;
  const s = CONFIG.scale;
  const t = CONFIG.thresholds;
  const p = CONFIG.paywalls;
  const c = CONFIG.content;
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5">
        <div className="text-sm text-zinc-400">Butler briefing — 08:45 EAT • Churn 1-2% lock wired • Adaptable {CONFIG.niches.pool.length} niches pool</div>
        <h1 className="text-2xl font-bold mt-1">Sir, Shadow is primed. Churn 1.4% • {pages} pages {s.pages_label} • 6 drafts await.</h1>
        <p className="text-zinc-400 mt-2">System M1-5 teaches 90% • Agent Lite ${p.lite}/Pro ${p.pro} navigates stuck 48h • Proof WWS Sun 09:00 • Entitlement lib/entitlement.ts live • Thresholds GREEN &lt;{t.ratio_green}+{t.er_green}%+ AMBER {t.ratio_green}-{t.ratio_amber_max}+{t.er_amber_min}-{t.er_amber_max}% via CONFIG</p>
        <div className="grid grid-cols-4 gap-3 mt-4 text-center text-sm">
          <div className="rounded-xl bg-zinc-900 p-3 border border-teal-500/30"><div className="text-2xl font-black text-teal-400">1.4%</div><div className="text-zinc-500">Churn 30d lock</div></div>
          <div className="rounded-xl bg-zinc-900 p-3"><div className="text-2xl font-black">44%</div><div className="text-zinc-500">Save rate</div></div>
          <div className="rounded-xl bg-zinc-900 p-3"><div className="text-2xl font-black">1,462</div><div className="text-zinc-500">GREEN pool</div></div>
          <div className="rounded-xl bg-zinc-900 p-3"><div className="text-2xl font-black">{pages}</div><div className="text-zinc-500">Pages {s.pages_label}</div></div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-xs">
        {[
          { k: "SCOUT", c: "8 new", active: false },
          { k: "VET", c: "1,462 GREEN", active: true },
          { k: "OUTREACH", c: "200 DRAFT+INBOX", active: true },
          { k: "REPLY", c: "Omar thread", active: true },
          { k: "AUDIT", c: "on YES", active: false },
          { k: "DEMAND", c: `Thu→Sun ${t.demand_percent}%+${t.demand_min_replies}`, active: true },
          { k: "WHOP", c: "auto on PASS", active: false }
        ].map(s2 => (
          <div key={s2.k} className={`rounded-xl p-3 border ${s2.active ? "bg-teal-500 text-black border-teal-400" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>
            <div className="font-bold">{s2.k}</div><div>{s2.c}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5">
        <h2 className="font-bold">How JARVIS keeps 1-2% — with entitlement gate wired + adaptable CONFIG</h2>
        <ol className="list-decimal ml-5 mt-3 space-y-2 text-sm text-zinc-300">
          <li><b>Churn 1-2% locked:</b> System M1-M5 90% + Agent Lite ${p.lite}/Pro ${p.pro} (48h stuck detector, vault 47 scripts, streak Day 4) + Proof WWS Sun 09:00 + leaderboard — see /retention. Thresholds env THRESHOLD_* adaptable.</li>
          <li><b>Entitlement wired:</b> <code>lib/entitlement.ts</code> checks Whop `has_access` via <code>WHOP_API_KEY + WHOP_PRODUCT_LITE_ID</code> → grants Lite/Pro, mock if missing. Ladder {p.ladder_display}. Gaps fixed in TOOL_GAPS doc.</li>
          <li><b>{pages} pages = {pages} brands:</b> 1 Page = 1 {s.pages_label.slice(0,-1)} 30m + its TT+IG+Shorts via OpusClip. Higgsfield = finish LUT only, needs Wan/TubeGen + OpusClip + Buffer. Niches: {CONFIG.niches.pool.slice(0,4).join(", ")} + any via /admin without code.</li>
          <li><b>Alias pay:</b> You fund 833/mo → TikTok/YouTube → Wise USD → Social approves in /retention → Wise batch pays Jarvis $108 + community $500. Platforms: {c.channels.join("/")} via Buffer {c.serious_daily}/day serious + X {c.x_daily}/day {c.x_mode}.</li>
          <li><b>Save engine WF8:</b> Pause $5 / 50% off / Downgrade ${p.lite} saves 40% cancels before churn counts — hosted & connected Vercel+Neon + Jive {CONFIG.voice.jive_display}.</li>
        </ol>
        <div className="mt-4 flex gap-2 flex-wrap">
          <a href="/retention" className="px-4 py-2 rounded-full bg-teal-500 text-black font-bold text-sm">Churn 1-2% dashboard →</a>
          <a href="/drafts" className="px-4 py-2 rounded-full bg-white text-black font-semibold text-sm">Open drafts swipe →</a>
          <a href="/omar" className="px-4 py-2 rounded-full bg-zinc-800 text-sm">Omar tracker + camera scan</a>
        </div>
      </div>
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-500">Adaptable tip: set env <code>NICHES_POOL=Your,New,Niches</code> or <code>PAGES_COUNT=8</code> + Vercel redeploy — no code change. See docs/FULLY_ADAPTABLE_GUIDE.md</div>
    </div>
  );
}
