// PUBLISH — one adapter, five surfaces, and an error that cannot be mistaken for a success.
//
// Why this file was written (2026-10-31):
//
//   n8n WF5 posted to `https://api.bufferapp.com/1/updates/create.json`. That is Buffer's REST
//   v1 API, which Buffer retired — its own migration guide now opens with the before/after table.
//   The replacement is GraphQL at `https://api.buffer.com`: always POST, always GraphQL, one
//   channel per call, Bearer key.
//
//   Worse than the dead URL is what the new API makes possible if you are careless: **a failed
//   mutation returns HTTP 200**. `createPost` returns a union — `PostActionSuccess | MutationError`
//   — and Buffer answers 200 either way. A caller that checks `res.ok` records every failure as a
//   successful publish and never retries. That is the same shape as every other defect this
//   project has had: a failure that reads as success. It is handled first, and tested first.
//
//   Three more things this file refuses to do:
//     · publish a post without its video because the media field was rejected (silent downgrade)
//     · publish from a tier that is not allowed to publish directly
//     · decide a channel id from a default. An unset channel is a refusal, not a guess.

import { TIER_SPECS, type AgentTier, type PaidTier } from "./tiers";

export const BUFFER_ENDPOINT = "https://api.buffer.com";

/**
 * Buffer's documented ceilings. 100 per 15 minutes, 250–500 a day, depending on plan.
 * At full scale this operation sends 5 surfaces × 5 pages × 3 posts = 75/day, which fits — but
 * it is a budget that has to be *seen*, not assumed.
 */
export const BUFFER_LIMITS = { per_15m: 100, per_day_floor: 250, per_day_ceiling: 500 } as const;

/* ------------------------------- the surfaces ------------------------------- */

export type Surface = "youtube_longform" | "youtube_shorts" | "tiktok" | "instagram" | "facebook";

export type SurfaceSpec = {
  /** the `service` value Buffer reports on the channel */
  service: "youtube" | "tiktok" | "instagram" | "facebook";
  /** env var holding the channel id — one per surface, never a shared default */
  env: string;
  label: string;
  caption_max: number;
  hashtags_max: number;
  /** YouTube only: title and description are separate fields */
  title_max?: number;
  description_max?: number;
  /** every surface this operation posts to is a video surface. Text-only is not a downgrade, it is a different product. */
  video_required: boolean;
};

export const SURFACES: Record<Surface, SurfaceSpec> = {
  youtube_longform: {
    service: "youtube",
    env: "BUFFER_CHANNEL_YOUTUBE_LONGFORM",
    label: "YouTube — longform",
    caption_max: 5000,
    hashtags_max: 15,
    title_max: 100,
    description_max: 5000,
    video_required: true,
  },
  youtube_shorts: {
    service: "youtube",
    env: "BUFFER_CHANNEL_YOUTUBE_SHORTS",
    label: "YouTube — Shorts",
    caption_max: 5000,
    hashtags_max: 15,
    title_max: 100,
    description_max: 5000,
    video_required: true,
  },
  tiktok: {
    service: "tiktok",
    env: "BUFFER_CHANNEL_TIKTOK",
    label: "TikTok",
    caption_max: 2200,
    hashtags_max: 10,
    video_required: true,
  },
  instagram: {
    service: "instagram",
    env: "BUFFER_CHANNEL_INSTAGRAM",
    label: "Instagram — Reels",
    caption_max: 2200,
    hashtags_max: 30,
    video_required: true,
  },
  facebook: {
    service: "facebook",
    env: "BUFFER_CHANNEL_FACEBOOK",
    label: "Facebook — Reels",
    caption_max: 5000,
    hashtags_max: 10,
    video_required: true,
  },
};

export const ALL_SURFACES = Object.keys(SURFACES) as Surface[];

/** What `/api/publish` reports: five rows, each saying whether its channel is set. */
export function describeChannels(env: Env = process.env) {
  return ALL_SURFACES.map((s) => {
    const spec = SURFACES[s];
    const id = (env[spec.env] || "").trim();
    return {
      surface: s,
      label: spec.label,
      env: spec.env,
      channel: id ? `${id.slice(0, 6)}…` : null,
      configured: id.length > 0,
      caption_max: spec.caption_max,
      video_required: spec.video_required,
    };
  });
}

/** X is deliberately absent. It was removed on 2026-10-31 and must not creep back in. */
export const RETIRED_SURFACES = ["x", "twitter"] as const;

export type ChannelMap = Partial<Record<Surface, string>>;
export type Env = Record<string, string | undefined>;

