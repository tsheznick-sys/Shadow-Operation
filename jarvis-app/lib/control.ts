// GLOBAL PAUSE — the Big Red Button.
// One switch stops every outbound action: publish, DM, voice, money.
// Nothing resumes automatically; only the owner can undo it.
import { getSql } from "./db";
import { getSession } from "./auth";

export type ControlState = "running" | "paused";

const MEM: { state: ControlState; changed_by: string; changed_at: string; reason: string } = {
  state: (process.env.CONTROL_STATE as ControlState) || "running",
  changed_by: "env",
  changed_at: "",
  reason: "",
};

export async function getControl(): Promise<{ state: ControlState; changed_by: string; changed_at: string; reason: string }> {
  const sql = getSql();
  if (sql) {
    try {
      const rows: any = await sql`SELECT key, value FROM app_config WHERE key IN ('control_state','control_changed_by','control_changed_at','control_reason')`;
      const map = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
      if (map.control_state) {
        return {
          state: map.control_state as ControlState,
          changed_by: map.control_changed_by || "",
          changed_at: map.control_changed_at || "",
          reason: map.control_reason || "",
        };
      }
    } catch {
      // fall through to memory
    }
  }
  return { ...MEM };
}

export async function setControl(
  state: ControlState,
  by: string,
  reason = ""
): Promise<{ ok: boolean; state: ControlState; saved: string; error?: string }> {
  MEM.state = state;
  MEM.changed_by = by;
  MEM.changed_at = new Date().toISOString();
  MEM.reason = reason;

  const sql = getSql();
  if (!sql) return { ok: true, state, saved: "memory" };

  try {
    for (const [k, v] of [
      ["control_state", state],
      ["control_changed_by", by],
      ["control_changed_at", MEM.changed_at],
      ["control_reason", reason],
    ]) {
      await sql`
        INSERT INTO app_config (key, value, updated_at) VALUES (${k}, ${v}, now())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      `;
    }
    await sql`
      INSERT INTO audit_log (actor, action, detail, created_at)
      VALUES (${by}, ${"control_" + state}, ${JSON.stringify({ reason })}, now())
    `;
    return { ok: true, state, saved: "neon" };
  } catch (err: any) {
    return { ok: false, state, saved: "memory", error: String(err?.message || err) };
  }
}

/** Owner-only guard for the control surface. */
export function canControl(): { allowed: boolean; actor: string } {
  const session = getSession();
  if (!session) return { allowed: false, actor: "anonymous" };
  return { allowed: session.role === "owner", actor: session.email };
}

/**
 * Every outbound workflow calls this before acting.
 * Returns allowed=false with a reason so the caller can log and stop.
 */
export async function mayActOutbound(action: string): Promise<{ allowed: boolean; reason: string }> {
  const control = await getControl();
  if (control.state === "paused") {
    return { allowed: false, reason: `global pause — ${action} blocked (set by ${control.changed_by || "owner"})` };
  }
  return { allowed: true, reason: "running" };
}
