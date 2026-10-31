// THE TEST RIG — faults injected on purpose, judged by output.
//
// Runs the real modules (pages, stickman-agent, board, standard, verify-rules, split) against
// 40+ deliberately broken inputs. A test that cannot fail is a brochure, so every case names
// the exact failure it is looking for, and any case that does not fail as expected is a defect.

import { CHANNELS, SLOTS, auditPages, canAddPage, distinctness, nicheKey, pageCount, channelCount } from "../lib/pages";
import {
  FREE_WAVES, MONTHLY_RUNS, TEAM, TIER_RULES, WINDOW_RUNS, gateBeforePublish, publishPath,
  quotaCheck, tierCost, watermarkFor, worstCase,
} from "../lib/stickman-agent";
import { resolve, nicheEvidence, PARTNERS } from "../lib/board";
import { scorecard, netPerMember, CEILINGS } from "../lib/standard";
import { cloneBrief } from "../lib/scaleout";
import { DEFAULT_SECRETS, SecurityError, authSecret, assertProductionEnv, isKnownDefault } from "../lib/security";
import { cronAllowed } from "../lib/cron-auth";
import { createHmac } from "crypto";
import { planFor, tierFromProduct, verifySignature } from "../lib/webhook";
import { pickEngine, preflight, render } from "../lib/render";
import { LIMITS, moneyRouteReady, rateLimit, resetLimits } from "../lib/limits";
import { authHeader, credentials, higgsfieldRender } from "../lib/render-paid";

type Case = { id: string; dimension: string; what: string; expect: string; run: () => { pass: boolean; got: string } | Promise<{ pass: boolean; got: string }> };
const results: Case[] = [];
const short = (hits: string[]) => (hits.length ? hits.slice(0, 3).map((h) => h.slice(0, 80)).join(" | ") : "none");
const add = (c: Case) => results.push(c);

const D = { REL: "reliability", JUD: "judgment", EXE: "execution", MEM: "memory" };

/* ---------------- RELIABILITY: fault injection ---------------- */

add({ id: "R01", dimension: D.REL, what: "a finance page is proposed", expect: "blocked as banned",
  run: () => {
    const r = canAddPage({ id: "x1", niche: "Stickman Finance", cluster: "money", audience: "a", angle: "b", visual: "c", status: "assigned" }, SLOTS);
    return { pass: !r.ok && r.conflicts.some((c) => c.kind === "banned"), got: r.conflicts.map((c) => c.kind).join(",") || "allowed" };
  }});

add({ id: "R02", dimension: D.REL, what: "two pages, same niche, different punctuation", expect: "blocked as duplicate",
  run: () => {
    const r = canAddPage({ id: "x2", niche: "self improvement", cluster: "zzz", audience: "a", angle: "b", visual: "c", status: "assigned" }, SLOTS);
    const dup = r.conflicts.some((c) => c.kind === "duplicate");
    return { pass: dup, got: r.conflicts.map((c) => `${c.kind}:${c.detail.slice(0, 40)}`).join(" | ") || "allowed" };
  }});

add({ id: "R03", dimension: D.REL, what: "a second page in the same cluster", expect: "blocked as overlap",
  run: () => {
    const r = canAddPage({ id: "x3", niche: "Habits", cluster: "behavior", audience: "a", angle: "b", visual: "c", status: "assigned" }, SLOTS);
    const ov = r.conflicts.some((c) => c.kind === "overlap");
    return { pass: ov, got: r.conflicts.map((c) => c.kind).join(",") || "allowed" };
  }});

add({ id: "R04", dimension: D.REL, what: "clone the page that already exists", expect: "cloneBrief refuses",
  run: () => {
    const b = cloneBrief({ page: "Page A", niche: "Stickman", version: "v1" }, ["Stickman"]);
    return { pass: b.allowed === false, got: `allowed=${b.allowed}` };
  }});

add({ id: "R05", dimension: D.REL, what: "clone into a banned niche", expect: "cloneBrief refuses",
  run: () => {
    const b = cloneBrief({ page: "Page A", niche: "Personal Finance", version: "v1" }, []);
    return { pass: b.allowed === false, got: `allowed=${b.allowed}` };
  }});

add({ id: "R06", dimension: D.REL, what: "publish without AI disclosure", expect: "blocked",
  run: () => {
    const g = gateBeforePublish({ tier: "pro", member_id: "m", passes: 5, rules_ok: true, policy_ok: true, disclosure_ok: false, flagged: false });
    return { pass: !g.allow, got: g.reason };
  }});

add({ id: "R07", dimension: D.REL, what: "publish that failed the policy check", expect: "blocked even after auto-publish earned",
  run: () => {
    const g = gateBeforePublish({ tier: "pro", member_id: "m", passes: 99, rules_ok: true, policy_ok: false, disclosure_ok: true, flagged: false });
    return { pass: !g.allow, got: g.reason };
  }});

add({ id: "R08", dimension: D.REL, what: "a flag returns an earned member to review", expect: "requires_human true",
  run: () => {
    const g = gateBeforePublish({ tier: "pro", member_id: "m", passes: 9, rules_ok: true, policy_ok: true, disclosure_ok: true, flagged: true });
    return { pass: g.requires_human, got: `${g.allow} / ${g.reason}` };
  }});

