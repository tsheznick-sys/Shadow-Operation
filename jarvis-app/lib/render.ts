// RENDER — the difference between a product and four screens describing one.
//
// Before this file the agent had no way to make a video: no adapter, no storage call, no route.
// The panel promised "script -> render -> cut -> schedule" and every step was a paragraph.
//
// Engine order (owner-stated 2026-10-31: free stickman first):
//   1. stickman free repo  — $0, our own engine, the one page 1 is meant to run on
//   2. Wan T4              — $0 fallback if the primary render fails
//   3. TubeGen / paid      — only when a specific asset justifies the spend
//
// The adapter never pretends. If it is not configured it says so and returns no asset, because
// a fake asset is worse than a missing one: it would ship to a real channel.

export type RenderRequest = {
  script: string;
  niche: string;
  format: "longform" | "short";
  /** the locked frame that keeps the character identical across every episode */
  characterLock?: string;
  tier: "free" | "circle" | "pro" | "team";
};

export type RenderResult = {
  ok: boolean;
  engine: string;
  asset_url?: string;
  duration_s?: number;
  watermark: boolean;
  cost: number;
  reason?: string;
};

export const ENGINE_ORDER = ["stickman_free", "wan_t4", "tubegen"] as const;
export type Engine = (typeof ENGINE_ORDER)[number];

export const ENGINE_COST: Record<Engine, number> = {
  stickman_free: 0,
  wan_t4: 0,
  tubegen: 0.35,
};

/** Configuration check, so a missing env fails on the panel instead of mid-render. */
export function engineStatus(env = process.env): { engine: Engine; configured: boolean; why: string }[] {
  return ENGINE_ORDER.map((e) => {
    if (e === "stickman_free") {
      const url = env.STICKMAN_REPO_URL || env.STICKMAN_FREE_REPO;
      return { engine: e, configured: !!url, why: url ? "ready" : "STICKMAN_REPO_URL not set" };
    }
    if (e === "wan_t4") {
      const url = env.WAN_T4_URL;
      return { engine: e, configured: !!url, why: url ? "ready" : "WAN_T4_URL not set" };
    }
    const key = env.TUBEGEN_API_KEY;
    return { engine: e, configured: !!key, why: key ? "ready" : "TUBEGEN_API_KEY not set (paid — last resort)" };
  });
}

/** The first engine that can actually run. Null means: nothing can render right now. */
export function pickEngine(env = process.env): Engine | null {
  const ok = engineStatus(env).find((s) => s.configured);
  return ok ? ok.engine : null;
}

/**
 * Pre-flight. Everything that must be true BEFORE spending a render.
 * A render that runs on a blocked script is money spent to produce a video nobody may post.
 */
export function preflight(req: RenderRequest, rulesPassed: boolean, policyPassed: boolean) {
  const problems: string[] = [];
  if (!rulesPassed) problems.push("rules failed — a blocked script must not cost a render");
  if (!policyPassed) problems.push("policy failed — rendering it would produce an unusable asset");
  if (req.script.trim().length < 200) problems.push("script under 200 chars — that is a caption, not an episode");
  if (!req.characterLock && req.format === "longform") problems.push("no character lock — a longform without one drifts and stops being the same page");
  if (!ENGINE_ORDER.includes("stickman_free")) problems.push("engine order corrupted");
  return { ok: problems.length === 0, problems };
}

/**
 * Submit a render. Honest by construction: unconfigured means no asset, not a placeholder URL.
 */
export async function render(req: RenderRequest, opts: { rulesPassed: boolean; policyPassed: boolean; fetchImpl?: typeof fetch }): Promise<RenderResult> {
  const pre = preflight(req, opts.rulesPassed, opts.policyPassed);
  const engine = pickEngine();
  const watermark = req.tier === "free";
  if (!pre.ok) {
    return { ok: false, engine: engine ?? "none", watermark, cost: 0, reason: pre.problems.join("; ") };
  }
  if (!engine) {
    return {
      ok: false, engine: "none", watermark, cost: 0,
      reason: "no render engine configured — set STICKMAN_REPO_URL. Refusing to return a fake asset.",
    };
  }
  // The remote contract is deliberately not invented here: the endpoint shape must be confirmed
  // against the stickman repo before this can call it. Until then it fails closed with a reason.
  return {
    ok: false, engine, watermark, cost: 0,
    reason: `${engine} is configured but its submit contract is not yet wired — add the endpoint call here rather than guessing it`,
  };
}
