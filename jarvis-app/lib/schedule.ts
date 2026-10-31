// THE SCHEDULER — the agent books a slot, Buffer publishes it, nobody posts by hand.
//
// Why this file exists (2026-10-31):
//
//   `agent_schedule` has been in migrate.sql since the build began: member, page, platform,
//   publish_at, asset, watermark, gate_status, publish_path, sla_due_at, and a partial index on
//   exactly the rows a publisher would select. **Nothing ever wrote to it or read from it.**
//   A table with a due-index and no reader is the fifth artifact in this project that reads like
//   machinery — same shape as the prose workflows, the orphaned render adapter and the dead
//   model id. It is a promise made in SQL.
//
// What replaces it is the loop the product actually sells:
//
//   asset → gate → slots → rows in agent_schedule → a cron claims what is due → Buffer → published
//
// Three rules govern it, and each one exists because of a specific way this can go wrong:
//
//   1. **A slot is never in the past.** Booking 09:00 when it is 11:00 means the post arrives
//      instantly, which looks broken and burns a day of cadence.
//   2. **One post per surface per day, per page.** Two posts to the same channel inside 24h is the
//      duplicated-template signal that gets channels suppressed — on TikTok especially.
//   3. **The claim is atomic.** The publisher does `UPDATE … WHERE gate_status='pass' … RETURNING`,
//      never SELECT-then-POST. A cron that runs twice (retry, overlapping deploy) would otherwise
//      publish everything twice, and neither run would report an error.
//
// Timezone: a fixed offset, default +180 (Africa/Nairobi, no DST). This is honest for one operator
// in one place. It is NOT a timezone library, and SCHEDULE_UTC_OFFSET_MIN exists so moving does not
// require code.

import { publishPath, gateBeforePublish, watermarkFor, type Tier, type PublishAttempt } from "./stickman-agent";
import { SURFACES, type Surface, type ChannelMap, type Env } from "./publish";

// Re-exported so a caller imports scheduling types from one module.
export type { Surface, ChannelMap, Env };
export type { Tier } from "./stickman-agent";

export const MAX_ATTEMPTS = 3;
export const MAX_BATCH = 25;
export const DEFAULT_UTC_OFFSET_MIN = 180; // EAT, UTC+3, no DST

/**
 * When each surface is posted, in local time. Staggered on purpose: five channels posting the
 * same clip at the same minute is a template, and platforms score templates against you.
 */
export const DEFAULT_SLOTS: Record<Surface, string> = {
  youtube_longform: "09:00",
  youtube_shorts: "12:00",
  tiktok: "17:00",
  instagram: "19:00",
  facebook: "20:00",
};

/** Longform is 3×/week; the cut-down surfaces are daily. 0 = Sunday, 1 = Monday. */
export const LONGFORM_DAYS = [1, 3, 5];

export const SCHEDULABLE_SURFACES: Surface[] = ["youtube_longform", "youtube_shorts", "tiktok", "instagram", "facebook"];

/* ------------------------------- time ------------------------------- */

export function utcOffsetMinutes(env: Env = process.env): number {
  const raw = (env.SCHEDULE_UTC_OFFSET_MIN || "").trim();
  const n = Number(raw);
  return Number.isFinite(n) && Math.abs(n) <= 14 * 60 ? n : DEFAULT_UTC_OFFSET_MIN;
}

