"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { demoLogins: { email: string; role: string; password: string }[]; next: string };

export default function LoginForm({ demoLogins, next }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Login failed");
        setBusy(false);
        return;
      }
      router.push(next || "/team");
      router.refresh();
    } catch {
      setError("Network error — try again");
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-1">Sign in</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Three seats: Owner, Content Guy, Social Manager. Each sees only its own lanes.
      </p>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-wide">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            className="w-full mt-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-teal-500"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-wide">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full mt-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-teal-500"
            placeholder="••••••••"
            required
          />
        </div>
        {error ? <div className="text-sm text-red-400">{error}</div> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-teal-500 text-black font-bold py-2 text-sm disabled:opacity-50"
        >
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>

      {demoLogins.length > 0 ? (
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="text-xs font-bold text-amber-400 mb-2">Development seats (change in env before going live)</div>
          <div className="space-y-2">
            {demoLogins.map((u) => (
              <button
                key={u.email}
                type="button"
                onClick={() => {
                  setEmail(u.email);
                  setPassword(u.password);
                }}
                className="w-full text-left rounded-lg bg-black/40 border border-zinc-800 px-3 py-2 text-xs hover:border-teal-600"
              >
                <div className="font-mono text-teal-400">{u.email}</div>
                <div className="text-zinc-500">
                  {u.role} · {u.password}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
