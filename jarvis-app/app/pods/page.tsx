import { CONFIG } from "@/lib/config";
export default function Pods() {
  const p = CONFIG.paywalls;
  const s = CONFIG.scale;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-teal-500 text-black p-5">
        <div className="text-sm font-bold">POD ACCOUNTABILITY • 5 max accountability • Wire live • Adaptable {s.pages_count} {s.pages_label}</div>
        <h1 className="text-2xl font-black mt-1">Your pod keeps you — 28 vs 22 is why churn is 1.1%.</h1>
        <p className="text-sm mt-2 opacity-80">Auto-assign on join via n8n WF9 ManyChat → Whop Chat pod channel → daily 05:45 streak battle → inactive 3d Vesper DM in pod. Good-Better-Best vault incentivizes tools per tier from CONFIG ladder {p.ladder_display}.</p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        {[
          { name: "Pod Red 🔥", m: 5, streak: 28, lead: true, members: "you + 4 — 6 posts 7d" },
          { name: "Pod Blue", m: 5, streak: 22, lead: false, members: "5 members — 5 posts 7d" },
          { name: "Pod Green", m: 4, streak: 18, lead: false, members: "4 members — open 1 slot" },
        ].map(pod => (
          <div key={pod.name} className={`rounded-2xl p-5 border ${pod.lead ? "bg-white text-black border-white" : "bg-[#13131a] border-zinc-800"}`}>
            <div className="font-bold">{pod.name}</div>
            <div className="text-xs opacity-60 mt-1">{pod.m}/5 members • {pod.streak} posts 7d</div>
            <div className="text-xs mt-2 opacity-80">{pod.members}</div>
            <button className={`mt-3 w-full px-3 py-1.5 rounded-full text-xs font-bold ${pod.lead ? "bg-black text-white" : "bg-teal-500 text-black"}`}>{pod.lead ? "Your pod — keep streak?" : "View pod chat →"}</button>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5">
        <h2 className="font-bold">Good-Better-Best vault = tool incentive (adaptable via TIER_* env)</h2>
        <div className="mt-3 grid grid-cols-3 gap-3 text-sm text-center">
          <div className="rounded-xl bg-zinc-900 p-4"><div className="font-black">GOOD ${p.good}</div><div className="text-xs text-zinc-500 mt-1">Pillow + Wan templates manual — no auto (env TIER_GOOD_PRICE)</div><div className="mt-2 text-xs opacity-60">Starter</div></div>
          <div className="rounded-xl bg-zinc-900 border border-teal-500/30 p-4"><div className="font-black text-teal-400">BETTER ${p.better}</div><div className="text-xs text-zinc-500 mt-1">TubeGen + OpusClip presets — Lite ${p.lite} unlocks 1 domain 3 clips/day</div><div className="mt-2 text-xs font-bold">Most bought</div></div>
          <div className="rounded-xl bg-white text-black p-4"><div className="font-black">BEST ${p.best}+${p.pro}/mo</div><div className="text-xs opacity-60 mt-1">Full stack SCALE ${s.scale_monthly} auto Higgsfield LUT $0.08/clip + {s.pages_count} {s.pages_label}</div><div className="mt-2 text-xs font-bold">1.1% churn</div></div>
        </div>
        <div className="mt-3 text-xs text-zinc-600">Lite = BETTER tools (3 clips/day, 1 domain). Pro = BEST full stack SCALE ${s.scale_monthly} (6/day, {s.pages_count} {s.pages_label}, auto LUT $0.08/clip). Wired POST /api/whop/upgrade Lite→Pro via WHOP_PRODUCT_LITE_ID/PRO_ID. Ladder {p.ladder_display} env WHOP_LADDER_PRICES.</div>
        <div className="mt-4 p-3 rounded-xl bg-teal-500 text-black text-sm flex justify-between items-center"><span><b>Scale ${s.scale_monthly} live:</b> TubeGen $29 + OpusClip $15 + Higgsfield auto $29 + Buffer Team $60 + brain $36 — 7 sales ${p.best} covers scale. Upgrade now → {s.pages_count} {s.pages_label}.</span><a href="/api/whop/upgrade" className="px-4 py-1.5 rounded-full bg-black text-white font-bold text-xs">Upgrade Lite→Pro ${p.pro}</a></div>
      </div>
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
        <h2 className="font-bold text-sm">How pod saves churn — live in /api/pods + WF9 • Jive {CONFIG.voice.jive_display}</h2>
        <p className="text-xs text-zinc-400 mt-1">Join → Whop webhook membership_created → n8n WF9 pod_assign: smallest pod (≤5) → Whop Chat add member → Postgres pods/pod_members → daily 05:45 leaderboard posts to pod chat. Inactive 3d → Vesper `Hey love it's Vesper — Pod Red misses you` via Jive. Full stack SCALE ${s.scale_monthly} — Higgsfield finish only, needs Wan/TubeGen engine + OpusClip clip + Buffer publish. Adaptable PAGES_COUNT={s.pages_count} via env.</p>
      </div>
    </div>
  );
}
