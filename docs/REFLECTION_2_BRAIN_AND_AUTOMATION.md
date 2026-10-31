# REFLECTION 2 — the brain and the automation

**Written:** 2026-10-31, second pass · **Asked for:** "reflect again deeply, keep in mind N8N workflow (Cloud Automation-based pipeline) + Claude (Brain), solve the errors."
**Gate:** 116/116 · `tsc` 0 · `next build` ✓.

---

## 0. The sentence that came out of this pass

**The brain has been dead for a year, and the automation could not reach it.**

Not degraded. Not slow. Dead, and answering anyway — in a voice convincing enough that nothing in
the system noticed: not the tests, not the logs, not the UI.

---

## 1. Claude: a model retired in 2025, still being called in 2026

`lib/jarvis.ts` called `claude-3-5-sonnet-20241022`. Anthropic **retired that id on 2025-10-28**
(its own deprecation table says so). Every request has returned 404 since.

What happened next is the part that matters:

```ts
try { …claude… } catch (e) {
  console.error("[JARVIS] Claude failed, trying Grok:", …)   // swallowed
}
if (grokKey) { … }                                            // no key set
return { text: "<canned paragraph>", mock: true, provider: "mock" };
```

And the route passed that straight through:

```ts
const res = await askJarvis(prompt, history);
return NextResponse.json(res);        // HTTP 200, always
```

So a member typed a question, the model 404'd, and they received a paragraph beginning *"Sir,
CLAUDE_API_KEY / GROK_API_KEY missing in Vercel env — Mock: GREEN <50+5%+ fast-close…"*. The word
"mock" was in the payload. Nothing acted on it. The chat page rendered `d.text` and appended the
provider tag only when `mock` was **false** — so the one signal that would have exposed it was the
one the UI hid.

**Second trap inside the first:** fixing only the model name would have traded a 404 for a 400.
Claude 4.7 and later reject a non-default `temperature`, and the call sent `temperature: 0.4`. The
fix is both, or neither is a fix.

**Third trap:** no timeout. A hung provider hung the route; Vercel kills the function and the Grok
fallback never runs. A fallback that only fires on *thrown* errors is not a fallback.

### What changed

`lib/brain.ts` — one transport, three rules.

| Rule | Why |
|---|---|
| `RETIRED_MODELS` as data; a retired id in env is **replaced and reported** | The next retirement is a one-line change, and the substitution is visible |
| No `temperature` on the Anthropic call | A 400 is as dead as a 404 |
| `AbortController` timeout (20 s default) | So the second brain is actually reached |
| `sanitizeHistory()` drops any role but user/assistant | The client's `history` was passed through verbatim: `{role:"system"}` was a prompt-injection door |
| `ok: false` when nothing answers | There is no third option that returns text |

`B01`–`B07` test each one, with a stub `fetch` — no network, fully inspectable, including
"assert `temperature` is absent from the body" and "assert a 404 produces no `text` field".

And the honesty rule now matches `ALLOW_MOCK_DB`: `mockAllowed()` is false in production unless the
operator sets `ALLOW_MOCK_BRAIN=true` **out loud**. The demo string is prefixed `[DEMO — …]` so it can
never be quoted as the model.

---

## 2. The client was a second brain, and it lied too

`app/jarvis/page.tsx` had a `mockReply(q)` function — a keyword table returning confident answers:

> *"Sir, Omar: V2 ZIP 7.0M sent 23:38Z 28 Oct in thread 1a15281d992fe8e7 …"*

Wired into `catch { ... mockReply(q) }`. So **if the network failed**, the user was told about a ZIP
sent three days earlier, complete with a thread id. The server's mock was at least labelled. The
client's was not.

It is deleted. The page now renders a red `[brain offline]` bubble and says *nothing was answered,
and I will not guess*. `J11` fails if a fabricated reply table returns.

There were four such places in this codebase — server mock, client mock, static cron brief, prose
workflow files. Four systems that would rather produce a plausible sentence than report a failure.

---

## 3. n8n: the automation could not reach the brain

This is the architectural error, and it is worse than the model id.

Every route under `/api` requires a `shadow_session` cookie except the webhook, the crons and auth.
n8n is a machine caller: **it has no cookie.** So the "n8n Cloud automation + Claude brain"
architecture had no working link between its two halves. WF2 could not ask for a script. WF3 could
not ask for a reframe. The blueprint's answer was to put a Claude node *inside n8n* — which would
have created a second copy of the system prompt and a second copy of the model id, outside this
repo: the exact drift that produced the tier bug, planted on purpose.

`POST /api/brain` is the door:

```
Authorization: Bearer $N8N_BRAIN_TOKEN     (falls back to $CRON_SECRET)
{ "prompt": "...", "expect": "script" }
→ 200 { ok: true, data, provider, model, publishable }
→ 503 { ok: false, error: "brain_unavailable", retryable: true }
```