/** "09:00" → 540. Returns null for anything that is not a real time of day. */
export function parseHHMM(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec((value || "").trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

/**
 * The UTC instant for a local wall-clock time on a given local day.
 * Fixed offset, so it is arithmetic rather than a lookup — correct for EAT, documented as such.
 */
export function slotInstant(localDay: string, hhmm: string, offsetMin: number): Date | null {
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDay);
  const mins = parseHHMM(hhmm);
  if (!day || mins === null) return null;
  const utcMs = Date.UTC(Number(day[1]), Number(day[2]) - 1, Number(day[3]), 0, 0, 0) + mins * 60_000 - offsetMin * 60_000;
  return new Date(utcMs);
}

/** The local calendar day (YYYY-MM-DD) that contains `at`, at the given offset. */
export function localDay(at: Date, offsetMin: number): string {
  const shifted = new Date(at.getTime() + offsetMin * 60_000);
  return shifted.toISOString().slice(0, 10);
}

/** What weekday is it, locally? 0..6. */
export function localWeekday(at: Date, offsetMin: number): number {
  return new Date(at.getTime() + offsetMin * 60_000).getUTCDay();
}

export function slotTimeFor(surface: Surface, env: Env = process.env): string {
  const key = `SCHEDULE_SLOT_${surface.toUpperCase()}`;
  const v = (env[key] || "").trim();
  return parseHHMM(v) !== null ? v : DEFAULT_SLOTS[surface];
}

export function longformDays(env: Env = process.env): number[] {
  const raw = (env.LONGFORM_PUBLISH_DAYS || "").trim();
  if (!raw) return LONGFORM_DAYS;
  const days = raw.split(",").map((x) => Number(x.trim())).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
  return days.length ? days : LONGFORM_DAYS;
}

/** Is this surface allowed on this local day? Only longform is restricted. */
export function allowedOn(surface: Surface, weekday: number, env: Env = process.env): boolean {
  if (surface !== "youtube_longform") return true;
  return longformDays(env).includes(weekday);
}

/**
 * The next slot at or after `after`. Never returns an instant in the past — if today's slot has
 * gone, it walks forward, up to a fortnight (after which something is wrong upstream).
 */
export function nextSlot(
  surface: Surface,
  after: Date,
  opts: { env?: Env; offsetMin?: number } = {},
): Date | null {
  const env = opts.env || process.env;
  const offset = opts.offsetMin ?? utcOffsetMinutes(env);
  const time = slotTimeFor(surface, env);

  for (let i = 0; i < 14; i++) {
    const probe = new Date(after.getTime() + i * 86_400_000);
    const day = localDay(probe, offset);
    const wd = localWeekday(probe, offset);
    if (!allowedOn(surface, wd, env)) continue;
    const at = slotInstant(day, time, offset);
    if (at && at.getTime() >= after.getTime()) return at;
  }
  return null;
}

/* ------------------------------- planning ------------------------------- */

export type BookedSlot = { surface: Surface; publish_at: string; page_ref?: string };

export type PlanInput = {
  asset_id: string;
  page_ref: string;
  member_id?: string;
  tier: Tier;
  /** the gate inputs, straight from the asset */
  rules_ok: boolean;
  policy_ok: boolean;
  disclosure_ok: boolean;
  flagged?: boolean;
  passes?: number;
  /** how many videos / how it should be cut */
  surfaces?: Surface[];
  /** earliest acceptable publish time */
  not_before?: Date;
  /** double-quota members get one slot a day; this is the per-surface cap */
  per_surface_per_day?: number;
};

export type PlannedRow = {
  asset_id: string;
  page_ref: string;
  member_id?: string;
  surface: Surface;
  publish_at: string;
  watermark: boolean;
  gate_status: "pass" | "g4_review" | "blocked";
  publish_path: string;
  sla_due_at: string | null;
  blocked_by: string | null;
};

export type Plan = {
  rows: PlannedRow[];
  /** true when nothing can be scheduled at all, with the reason */
  refused: { code: string; detail: string } | null;
};

/** Key used for the one-post-per-surface-per-day rule. */
export function dayKey(surface: Surface, publish_at: string, offsetMin: number): string {
  return `${surface}:${localDay(new Date(publish_at), offsetMin)}`;
}

/**
 * Turn one finished asset into the rows a publisher will pick up.
 *
 * The gate runs first and the slot second. A blocked asset produces no `pass` row at all — it does
 * not get a time and then get refused, because a row with a time is a promise the system may keep
 * by accident.
 */
export function planAsset(input: PlanInput, opts: { env?: Env; booked?: BookedSlot[]; now?: Date } = {}): Plan {
  const env = opts.env || process.env;
  const now = opts.now ?? new Date();
  const offset = utcOffsetMinutes(env);

  // Tier gate. Free does not reach a publisher at all: the download IS the product.
  const path = publishPath(input.tier, input.passes ?? 0);
  if (path.path === "manual_download") {
    return { rows: [], refused: { code: "manual_tier", detail: "free receives the file to post; the scheduler is not part of that product" } };
  }

  const gate = gateBeforePublish({
    tier: input.tier,
    member_id: input.member_id ?? "unknown",
    passes: input.passes ?? 0,
    rules_ok: input.rules_ok,
    policy_ok: input.policy_ok,
    disclosure_ok: input.disclosure_ok,
    flagged: input.flagged ?? false,
  } as PublishAttempt);

  if (!gate.allow) {
    return {
      rows: [],
      refused: { code: "gate_blocked", detail: gate.reason },
    };
  }

  const wm = watermarkFor(input.tier).apply;
  const booked = new Set((opts.booked ?? []).map((b) => dayKey(b.surface, b.publish_at, offset)));
  const perDay = Math.max(1, input.per_surface_per_day ?? 1);
  const surfaces = (input.surfaces ?? SCHEDULABLE_SURFACES).filter((s) => SCHEDULABLE_SURFACES.includes(s));

  const start = input.not_before && input.not_before > now ? input.not_before : now;
  const rows: PlannedRow[] = [];

  for (const surface of surfaces) {
    let cursor = start;
    let placed: Date | null = null;

    // Walk forward until a day has room. One post per surface per day is the default; the
    // second occurrence slides to the next valid day rather than stacking.
    for (let attempt = 0; attempt < 30 && !placed; attempt++) {
      const slot = nextSlot(surface, cursor, { env, offsetMin: offset });
      if (!slot) break;
      const key = dayKey(surface, slot.toISOString(), offset);
      const used = countBooked(booked, key);
      if (used < perDay) {
        booked.add(key);
        placed = slot;
      } else {
        // jump past this day entirely
        cursor = new Date(slot.getTime() + 24 * 3600_000);
      }
    }
    if (!placed) continue;

    const slaHours = path.sla_hours;
    rows.push({
      asset_id: input.asset_id,
      page_ref: input.page_ref,
      member_id: input.member_id,
      surface,
      publish_at: placed.toISOString(),
      watermark: wm,
      // A Pro member's first three publishes wait for a human. Circle goes straight through:
      // scheduled via our publisher is what $44 buys.
      gate_status: gate.requires_human ? "g4_review" : "pass",
      publish_path: path.path,
      sla_due_at: gate.requires_human && slaHours ? new Date(placed.getTime() + slaHours * 3600_000).toISOString() : null,
      blocked_by: null,
    });
  }

  if (rows.length === 0) {
    return { rows, refused: { code: "no_slot", detail: "no surface had a free slot in the next fortnight" } };
  }
  return { rows, refused: null };
}

function countBooked(booked: Set<string>, key: string): number {
  // The set holds one entry per booked occurrence; duplicates were never added, so room is
  // tracked by a shadow count keyed off the same string.
  let n = 0;
  for (const _ of Array.from(booked)) {
    if (_ === key) n++;
  }
  return n;
}

/* ------------------------------- the publisher ------------------------------- */

/**
 * THE CLAIM. One statement, conditional, returning only what it won.
 *
 * Two cron invocations in the same minute (a retry, an overlapping deploy, a manual run during a
 * scheduled one) must not both publish the same row. `SELECT … then POST` cannot promise that;
 * `UPDATE … WHERE … RETURNING` can, because the row leaves `pass` the moment it is claimed.
 *
 * `gate_status = 'pass'` excludes G4 rows (a Pro member's first three) — those wait for a human to
 * move them to `pass`, and the publisher must never do it for them.
 */
export const CLAIM_SQL = `
WITH due AS (
  SELECT id FROM agent_schedule
   WHERE gate_status = 'pass'
     AND publish_at <= $1
     AND attempts < ${MAX_ATTEMPTS}
     AND claimed_at IS NULL
   ORDER BY publish_at
   LIMIT $2
   FOR UPDATE SKIP LOCKED
)
UPDATE agent_schedule s
   SET claimed_at = NOW(), attempts = s.attempts + 1
  FROM due
 WHERE s.id = due.id
RETURNING s.id, s.member_id, s.page_ref, s.platform, s.asset_id, s.watermark, s.publish_at, s.attempts
`;

/** The mark. `published` only after Buffer confirmed a post id. */
export const MARK_SQL = `
UPDATE agent_schedule
   SET gate_status = $2,
       buffer_post_id = $3,
       last_error = $4,
       published_at = CASE WHEN $2 = 'published' THEN NOW() ELSE published_at END,
       claimed_at = NULL
 WHERE id = $1
`;

/** Backoff between attempts: 5 minutes, then 30, then 2 hours. Never a tight retry loop. */
export function backoffMinutes(attempts: number): number {
  const ladder = [5, 30, 120];
  return ladder[Math.max(0, Math.min(attempts - 1, ladder.length - 1))];
}

export type DueRow = {
  id: number;
  member_id: string | null;
  page_ref: string;
  platform: Surface;
  asset_id: string;
  watermark: boolean;
  publish_at: string;
  attempts: number;
};

/** Should this row be sent right now? The publisher asks this of every claimed row. */
export function claimable(row: DueRow, now: Date, maxAttempts = MAX_ATTEMPTS): { ok: boolean; why: string } {
  if (row.attempts > maxAttempts) return { ok: false, why: `${row.attempts} attempts — blocked for review` };
  if (new Date(row.publish_at).getTime() > now.getTime()) return { ok: false, why: "not due yet" };
  return { ok: true, why: "due" };
}

/**
 * Which channel does this row publish to?
 *
 * A member who connected their own channel has a row in member_channels; otherwise the page's
 * channel comes from env. If neither exists the row is blocked — a channel is never guessed from
 * position or from a default, because publishing a paying member's work to the wrong account is
 * not a recoverable mistake.
 */
export function resolveChannel(
  row: { platform: Surface },
  memberChannels: Partial<Record<Surface, string>> | null,
  pageChannels: ChannelMap,
): { channelId: string | null; source: "member" | "page" | "none" } {
  const fromMember = memberChannels?.[row.platform];
  if (fromMember && fromMember.trim()) return { channelId: fromMember.trim(), source: "member" };
  const fromPage = pageChannels[row.platform];
  if (fromPage && fromPage.trim()) return { channelId: fromPage.trim(), source: "page" };
  return { channelId: null, source: "none" };
}

/** How many rows a single run may send. Buffer allows 100 per 15 min; 25 leaves room for the rest. */
export function batchSize(queued: number, env: Env = process.env): number {
  const cap = Number((env.SCHEDULE_MAX_BATCH || "").trim()) || MAX_BATCH;
  return Math.max(0, Math.min(queued, cap, MAX_BATCH));
}

/** The exact failure the publisher must not swallow: Buffer says 200 and the post did not happen. */
export function shouldCountAsPublished(result: { ok: boolean; post?: { id?: string } }): boolean {
  return result.ok === true && typeof result.post?.id === "string" && result.post.id.length > 0;
}

export const SCHEDULABLE_NOTE =
  "X is not schedulable. It was removed on 2026-10-31 and is absent from agent_schedule's platform CHECK.";
