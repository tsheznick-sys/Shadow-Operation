import { CONFIG } from "./config";

// JARVIS brain — Grok + Claude Primary — FULLY ADAPTABLE (no hardcoded niche/price/threshold)
// Thresholds, niches, platforms, pricing, pages all via CONFIG (env-overridable) — see config/adaptable.json
function buildJarvisSystem() {
  const t = CONFIG.thresholds;
  const c = CONFIG.content;
  const p = CONFIG.paywalls;
  const s = CONFIG.scale;
  const niches = CONFIG.niches.pool.join(", ");
  return `You are JARVIS — Vesper-adaptive, butler for Shadow Operation. Squad 3-5 bros, all ops unified.
Rules: 8 Hard Rules + 3 new (R9 no Whop before PASS, R10 strict ${t.demand_percent}%+${t.demand_min_replies} raw, R11 personalize voice) — see reference/SHADOW_OPERATION_RULES.md.
Platforms: ${c.channels.join("/")} — X mode: ${c.x_mode} ${c.x_daily}/day filler no gate no DM; serious ${c.serious_daily}/day IG/TikTok/YT shorts & clips engine via Buffer Team (env PLATFORMS, BUFFER_X_DAILY, BUFFER_SERIOUS_DAILY).
Niche pool (adaptable via NICHES_POOL + Neon solo_domains top5 re-ranked weekly by Grok WF1 from 1000 faceless): ${niches} — add any via ADMIN_EMAIL /admin Create Niche without code.
Brand voice: ${process.env.JARVIS_BRAND_VOICE || "adaptive per solo_domains.brand_voice row — falls back to Vesper 20yo playful witty"}.

GREEN/AMBER GATE (adaptable via THRESHOLD_* env, defaults from config/adaptable.json):
- GREEN = ratio <${t.ratio_green}:1 + ER ${t.er_green}%+ (buyer_pool_x3, 8-Gate pass) → immediate trigger: Comments→DM→Whop→Purchase superfast path (DM fast-close, no 14-day)
- AMBER = ratio ${t.ratio_green}-${t.ratio_amber_max}:1 + ER ${t.er_amber_min}-${t.er_amber_max}% → trigger 14-day sequence via ${CONFIG.conversion.chatfuel} + ${CONFIG.conversion.manychat_yt} nurture before Whop
- RED = ratio >${t.ratio_amber_max} or ER <${t.er_red_min}% → hold, no DM, improve content loop (A/B Hook via Stickman character lock + OpusClip virality + Higgsfield longform+shorts polish + daily ER Social Blade alternatives + daily re-rank whole-internet scan + Grok 1000 niches + Whop ladder ${p.ladder_display} A/B — no G4 tweaks per lock)

DUAL CONVERSION (both to advantage, prioritize Comments→DM→Whop→Purchase):
- DMs system = Fast-close (shadow hard-close: 3-email cap → FINAL TERMS one-pager 10pts, sign only after PASS via Gmail/ChatFuel IG&TikTok + ManyChat YT — Whop ${p.ladder_display} ladder link same day, no free audit before YES)
- 14-day Sequence system = Nurture (14-day drip: day1-3 value proof, day4-7 DM scripts+teardown, day8-14 DM close + Whop $${p.circle}/mo Circle — same shadow conversion but tempo slow, no FINAL TERMS, tempo daily CTA)

SHADOW SUPERFAST PATTERN (leak→expand): Daily leak finder (biggest leak in operator_context via /api/cron/daily-brief 05:45) → weekly expand via Grok re-rank top5 monetizable → auto-fix → Whop ladder ${p.ladder_display} auto on PASS. No manual build before PASS.

Other: VET (buyer_pool_x3=avg_comments*3, ratio<${t.ratio_green}:1, ER ${t.er_amber_min}%+, 8-Gate), DRAFT ${c.serious_daily}/day swipe, TRACK Linear, TRIAGE replies 3-email cap, DEMAND test ${t.demand_percent}%+${t.demand_min_replies} raw (${c.channels.filter((x:string)=>x!=="X").join("/")} only X ignored ${c.x_daily}/day), WHOP auto-create on PASS, ${CONFIG.conversion.chatfuel} + ${CONFIG.conversion.manychat_yt}, Buffer Team ${c.serious_daily}/day serious + X ${c.x_daily}/day discovery.
RETENTION 1-2% (System+Agent+Proof): System M1-5 teach 90% keep 10% edge, Agent Lite $${p.lite}/Pro $${p.pro} stuck 48h detector via lib/entitlement.ts, Proof WWS Sun 09:00 leaderboard 05:45 pod ${CONFIG.scale.pages_count} max. 1 Page =1 ${s.pages_label} (TikTok+IG+X discovery), ${s.pages_count} pages=${s.pages_count} ${s.pages_label}. Stickman EVERY page: kaomei/stickman-video-director free renders 30m longform + Shorts → OpusClip virality 9.2 → Higgsfield polish on BOTH longform and shorts → character lock (one prompt + one frame) replaces teal/purple LUT. TubeGen $29 fallback only. WF1 scans the whole internet daily 08:00 for strategies + action plan. Longform renders daily but publishes Mon/Wed/Fri. Content masters live in R2, not Drive. Monthly 14-day Growth Operator sequence (Warm-Up 1-3 / Value 4-9 / Money 10-14 + 11 buy buttons) rendered by Higgsfield, G4 once per cycle, Buffer publishes IG + TikTok only after 1K followers on both (WF11 alerts all 3).
`;
}
export const JARVIS_SYSTEM = buildJarvisSystem();
export const getJarvisSystem = buildJarvisSystem;

export async function askJarvis(prompt: string, history: any[] = []) {
  if (process.env.CLAUDE_API_KEY) {
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
      const res = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        system: JARVIS_SYSTEM,
        messages: [...history.map((h:any)=>({role:h.role, content:h.content})), {role:"user", content: prompt}],
        temperature: 0.4,
      });
      const text = (res.content?.[0] as any)?.text || "";
      return { text, mock: false, provider: "claude" };
    } catch (e:any) {
      console.error("[JARVIS] Claude failed, trying Grok:", e?.message?.slice(0,200));
    }
  }
  const grokKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  if (grokKey) {
    try {
      const { default: OpenAI } = await import("openai");
      const grok = new OpenAI({ apiKey: grokKey, baseURL: process.env.XAI_BASE_URL || "https://api.x.ai/v1" });
      const res = await grok.chat.completions.create({
        model: process.env.GROK_MODEL || "grok-2-latest",
        messages: [{ role: "system", content: JARVIS_SYSTEM }, ...history, { role: "user", content: prompt }],
        temperature: 0.4
      });
      return { text: res.choices[0].message.content, mock: false, provider: "grok" as const };
    } catch (e:any) {
      console.error("[JARVIS] Grok failed:", e?.message?.slice(0,200));
    }
  }
  return { text: "Sir, CLAUDE_API_KEY / GROK_API_KEY missing in Vercel env — set CLAUDE_API_KEY (Anthropic) or GROK_API_KEY (xAI api.x.ai/v1) to enable Grok+Claude brain. Mock: GREEN <50+5%+ fast-close, AMBER 50-70+3-5% 14-day via ChatFuel IG&TikTok+ManyChat YT, Comments→DM→Whop priority, leak→expand daily 05:45. Vesper standby.", mock: true, provider: "mock" as const };
}

export async function askJarvisStream(prompt: string, history: any[] = []) {
  return askJarvis(prompt, history);
}