One prompt, one model policy, one audit trail. `bearered()` in `lib/cron-auth.ts` is the single
machine-auth rule — constant-time compare, and **503 when unset in production**, same as every other
secret in this repo. `publishable: false` marks a mock, and WF2 checks it explicitly.

---

## 4. n8n: the workflows were prose

```
$ python3 -c "import json; print(len(json.load(open('n8n/n8n_workflows_self_3man.json'))['nodes']))"
```

That command doesn't even run — there is no top-level `nodes`. Each file held
`{"workflows": [{"nodes": ["Postgres SELECT 50 creators", "HTTP Social Blade…", …]}]}`: an array of
**strings** describing a workflow. n8n cannot import one node of it.

Meanwhile `/n8n` told the owner *"import to n8n, add 8 creds, run WF1"*, and ten documents claimed
"9 WFs", "10 WFs", "14 WFs" for the same file.

This is the **third** instance of one pattern:

| Instance | Reads like | Actually |
|---|---|---|
| `lib/render-paid.ts` | a render engine | imported by nothing |
| `lib/jarvis.ts` | a Claude brain | calling a retired id, returning a mock |
| `n8n/*.json` | workflows | arrays of English sentences |

Documents that read like machinery. Each one made the project look further along than it was, and
none of them could be caught by a test that only exercised the code it was told to exercise.

### What changed

`n8n/build_workflows.py` is now the source; the JSON is generated. Five workflows, 142 nodes total:

| WF | When | Nodes | What it proves |
|---|---|---|---|
| WF1 Research | Mon 08:00 | 10 | Postgres → prompt → `/api/brain` → parse → write → Telegram |
| WF2 Content | 02:00 | 10 | six scripts → `publisher_queue38` as `pending_G4`, **never published** |
| WF3 Demand | 09:00 | 7 | PASS = replies ≥ max(25, ⌈views×1%⌉) — arithmetic, not judgement |
| WF4 Brief | 05:45 | 5 | prints `source`, so a placeholder can't be quoted as a metric |
| WF5 Publish | manual | 7 | G4 is a human, not a cron |

Guards, in the workflows and in the tests:

- every `/api/brain` node feeds an `ok?` IF; the false branch says **STOPPED — nothing was written**
  (`N03` counts them: 8 brain calls, all gated)
- `WF6–WF14` are named in old docs and **do not exist** — stated in `n8n/README.md` and on `/n8n`
- `N01` fails on any file with zero executable nodes or a dangling connection
- `N02` re-runs the generator and fails if a committed file drifted
- WF5 is a **manual** trigger on purpose: a publish gate is a person

---

## 5. The retired ladder was still on sale — in the automation

`config/n8n_workflow_variables.json` — the file n8n reads for its variables — said:

```
{ "key": "WHOP_LADDER_PRICES", "value": "$27+$9+$79+$19/mo" }   ← retired, quoted as evidence
```

So the previous round's price fix reached **17 markdown documents and none of the machinery**. A
workflow using `{{ $vars.WHOP_LADDER_PRICES }}` would have advertised a $27 vault and a $19 Circle
that have not existed for days. The `/n8n` page showed the same ladder to the owner, and
`lib/interview.ts` asked *"Rank what you want to earn from first: vault one-times ($27), Pro ($79),
Circle ($19/mo)"*.

`J08` had been scanning `docs/` only. `J10` scans `jarvis-app/app`, `jarvis-app/lib`, `n8n/` and the
n8n variable file — and it caught the `/n8n` page on the first run, because I reintroduced the
literal deliberately to check that it fails.

---

## 6. Where the count now stands

```
reliability  17/17   security 27/27   execution 15/15   tiers 15/15
memory       18/18   judgment 13/13   brain     7/7     automation 4/4
TOTAL       116/116
```

Two new dimensions exist because the previous gate had no way to ask either question: *does the
model actually answer* (brain) and *is the automation actually machinery* (automation).

Negative-tested, not assumed:

- retire the model id in `DEFAULT_MODEL` → `B01` fails (it also asserts the default is not retired)
- reintroduce the retired `$27+$9+$79+$19` ladder in the UI → `J10` fails and names the file and line
- tamper with one node name in a workflow → `N01` and `N02` both fail

---

## 7. What this does and does not change about the stages

Nothing about Stage 1–4's blockers — those are still your accounts. What it changes is **what
happens the moment they exist.**

Before this pass, if you had completed Neon + Whop + keys tonight, you would have had: a working
storefront, a payment recorded correctly, and a chat that answered every question with a fixed
paragraph about a ZIP file, while nine documents told you WF1–WF14 were running.

Now: `/api/jarvis` answers 503 until the brain is real, `/n8n` lists five workflows that exist, and
`/api/brain` gives the automation a way in.

**Still true, and now the only thing true about the money loop:** no route spends a run. Stage 5 —
`quotaCheck` → `higgsfieldRender` → `agent_runs` → URL — remains the last code owed, and it is still
about 120 lines against modules that already exist.

The difference is that when it lands, the two systems on either side of it now tell the truth.