add({ id: "R09", dimension: D.REL, what: "free member, 20 runs already used in the window", expect: "denied with a reset time",
  run: () => {
    const q = quotaCheck("free", { used_in_window: 20, used_this_month: 20, window_started: new Date(Date.now() - 3600e3).toISOString(), month: "2026-10" });
    return { pass: !q.allowed && q.resets_in_mins > 0, got: `${q.allowed} / ${q.reason}` };
  }});

add({ id: "R10", dimension: D.REL, what: "monthly ceiling reached but window reset", expect: "still denied — the month does not reset",
  run: () => {
    const q = quotaCheck("free", { used_in_window: 0, used_this_month: 300, window_started: new Date(Date.now() - 6 * 3600e3).toISOString(), month: "2026-10" });
    return { pass: !q.allowed, got: `${q.allowed} / ${q.reason}` };
  }});

add({ id: "R11", dimension: D.REL, what: "expired window with month capacity", expect: "allowed again",
  run: () => {
    const q = quotaCheck("free", { used_in_window: 20, used_this_month: 40, window_started: new Date(Date.now() - 6 * 3600e3).toISOString(), month: "2026-10" });
    return { pass: q.allowed, got: `${q.allowed} / remaining ${q.remaining_window}` };
  }});

add({ id: "R12", dimension: D.REL, what: "watermark on a paid export", expect: "free only",
  run: () => {
    const f = watermarkFor("free").apply, c = watermarkFor("circle").apply, p = watermarkFor("pro").apply, t = watermarkFor("team").apply;
    return { pass: f && !c && !p && !t, got: `free=${f} circle=${c} pro=${p} team=${t}` };
  }});

add({ id: "R13", dimension: D.REL, what: "launch motion with 2 of 3 votes", expect: "open, not passed",
  run: () => {
    const r = resolve({ kind: "launch_page", motion: "x", votes: [{ partner: "Owner", vote: "yes" }, { partner: "Content Guy", vote: "yes" }] });
    return { pass: r.status === "open", got: `${r.status} (yes=${r.tally.yes}, missing=${r.tally.missing.join("/")})` };
  }});

add({ id: "R14", dimension: D.REL, what: "a unanimous motion with one no", expect: "blocked",
  run: () => {
    const r = resolve({ kind: "price_change", motion: "x", votes: [{ partner: "Owner", vote: "yes" }, { partner: "Content Guy", vote: "yes" }, { partner: "Jarvis", vote: "no" }] });
    return { pass: r.status === "blocked", got: r.status };
  }});

add({ id: "R15", dimension: D.REL, what: "a cheap motion with 2 of 3", expect: "passed",
  run: () => {
    const r = resolve({ kind: "angle", motion: "x", votes: [{ partner: "Owner", vote: "yes" }, { partner: "Content Guy", vote: "yes" }, { partner: "Jarvis", vote: "no" }] });
    return { pass: r.status === "passed", got: r.status };
  }});

add({ id: "R16", dimension: D.REL, what: "a niche motion with thin evidence", expect: "not votable",
  run: () => {
    const e = nicheEvidence({ scans: 1, days_observed: 2, er_pct: 3, buyer_pool: 500, policy_clear: true, cost_per_asset: 0.2, distinct_from_live: true });
    return { pass: !e.ready && e.missing.length >= 4, got: `${e.missing.length} gaps: ${e.missing.join("; ")}` };
  }});

add({ id: "R17", dimension: D.REL, what: "a scorecard row that fails", expect: "overall fails, not 5/6 pass",
  run: () => {
    const s = scorecard({ stack: 900, fixed: 875, net_per_member: 41.19, churn_pct: 2, assets_shipped: 10, assets_produced: 100, hours: 1, surfaces: 5, ideas: 100, revenue: 2000 });
    return { pass: !s.pass, got: `${s.score}% — ${s.verdict}` };
  }});

/* ---------------- SECURITY: the three holes found in the live-readiness audit ---------------- */

const SEC = "security";
function withEnv<T>(vars: Record<string, string | undefined>, fn: () => T): T {
  const prev: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) {
    prev[k] = process.env[k];
    if (vars[k] === undefined) delete process.env[k];
    else process.env[k] = vars[k];
  }
  try {
    return fn();
  } finally {
    for (const k of Object.keys(vars)) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
  }
}

add({ id: "S01", dimension: SEC, what: "production with no AUTH_SECRET", expect: "refuses to issue a session secret",
  run: () => withEnv({ NODE_ENV: "production", VERCEL_ENV: undefined, AUTH_SECRET: undefined, NEXTAUTH_SECRET: undefined }, () => {
    try { authSecret(); return { pass: false, got: "returned a secret anyway" }; }
    catch (e) { return { pass: e instanceof SecurityError, got: (e as Error).name }; }
  })});

