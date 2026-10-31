// THE JOIN LINK — where a DM sends somebody, and why it is built here and not typed by a person.
//
// The DM leg exists to move a commenter into the community. That means the message has to carry a
// whop.com link, and it means the link is the single most abusable string in the system:
//
//   · a compromised workflow, or a prompt injection inside a comment, that gets its URL into a DM
//     turns our verified account into a phishing relay — to the exact audience we built;
//   · a wrong link is worse than no link, because the DM cannot be sent again. Meta allows ONE
//     private reply per comment, so a broken join link is a lead spent.
//
// So the text is never trusted to contain the right URL. The link is BUILT from environment ids,
// the result is checked against whop.com, and any other http(s) URL in the message is refused.
//
// A NOTE ON THE IDS. `WHOP_PRODUCT_*_ID` holds `prod_…` values — those are products, and
// https://whop.com/checkout/prod_… is a 404. A checkout link takes a PLAN id (`plan_…`), which is
// a separate object in the Whop dashboard (Checkout Links → ⋯ → Details). Building the link from a
// product id would fail silently at the worst moment, so the prefix is checked here.

export type JoinTier = "free" | "circle" | "pro" | "team";

export const WHOP_HOSTS = ["whop.com", "www.whop.com"] as const;

const PLAN_ENV: Record<Exclude<JoinTier, "free">, string> = {
  circle: "WHOP_PLAN_CIRCLE_ID",
  pro: "WHOP_PLAN_PRO_ID",
  team: "WHOP_PLAN_TEAM_ID",
};

export type LinkResult =
  | { ok: true; url: string; kind: "community" | "checkout"; tier: JoinTier }
  | { ok: false; code: "community_url_missing" | "plan_id_missing" | "not_a_plan_id" | "bad_page_ref" | "bad_affiliate"; reason: string };

/** A predicate, because narrowing this union inline has already cost one round of confusion. */
export function isLinkFailure(r: LinkResult): r is Extract<LinkResult, { ok: false }> {
  return r.ok === false;
}

/** A path segment on whop.com is a slug: no spaces, no query, nothing that changes the host. */
function safePageRef(pageRef: string): string | null {
  const p = String(pageRef || "").trim();
  if (!p) return "unknown_page";
  if (!/^[a-z0-9][a-z0-9._-]{0,63}$/i.test(p)) return null;
  return p;
}

export function isWhopUrl(raw: string): boolean {
  try {
    const u = new URL(String(raw));
    if (u.protocol !== "https:") return false;
    return (WHOP_HOSTS as readonly string[]).includes(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

/** Every http(s) URL in a message. Used to refuse anything that is not a whop.com link. */
export function linksIn(text: string): string[] {
  return Array.from(String(text || "").matchAll(/https?:\/\/[^\s<>"')]+/g)).map((m) => m[0]);
}

export function strayLinks(text: string): string[] {
  return linksIn(text).filter((u) => !isWhopUrl(u));
}

/**
 * The link a DM sends. Paid tiers go straight to checkout for that plan; free goes to the
 * community page. Campaign parameters are appended for Whop's own reporting
 * (utm_source/medium/campaign are read from the link the buyer arrived on).
 */
export function buildJoinLink(
  opts: { tier: JoinTier; page_ref: string; surface: string; env?: NodeJS.ProcessEnv },
): LinkResult {
  const env = opts.env ?? process.env;
  const page = safePageRef(opts.page_ref);
  if (page === null) return { ok: false, code: "bad_page_ref", reason: `page_ref "${opts.page_ref}" is not a slug and cannot be put in a link` };

  const affiliate = (env.WHOP_AFFILIATE_CODE || "").trim();

  const base = ((): LinkResult => {
    if (opts.tier === "free") {
      const raw = (env.WHOP_COMMUNITY_URL || "").trim();
      if (!raw) return { ok: false, code: "community_url_missing", reason: "WHOP_COMMUNITY_URL is not set — there is no default, because a guessed link is a wasted DM" };
      if (!isWhopUrl(raw)) return { ok: false, code: "community_url_missing", reason: "WHOP_COMMUNITY_URL is not an https://whop.com address" };
      return { ok: true, url: raw, kind: "community", tier: "free" };
    }
    const name = PLAN_ENV[opts.tier];
    const plan = (env[name] || "").trim();
    if (!plan) return { ok: false, code: "plan_id_missing", reason: `${name} is not set — checkout needs a plan id, not a product id` };
    if (!/^plan_[A-Za-z0-9]+$/.test(plan)) {
      return {
        ok: false,
        code: "not_a_plan_id",
        reason: `${name} is "${plan.slice(0, 12)}…"; a checkout link needs plan_XXXXXXXXX. prod_ ids are products and 404 at /checkout/`,
      };
    }
    return { ok: true, url: `https://whop.com/checkout/${plan}`, kind: "checkout", tier: opts.tier };
  })();

  if (!base.ok) return base;

  const u = new URL(base.url);
  if (affiliate) {
    if (!/^[A-Za-z0-9_-]{2,40}$/.test(affiliate)) {
      return { ok: false, code: "bad_affiliate", reason: "WHOP_AFFILIATE_CODE is not a Whop username" };
    }
    u.searchParams.set("a", affiliate);
  }
  u.searchParams.set("utm_source", "chatfuel");
  u.searchParams.set("utm_medium", "dm");
  u.searchParams.set("utm_campaign", page);
  u.searchParams.set("utm_content", String(opts.surface || "").slice(0, 40));
  const url = u.toString();
  if (!isWhopUrl(url)) return { ok: false, code: "community_url_missing", reason: "the assembled link did not stay on whop.com" };
  return { ok: true, url, kind: base.kind, tier: base.tier };
}

/** One paragraph, one link, and an invitation to answer — the reply is what opens the 24h window. */
export function joinMessage(opts: {
  link: string;
  community: string;
  surface: string;
}): string {
  const where = opts.community.replace(/\s+/g, " ").trim();
  return `${where}\n\n${opts.link}\n\nReply here if you want the walkthrough — a person answers, not a bot.`;
}