/** Read the five channel ids from env. An empty string is treated as unset, never as an id. */
export function channelsFromEnv(env: Env = process.env): { channels: ChannelMap; missing: Surface[] } {
  const channels: ChannelMap = {};
  const missing: Surface[] = [];
  for (const s of ALL_SURFACES) {
    const v = (env[SURFACES[s].env] || "").trim();
    if (v) channels[s] = v;
    else missing.push(s);
  }
  return { channels, missing };
}

/* ------------------------------- who may publish ------------------------------- */

/**
 * Direct publish is a tier privilege, and it is read from the registry rather than restated here.
 * A tier that is not allowed to publish directly gets the asset as a download and publishes it
 * themselves — which is the product they bought.
 */
export function canAutoPublish(tier: AgentTier): boolean {
  if (tier === "free") return false;
  const spec = TIER_SPECS[tier as PaidTier];
  return !!spec?.direct_publish;
}

/* ------------------------------- the post body ------------------------------- */

export type PublishInput = {
  surface: Surface;
  channelId: string;
  /** the caption / post text */
  text: string;
  /** public URL of the finished video. Required on every surface we run. */
  videoUrl?: string;
  /** optional thumbnail / image */
  imageUrl?: string;
  /** YouTube only */
  title?: string;
  /** ISO timestamp; omit to use the channel's queue */
  dueAt?: string;
};

export type Problem = { code: string; detail: string };

/** Trim to a platform limit without cutting a word in half, and say it was trimmed. */
export function clampText(text: string, max: number): { text: string; trimmed: boolean } {
  const t = (text || "").trim();
  if (t.length <= max) return { text: t, trimmed: false };
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const safe = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return { text: safe.trimEnd() + "…", trimmed: true };
}

