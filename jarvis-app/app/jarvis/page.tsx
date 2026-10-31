"use client";
import { useState, useEffect } from "react";

type Msg = { role: string; text: string; error?: boolean };

export default function JarvisChat() {
  const [tier, setTier] = useState("checking...");
  const [hasAccess, setHasAccess] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "jarvis",
      text:
        "Sir, I am online. Churn 1.2% lock · entitlement gate wired (Circle $44 / Pro $53 / Team $62). " +
        "Ask: How's Omar? Vet @handle? GREEN/AMBER 50:1?",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wid = params.get("whop_user_id") || params.get("user_id") || "";
    fetch(`/api/entitlement?whop_user_id=${encodeURIComponent(wid)}`)
      .then((r) => r.json())
      .then((d) => {
        setTier(`${d.tier} (${d.limits?.label || ""}) ${d.mock ? "• mock" : "• live"} — ${d.reason}`);
        setHasAccess(!!d.hasAccess);
        if (!d.hasAccess) {
          setMsgs((m) => [
            ...m,
            {
              role: "jarvis",
              text: `Sir, entitlement gate: ${d.reason}. The agent tiers are Circle $44, Pro $53 and Team $62 — one Whop product each. ${d.limits?.label || ""}`,
            },
          ]);
        }
      })
      .catch(() => setTier("entitlement unreachable — WHOP_API_KEY not set"));
  }, []);

  const send = async () => {
    if (!input.trim() || busy) return;
    const q = input;
    setInput("");
    setBusy(true);
    setMsgs((m) => [...m, { role: "you", text: q }]);

    if (!hasAccess && !q.toLowerCase().includes("buy") && !q.toLowerCase().includes("omar")) {
      setMsgs((m) => [
        ...m,
        { role: "jarvis", text: "Sir, locked — a membership is required. Circle $44 unlocks this chat. Ask 'buy circle' for the link, or ask Omar (always open)." },
      ]);
      setBusy(false);
      return;
    }

    try {
      const r = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q, history: msgs }),
      });
      const d = await r.json().catch(() => ({}));

      // The brain used to answer 200 with a canned paragraph when it was down. It now answers
      // 503, and that is what the member sees: a plain statement, not an invented reply.
      if (!r.ok || !d?.ok) {
        setMsgs((m) => [
          ...m,
          { role: "jarvis", error: true, text: `[brain offline] ${d?.text || d?.error || `HTTP ${r.status}`} — nothing was answered, and I will not guess.` },
        ]);
      } else {
        setMsgs((m) => [
          ...m,
          { role: "jarvis", text: `${d.text}${d.mock ? " [DEMO]" : d.provider ? ` [${d.provider}${d.model ? `:${d.model}` : ""}]` : ""}` },
        ]);
      }
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "jarvis", error: true, text: "[brain offline] The request did not complete. Nothing was answered." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">JARVIS Chat — entitlement wired • churn 1.2%</h1>
        <div
          className="text-xs px-3 py-1 rounded-full border"
          style={{ background: hasAccess ? "#14b8a6" : "#27272a", color: hasAccess ? "#000" : "#a1a1aa" }}
        >
          {tier}
        </div>
      </div>
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-4 h-[48vh] overflow-auto space-y-3">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] ${
              m.role === "you" ? "ml-auto bg-white text-black" : m.error ? "bg-red-950 text-red-200 border border-red-800" : "bg-zinc-800 text-zinc-100"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask JARVIS: How's Omar? Vet @quietwolfzz? GREEN? 14-day? Buy circle?"
          className="flex-1 rounded-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm"
        />
        <button onClick={send} disabled={busy} className="px-5 py-3 rounded-full bg-white text-black font-bold disabled:opacity-50">
          {busy ? "…" : "Send"}
        </button>
        <button
          onClick={() => alert("Sir, listening — Whisper would transcribe here. PWA mic button v1; Hey Jarvis wake-word lands with native v2 (30d). Entitlement still enforced server-side.")}
          className="px-5 py-3 rounded-full bg-teal-500 text-black font-bold"
        >
          🎙️ Mic
        </button>
        <button
          onClick={() => alert("Sir, briefing: Churn 1.1% | GREEN <50+5%+ fast-close | AMBER 14-day via ChatFuel IG&TikTok+ManyChat YT | Comments->DM->Whop | Leak->expand 05:45, needs Wan+OpusClip+Buffer (see docs/TOOL_GAPS).")}
          className="px-5 py-3 rounded-full bg-zinc-800 text-sm"
        >
          🔊 Briefing
        </button>
      </div>
      <p className="text-xs text-zinc-600">
        Brain: lib/brain.ts → Claude (ANTHROPIC_MODEL, no retired ids) → Grok fallback → honest 503.
        A 503 means nothing answered; the page shows that instead of inventing text. Entitlement:
        lib/entitlement.ts → Whop v1 → Circle $44 / Pro $53 / Team $62. Automation door: POST /api/brain.
      </p>
    </div>
  );
}
