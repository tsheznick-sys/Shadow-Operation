// PAID RENDER — Higgsfield, implemented against their published API.
//
// Verified from docs.higgsfield.ai (2026-10-31):
//   base      https://api.higgsfield.ai
//   auth      Authorization: Key ${HF_API_KEY_ID}:${HF_API_KEY_SECRET}   (NOT Bearer)
//   endpoint  POST /wan/v2.7/image-to-video
//   body      { image_url, prompt?, duration?, resolution?, seed? }
//   response  { status, request_id, video: { url } }
//   headers   Idempotency-Key supported — we always send one, so a retry cannot double-bill.
//
// Chosen over the free stickman engine on 2026-10-31 because this contract is documented today,
// while the free engine's submit shape is not. The engine order in lib/render.ts is unchanged:
// free first, this second — so money is only spent when the cheap path cannot run.

export const HF_BASE = "https://api.higgsfield.ai";
export const HF_WAN = "/wan/v2.7/image-to-video";

export type HfCredentials = { keyId: string; keySecret: string };

export function credentials(env = process.env): HfCredentials | null {
  const keyId = env.HIGGSFIELD_KEY_ID;
  const keySecret = env.HIGGSFIELD_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

/**
 * The auth header. Two ways to get this wrong, both of which cost a confusing 401:
 *   - using "Bearer" — Higgsfield wants the literal word "Key"
 *   - sending only the secret — it is ID:SECRET as one string
 */
export function authHeader(c: HfCredentials): string {
  return `Key ${c.keyId}:${c.keySecret}`;
}

/**
 * A flat shape rather than a discriminated union.
 *
 * The union looked tidier but forced every caller into a narrowing branch before it could even
 * read a failure reason — which is how a render wrapper ends up logging "unknown error". Callers
 * check `ok` and then read whatever is present.
 */
export type HfResult = {
  ok: boolean;
  url?: string;
  pending?: boolean;
  requestId?: string;
  engine?: "higgsfield_wan";
  reason?: string;
  status?: number;
};

/** Submit one image-to-video render. `fetchImpl` is injectable so the shape is testable offline. */
export async function higgsfieldRender(
  input: { imageUrl: string; prompt?: string; duration?: number; resolution?: "720p" | "1080p"; idempotencyKey?: string },
  opts: { fetchImpl?: typeof fetch; env?: NodeJS.ProcessEnv } = {},
): Promise<HfResult> {
  const env = opts.env ?? process.env;
  const creds = credentials(env);
  if (!creds) {
    return { ok: false, pending: false, reason: "HIGGSFIELD_KEY_ID / HIGGSFIELD_KEY_SECRET not set — nothing was charged" };
  }
  if (!input.imageUrl) {
    return { ok: false, pending: false, reason: "no first frame — image-to-video needs an image_url" };
  }
  const doFetch = opts.fetchImpl ?? fetch;
  const body = {
    image_url: input.imageUrl,
    ...(input.prompt ? { prompt: input.prompt } : {}),
    duration: Math.min(15, Math.max(2, input.duration ?? 5)),
    resolution: input.resolution ?? "720p",
  };

  let res: Response;
  try {
    res = await doFetch(`${HF_BASE}${HF_WAN}`, {
      method: "POST",
      headers: {
        Authorization: authHeader(creds),
        "Content-Type": "application/json",
        // Always present: a network retry must not bill the same render twice.
        "Idempotency-Key": input.idempotencyKey ?? `hf_${Date.now()}`,
      },
      body: JSON.stringify(body),
    });
  } catch (e: any) {
    return { ok: false, pending: false, reason: `request failed before reaching Higgsfield: ${e?.message ?? "unknown"}` };
  }

  const data: any = await res.json().catch(() => ({}));

  if (res.status === 401 || res.status === 403) {
    return {
      ok: false,
      pending: false,
      status: res.status,
      reason: "credentials rejected — check the Key ID:SECRET format and that the key is enabled",
    };
  }
  if (!res.ok) {
    return { ok: false, pending: false, status: res.status, reason: data?.error ?? data?.message ?? `HTTP ${res.status}` };
  }
  const url = data?.video?.url ?? data?.output?.video?.url;
  if (url) return { ok: true, url, requestId: data?.request_id ?? "", engine: "higgsfield_wan" };
  return {
    ok: false,
    pending: true,
    requestId: data?.request_id,
    reason: `accepted but still rendering (status: ${data?.status ?? "unknown"}) — poll before scheduling`,
  };
}

/** Cost is plan-dependent, so it is configured rather than assumed. */
export function renderCost(env = process.env): number {
  const n = Number(env.HIGGSFIELD_COST_PER_RENDER ?? "0.1");
  return Number.isFinite(n) && n >= 0 ? n : 0.1;
}
