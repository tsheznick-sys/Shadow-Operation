"use client";

import { useEffect, useMemo, useState } from "react";

type Question = {
  id: string;
  prompt: string;
  why: string;
  type: "long" | "text" | "single" | "multi";
  options?: string[];
  minLength?: number;
};

type Props = {
  role: string;
  roleLabel: string;
  name: string;
  questions: Question[];
};

export default function Wizard({ role, roleLabel, name, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    fetch("/api/onboarding")
      .then((r) => r.json())
      .then((d) => {
        if (d.answers) setAnswers(d.answers);
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
  }, []);

  const q = questions[step];
  const value = answers[q.id] || "";
  const answeredCount = useMemo(
    () => questions.filter((x) => (answers[x.id] || "").trim().length >= (x.minLength || 3)).length,
    [answers, questions]
  );
  const pct = Math.round((answeredCount / questions.length) * 100);
  const tooShort = value.trim().length < (q.minLength || 3);

  function set(v: string) {
    setAnswers((prev) => ({ ...prev, [q.id]: v }));
    setSaved("");
  }

  function toggleMulti(opt: string) {
    const current = (answers[q.id] || "").split("|").filter(Boolean);
    const next = current.includes(opt) ? current.filter((x) => x !== opt) : [...current, opt];
    set(next.join("|"));
  }

  async function save(moveTo?: number) {
    setBusy(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      setSaved(data.ok ? `Saved · ${data.answered}/${data.total} (${data.completeness}%)` : "Save failed");
      if (typeof moveTo === "number") setStep(moveTo);
    } catch {
      setSaved("Save failed — network");
    }
    setBusy(false);
  }

  if (!hydrated) return <div className="text-sm text-zinc-500">Loading your interview…</div>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="rounded-full bg-teal-500 text-black text-xs font-bold px-3 py-1">{roleLabel}</span>
        <span className="text-sm text-zinc-400">{name}</span>
        <span className="text-xs text-zinc-600">
          {answeredCount}/{questions.length} answered · {pct}%
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-zinc-800 mb-6 overflow-hidden">
        <div className="h-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="grid md:grid-cols-[180px_1fr] gap-6">
        <div className="space-y-1 max-h-[420px] overflow-auto pr-1">
          {questions.map((item, i) => {
            const done = (answers[item.id] || "").trim().length >= (item.minLength || 3);
            return (
              <button
                key={item.id}
                onClick={() => setStep(i)}
                className={`w-full text-left text-xs px-2 py-1.5 rounded-md border ${
                  i === step
                    ? "border-teal-500 bg-teal-500/10 text-teal-300"
                    : done
                    ? "border-zinc-800 text-zinc-400"
                    : "border-zinc-900 text-zinc-600"
                }`}
              >
                <span className="font-mono mr-1">{String(i + 1).padStart(2, "0")}</span>
                {done ? "✓ " : ""}
                {item.id.replace(/_/g, " ")}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="text-xs text-zinc-500 mb-2">
            Question {step + 1} of {questions.length} · {q.type}
            {q.minLength ? ` · min ${q.minLength} chars` : ""}
          </div>
          <h2 className="text-lg font-semibold leading-snug mb-2">{q.prompt}</h2>
          <p className="text-xs text-amber-400/90 mb-4">Why Jarvis needs this: {q.why}</p>

          {q.type === "single" && q.options ? (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => set(opt)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg border ${
                    value === opt ? "border-teal-500 bg-teal-500/10" : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : q.type === "multi" && q.options ? (
            <div className="space-y-2">
              {q.options.map((opt) => {
                const on = (value || "").split("|").includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleMulti(opt)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg border ${
                      on ? "border-teal-500 bg-teal-500/10" : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {on ? "✓ " : ""}
                    {opt}
                  </button>
                );
              })}
              <textarea
                value={value.includes("|") ? "" : value}
                onChange={(e) => set(e.target.value)}
                rows={2}
                placeholder="Anything else to add?"
                className="w-full mt-2 rounded-lg bg-black/40 border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-teal-500"
              />
            </div>
          ) : (
            <textarea
              value={value}
              onChange={(e) => set(e.target.value)}
              rows={q.type === "long" ? 8 : 3}
              placeholder="Answer in your own words — the more specific, the better Jarvis runs."
              className="w-full rounded-lg bg-black/40 border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          )}

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              className="px-3 py-2 rounded-lg bg-zinc-800 text-sm"
              disabled={step === 0}
            >
              Back
            </button>
            <button
              onClick={() => save(step + 1)}
              disabled={busy || tooShort || step === questions.length - 1}
              className="px-3 py-2 rounded-lg bg-teal-500 text-black text-sm font-bold disabled:opacity-40"
            >
              Save & next
            </button>
            <button onClick={() => save()} disabled={busy} className="px-3 py-2 rounded-lg bg-zinc-800 text-sm">
              {busy ? "Saving…" : "Save draft"}
            </button>
            <a href="/team" className="px-3 py-2 rounded-lg border border-zinc-700 text-sm">
              Team dashboard
            </a>
          </div>

          {saved ? <div className="text-xs text-teal-400 mt-3">{saved}</div> : null}
          {tooShort && value.length > 0 ? (
            <div className="text-xs text-amber-400 mt-2">
              {q.minLength ? `Add ${(q.minLength || 0) - value.trim().length} more characters for a usable answer.` : ""}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
