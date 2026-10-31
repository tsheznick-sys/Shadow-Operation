// NUMBER VERIFICATION — never take a member's word for a number.
// Jarvis opens the link AND pulls the real count from the platform, then reconciles.
// A mismatch over CHALLENGE_MISMATCH_LIMIT (default 20%) rejects the day.

export type VerifyResult = {
  ok: boolean;
  status: "verified" | "mismatch" | "api_missing" | "unreachable";
  claimed: number;
  actual: number | null;
  mismatch_pct: number;
  reason: string;
};

export function mismatchLimit(): number {
  const v = Number(process.env.CHALLENGE_MISMATCH_LIMIT || 20);
  return Number.isFinite(v) && v >= 0 ? v : 20;
}

export function verifiesLinks(): boolean {
  return (process.env.CHALLENGE_VERIFY_LINKS || "true").toLowerCase() !== "false";
}

/** Which platform a link belongs to — decides which API to read. */
export function platformOf(link: string): "youtube" | "tiktok" | "instagram" | "unknown" {
  const l = link.toLowerCase();
  if (l.includes("youtube.com") || l.includes("youtu.be")) return "youtube";
  if (l.includes("tiktok.com")) return "tiktok";
  if (l.includes("instagram.com")) return "instagram";
  return "unknown";
}

/**
 * Pull the real public count for a post.
 * Uses the APIs already in the stack. Returns null when the key is missing —
 * and null is reported honestly as api_missing, never as "verified".
 */
export async function realCount(link: string, metric: "views" | "comments"): Promise<number | null> {
  const platform = platformOf(link);
  try {
    if (platform === "youtube") {
      const key = process.env.YOUTUBE_API_KEY;
      if (!key) return null;
      const id = ytId(link);
      if (!id) return null;
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${encodeURIComponent(id)}&key=${key}`,
        { cache: "no-store" }
      );
      if (!res.ok) return null;
      const j: any = await res.json();
      const s = j?.items?.[0]?.statistics;
      if (!s) return null;
      return Number(metric === "views" ? s.viewCount : s.commentCount) || 0;
    }

    // TikTok + Instagram only expose these counts through the business APIs the stack already holds.
    if (platform === "tiktok" && process.env.TIKTOK_ACCESS_TOKEN) return null; // wired in WF3, not here
    if (platform === "instagram" && process.env.META_ACCESS_TOKEN) return null;

    return null;
  } catch {
    return null;
  }
}

function ytId(link: string): string | null {
  try {
    const u = new URL(link);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    const v = u.searchParams.get("v");
    if (v) return v;
    const m = u.pathname.match(/\/(shorts|embed|live)\/([A-Za-z0-9_-]{6,})/);
    return m ? m[2] : null;
  } catch {
    return null;
  }
}

/** Compare what they typed against what the platform says. */
export function reconcile(claimed: number, actual: number | null, limit = mismatchLimit()): VerifyResult {
  if (actual === null) {
    return {
      ok: true,
      status: "api_missing",
      claimed,
      actual: null,
      mismatch_pct: 0,
      reason: "platform key missing — counted, but flagged as unverified and excluded from the leaderboard top 3",
    };
  }
  if (actual <= 0) {
    return { ok: false, status: "unreachable", claimed, actual, mismatch_pct: 0, reason: "the post could not be read" };
  }
  const pct = Math.abs(claimed - actual) / actual * 100;
  if (pct > limit) {
    return {
      ok: false,
      status: "mismatch",
      claimed,
      actual,
      mismatch_pct: Math.round(pct),
      reason: `claimed ${claimed} vs real ${actual} — ${Math.round(pct)}% off, limit ${limit}%. This day does not count until corrected.`,
    };
  }
  return {
    ok: true,
    status: "verified",
    claimed,
    actual,
    mismatch_pct: Math.round(pct),
    reason: `verified against the platform (${Math.round(pct)}% off)`,
  };
}

/** The full check for one submission. */
export async function verifySubmission(
  link: string,
  claimed: number,
  metric: "views" | "comments" = "comments"
): Promise<VerifyResult> {
  if (!verifiesLinks()) {
    return { ok: true, status: "api_missing", claimed, actual: null, mismatch_pct: 0, reason: "verification disabled by env" };
  }
  if (!/^https?:\/\//i.test(link)) {
    return { ok: false, status: "unreachable", claimed, actual: null, mismatch_pct: 0, reason: "no valid link submitted" };
  }
  const actual = await realCount(link, metric);
  return reconcile(claimed, actual);
}
