import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-safe HMAC verify (WebCrypto) — mirrors lib/auth.ts without node:crypto.
const OWNER_ONLY = ["/admin", "/control"];

const PROTECTED = ["/team", "/money", "/onboarding", "/content", "/social", "/admin", "/retention", "/pods", "/drafts", "/autonomy", "/control"];

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
  const secret = process.env.AUTH_SECRET || "dev-only-shadow-secret-change-me";
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
  matcher: ["/team/:path*", "/money/:path*", "/onboarding/:path*", "/content/:path*", "/social/:path*", "/admin/:path*", "/retention/:path*", "/pods/:path*", "/drafts/:path*", "/autonomy/:path*"],
};
