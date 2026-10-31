import { NextResponse } from "next/server";
import { canControl, getControl, setControl } from "@/lib/control";

export const dynamic = "force-dynamic";

export async function GET() {
  const control = await getControl();
  return NextResponse.json({ ok: true, ...control });
}

export async function POST(req: Request) {
  const gate = canControl();
  if (!gate.allowed) {
    return NextResponse.json({ ok: false, error: "owner_only" }, { status: 403 });
  }

  const ctype = req.headers.get("content-type") || "";
  let body: any = {};
  if (ctype.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const fd = await req.formData().catch(() => null);
    body = fd ? { action: String(fd.get("action") || ""), reason: String(fd.get("reason") || "") } : {};
  }

  const action = body.action;
  if (action !== "pause" && action !== "resume") {
    return NextResponse.json({ ok: false, error: "action must be pause or resume" }, { status: 400 });
  }

  const state = action === "pause" ? "paused" : "running";
  const result = await setControl(state, gate.actor, String(body.reason || "").slice(0, 500));
  return NextResponse.json({ ok: result.ok, ...result });
}
