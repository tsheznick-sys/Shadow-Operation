import { getSql } from "@/lib/db";
import { getSession, ROLE_LABEL, type Role } from "@/lib/auth";
import { questionsFor, ROLES, totalQuestions } from "@/lib/interview";

export const dynamic = "force-dynamic";

type Row = { email: string; name: string; role: string; answers: any; completeness: number; updated_at: string };

async function loadProfiles(): Promise<{ rows: Row[]; mock: boolean }> {
  const sql = getSql();
  if (!sql) return { rows: [], mock: true };
  try {
    const rows: any = await sql`SELECT email, name, role, answers, completeness, updated_at FROM team_profiles ORDER BY email`;
    return { rows, mock: false };
  } catch {
    return { rows: [], mock: true };
  }
}

export default async function TeamPage({ searchParams }: { searchParams: { denied?: string } }) {
  const session = getSession();
  const { rows, mock } = await loadProfiles();

  const byEmail = new Map(rows.map((r) => [r.email, r]));
  const me = session ? byEmail.get(session.email) : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-bold">Team · 3 seats</h1>
          <p className="text-sm text-zinc-500">
            Owner, Content Guy, Social Manager. Each seat sees only its lanes; Jarvis reads every answer.
          </p>
        </div>
        {session ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs">
            <div className="text-zinc-500">Signed in</div>
            <div className="font-mono text-teal-400">{session.email}</div>
            <div className="text-zinc-500">{ROLE_LABEL[session.role as Role]}</div>
          </div>
        ) : null}
      </div>

      {searchParams.denied ? (
        <div className="mb-4 rounded-lg border border-amber-700/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          Your seat has no access to <span className="font-mono">{searchParams.denied}</span> — ask the owner to widen it.
        </div>
      ) : null}

      {mock ? (
        <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-400">
          Running without Neon — interviews save to memory for this session. Add <span className="font-mono">DATABASE_URL</span> and run{" "}
          <span className="font-mono">scripts/migrate.sql</span> to persist.
        </div>
      ) : null}

      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {ROLES.map((role: Role) => {
          const row = rows.find((r) => r.role === role);
          const total = totalQuestions(role);
          const done = row?.completeness ?? 0;
          const isMe = session?.role === role;
          return (
            <div
              key={role}
              className={`rounded-xl border p-4 ${isMe ? "border-teal-600 bg-teal-500/5" : "border-zinc-800 bg-zinc-900/40"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-sm">{ROLE_LABEL[role]}</div>
                {isMe ? <span className="text-[10px] text-teal-400 font-bold">YOU</span> : null}
              </div>
              <div className="text-xs font-mono text-zinc-500 truncate">{row?.email || "not filled yet"}</div>

              <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: `${done}%` }} />
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {done}% · {total} questions
              </div>

              {row?.answers ? (
                <ul className="mt-3 space-y-1 text-[11px] text-zinc-400">
                  {Object.keys(row.answers).slice(0, 4).map((k) => (
                    <li key={k} className="truncate">
                      <span className="text-zinc-600 font-mono">{k}</span> · {String(row.answers[k]).slice(0, 46)}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 text-[11px] text-zinc-600">No answers yet.</div>
              )}

              {isMe ? (
                <a href="/onboarding" className="mt-3 inline-block text-xs rounded-lg bg-teal-500 text-black font-bold px-3 py-1.5">
                  {done > 0 ? "Continue interview" : "Start interview"}
                </a>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="font-bold text-sm mb-2">What Jarvis does with each answer</div>
        <div className="grid md:grid-cols-2 gap-3 text-xs text-zinc-400">
          {ROLES.map((role: Role) => (
            <div key={role}>
              <div className="text-teal-400 font-semibold mb-1">{ROLE_LABEL[role]}</div>
              <ul className="space-y-1">
                {questionsFor(role).slice(0, 4).map((q) => (
                  <li key={q.id}>· {q.why}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {me && me.completeness >= 100 ? (
        <div className="mt-4 rounded-xl border border-teal-700 bg-teal-500/10 p-4 text-sm">
          Interview complete. Jarvis has enough to brief you instead of asking you.
        </div>
      ) : null}
    </div>
  );
}
