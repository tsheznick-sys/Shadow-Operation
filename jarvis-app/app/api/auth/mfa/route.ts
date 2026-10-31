import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/session";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, teamUsers } from "@/lib/auth";
import { currentCodeForDemo, knownEmail, sendCode, verifyCode } from "@/lib/twofactor";

export const dynamic = "force-dynamic";

/** Step 1 — send a 6-digit code to a known seat. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").toLowerCase().trim();
  if (!email || !knownEmail(email)) {
    return NextResponse.json({ ok: false, error: "not_a_seat" }, { status: 404 });
  }
  const user = teamUsers().find((u) => u.email === email)!;
  const result = await sendCode(email, user.name);
  return NextResponse.json({
    ok: true,
    channel: result.channel,
    devCode: result.sent ? undefined : currentCodeForDemo(email),
  });
}

/** Step 2 — verify the code and mint the signed session cookie. */
export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").toLowerCase().trim();
  const code = String(body.code || "");
  if (!email || !knownEmail(email)) {
    return NextResponse.json({ ok: false, error: "not_a_seat" }, { status: 404 });
  }
  if (!verifyCode(email, code)) {
    return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 401 });
  }

  const user = teamUsers().find((u) => u.email === email)!;
  const token = signSession({
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  });
  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

/** GET — who am I (next-auth session or the legacy cookie). */
export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (email) {
    return NextResponse.json({ ok: true, via: "nextauth", email, role: (session!.user as any).role || null });
  }
  const legacy = cookies().get(SESSION_COOKIE)?.value;
  return NextResponse.json({ ok: Boolean(legacy), via: legacy ? "cookie" : null });
}