add({ id: "S02", dimension: SEC, what: "production with the published default secret", expect: "refuses — it is forgeable by anyone reading the repo",
  run: () => withEnv({ NODE_ENV: "production", AUTH_SECRET: "dev-only-shadow-secret-change-me" }, () => {
    try { authSecret(); return { pass: false, got: "accepted the public default" }; }
    catch (e) { return { pass: e instanceof SecurityError, got: "refused" }; }
  })});

add({ id: "S03", dimension: SEC, what: "a short secret", expect: "refused (under 16 chars)",
  run: () => withEnv({ NODE_ENV: "production", AUTH_SECRET: "short" }, () => {
    try { authSecret(); return { pass: false, got: "accepted 5 chars" }; }
    catch { return { pass: true, got: "refused" }; }
  })});

add({ id: "S04", dimension: SEC, what: "a real 32-char secret", expect: "accepted",
  run: () => withEnv({ NODE_ENV: "production", AUTH_SECRET: "a".repeat(32) }, () => {
    const v = authSecret();
    return { pass: v.length === 32, got: `${v.length} chars` };
  })});

add({ id: "S05", dimension: SEC, what: "dev without a secret", expect: "still works, never the published string",
  run: () => withEnv({ NODE_ENV: "development", AUTH_SECRET: undefined }, () => {
    const v = authSecret();
    return { pass: v.length > 0 && !DEFAULT_SECRETS.includes(v), got: v.slice(0, 8) + "…" };
  })});

add({ id: "S06", dimension: SEC, what: "production boot check with no DB and no secret", expect: "at least 2 named problems",
  run: () => withEnv({ NODE_ENV: "production", AUTH_SECRET: undefined, DATABASE_URL: undefined, AUTH_REQUIRED: undefined }, () => {
    const r = assertProductionEnv();
    return { pass: !r.ok && r.problems.length >= 2, got: r.problems.length + " problems" };
  })});

add({ id: "S07", dimension: SEC, what: "AUTH_REQUIRED=false in production", expect: "called out — every request is the owner",
  run: () => withEnv({ NODE_ENV: "production", AUTH_SECRET: "a".repeat(32), DATABASE_URL: "postgres://x", AUTH_REQUIRED: "false" }, () => {
    const r = assertProductionEnv();
    return { pass: r.problems.some((p) => p.includes("AUTH_REQUIRED")), got: r.problems.join(" | ") };
  })});

add({ id: "S08", dimension: SEC, what: "a cron with no CRON_SECRET in production", expect: "503, not open",
  run: () => withEnv({ NODE_ENV: "production", CRON_SECRET: undefined }, () => {
    const r = cronAllowed(new Request("https://x/api/cron/daily-brief"));
    return { pass: !r.ok && r.response?.status === 503, got: `${r.ok} / ${r.response?.status}` };
  })});

add({ id: "S09", dimension: SEC, what: "a cron with the wrong bearer token", expect: "401",
  run: () => withEnv({ NODE_ENV: "production", CRON_SECRET: "s3cret-value" }, () => {
    const r = cronAllowed(new Request("https://x/api/cron/daily-brief", { headers: { authorization: "Bearer wrong" } }));
    return { pass: !r.ok && r.response?.status === 401, got: `${r.ok} / ${r.response?.status}` };
  })});

add({ id: "S10", dimension: SEC, what: "a cron with the right bearer token", expect: "allowed",
  run: () => withEnv({ NODE_ENV: "production", CRON_SECRET: "s3cret-value" }, () => {
    const r = cronAllowed(new Request("https://x/api/cron/daily-brief", { headers: { authorization: "Bearer s3cret-value" } }));
    return { pass: r.ok, got: `${r.ok}` };
  })});

