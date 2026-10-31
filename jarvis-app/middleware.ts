import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-safe HMAC verify (WebCrypto) — mirrors lib/auth.ts without node:crypto.
const OWNER_ONLY = ["/admin", "/control", "/board", "/scale"];

// Every internal surface. Added 2026-10-31: /board, /scale, /reliability and /stickman were
// public — any member could read the pricing strategy, the graduation plan and the reliability
// numbers. /bros, /challenge, /ledger and /login stay public on purpose: they are the shop front.
const PROTECTED = [
  "/team", "/money", "/onboarding", "/content", "/social", "/admin", "/retention",
  "/pods", "/drafts", "/autonomy", "/control", "/board", "/scale", "/reliability",
  "/stickman", "/improve", "/jarvis", "/n8n",
];

/**
 * API routes reachable without a session, and why each one is safe:
 *   /api/auth/*        — the login flow itself
 *   /api/whop/webhook  — verified by Whop's signature inside the handler, not by cookie
 *   /api/cron/*        — verified by CRON_SECRET inside the handler (added 2026-10-31)
 * Everything else under /api requires a session. Before this, NINE handlers had no check at all.
 */
const PUBLIC_API = ["/api/auth", "/api/whop/webhook", "/api/cron", "/api/health"];

const ROLE_ROUTES: Record<string, string[]> = {
  owner: ["*"],
  content: ["/content", "/pods", "/onboarding", "/team", "/money", "/drafts", "/jarvis", "/n8n", "/autonomy", "/control"],
  social: ["/social", "/pods", "/onboarding", "/team", "/money", "/drafts", "/jarvis", "/n8n", "/retention", "/autonomy"],
};

function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = norm.length % 4 === 0 ? "" : "=".repeat(4 - (norm.length % 4));
  const bin = atob(norm + pad);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function verifyEdge(token: string | undefined): Promise<{ email: string; role: string; exp: number } | null> {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  // No default secret. A forged cookie is not a degraded session, it is a takeover — so an
  // unset secret in production fails closed (every check returns null) instead of open.
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 16) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const ok = await crypto.subtle.verify("HMAC", key, b64urlToBytes(sig), new TextEncoder().encode(body));
  if (!ok) return null;
  try {
    const json = JSON.parse(new TextDecoder().decode(b64urlToBytes(body)));
    if (!json?.email || !json?.role) return null;
    if (json.exp && json.exp < Math.floor(Date.now() / 1000)) return null;
    return json;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (process.env.AUTH_REQUIRED === "false") return NextResponse.next();
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) return NextResponse.next();

  // API guard: a machine caller gets 401 JSON, never a redirect to HTML.
  if (pathname.startsWith("/api")) {
    if (PUBLIC_API.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return NextResponse.next();
    const session = await verifyEdge(req.cookies.get("shadow_session")?.value);
    if (!session) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsAuth) return NextResponse.next();

  const session = await verifyEdge(req.cookies.get("shadow_session")?.value);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (OWNER_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`)) && session.role !== "owner") {
    const url = req.nextUrl.clone();
    url.pathname = "/team";
    url.searchParams.set("denied", pathname);
    return NextResponse.redirect(url);
  }

  const allowed = ROLE_ROUTES[session.role] || [];
  if (!allowed.includes("*") && !allowed.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = req.nextUrl.clone();
    url.pathname = "/team";
    url.searchParams.set("denied", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/team/:path*", "/money/:path*", "/onboarding/:path*", "/content/:path*", "/social/:path*",
    "/admin/:path*", "/retention/:path*", "/pods/:path*", "/drafts/:path*", "/autonomy/:path*",
    "/control/:path*", "/board/:path*", "/scale/:path*", "/reliability/:path*",
    "/stickman/:path*", "/stickman", "/improve/:path*", "/jarvis/:path*", "/n8n/:path*",
    // the API surface was previously outside the matcher entirely
    "/api/:path*",
  ],
};
