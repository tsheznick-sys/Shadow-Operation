import { canControl, getControl } from "@/lib/control";
import { ROLE_LABEL, type Role } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ControlPage() {
  const control = await getControl();
  const gate = canControl();
  const paused = control.state === "paused";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Big Red Button</h1>
      <p className="text-sm text-zinc-500 max-w-3xl mb-6">
        One switch stops every outbound action: publishing, DMs, voice calls and money. Nothing resumes on its own — only the owner
        can undo it, and both directions are written to the audit log.
      </p>

      <div
        className={`rounded-2xl border p-6 mb-6 ${
          paused ? "border-red-600 bg-red-500/10" : "border-teal-700 bg-teal-500/5"
        }`}
      >
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">Current state</div>
        <div className={`text-3xl font-black mt-1 ${paused ? "text-red-400" : "text-teal-400"}`}>
          {paused ? "PAUSED — nothing ships" : "RUNNING — all workflows live"}
        </div>
        {control.changed_by ? (
          <div className="text-xs text-zinc-500 mt-2">
            last change by <span className="font-mono">{control.changed_by}</span> · {control.changed_at || "unknown time"}
            {control.reason ? ` · “${control.reason}”` : ""}
          </div>
        ) : null}

        {gate.allowed ? (
          <form action="/api/control" method="post" className="mt-5 flex flex-wrap gap-2 items-center">
            <input
              name="reason"
              placeholder="reason (optional, logged)"
              className="rounded-lg bg-black/40 border border-zinc-800 px-3 py-2 text-sm min-w-[240px]"
            />
            {paused ? (
              <button name="action" value="resume" className="rounded-lg bg-teal-500 text-black font-bold text-sm px-4 py-2">
                Resume everything
              </button>
            ) : (
              <button name="action" value="pause" className="rounded-lg bg-red-600 text-white font-bold text-sm px-4 py-2">
                Global pause
              </button>
            )}
          </form>
        ) : (
          <div className="text-xs text-zinc-500 mt-5">
            {gate.actor === "anonymous"
              ? "Sign in as the owner to use the button."
              : `Your seat (${ROLE_LABEL.owner}) is required — you are signed in as ${gate.actor}.`}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-sm mb-2">What a pause stops</div>
          <ul className="text-xs text-zinc-400 space-y-1">
            <li>· WF4 — Buffer publishing (Shorts, longform, carousels)</li>
            <li>· WF5 / WF5A — inbound DMs and the 14-day sequence</li>
            <li>· WF7 — voice broadcasts and remote fixes</li>
            <li>· WF8 / WF10 — save offers, autopay and sequence rollouts</li>
            <li>· WF11 — sequence unlocking</li>
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-bold text-sm mb-2">What keeps running</div>
          <ul className="text-xs text-zinc-400 space-y-1">
            <li>· WF1 research — scanning costs nothing and keeps the pool fresh</li>
            <li>· WF2 / WF3 rendering — assets stack up in R2 for when you resume</li>
            <li>· WF6 alerts, WF9 proof tracking, WF12 interview digest</li>
            <li>· Inbound Whop webhooks still record (never lost)</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-400">
        <div className="font-bold text-sm text-white mb-2">Also reachable by voice</div>
        Jarvis answers “press 1” on the Jive call with the same switch — the voice path calls{" "}
        <span className="font-mono">POST /api/control</span> with a signed owner token, so the button works from your phone without
        opening the app.
      </div>
    </div>
  );
}
