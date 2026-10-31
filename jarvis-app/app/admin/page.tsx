import { CONFIG } from "@/lib/config";
export default function AdminPipeline() {
  const pool = CONFIG.niches.pool;
  const c = CONFIG.content;
  const p = CONFIG.paywalls;
  const s = CONFIG.scale;
  const t = CONFIG.thresholds;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Admin — Whole Operation Pipeline • Monetization + Agent Upgrades • 24/7 n8n • Adaptable {s.pages_count} {s.pages_label}</h1>
      <p className="text-sm text-zinc-500">You own Shadow Operation whole pipeline — monetization of pages you run with Jarvis Agent + own & upgrade agent hosted in N8N (Claude Pro/Max main brain + Grok speciality). Self-only 3-man scalable {s.pages_count} {s.pages_label}. Niches pool {pool.length}: {pool.slice(0,4).join(", ")} + any via /admin without code.</p>
      <div className="grid grid-cols-4 gap-3 text-sm">
        <div className="rounded-xl bg-teal-500 text-black p-4"><div className="font-bold">Monetize {s.pages_count} {s.pages_label}</div><div>Whop ladder {p.ladder_display} per domain scalable — {t.demand_percent}%+{t.demand_min_replies} PASS auto → Whop live — pricing env TIER_* without code</div></div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4"><div className="font-bold">Claude Max brain 24/7</div><div>n8n Cloud $20 24/7 + Claude Pro/Max main brain — all prompts via n8n Code + CONFIG thresholds — replaces OpenAI</div></div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4"><div className="font-bold">Higgsfield polish</div><div>Higgsfield improves final Shorts pieces (upscale/clean) + Stickman character lock per Finance page — open-source engine + TubeGen longform</div></div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4"><div className="font-bold">Grok speciality</div><div>Research competitors + 1000 faceless {pool[0]}/{pool[1]} niches via X trending → WF1 top5 to solo_domains</div></div>
      </div>
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5">
        <h2 className="font-bold">Whole pipeline A→Z — admin sees all + decides PASS/FAIL • adaptable via env</h2>
        <ol className="list-decimal ml-5 mt-3 space-y-2 text-sm text-zinc-300">
          <li><b>TubeGen 30min longform faceless 2h →</b> Claude Max auto-scripts {c.words_per_longform} words per domain (scalable {s.pages_count} via PAGES_COUNT) → admin picks domains from Grok top5</li>
          <li><b>OpusClip auto (Claude Pro&Max together n8n automatically clips) →</b> 5-8 shorts virality ranked → admin gets feedback (no approval required) — brand voice per page via solo_domains.brand_voice</li>
          <li><b>Stickman Shorts + TubeGen longform →</b> OpusClip virality → Higgsfield short-form polish → character lock → queue38 — Content Guy G4 tweaks → admin views</li>
          <li><b>Jarvis SEO (Claude Max) → Buffer Team unlimited →</b> social gives Jarvis autopublish approval → live 24/7 without opening platforms ({c.channels.join("/")})</li>
          <li><b>Analytics one-app Vercel embeds n8n+Buffer+Chatfuel →</b> social manager feedback from Jarvis on all platforms → admin sees one dashboard for all 3 bros</li>
          <li><b>Whop ladder auto on PASS {t.demand_percent}%+{t.demand_min_replies} →</b> admin monetizes pages — Whop sales fund n8n loops (MVP ${s.mvp_monthly} → SCALE ${s.scale_monthly} for {s.pages_count} pages)</li>
          <li><b>Own & upgrade agent:</b> Vercel embeds n8n 24/7 — upgrade via n8n Cloud + Claude Max + Grok — one app dashboard always 24/7 — see live links + config/n8n_workflow_variables.json</li>
        </ol>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-zinc-900 p-3"><div className="font-bold">Self-only scalable {s.pages_count} {s.pages_label}</div><div className="text-zinc-500 mt-1">No external creators in this ZIP — {s.pages_count} {s.pages_label} via PAGES_COUNT template owns — add niche via /admin + env NICHES_POOL without deploy to code</div></div>
          <div className="rounded-xl bg-zinc-900 p-3 border border-teal-500/30"><div className="font-bold text-teal-400">24/7 one-app 3-man</div><div className="text-zinc-500 mt-1">Vercel embeds n8n Cloud $20 + Buffer Team $12/channel + Chatfuel — all 3 bros see same board filtered by role — equal SEND — X {c.x_daily}/day {c.x_mode}</div></div>
        </div>
      </div>
    </div>
  );
}
