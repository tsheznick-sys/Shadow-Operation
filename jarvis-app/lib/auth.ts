// AUTH — 3-man team, no external provider, no extra dependency.
// HMAC-signed session cookie. Edge-safe verify lives in middleware.ts.
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export type Role = "owner" | "content" | "social";

export type Session = {
  email: string;
  name: string;
  role: Role;
  exp: number;
};

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner · Admin",
  content: "Content Guy · G4",
  social: "Social Manager · Buffer + DM",
};

// What each role may touch. Kept here so middleware and pages agree.
export const ROLE_ROUTES: Record<Role, string[]> = {
  owner: ["*"],
  content: ["/content", "/pods", "/onboarding", "/team", "/money", "/drafts", "/jarvis", "/n8n"],
  social: ["/social", "/pods", "/onboarding", "/team", "/money", "/drafts", "/jarvis", "/n8n", "/retention"],
};

type SeedUser = { email: string; password: string; name: string; role: Role };

function pick(env: string | undefined, fallback: string) {
  return env && env.trim().length > 0 ? env.trim() : fallback;
}

/** Seeded team — every value env-overridable, no code change to rotate. */
export function teamUsers(): SeedUser[] {
  return [
    {
      email: pick(process.env.TEAM_OWNER_EMAIL, "scott.abuya@gmail.com").toLowerCase(),
      password: pick(process.env.TEAM_OWNER_PASSWORD, "shadow-owner-2026"),
      name: pick(process.env.TEAM_OWNER_NAME, "Scott"),
      role: "owner",
    },
    {
      email: pick(process.env.TEAM_CONTENT_EMAIL, "content@shadow.local").toLowerCase(),
      password: pick(process.env.TEAM_CONTENT_PASSWORD, "shadow-content-2026"),
      name: pick(process.env.TEAM_CONTENT_NAME, "Content Guy"),
      role: "content",
    },
    {
      email: pick(process.env.TEAM_SOCIAL_EMAIL, "info.wolf@gmail.com").toLowerCase(),
      password: pick(process.env.TEAM_SOCIAL_PASSWORD, "shadow-social-2026"),
      name: pick(process.env.TEAM_SOCIAL_NAME, "Social Manager"),
      role: "social",
    },
  ];
}

export function authSecret(): string {
  return pick(process.env.AUTH_SECRET, "dev-only-shadow-secret-change-me");
}

export function authRequired(): boolean {
  return process.env.AUTH_REQUIRED !== "false";
}

export function showDemoLogins(): boolean {
  return process.env.SHOW_DEMO_LOGINS === "true" || process.env.NODE_ENV !== "production";
}

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function b64url(input: Buffer | string): string {
  const b = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function signSession(payload: Session): string {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", authSecret()).update(body).digest();
  return `${body}.${b64url(sig)}`;
}

export function verifySession(token: string | undefined | null): Session | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", authSecret()).update(body).digest();
  const given = Buffer.from(sig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  if (given.length !== expected.length) return null;
  if (!timingSafeEqual(given, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")) as Session;
    if (!parsed?.email || !parsed?.role) return null;
    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Server component / route helper. */
export function getSession(): Session | null {
  if (!authRequired()) {
    const u = teamUsers()[0];
    return { email: u.email, name: u.name, role: u.role, exp: 0 };
  }
  return verifySession(cookies().get("shadow_session")?.value);
}

export function canAccess(role: Role, pathname: string): boolean {
  const allowed = ROLE_ROUTES[role];
  if (allowed.includes("*")) return true;
  return allowed.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function checkPassword(input: string, expected: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const SESSION_COOKIE = "shadow_session";
export const SESSION_MAX_AGE = MAX_AGE;
