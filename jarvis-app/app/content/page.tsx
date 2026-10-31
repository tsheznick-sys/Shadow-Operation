import { CONFIG } from "@/lib/config";
export default function ContentG4() {
  const pool = CONFIG.niches.pool;
  const c = CONFIG.content;
  const t = CONFIG.thresholds;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Content Guy — Production Pipeline G4 • queue38 pending</h1>
      <p className="text-sm text-zinc-500">He does the G4 approval & any changes to be made in the content & production pipeline — approves queue38 before Buffer. Claude Max auto-scripts TubeGen 30min → OpusClip auto clips → his G4 tweaks → approve to social. Adaptable niches via CONFIG + Neon solo_domains top5 (no hardcoded here).</p>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-teal-500 text-black p-4"><div className="font-bold">WF2 TubeGen 30m</div><div>Claude auto-scripts {c.words_per_longform} words → TubeGen faceless 30min longform → OpusClip auto → 5-8 shorts — niches from WF1 Grok rank</div></div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4"><div className="font-bold">WF3 Stickman + Virality</div><div>n8n stickman-video-director free Shorts + OpusClip 9.2 virality — Stickman Finance character lock (one prompt + one frame) → queue38 — brand voice per niche</div></div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4"><div className="font-bold">G4 queue38</div><div>queue38 pending_G4 → content guy tweaks captions/hashtags/LUT → approves to Buffer Team queue — excluded from improve loop per lock</div></div>
      </div>
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-400">Niche pool (env NICHES_POOL + DB): {pool.join(" • ")} — WF1 Grok picks top5 to Neon solo_domains for WF2. Change env + re-rank without code.</div>
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5">
        <h2 className="font-bold">queue38 pending_G4 — content guy swipe</h2>
        <div className="mt-3 space-y-2 text-sm">
          {[`TubeGen 30min: ${pool[0]} Hack #3 → OpusClip 8s clip 1/6 virality 9.2 + virality 9.2 (GREEN <${t.ratio_green}+${t.er_green}%+)`,
            `TubeGen 30m longform 2/6 ${pool[1]||pool[0]} → OpusClip virality 8.8 + captions 9:16`,
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
