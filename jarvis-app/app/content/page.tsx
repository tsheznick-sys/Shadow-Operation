import { CONFIG } from "@/lib/config";
export default function ContentG4() {
  const pool = CONFIG.niches.pool;
  const c = CONFIG.content;
  const t = CONFIG.thresholds;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Content Guy — Production Pipeline G4 • queue38 pending</h1>
      <p className="text-sm text-zinc-500">He does the G4 approval — the ONLY human approve now (G5 removed 2026-10-31, Buffer auto-schedules on G4). Claude Max auto-scripts 30min → Stickman free engine renders every page → OpusClip clips → Higgsfield polishes longform + shorts → his G4 tweaks → live. WF1 rescans the whole internet daily 08:00 for strategies + action plan. Niches via CONFIG + Neon solo_domains top5.</p>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-teal-500 text-black p-4"><div className="font-bold">WF2 Stickman 30m</div><div>Renders daily 02:00, publishes 3×/week (Mon/Wed/Fri) → OpusClip 6 clips — niches + action plan from WF1 daily scan</div></div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4"><div className="font-bold">WF10 Monthly 14-Day</div><div>Growth Operator book: Warm-Up 1-3 / Value 4-9 / Money Days 10-14 + 11 buy buttons — Higgsfield slides → G4 once → Buffer (IG/TikTok at 1K)</div></div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4"><div className="font-bold">WF3 Polish + Final</div><div>OpusClip 9.2 virality + Higgsfield polishes BOTH longform + shorts (one prompt + one frame character lock) → queue38 → G4 → Buffer</div></div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4"><div className="font-bold">G4 queue38</div><div>queue38 pending_G4 → content guy tweaks captions/hashtags/LUT → approves to Buffer Team queue — excluded from improve loop per lock</div></div>
      </div>
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-400">Niche pool (env NICHES_POOL + DB): {pool.join(" • ")} — WF1 Grok picks top5 to Neon solo_domains for WF2. Change env + re-rank without code.</div>
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5">
        <h2 className="font-bold">queue38 pending_G4 — content guy swipe</h2>
        <div className="mt-3 space-y-2 text-sm">
          {[`Stickman 30min: ${pool[0]} Hack #3 → OpusClip 8s clip 1/6 virality 9.2 + virality 9.2 (GREEN <${t.ratio_green}+${t.er_green}%+)`,
            `Stickman 30m longform 2/6 ${pool[1]||pool[0]} → OpusClip virality 8.8 + captions 9:16`,
            `OpusClip 32s long ${pool[2]||pool[0]} virality 9.0 → queue38 pending tweaks`].map((text,i)=>(
            <div key={i} className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 flex justify-between items-center">
              <div>{text}</div><button className="px-3 py-1 rounded-full bg-white text-black text-xs font-bold">Approve → Buffer</button>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-zinc-600">Content guy equal SEND (equal_3_all lock) — can tweak any production step before approve. After G4 → social manager Buffer Team {c.serious_daily}/day + X {c.x_daily}/day {c.x_mode}.</div>
      </div>
    </div>
  );
}
