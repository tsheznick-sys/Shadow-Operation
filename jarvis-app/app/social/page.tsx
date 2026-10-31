import { CONFIG } from "@/lib/config";
export default function SocialManager() {
  const c = CONFIG.content;
  const t = CONFIG.thresholds;
  const p = CONFIG.paywalls;
  const pool = CONFIG.niches.pool;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Social Media Manager — Posting + Analytics One Frontend • Buffer Team unlimited</h1>
      <p className="text-sm text-zinc-500">Approvals of the posting, analytics dashboard in one front-end — no need to open each platform. Guided by Jarvis Agent, gives Jarvis approval of autopublish + Chatfuel {CONFIG.conversion.chatfuel} + ManyChat YT 8ch. Platforms {c.channels.join("/")} • {c.serious_daily}/day serious + X {c.x_daily}/day {c.x_mode} (all env-driven).</p>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4"><div className="font-bold">Buffer Team queue</div><div>Buffer Team unlimited $12/channel — {c.serious_daily}/day per domain auto after approve — X {c.x_daily}/day discovery filler — no per-platform open</div></div>
        <div className="rounded-xl bg-teal-500 text-black p-4"><div className="font-bold">Analytics one frontend</div><div>Vercel embeds Buffer + Publisher + Social Blade alternatives — views/replies/ER/buyer_pool_x3 GREEN &lt;{t.ratio_green}+{t.er_green}%+ AMBER {t.ratio_green}-{t.ratio_amber_max}+{t.er_amber_min}-{t.er_amber_max}% in one board guided by Jarvis 24/7</div></div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4"><div className="font-bold">{CONFIG.conversion.chatfuel} + ManyChat</div><div>Chatfuel {CONFIG.conversion.chatfuel} + ManyChat YT Whop funnel — n8n Jarvis handles DMs, social reviews in one-app — ladder {p.ladder_display}</div></div>
      </div>
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-400">Niche queues (from CONFIG top5 solo_domains): {pool.slice(0,5).join(" • ")} — SEO by Jarvis Claude Max — auto adaptable without code.</div>
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5">
        <h2 className="font-bold">Buffer Team unlimited — social manager autopublish + one-app analytics</h2>
        <div className="mt-3 grid grid-cols-4 gap-3 text-center text-sm">
          <div className="rounded-xl bg-zinc-900 p-3"><div className="text-2xl font-black">{c.serious_daily}/day</div><div className="text-zinc-500">Buffer queue/domain</div></div>
          <div className="rounded-xl bg-zinc-900 p-3"><div className="text-2xl font-black">18.2K</div><div className="text-zinc-500">Views buffer live</div></div>
          <div className="rounded-xl bg-zinc-900 p-3 border border-teal-500/30"><div className="text-2xl font-black text-teal-400">312</div><div className="text-zinc-500">Replies {t.demand_percent}%+ PASS</div></div>
          <div className="rounded-xl bg-zinc-900 p-3"><div className="text-2xl font-black">{t.er_green}%+</div><div className="text-zinc-500">ER GREEN</div></div>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="rounded-xl bg-zinc-900 border border-teal-500/30 p-3 flex justify-between"><div>Buffer {c.serious_daily}/day: {pool.slice(0,3).join("/")} — SEO by Jarvis Claude Max — ready autopublish ({c.channels.join("/")})</div><button className="px-3 py-1 rounded-full bg-teal-500 text-black text-xs font-bold">Give Jarvis autopublish approval → live 24/7</button></div>
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3">Chatfuel DM inbox ({CONFIG.conversion.chatfuel} via CHATFUEL_TOKEN) + ManyChat 8ch Whop — n8n Jarvis auto-replies, social reviews here: 42 new DMs → 7 Whop leads</div>
        </div>
        <div className="mt-3 text-xs text-zinc-600">Social manager gets feedback from Jarvis Agent on all platforms connected — one Vercel dashboard embeds Buffer + Publisher + Chatfuel + n8n 24/7. Env PLATFORMS={c.channels.join(",")} X_MODE={c.x_mode}.</div>
      </div>
    </div>
  );
}
