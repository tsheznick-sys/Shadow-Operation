export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5">
        <div className="text-sm text-zinc-400">Butler briefing — 08:45 EAT</div>
        <h1 className="text-2xl font-bold mt-1">Sir, Shadow is primed. 6 drafts await your swipe.</h1>
        <p className="text-zinc-400 mt-2">Cloud-only v1 • Auto while you sleep (VET→DRAFT→TRACK) • You swipe SEND • Omar Story 1 due Thu 19:00 EAT</p>
        <div className="grid grid-cols-4 gap-3 mt-4 text-center text-sm">
          <div className="rounded-xl bg-zinc-900 p-3"><div className="text-2xl font-black">1,462</div><div className="text-zinc-500">GREEN pool</div></div>
          <div className="rounded-xl bg-zinc-900 p-3"><div className="text-2xl font-black">200/200</div><div className="text-zinc-500">LIVE verified</div></div>
          <div className="rounded-xl bg-zinc-900 p-3"><div className="text-2xl font-black">6/day</div><div className="text-zinc-500">Human swipe</div></div>
          <div className="rounded-xl bg-zinc-900 p-3 border border-teal-500/30"><div className="text-2xl font-black text-teal-400">1</div><div className="text-zinc-500">Partner to LIVE</div></div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs">
        {[
          { k: "SCOUT", c: "8 new", active: false },
          { k: "VET", c: "1,462 GREEN", active: true },
          { k: "OUTREACH", c: "200 DRAFT+INBOX", active: true },
          { k: "REPLY", c: "Omar thread", active: true },
          { k: "AUDIT", c: "on YES", active: false },
          { k: "DEMAND", c: "Thu→Sun 1%+25", active: true },
          { k: "WHOP", c: "auto on PASS", active: false }
        ].map(s => (
          <div key={s.k} className={`rounded-xl p-3 border ${s.active ? "bg-teal-500 text-black border-teal-400" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>
            <div className="font-bold">{s.k}</div><div>{s.c}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5">
        <h2 className="font-bold">How JARVIS works like real life — with your bros</h2>
        <ol className="list-decimal ml-5 mt-3 space-y-2 text-sm text-zinc-300">
          <li><b>Hosted & connected:</b> Vercel + Neon free tier (cloud truth). Cron every 15 min checks Gmail → Hard Rule filter → drafts → Linear sync → Telegram/Signal/Gmail pings to all bros.</li>
          <li><b>Agent primarily:</b> OpenAI gpt-4o-mini does VET (8-Gate), writes outreach, triages replies (FINAL TERMS guard), drafts audits — you only do human gates: SEND (swipe), call, sign, money.</li>
          <li><b>Chat-first practical:</b> Bros open PWA → /jarvis chat + mic button → Whisper → agent → text reply + 08:45 voice briefing (ElevenLabs). Wake word Hey Jarvis lands with native v2 (30d).</li>
          <li><b>Squad 3-5:</b> Google OAuth — equal approve, but SEND/money = admin-only toggle (you super-admin). Per-niche ownership (Numinous vs Shadow).</li>
          <li><b>Full auto to Whop:</b> On PASS (1%+25), auto-creates Whop vault (PremiereProTutos style) + grants admin + pushes ManyChat 8ch — you get payout.</li>
          <li><b>Forever memory + safety:</b> Every DM/email stored in Neon, Strict 0% 550 auto-pause, R2 daily backup, encrypted.</li>
        </ol>
        <div className="mt-4 flex gap-2">
          <a href="/drafts" className="px-4 py-2 rounded-full bg-white text-black font-semibold text-sm">Open drafts swipe →</a>
          <a href="/omar" className="px-4 py-2 rounded-full bg-zinc-800 text-sm">Omar tracker + camera scan</a>
        </div>
      </div>
    </div>
  );
}
