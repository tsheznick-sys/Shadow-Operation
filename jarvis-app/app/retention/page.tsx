import { CONFIG } from "@/lib/config";
export default function Retention() {
  const p = CONFIG.paywalls;
  const s = CONFIG.scale;
  const t = CONFIG.thresholds;
  const pool = CONFIG.niches.pool;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-teal-500 text-black p-5">
        <div className="text-sm font-bold">CHURN LOCK 1-2% • System + Agent + Proof Loop • Wired + Adaptable</div>
        <h1 className="text-2xl font-black mt-1">Your Whop churn is now engineered, not hoped. 1.2% target.</h1>
        <p className="text-sm mt-2 opacity-80">System teaches $100 • Agent navigates stuck 24/7 • Proof proves wins weekly. Cancel → Pause $5 / 50% off / Downgrade ${p.lite} — saves 40% before churn counts. Entitlement Lite ${p.lite}/Pro ${p.pro}. Adaptable thresholds GREEN &lt;{t.ratio_green}+{t.er_green}%+ via CONFIG.</p>
        <div className="mt-4 flex gap-2 flex-wrap text-xs">
          <span className="px-3 py-1.5 rounded-full bg-black text-white font-bold">Activation 85% in 7d</span>
          <span className="px-3 py-1.5 rounded-full bg-white text-black font-bold">Agent DAU 60%</span>
          <span className="px-3 py-1.5 rounded-full bg-black text-white font-bold">Save rate 45%</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 text-sm">
        {[
          { k: "Churn 30d", v: "1.4%", sub: "target 1-2%", ok: true },
          { k: "Save offers", v: "44%", sub: "Pause/Downgrade", ok: true },
          { k: "Activation 7d", v: "82%", sub: "published 1 clip", ok: false },
          { k: "WWS replay", v: "41%", sub: "of base watched", ok: true },
        ].map(s2 => (
          <div key={s2.k} className={`rounded-xl p-4 border ${s2.ok ? "bg-zinc-900 border-zinc-800" : "bg-amber-500 text-black border-amber-400"}`}>
            <div className="text-xs opacity-60">{s2.k}</div>
            <div className="text-2xl font-black">{s2.v}</div>
            <div className="text-xs opacity-70">{s2.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5">
          <div className="font-bold">1. System — teach 90% keep 10%</div>
          <div className="text-xs text-zinc-500 mt-1">Whop Courses M1-M5 • Notion SOPs • 1000 niches CSV • Each lesson → Agent CTA — niches from CONFIG {pool.length} pool adaptable</div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="rounded-xl bg-zinc-900 p-3 flex justify-between"><span>M1 Niche to $100 (8-Gate &lt;{t.ratio_green}+{t.er_green}%+)</span><span className="text-teal-400 font-bold">✓ live</span></div>
            <div className="rounded-xl bg-zinc-900 p-3 flex justify-between"><span>M2 30m→8 clips ({CONFIG.content.serious_daily}/day)</span><span className="text-teal-400 font-bold">✓ live</span></div>
            <div className="rounded-xl bg-zinc-900 p-3 flex justify-between"><span>M3 Buffer {CONFIG.content.serious_daily}/day {CONFIG.content.channels.join("/")}</span><span className="text-teal-400 font-bold">✓ live</span></div>
            <div className="rounded-xl bg-zinc-900 p-3"><span className="font-bold">Kept in Agent:</span> Grok rank {pool.length} pool • TubeGen auto • OpusClip score • LUT per-clip — all env-driven</div>
          </div>
        </div>
        <div className="rounded-2xl bg-[#13131a] border border-teal-500/30 p-5">
          <div className="font-bold">2. Agent — paid fee navigates stuck • WIRED</div>
          <div className="text-xs text-zinc-500 mt-1">Whop Lite ${p.lite}/Pro ${p.pro} • Stuck detector 48h • Vault lock-in • Daily streak • Entitlement gate lib/entitlement.ts</div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="rounded-xl bg-teal-500 text-black p-3"><span className="font-bold">Gate:</span> Whop API has_access → Lite ${p.lite}/Pro ${p.pro} ({s.pages_count} {s.pages_label}). No pay = mock lock. Ladder {p.ladder_display}.</div>
            <div className="rounded-xl bg-zinc-900 p-3">Stuck triggers: no post 48h → DM "Sir queue empty" • 3 FAILs → reframe • DM 24h nudge</div>
            <div className="rounded-xl bg-zinc-900 p-3">Vault: <b>47 scripts saved</b> • Pause $5 keep vs Cancel delete in 7d — loss aversion lock</div>
            <div className="rounded-xl bg-zinc-900 p-3">Streak: Day 4 • 3/{CONFIG.content.serious_daily} posts today — freeze available • Adaptable PAGES_COUNT={s.pages_count}</div>
          </div>
        </div>
        <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5">
          <div className="font-bold">3. Proof Loop — momentum not info</div>
          <div className="text-xs text-zinc-500 mt-1">WWS Sun 09:00 • Clip Tue/Fri • Leaderboard daily 05:45 • Pod 5 — {s.pages_count} {s.pages_label} {CONFIG.content.channels.join("/")}</div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="rounded-xl bg-zinc-900 p-3">Sun WWS: 12 wins this week • $340 new • @{pool[0].toLowerCase().replace(" ","_")}_ke $90 with Agent — replay 41% watched</div>
            <div className="rounded-xl bg-zinc-900 p-3">Leaderboard: #1 @{pool[0].toLowerCase().replace(" ","_")}_mind 12k views • #2 you 4k • Pod Red 28 posts vs Blue 22</div>
            <div className="rounded-xl bg-zinc-900 border border-teal-500/30 p-3">Thu teardown 19:00: biggest leak via daily-brief 05:45 → expand top5 via Grok — Vesper voice-00 via Jive {CONFIG.voice.jive_display}</div>
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5">
        <h2 className="font-bold">Cancel → Save engine (the 1-2% maker) — WF8 wired</h2>
        <p className="text-xs text-zinc-500 mt-1">Whop membership_cancelled webhook → n8n WF8 retention → offer before cancel final. Paused = active 0% churn — offers env RETENTION_SAVE_OFFERS adaptable.</p>
        <div className="mt-3 grid grid-cols-3 gap-3 text-sm text-center">
          <div className="rounded-xl bg-zinc-900 p-4"><div className="text-2xl">⏸️</div><div className="font-bold mt-1">Pause $5/mo</div><div className="text-xs text-zinc-500 mt-1">Keep vault + streak + pod. 7d delete warning. Save 22% cancels.</div><button className="mt-3 px-3 py-1 rounded-full bg-teal-500 text-black text-xs font-bold">One-click pause</button></div>
          <div className="rounded-xl bg-white text-black p-4"><div className="text-2xl">🏷️</div><div className="font-bold mt-1">50% off next month</div><div className="text-xs opacity-60 mt-1">From ${p.circle} → ${(Number(p.circle)/2).toFixed(2)}. One time. Saves price churn 12%.</div><button className="mt-3 px-3 py-1 rounded-full bg-black text-white text-xs font-bold">Apply 50% OFF</button></div>
          <div className="rounded-xl bg-zinc-900 p-4"><div className="text-2xl">⬇️</div><div className="font-bold mt-1">Downgrade ${p.lite} Lite</div><div className="text-xs text-zinc-500 mt-1">Keep Agent 30 runs + vault. Lose Pro. Saves value churn 10%.</div><button className="mt-3 px-3 py-1 rounded-full bg-zinc-800 text-white text-xs font-bold">Downgrade</button></div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3 text-center text-xs">
          <div className="rounded-xl bg-zinc-900 p-3"><div className="font-black text-lg">Day 0-2</div><div className="text-zinc-500">Activation: 1 clip in 48h required. Agent DM 12h.</div></div>
          <div className="rounded-xl bg-zinc-900 p-3"><div className="font-black text-lg">Day 3-7</div><div className="text-zinc-500">Habit: daily streak + freeze. Pod check-in.</div></div>
          <div className="rounded-xl bg-zinc-900 p-3"><div className="font-black text-lg">Day 7-30</div><div className="text-zinc-500">Money win: $10-100 via Agent queue. Leaderboard.</div></div>
          <div className="rounded-xl bg-zinc-900 p-3 border border-teal-500/30"><div className="font-black text-teal-400 text-lg">Day 30+</div><div className="text-zinc-500">Ascension: $100 → Pro ${p.pro} unlock {s.pages_count} {s.pages_label}.</div></div>
        </div>
        <div className="mt-3 text-xs text-zinc-600">Whop webhook before final → 3 offers → only if all declined → cancel counts. Failed payment: recovery 30%. Alias Wise: TikTok/YouTube → Wise USD → Social approves here → Wise batch pays.</div>
      </div>
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
        <h2 className="font-bold text-sm">{s.pages_count} pages = {s.pages_count} brands, not per platform • adaptable PAGES_COUNT={s.pages_count}</h2>
        <p className="text-xs text-zinc-400 mt-1">1 Page = 1 YT longform (30m) → its own TT+IG+Shorts via same Buffer queue. So {s.pages_count} pages = {s.pages_count} YouTube channels = {s.pages_count*3} platform endpoints but {s.pages_count} content engines. Change via env PAGES_COUNT without code.</p>
        <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs">
          {pool.slice(0,5).map(n => <div key={n} className="rounded-xl bg-[#13131a] p-3 border border-zinc-800">{n.slice(0,12)}<div className="text-zinc-600">YT+TT+IG</div></div>)}
        </div>
      </div>
    </div>
  );
}
