// TWO-FACTOR for the money surface.
// 6-digit code, HMAC-derived (no storage, no SMS cost), emailed via Resend when configured.
// Codes are bound to (email, minute bucket) with a ±1 bucket window, so they expire in ~2 minutes.
import { createHmac, timingSafeEqual } from "crypto";
import { authSecret, teamUsers } from "./auth";

const TTL_BUCKETS = 1; // current + previous minute bucket

export function otpEnabled(): boolean {
  return process.env.TFA_ENABLED !== "false";
}

/** /money and /admin are the only 2FA-protected surfaces. */
export function requires2fa(pathname: string): boolean {
  return pathname === "/money" || pathname.startsWith("/money/") || pathname === "/admin" || pathname.startsWith("/admin/");
}

function bucket(offset = 0): number {
  return Math.floor(Date.now() / 60000) + offset;
}

export function code(email: string, bucketOffset = 0): string {
  const digest = createHmac("sha256", authSecret())
    .update(`otp:${email.toLowerCase()}:${bucket(bucketOffset)}`)
    .digest();
  const num = digest.readUInt32BE(0) % 1000000;
  return String(num).padStart(6, "0");
}

export function verifyCode(email: string, input: string): boolean {
  const clean = (input || "").replace(/\D/g, "");
  if (clean.length !== 6) return false;
  for (let i = 0; i <= TTL_BUCKETS; i++) {
    const expected = code(email, -i);
    const a = Buffer.from(clean);
    const b = Buffer.from(expected);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

export function currentCodeForDemo(email: string): string {
  // Only surfaced outside production so the flow is testable without email.
  return process.env.NODE_ENV === "production" ? "" : code(email);
}

/** Send the code. Resend if configured; otherwise log and let dev mode show it. */
export async function sendCode(email: string, name: string): Promise<{ sent: boolean; channel: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Jarvis <noreply@shadow.local>";
  const otp = code(email);

  if (!key) {
    console.log(`[2FA] ${email} (${name}) code ${otp} — set RESEND_API_KEY to email it`);
    return { sent: false, channel: "console" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to: email,
        subject: `Jarvis code ${otp}`,
        text: `${name}, your money-surface code is ${otp}. It expires in about two minutes. If this wasn't you, ignore it and check who has your password.`,
      }),
    });
    return { sent: res.ok, channel: res.ok ? "resend" : `resend_${res.status}` };
  } catch {
    return { sent: false, channel: "error" };
  }
}

export function knownEmail(email: string): boolean {
  return teamUsers().some((u) => u.email === email.toLowerCase());
}
