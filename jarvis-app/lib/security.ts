// SECURITY — the rules that stop this operation being taken over by someone who read the repo.
//
// Why this file exists (2026-10-31 audit):
//   Every secret in this project had a working default, written in the source. A default secret
//   is not a convenience — it is a master key with the code printed on it. The audit found:
//     · AUTH_SECRET       -> "dev-only-shadow-secret-change-me"   (forge an owner cookie)
//     · TEAM_*_PASSWORD   -> "shadow-owner-2026" etc.            (log in as the owner)
//     · DATABASE_URL      -> silent null, every route mock-modes to 200
//   All three are fixed here, and the fix is the same in each case: **in production, absence is
//   a crash, not a default.**

export const DEFAULT_SECRETS = [
  "dev-only-shadow-secret-change-me",
  "shadow-owner-2026",
  "shadow-content-2026",
  "shadow-social-2026",
];

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

/** Anything that would let a reader of this repo impersonate us. */
export function isKnownDefault(value: string | undefined): boolean {
  if (!value) return false;
  return DEFAULT_SECRETS.includes(value.trim());
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityError";
  }
}

/**
 * The session signing secret.
 * Production: no default, no fallback, no "temporary". A boot failure is cheaper than a takeover.
 */
export function authSecret(): string {
  const v = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (v && v.trim().length >= 16 && !isKnownDefault(v)) return v.trim();
  if (isProduction()) {
    throw new SecurityError(
      isKnownDefault(v)
        ? "AUTH_SECRET is set to a public default from this repository — every session cookie is forgeable. Rotate it."
        : "AUTH_SECRET is missing or shorter than 16 characters. Production refuses to boot without it.",
    );
  }
  // dev only: stable per-process value, never the published string
  return `dev-${process.pid}-${process.env.HOSTNAME ?? "local"}`;
}

/**
 * Dev-only seat passwords, kept here so no other file re-types a guessable string.
 * These are deliberately NOT usable in production: seatPassword() returns null there, and the
 * login route refuses an empty password, so an unset seat is DISABLED rather than guessable.
 */
const DEV_SEAT_FALLBACK: Record<string, string> = {
  TEAM_OWNER_PASSWORD: "shadow-owner-2026",
  TEAM_CONTENT_PASSWORD: "shadow-content-2026",
  TEAM_SOCIAL_PASSWORD: "shadow-social-2026",
};

/** A seat password. In production an unset seat password means that seat cannot log in at all. */
export function seatPassword(envName: string): string | null {
  const v = process.env[envName];
  if (v && v.trim().length >= 10 && !isKnownDefault(v)) return v.trim();
  if (isProduction()) return null; // seat disabled rather than guessable
  return DEV_SEAT_FALLBACK[envName] ?? null;
}

/** Called once per process. Throws on the first thing that would let a stranger in. */
export function assertProductionEnv(): { ok: boolean; problems: string[] } {
  const problems: string[] = [];
  if (!isProduction()) return { ok: true, problems };

  try {
    authSecret();
  } catch (e) {
    problems.push((e as Error).message);
  }
  if (!process.env.DATABASE_URL) {
    problems.push("DATABASE_URL is missing — every route would silently mock-mode and return 200 while taking money.");
  }
  if (process.env.AUTH_REQUIRED === "false") {
    problems.push("AUTH_REQUIRED=false in production — every request is treated as the owner.");
  }
  for (const [envName, who] of [
    ["TEAM_OWNER_PASSWORD", "owner"],
    ["TEAM_CONTENT_PASSWORD", "content"],
    ["TEAM_SOCIAL_PASSWORD", "social"],
  ] as const) {
    const v = process.env[envName];
    if (v && isKnownDefault(v)) problems.push(`${envName} is a public default from this repo — the ${who} seat is guessable.`);
  }
  return { ok: problems.length === 0, problems };
}

/** Refuse to boot. Called from instrumentation / the first route hit. */
export function enforceProductionEnv() {
  const { ok, problems } = assertProductionEnv();
  if (!ok) {
    throw new SecurityError(`Refusing to run in production:\n - ${problems.join("\n - ")}`);
  }
}
