export default function Bros() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Bros — Squad 3-5 • Equal approve • You super-admin</h1>
      <p className="text-sm text-zinc-500">Q1 squad_3_5_roles + Q24 equal_all + Q21 hands_except_money — bros approve pipelines, only super-admin sends money.</p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { name: "You (Scott)", role: "Super-admin", perms: "SEND + money + sign", avatar: "👑" },
          { name: "Numinous Bro", role: "Admin — Numinous niche", perms: "Approve + SEND in his niche", avatar: "🔮" },
          { name: "Bro #3", role: "Member — Shadow scout", perms: "Approve, comment, vet", avatar: "⚡" }
        ].map(b=>(
          <div key={b.name} className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5">
            <div className="text-2xl">{b.avatar}</div>
            <div className="font-bold mt-2">{b.name}</div>
            <div className="text-xs text-teal-400">{b.role}</div>
            <div className="text-xs text-zinc-500 mt-2">{b.perms}</div>
            <div className="mt-3 text-xs px-3 py-2 rounded-full bg-zinc-900 text-center">Google OAuth • invite-only</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-[#13131a] border border-zinc-800 p-5 text-sm">
        <div className="font-bold">All ops unified (Q3)</div>
        <div className="text-zinc-400 mt-2">One pipeline board — filter by niche: Shadow / Numinous / Wolf/Mindset/Dark Psych/Marketing history/Wolf/Consumerism — each bro owns a niche. All bros see all, but per-niche owner approves.</div>
        <div className="mt-3 flex gap-2">
          <button className="px-4 py-2 rounded-full bg-white text-black font-semibold">Invite bro (Google)</button>
          <button className="px-4 py-2 rounded-full bg-zinc-800">Manage per-niche ownership</button>
        </div>
      </div>
    </div>
  );
}