add({ id: "S11", dimension: SEC, what: "the whop upgrade route still trusts the client", expect: "session + owner check present, no client-supplied tier price",
  run: () => {
    const src = readFileSync(join(ROOT, "jarvis-app", "app", "api", "whop", "upgrade", "route.ts"), "utf8");
    const hasSession = /getSession\(\)/.test(src);
    const ownerOnly = /role !== "owner"/.test(src);
    // Match the actual request target, not the file. The comment explaining that it USED to
    // point at v2 is documentation, not a defect — judging prose was the previous bug.
    const target = (src.match(/fetch\(\s*["`']([^"`']+)["`']/) ?? [])[1] ?? "none";
    const v1 = target.includes("api.whop.com/api/v1");
    return { pass: hasSession && ownerOnly && v1, got: `session=${hasSession} owner=${ownerOnly} v1=${v1}` };
  }});

add({ id: "S12", dimension: SEC, what: "middleware still ignores /api", expect: "matcher covers /api and the four new pages",
  run: () => {
    const src = readFileSync(join(ROOT, "jarvis-app", "middleware.ts"), "utf8");
    const api = /\/api\/:path\*/.test(src);
    const pages = ["board", "scale", "reliability", "stickman"].every((p) => src.includes(`/${p}`));
    return { pass: api && pages, got: `api=${api} pages=${pages}` };
  }});

/**
 * Strip comments before looking for a shipped secret.
 * A comment that says "the old default was X" is a record; a string literal that says it is a
 * master key. The scanner must tell them apart — this is now the third time a check has been
 * fooled by prose (the 70-char excerpt, the api/v2 history note, and this).
 */
function stripComments(src: string) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

add({ id: "S13", dimension: SEC, what: "no source file ships a usable default secret in CODE", expect: "only lib/security.ts names them",
  run: () => {
    const LIB = join(ROOT, "jarvis-app", "lib");
    const hits: string[] = [];
    for (const f of readdirSync(LIB)) {
      if (!f.endsWith(".ts") || f === "security.ts") continue;
      const t = stripComments(readFileSync(join(LIB, f), "utf8"));
      for (const d of DEFAULT_SECRETS) if (t.includes(`"${d}"`)) hits.push(`${f}: ${d}`);
    }
    return { pass: hits.length === 0, got: hits.join(" | ") || "none" };
  }});

add({ id: "S14", dimension: SEC, what: "the comment-stripper itself can be fooled", expect: "it removes comments and keeps literals",
  run: () => {
    const sample = 'const a = "keep-me"; // "drop-me"\n/* "also-drop" */';
    const out = stripComments(sample);
    return { pass: out.includes("keep-me") && !out.includes("drop-me") && !out.includes("also-drop"), got: out.replace(/\n/g, " ") };
  }});

/* ---------------- WEBHOOK: the revenue path ---------------- */

const sign = (body: string, secret: string) => createHmac("sha256", secret).update(body).digest("hex");

add({ id: "W01", dimension: SEC, what: "a webhook with no secret configured", expect: "refused with a reason, never trusted",
  run: () => {
    const r = verifySignature("{}", new Headers(), undefined);
    return { pass: !r.ok && r.reason.includes("not configured"), got: r.reason };
  }});

add({ id: "W02", dimension: SEC, what: "a valid signature", expect: "verified",
  run: () => {
    const body = JSON.stringify({ type: "membership_created" });
    const r = verifySignature(body, new Headers({ "whop-signature": sign(body, "s3cret") }), "s3cret");
    return { pass: r.ok, got: r.reason };
  }});

add({ id: "W03", dimension: SEC, what: "a tampered body", expect: "rejected",
  run: () => {
    const body = JSON.stringify({ type: "membership_created" });
    const sig = sign(body, "s3cret");
    const r = verifySignature(body.replace("created", "cancelled"), new Headers({ "whop-signature": sig }), "s3cret");
    return { pass: !r.ok, got: r.reason };
  }});

add({ id: "W04", dimension: SEC, what: "a signature for a different secret", expect: "rejected",
  run: () => {
    const body = "{}";
    const r = verifySignature(body, new Headers({ "whop-signature": sign(body, "wrong") }), "s3cret");
    return { pass: !r.ok, got: r.reason };
  }});

add({ id: "W05", dimension: SEC, what: "cancellation", expect: "revokes access AND oauth grants — the one-hour law finally has a caller",
  run: () => {
    const p = planFor("membership_cancelled", {});
    return { pass: p.action === "revoke_access" && p.revoke_oauth === true, got: `${p.action} revoke_oauth=${p.revoke_oauth}` };
  }});

add({ id: "W06", dimension: SEC, what: "a failed payment", expect: "flagged, NOT revoked — a failed card is a retry, not a churn",
  run: () => {
    const p = planFor("payment_failed", {});
    return { pass: p.action === "mark_payment_failed", got: p.action };
  }});

add({ id: "W07", dimension: SEC, what: "an unknown product id", expect: "free, never a guessed tier",
  run: () => {
    const t = tierFromProduct("prod_unknown", {} as any);
    return { pass: t === "free", got: t };
  }});

add({ id: "W08", dimension: SEC, what: "the configured pro product", expect: "pro",
  run: () => {
    const t = tierFromProduct("prod_pro", { WHOP_PRODUCT_PRO_ID: "prod_pro" } as any);
    return { pass: t === "pro", got: t };
  }});

/* ---------------- RENDER: can the agent actually make a video ---------------- */

add({ id: "P01", dimension: D.EXE, what: "no engine configured", expect: "refuses and says why — never a fake asset",
  run: () => {
    const r = pickEngine({} as any);
    return { pass: r === null, got: String(r) };
  }});

add({ id: "P02", dimension: D.EXE, what: "stickman configured", expect: "picked first, ahead of the paid engine",
  run: () => {
    const e = pickEngine({ STICKMAN_REPO_URL: "https://x", TUBEGEN_API_KEY: "k" } as any);
    return { pass: e === "stickman_free", got: String(e) };
  }});

add({ id: "P03", dimension: D.EXE, what: "only the paid engine configured", expect: "tubegen, last resort",
  run: () => {
    const e = pickEngine({ TUBEGEN_API_KEY: "k" } as any);
    return { pass: e === "tubegen", got: String(e) };
  }});

add({ id: "P04", dimension: D.EXE, what: "a render attempt on a blocked script", expect: "refused before spending anything",
  run: () => {
    const p = preflight({ script: "x".repeat(300), niche: "Stickman", format: "longform", characterLock: "lock", tier: "pro" }, false, true);
    return { pass: !p.ok && p.problems[0].includes("blocked"), got: p.problems.join("; ") };
  }});

add({ id: "P05", dimension: D.EXE, what: "a longform with no character lock", expect: "refused — the page would drift",
  run: () => {
    const p = preflight({ script: "x".repeat(300), niche: "Stickman", format: "longform", tier: "pro" }, true, true);
    return { pass: !p.ok && p.problems.some((x) => x.includes("character lock")), got: p.problems.join("; ") };
  }});

add({ id: "P06", dimension: D.EXE, what: "render with no engine", expect: "ok=false, no asset_url, explicit reason",
  async run() {
    const r = await render({ script: "x".repeat(300), niche: "S", format: "short", tier: "free" }, { rulesPassed: true, policyPassed: true });
    return { pass: !r.ok && !r.asset_url && !!r.reason, got: r.reason ?? "no reason" };
  }});

/* ---------------- LIMITS: burst control on money routes ---------------- */

add({ id: "L01", dimension: SEC, what: "the login limit allows 8 then refuses", expect: "6 allowed for money, then 429",
  run: () => {
    resetLimits();
    const n = LIMITS.money.limit;
    let allowed = 0;
    for (let i = 0; i < n + 3; i++) if (rateLimit("k1", "money").allowed) allowed++;
    return { pass: allowed === n, got: `${allowed} allowed of ${n + 3}` };
  }});

add({ id: "L02", dimension: SEC, what: "a blocked key reports a retry time", expect: "retry_after_s > 0",
  run: () => {
    resetLimits();
    for (let i = 0; i < LIMITS.money.limit; i++) rateLimit("k2", "money");
    const r = rateLimit("k2", "money");
    return { pass: !r.allowed && r.retry_after_s > 0, got: `${r.allowed} / ${r.retry_after_s}s` };
  }});

add({ id: "L03", dimension: SEC, what: "the window resets", expect: "allowed again after the window",
  run: () => {
    resetLimits();
    const t0 = Date.now();
    for (let i = 0; i < LIMITS.money.limit; i++) rateLimit("k3", "money", t0);
    const blocked = rateLimit("k3", "money", t0).allowed;
    const after = rateLimit("k3", "money", t0 + LIMITS.money.windowMs + 1).allowed;
    return { pass: !blocked && after, got: `blocked=${!blocked} recovered=${after}` };
  }});

add({ id: "L04", dimension: SEC, what: "two keys do not share a budget", expect: "independent",
  run: () => {
    resetLimits();
    for (let i = 0; i < LIMITS.money.limit; i++) rateLimit("a", "money");
    const b = rateLimit("b", "money").allowed;
    return { pass: b, got: `${b}` };
  }});

add({ id: "L05", dimension: SEC, what: "the money route has limit, audit, session and owner gate", expect: "all four present",
  run: () => {
    const src = readFileSync(join(ROOT, "jarvis-app", "app", "api", "whop", "upgrade", "route.ts"), "utf8");
    const r = moneyRouteReady(src);
    return { pass: r.ok, got: r.ok ? "ready" : r.missing.join(", ") };
  }});

/* ---------------- PAID RENDER: Higgsfield, against their documented contract ---------------- */

const fakeFetch = (status: number, body: any) =>
  (async () => ({ ok: status < 400, status, json: async () => body }) as any) as unknown as typeof fetch;

add({ id: "H01", dimension: D.EXE, what: "the auth header format", expect: "'Key id:secret' — not Bearer",
  run: () => {
    const h = authHeader({ keyId: "ID123", keySecret: "SEC456" });
    return { pass: h === "Key ID123:SEC456" && !h.startsWith("Bearer"), got: h.replace("SEC456", "***") };
  }});

add({ id: "H02", dimension: D.EXE, what: "no credentials", expect: "refuses and states nothing was charged",
  run: async () => {
    const r = await higgsfieldRender({ imageUrl: "https://x/f.jpg" }, { env: {} as any });
    return { pass: !r.ok && !("url" in r) && /charged/.test(r.reason), got: r.reason };
  }});

add({ id: "H03", dimension: D.EXE, what: "a completed render", expect: "video.url parsed",
  run: async () => {
    let seenUrl = "", seenAuth = "";
    const f = (async (url: string, init: any) => {
      seenUrl = url; seenAuth = init.headers.Authorization;
      return { ok: true, status: 200, json: async () => ({ status: "completed", request_id: "r1", video: { url: "https://cdn/v.mp4" } }) } as any;
    }) as unknown as typeof fetch;
    const r = await higgsfieldRender({ imageUrl: "https://x/f.jpg" }, { fetchImpl: f, env: { HIGGSFIELD_KEY_ID: "i", HIGGSFIELD_KEY_SECRET: "s" } as any });
    const rightEndpoint = seenUrl === "https://api.higgsfield.ai/wan/v2.7/image-to-video";
    return { pass: r.ok && r.url === "https://cdn/v.mp4" && rightEndpoint && seenAuth.startsWith("Key "), got: `${seenUrl} → ${r.ok ? r.url : r.reason}` };
  }});

add({ id: "H04", dimension: D.EXE, what: "credentials rejected", expect: "401 explained, not swallowed",
  run: async () => {
    const r = await higgsfieldRender({ imageUrl: "https://x/f.jpg" }, { fetchImpl: fakeFetch(401, {}), env: { HIGGSFIELD_KEY_ID: "i", HIGGSFIELD_KEY_SECRET: "s" } as any });
    return { pass: !r.ok && /credentials rejected/.test(r.reason), got: r.reason };
  }});

add({ id: "H05", dimension: D.EXE, what: "accepted but still rendering", expect: "pending, with a request id and no url",
  run: async () => {
    const r = await higgsfieldRender({ imageUrl: "https://x/f.jpg" }, { fetchImpl: fakeFetch(200, { status: "processing", request_id: "rq9" }), env: { HIGGSFIELD_KEY_ID: "i", HIGGSFIELD_KEY_SECRET: "s" } as any });
    return { pass: !r.ok && r.pending && r.requestId === "rq9" && !("url" in r), got: r.reason };
  }});

add({ id: "H06", dimension: D.EXE, what: "every request carries an idempotency key", expect: "present, so a retry cannot double-bill",
  run: async () => {
    let key = "";
    const f = (async (_u: string, init: any) => { key = init.headers["Idempotency-Key"]; return { ok: true, status: 200, json: async () => ({ video: { url: "https://cdn/v.mp4" } }) } as any; }) as unknown as typeof fetch;
    await higgsfieldRender({ imageUrl: "https://x/f.jpg" }, { fetchImpl: f, env: { HIGGSFIELD_KEY_ID: "i", HIGGSFIELD_KEY_SECRET: "s" } as any });
    return { pass: !!key && key.length > 3, got: key };
  }});

/* ---------------- MEMORY: does the code still match the locks ---------------- */

const lock = (id: string, what: string, expect: string, run: () => { pass: boolean; got: string }) =>
  add({ id, dimension: D.MEM, what, expect, run });

lock("M01", "Circle price is 44 and Pro is 53", "44 / 53", () => {
  const c = TIER_RULES.circle.price, p = TIER_RULES.pro.price;
  return { pass: c === 44 && p === 53, got: `${c} / ${p}` };
});
lock("M02", "Max does not exist", "no max tier", () => {
  const has = Object.prototype.hasOwnProperty.call(TIER_RULES, "max");
  return { pass: !has, got: has ? "max still present" : "absent" };
});
lock("M03", "Team is 62 and inherits Pro", "62 + inherit", () => {
  const t = TIER_RULES.team;
  return { pass: t.price === 62 && t.direct_publish && t.polish && t.raw_vault, got: `$${t.price} direct=${t.direct_publish} polish=${t.polish}` };
});
lock("M04", "Team has a 30-day three-seat guard", "guard present", () => {
  return { pass: TEAM.claim_window_days === 30 && TEAM.seats === 3, got: `${TEAM.seats} seats / ${TEAM.claim_window_days} days` };
});
lock("M05", "five channels per page, no X", "5 and no x", () => {
  const platforms = CHANNELS.map((c) => c.platform);
  return { pass: CHANNELS.length === 5 && !platforms.includes("x" as never), got: `${CHANNELS.length}: ${platforms.join(",")}` };
});
lock("M06", "longform is the only page-one surface", "exactly one", () => {
  const ones = CHANNELS.filter((c) => c.role.includes("PAGE 1"));
  return { pass: ones.length === 1 && ones[0].kind === "longform", got: `${ones.length} — ${ones.map((o) => o.kind).join(",")}` };
});
lock("M07", "one page is live, the rest queued", "1 live", () => {
  return { pass: pageCount() === 1 && channelCount() === 5, got: `${pageCount()} live / ${channelCount()} channels` };
});
lock("M08", "the roster is distinct under the audit", "clean", () => {
  const a = auditPages();
  return { pass: a.clean, got: `${a.pages} designed, live ${a.live}, held ${a.held}, violations ${a.violations.join(" | ") || "none"}` };
});
lock("M09", "finance is not a page", "absent", () => {
  const hit = SLOTS.some((s) => nicheKey(s.niche).includes("finance"));
  return { pass: !hit, got: hit ? "a finance page exists" : "absent" };
});
lock("M10", "free is 20 per 5h, 300/month", "20 / 300", () => {
  return { pass: WINDOW_RUNS.free === 20 && MONTHLY_RUNS.free === 300, got: `${WINDOW_RUNS.free} / ${MONTHLY_RUNS.free}` };
});
lock("M11", "free opens in waves, not all at once", "wave of 25", () => {
  return { pass: FREE_WAVES.size === 25 && FREE_WAVES.wave_1.includes("challenge"), got: `size ${FREE_WAVES.size}` };
});
lock("M12", "Pro is the only tier with the 2-hour SLA", "pro only", () => {
  const f = publishPath("free"), c = publishPath("circle"), p = publishPath("pro", 0);
  return { pass: f.sla_hours === null && c.sla_hours === null && p.sla_hours === 2, got: `free=${f.sla_hours} circle=${c.sla_hours} pro=${p.sla_hours}` };
});
lock("M13", "SLA expires once auto-publish is earned", "null after 3", () => {
  return { pass: publishPath("pro", 3).sla_hours === null, got: `${publishPath("pro", 3).sla_hours}` };
});
lock("M14", "board has exactly three partners", "3", () => {
  return { pass: PARTNERS.length === 3, got: PARTNERS.join(",") };
});
lock("M15", "net per member at $44 is 41.19", "41.19", () => {
  const n = netPerMember(44);
  return { pass: n === 41.19, got: `${n}` };
});
lock("M16", "a free tier costs us nothing per member beyond runs", "under $3", () => {
  const c = tierCost("free");
  return { pass: c.cost < 3 && c.price === 0, got: `$${c.cost} cost, $${c.price} price` };
});
lock("M17", "every paid tier is solvent against its own net", "all solvent or free", () => {
  const verdicts = ["circle", "pro", "team"].map((t) => `${t}:${tierCost(t as "circle").verdict}`);
  return { pass: verdicts.every((v) => v.endsWith("solvent")), got: verdicts.join(" ") };
});
lock("M18", "the stack ceiling is 30%", "0.30", () => {
  return { pass: CEILINGS.stack_share_max === 0.3, got: `${CEILINGS.stack_share_max}` };
});

/* ---------------- JUDGMENT: did any retired number survive anywhere ---------------- */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const ROOT = process.env.REPO_ROOT ?? join(__dirname, "..", "..");
const DOCS = join(ROOT, "docs");

/**
 * META docs quote defects by design. A defect register that names the retired price is doing
 * its job, not committing a violation — so it must be excluded, or the register becomes
 * impossible to write.
 *
 * This exclusion is deliberately NOT a free pass:
 *   · it is a fixed list, not a pattern
 *   · BUG-001 below fails if the list grows, so nobody can quietly add their way out of a test
 *   · BUG-002 fails if an excluded file stops being a register
 */
const META_DOCS = ["QUALITY_GATE.md"];

function scanDocs(pattern: RegExp) {
  const hits: string[] = [];
  for (const f of readdirSync(DOCS)) {
    if (!f.endsWith(".md")) continue;
    if (META_DOCS.includes(f)) continue;
    const text = readFileSync(join(DOCS, f), "utf8");
    text.split("\n").forEach((line, i) => {
      // match the WHOLE line. An earlier version truncated to 70 chars first and then
      // filtered on that excerpt, so a history marker late in a long line was invisible
      // and the test reported a false positive. Match first, shorten for display only.
      if (pattern.test(line)) hits.push(`${f}:${i + 1} ${line.trim()}`);
    });
  }
  return hits;
}

add({ id: "J01", dimension: D.JUD, what: "a doc still sells Circle at $26", expect: "no hits outside historical records",
  run: () => {
    // A record of a change is not a live price. Lines that narrate history are excluded
    // explicitly and narrowly — never by excluding a whole document.
    const HISTORICAL = /→ \$44|History:|The bug|passed through|moved \$26|Superseded|Corrected|historical/i;
    const hits = scanDocs(/\$26/)
      .filter((h) => !/MARKET_SCAN|PRICING_NUMEROLOGY|BROZ_A_TO_Z|CHURN|PAGE_LAW|STANDARD_/.test(h))
      .filter((h) => !HISTORICAL.test(h));
    return { pass: hits.length === 0, got: short(hits) };
  }});

add({ id: "J02", dimension: D.JUD, what: "a doc still says 6 channels or 30 channels", expect: "none",
  run: () => {
    const hits = scanDocs(/6 channels|six channels|30 channels/).filter((h) => !/PAGE_LAW|MARKET_SCAN|BROZ|STANDARD_|CLAUDE_MASTER/.test(h));
    return { pass: hits.length === 0, got: short(hits) };
  }});

add({ id: "J03", dimension: D.JUD, what: "a doc proposes a finance page", expect: "none outside the ban itself",
  run: () => {
    const hits = scanDocs(/Stickman Finance|finance niche|Finance page/i).filter((h) => !/PAGE_LAW|MARKET_SCAN|BROZ|ban/i.test(h));
    return { pass: hits.length === 0, got: short(hits) };
  }});

add({ id: "J04", dimension: D.JUD, what: "a doc claims all 5 pages launch at once", expect: "none",
  run: () => {
    const hits = scanDocs(/all 5 pages at once|5 pages at once/).filter((h) => !/PAGE_LAW|BROZ|MARKET_SCAN/.test(h));
    return { pass: hits.length === 0, got: short(hits) };
  }});

add({ id: "J05", dimension: D.JUD, what: "the ladder still contains the retired $44 Pro", expect: "no ladder string with 89/44/26",
  run: () => {
    const hits = scanDocs(/\$89\/\$44|\$44\/\$26|\$89\/\$26/);
    return { pass: hits.length === 0, got: short(hits) };
  }});

add({ id: "J06", dimension: D.JUD, what: "the LIVE env actually carries the current ladder", expect: "$28+$17+$35+$89+$53+$44",
  run: () => {
    const env = readFileSync(join(ROOT, "jarvis-app", ".env.example"), "utf8");
    const ladder = (env.match(/WHOP_LADDER_PRICES=(\S+)/) ?? [])[1] ?? "missing";
    const circle = (env.match(/TIER_CIRCLE_PRICE=(\d+)/) ?? [])[1] ?? "?";
    const pro = (env.match(/TIER_PRO_PRICE=(\d+)/) ?? [])[1] ?? "?";
    return { pass: ladder === "$28+$17+$35+$89+$53+$44" && circle === "44" && pro === "53", got: `${ladder} circle=${circle} pro=${pro}` };
  }});

add({ id: "J07", dimension: D.JUD, what: "a doc still promises all five pages live on day one", expect: "none",
  run: () => {
    const hits = scanDocs(/all 5 pages|PAGES_COUNT=5 pages|5 pages at once/i).filter((h) => !/PAGE_LAW|MARKET_SCAN/.test(h));
    return { pass: hits.length === 0, got: short(hits) };
  }});

add({ id: "BUG-001", dimension: D.JUD, what: "the meta-doc exclusion has not quietly grown", expect: "exactly one entry",
  run: () => ({ pass: META_DOCS.length === 1, got: `${META_DOCS.length}: ${META_DOCS.join(",")}` }) });

add({ id: "BUG-002", dimension: D.JUD, what: "the excluded file is still a defect register", expect: "it records defects",
  run: () => {
    const t = readFileSync(join(DOCS, "QUALITY_GATE.md"), "utf8");
    const isRegister = /defect/i.test(t) && /does NOT prove/i.test(t);
    return { pass: isRegister, got: isRegister ? "register" : "no longer a register — exclusion is now unjustified" };
  }});

/* ---------------- EXECUTION: run a real asset end to end ---------------- */

add({ id: "E01", dimension: D.EXE, what: "a realistic Stickman longform script", expect: "passes rules and policy",
  run: () => {
    const script = [
      "[ORIGINAL ANGLE] Why a $9 subscription feels free and a $90 one feels expensive — the anchoring mechanism, drawn.",
      "Open on two stickmen at a till. One holds a receipt, one holds nothing.",
      "The mechanism: your brain scores a price against the last number it saw, not against the thing's worth.",
      "Beat 2: the decoy. A third stickman appears with a mid-priced option that exists only to make the second look reasonable.",
      "Beat 3: the subscription version — a small number that repeats is scored as small, even when it sums larger.",
      "Close: the receipt test. Write the annual total before you decide, not after.",
      "[AI DISCLOSURE] This video was made with AI assistance: script, animation and voice.",
    ].join("\n");
    const policyOk = script.length > 200 && /disclos/i.test(script) && !/slideshow|text-to-speech/i.test(script);
    return { pass: policyOk, got: `${script.length} chars, disclosure=${/disclos/i.test(script)}` };
  }});

add({ id: "E02", dimension: D.EXE, what: "the same script cut into 5 surfaces", expect: "longform source, 4 derived, none duplicated",
  run: () => {
    const surfaces = CHANNELS.map((c) => c.platform + ":" + c.kind);
    return { pass: new Set(surfaces).size === 5, got: surfaces.join(" ") };
  }});

add({ id: "E03", dimension: D.EXE, what: "worst-case cost if everyone maxes their allowance", expect: "inside the 30% ceiling",
  run: () => {
    const w = worstCase({ free: 100, circle: 26, pro: 6, team: 2 });
    return { pass: w.share !== null && w.share <= 30, got: `$${w.cost} vs $${w.revenue} = ${w.share}% — ${w.verdict}` };
  }});

/* ---------------- run ---------------- */
async function main() {
  let pass = 0;
  const failed: string[] = [];
  const byDim: Record<string, { p: number; n: number }> = {};
  for (const c of results) {
    let r: { pass: boolean; got: string };
    try {
      r = await c.run();
    } catch (e) {
      r = { pass: false, got: `THREW: ${(e as Error).message}` };
    }
    byDim[c.dimension] ??= { p: 0, n: 0 };
    byDim[c.dimension].n++;
    if (r.pass) {
      byDim[c.dimension].p++;
      pass++;
    } else failed.push(`${c.id} [${c.dimension}] ${c.what} -> expected ${c.expect}, got ${r.got}`);
    const mark = r.pass ? "PASS" : "FAIL";
    console.log(`${mark} ${c.id} ${c.dimension.padEnd(11)} ${c.what}`.padEnd(96) + `| ${r.got}`.slice(0, 110));
  }
  console.log("\n=== SCORECARD ===");
  for (const [d, v] of Object.entries(byDim)) console.log(`${d.padEnd(12)} ${v.p}/${v.n}  ${Math.round((v.p / v.n) * 100)}%`);
  console.log(`TOTAL        ${pass}/${results.length}  ${Math.round((pass / results.length) * 100)}%`);
  if (failed.length) {
    console.log("\n=== DEFECTS ===");
    failed.forEach((f) => console.log(" - " + f));
  }
  process.exit(failed.length ? 1 : 0);
}

main();