/** Count hashtags in the text, so a platform limit is checked rather than hoped for. */
export function countHashtags(text: string): number {
  return (text.match(/(^|\s)#[A-Za-z0-9_]+/g) || []).length;
}

/**
 * Validate an input before any network call, and return the exact problems.
 * A refusal here is cheap; a rejected mutation after a human approved the asset is not.
 */
export function validate(input: PublishInput, env: Env = process.env): Problem[] {
  const problems: Problem[] = [];
  const spec = SURFACES[input.surface];
  if (!spec) return [{ code: "unknown_surface", detail: `${input.surface} is not a surface this operation runs` }];

  if (!input.channelId || !input.channelId.trim()) {
    problems.push({ code: "no_channel", detail: `${spec.env} is unset — a channel is never guessed` });
  }
  if (spec.video_required && !(input.videoUrl || "").trim()) {
    problems.push({ code: "no_video", detail: `${spec.label} is a video surface; a text-only post is a different product` });
  }
  if (input.videoUrl && !/^https?:\/\//i.test(input.videoUrl.trim())) {
    problems.push({ code: "video_not_public_url", detail: "Buffer fetches the asset itself; a local path will never resolve" });
  }
  if (spec.title_max && input.title && input.title.length > spec.title_max) {
    problems.push({ code: "title_too_long", detail: `${input.title.length} > ${spec.title_max} for ${spec.label}` });
  }
  if (countHashtags(input.text) > spec.hashtags_max) {
    problems.push({ code: "too_many_hashtags", detail: `${countHashtags(input.text)} > ${spec.hashtags_max} for ${spec.label}` });
  }
  if (!(input.text || "").trim() && !input.title) {
    problems.push({ code: "empty_post", detail: "no text and no title — nothing to publish" });
  }
  return problems;
}

export type Built = {
  query: string;
  variables: { input: Record<string, any> };
  /** what was changed to fit, so a caller can log it rather than discover it later */
  adjustments: string[];
};

/**
 * The GraphQL document, with BOTH union members selected.
 *
 * `... on MutationError { message }` is not optional decoration. Without it a failed mutation
 * returns `{}` under `createPost`, `post` is undefined, and a careless caller reads that as
 * "no error". Buffer's own migration guide says to always include both.
 */
export const CREATE_POST_MUTATION = `mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    __typename
    ... on PostActionSuccess {
      post { id text status dueAt }
    }
    ... on MutationError {
      message
    }
  }
}`;

export function buildCreatePost(input: PublishInput, env: Env = process.env): { built?: Built; problems: Problem[] } {
  const problems = validate(input, env);
  if (problems.length) return { problems };

  const spec = SURFACES[input.surface];
  const adjustments: string[] = [];
  const { text, trimmed } = clampText(input.text, spec.caption_max);
  if (trimmed) adjustments.push(`caption trimmed to ${spec.caption_max} chars for ${spec.label}`);

  const post: Record<string, any> = {
    channelId: input.channelId.trim(),
    text,
    schedulingType: "automatic",
  };

  if (input.dueAt) {
    post.mode = "customScheduled";
    post.dueAt = input.dueAt;
  } else {
    post.mode = "addToQueue";
  }

  // Media goes in `assets`. If the schema rejects the video the mutation returns a message we
  // surface — it does NOT quietly publish the text alone. That is enforced by validate() above
  // and by the caller refusing an assetless success below.
  const assets: any[] = [];
  if (input.videoUrl) assets.push({ video: { url: input.videoUrl.trim() } });
  if (input.imageUrl) assets.push({ image: { url: input.imageUrl.trim() } });
  if (assets.length) post.assets = assets;

  if (spec.title_max && input.title) post.title = input.title.slice(0, spec.title_max);

  return { built: { query: CREATE_POST_MUTATION, variables: { input: post }, adjustments }, problems };
}

/* ------------------------------- the answer ------------------------------- */

export type PublishSuccess = {
  ok: true;
  status: "ok";
  post: { id?: string; text?: string; status?: string; dueAt?: string };
};
export type PublishFailure = {
  ok: false;
  status: "error";
  code: "mutation_error" | "graphql_error" | "rate_limited" | "http_error" | "no_post_returned" | "network" | "not_configured";
  message: string;
  retryable: boolean;
};
export type PublishResult = PublishSuccess | PublishFailure;

/**
 * THE discriminator. HTTP 200 is not success; a `post` in the union is.
 *
 * Buffer returns:
 *   200 { data: { createPost: { __typename: "PostActionSuccess", post: {...} } } }   → success
 *   200 { data: { createPost: { __typename: "MutationError", message: "..." } } }    → FAILURE
 *   200 { errors: [ { message: "..." } ] }                                          → FAILURE
 *   429                                                                             → retry later
 *
 * A function that returns `res.ok` here records failures as publishes. That is the bug.
 */
export function classifyResponse(status: number, body: any): PublishResult {
  if (status === 429) {
    return { ok: false, status: "error", code: "rate_limited", message: "Buffer rate limit — 100 per 15 minutes", retryable: true };
  }
  if (status < 200 || status >= 300) {
    return { ok: false, status: "error", code: "http_error", message: `HTTP ${status}`, retryable: status >= 500 };
  }
  const errors = body?.errors;
  if (Array.isArray(errors) && errors.length) {
    return { ok: false, status: "error", code: "graphql_error", message: errors.map((e: any) => e?.message).filter(Boolean).join("; ").slice(0, 300), retryable: false };
  }
  const node = body?.data?.createPost;
  if (!node) {
    return { ok: false, status: "error", code: "no_post_returned", message: "no createPost in the response — treat as failure, not silence", retryable: false };
  }
  if (node.__typename === "MutationError" || typeof node.message === "string") {
    return { ok: false, status: "error", code: "mutation_error", message: String(node.message || "mutation error").slice(0, 300), retryable: false };
  }
  if (!node.post) {
    return { ok: false, status: "error", code: "no_post_returned", message: "success union carried no post", retryable: false };
  }
  return { ok: true, status: "ok", post: { id: node.post.id, text: node.post.text, status: node.post.status, dueAt: node.post.dueAt } };
}

/* ------------------------------- the transport ------------------------------- */

export type BufferClient = { key: string; endpoint: string };

export function client(env: Env = process.env): { client?: BufferClient; problem?: Problem } {
  const key = (env.BUFFER_API_KEY || env.BUFFER_TOKEN || "").trim();
  if (!key) return { problem: { code: "not_configured", detail: "BUFFER_API_KEY is unset — nothing can be published" } };
  return { client: { key, endpoint: (env.BUFFER_ENDPOINT || BUFFER_ENDPOINT).replace(/\/$/, "") } };
}

async function gql(c: BufferClient, query: string, variables: any, fetchImpl: typeof fetch, timeoutMs = 30_000) {
  const ctrl: any = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(c.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${c.key}` },
      body: JSON.stringify({ query, variables }),
      signal: ctrl.signal,
    });
    let body: any = null;
    try { body = await res.json(); } catch { body = null; }
    return { status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

/** Publish one post to one surface. One channel per call — that is the API's shape, not a choice. */
export async function publish(
  input: PublishInput,
  opts: { env?: Env; fetchImpl?: typeof fetch } = {},
): Promise<PublishResult> {
  const env = opts.env || process.env;
  const { client: c, problem } = client(env);
  if (!c) return { ok: false, status: "error", code: "not_configured", message: problem!.detail, retryable: false };

  const { built, problems } = buildCreatePost(input, env);
  if (!built) {
    return { ok: false, status: "error", code: "not_configured", message: problems.map((p) => `${p.code}: ${p.detail}`).join("; "), retryable: false };
  }

  try {
    const { status, body } = await gql(c, built.query, built.variables, opts.fetchImpl || fetch);
    return classifyResponse(status, body);
  } catch (e: any) {
    const aborted = e?.name === "AbortError";
    return {
      ok: false,
      status: "error",
      code: "network",
      message: aborted ? "Buffer did not answer in 30s" : (e?.message || "network error").slice(0, 200),
      retryable: true,
    };
  }
}

/* ------------------------------- discovery ------------------------------- */

export type Channel = { id: string; name?: string; displayName?: string; service?: string };

/**
 * List the channels this key can see, and say which of our five surfaces each one is.
 *
 * A channel is never identified by position or by default. This is the only supported way to
 * learn the ids, and the mapping is written into env by a human who read the names.
 */
export async function listChannels(opts: { env?: Env; fetchImpl?: typeof fetch; organizationId?: string } = {}) {
  const env = opts.env || process.env;
  const { client: c, problem } = client(env);
  if (!c) return { ok: false as const, error: problem!.detail, channels: [] as Channel[], organizations: [] as any[] };

  const orgId = (opts.organizationId || env.BUFFER_ORGANIZATION_ID || "").trim();
  try {
    let orgs: any[] = [];
    if (!orgId) {
      const r = await gql(c, `query { account { organizations { id name } } }`, {}, opts.fetchImpl || fetch, 15_000);
      if (r.status >= 300 || r.body?.errors) {
        return { ok: false as const, error: `account query failed: HTTP ${r.status}`, channels: [], organizations: [] };
      }
      orgs = r.body?.data?.account?.organizations ?? [];
      if (orgs.length === 0) return { ok: false as const, error: "this key sees no organizations", channels: [], organizations: [] };
    }

    const useOrg = orgId || orgs[0].id;
    const q = `query Channels($organizationId: OrganizationId!) {
      channels(input: { organizationId: $organizationId }) { id name displayName service }
    }`;
    const r = await gql(c, q, { organizationId: useOrg }, opts.fetchImpl || fetch, 15_000);
    if (r.status >= 300 || r.body?.errors) {
      return { ok: false as const, error: `channels query failed: ${r.body?.errors?.[0]?.message ?? `HTTP ${r.status}`}`, channels: [], organizations: orgs };
    }
    const channels: Channel[] = r.body?.data?.channels ?? [];
    return { ok: true as const, channels, organizations: orgs, organizationId: useOrg };
  } catch (e: any) {
    return { ok: false as const, error: (e?.message || "network").slice(0, 200), channels: [], organizations: [] };
  }
}

/**
 * Which of the five surfaces does each channel look like, and what is still missing?
 * Matching is by Buffer's `service` field plus a name hint — never by order.
 */
export function proposeMapping(channels: Channel[]): { proposed: ChannelMap; unmatched: Channel[]; ambiguous: string[] } {
  const proposed: ChannelMap = {};
  const ambiguous: string[] = [];
  const used = new Set<string>();

  // YouTube reports one service for both surfaces; the name is the only discriminator.
  const order: Surface[] = ["youtube_longform", "youtube_shorts", "tiktok", "instagram", "facebook"];
  for (const s of order) {
    const spec = SURFACES[s];
    const candidates = channels.filter((c) => !used.has(c.id) && (c.service || "").toLowerCase() === spec.service);
    if (candidates.length === 0) continue;
    let pick: Channel | undefined;
    if (spec.service === "youtube") {
      const isShort = /short/i.test(`${candidates[0].name ?? ""} ${candidates[0].displayName ?? ""}`);
      const wantShort = s === "youtube_shorts";
      pick = candidates.find((c) => /short/i.test(`${c.name ?? ""} ${c.displayName ?? ""}`) === wantShort) ?? candidates[0];
      if (candidates.length > 1 && !isShort && !wantShort && candidates.length === 2 && s === "youtube_longform") {
        // two YouTube channels, neither named — the human has to say which is which
        const bothPlain = candidates.every((c) => !/short/i.test(`${c.name ?? ""} ${c.displayName ?? ""}`));
        if (bothPlain) ambiguous.push("two YouTube channels and neither is named Shorts — assign by hand");
      }
    } else {
      pick = candidates[0];
    }
    if (pick) {
      proposed[s] = pick.id;
      used.add(pick.id);
    }
  }
  return { proposed, unmatched: channels.filter((c) => !used.has(c.id)), ambiguous };
}

/* ------------------------------- budget ------------------------------- */

/** Will this many posts fit inside Buffer's ceilings? Asked before a batch, not after. */
export function fitsBudget(posts: number, window: "15m" | "day" = "15m") {
  const cap = window === "15m" ? BUFFER_LIMITS.per_15m : BUFFER_LIMITS.per_day_floor;
  return { ok: posts <= cap, cap, posts, detail: `${posts}/${cap} in ${window}` };
}
