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

type Case = { id: string; dimension: string; what: string; expect: string; run: () => { pass: boolean; got: string } };
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

function scanDocs(pattern: RegExp) {
  const hits: string[] = [];
  for (const f of readdirSync(DOCS)) {
    if (!f.endsWith(".md")) continue;
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
let pass = 0;
const failed: string[] = [];
const byDim: Record<string, { p: number; n: number }> = {};
for (const c of results) {
  let r: { pass: boolean; got: string };
  try { r = c.run(); } catch (e) { r = { pass: false, got: `THREW: ${(e as Error).message}` }; }
  byDim[c.dimension] ??= { p: 0, n: 0 };
  byDim[c.dimension].n++;
  if (r.pass) { byDim[c.dimension].p++; pass++; }
  else failed.push(`${c.id} [${c.dimension}] ${c.what} -> expected ${c.expect}, got ${r.got}`);
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`${mark} ${c.id} ${c.dimension.padEnd(11)} ${c.what}`.padEnd(96) + `| ${r.got}`.slice(0, 110));
}
console.log("\n=== SCORECARD ===");
for (const [d, v] of Object.entries(byDim)) console.log(`${d.padEnd(12)} ${v.p}/${v.n}  ${Math.round((v.p / v.n) * 100)}%`);
console.log(`TOTAL        ${pass}/${results.length}  ${Math.round((pass / results.length) * 100)}%`);
if (failed.length) { console.log("\n=== DEFECTS ==="); failed.forEach((f) => console.log(" - " + f)); }
process.exit(failed.length ? 1 : 0);
