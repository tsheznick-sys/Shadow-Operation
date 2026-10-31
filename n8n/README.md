# n8n — Cloud automation, generator-built

**The JSON in this folder is generated.** Edit `build_workflows.py`, run it, commit both.

```bash
python3 n8n/build_workflows.py
```

A test (`T18`) re-runs the generator and fails if any committed file has drifted from it, so the
files cannot quietly become prose again.

---

## Why this folder was rebuilt

Until 2026-10-31 these files were *descriptions of workflows*, not workflows:

```json
{ "name": "...", "workflows": [ { "nodes": ["IF approved → HTTP Publisher API", ...] } ] }
```

`nodes` was an array of **strings**. There was nothing to import. n8n would reject the file. The
`/n8n` page told the owner to import it and "run WF1", and several documents claimed "9 WFs",
"10 WFs" and "14 WFs" for the same file. All of it referred to a file with zero executable nodes.

That is the same defect as a render engine with no callers: a document that reads like machinery.

---

## What is in here

| File | Workflows | Import |
|---|---|---|
| `wf1_research.json` … `wf5_publish.json` | one each | Workflow → **Import from File** |
| `n8n_workflows_self_3man.json` | all five | Import from File (array of workflows) |
| `n8n_workflows_solo_content.json` | WF1, WF2, WF4 | solo has no G4, so no demand/publish gate |
| `n8n_workflows_squad_hybrid.json` | all five | G4 approval held by three humans |

| WF | When | Does | Writes |
|---|---|---|---|
| **WF1** Research | Mon 08:00 | Ranks the GREEN pool via `/api/brain` | `solo_domains` |
| **WF2** Content | 02:00 daily | Six scripts (3×8s, 2×32s, 1×60s) | `publisher_queue38` as `pending_G4` |
| **WF3** Demand | 09:00 daily | PASS = replies ≥ max(25, ⌈views × 1%⌉) | Telegram only — creates **nothing** in Whop |
| **WF4** Brief | 05:45 daily | Forwards `/api/cron/daily-brief` | nothing |
| **WF5** Publish | every 15 min | Calls `/api/cron/publish-due` | `agent_schedule` → `published` |
| **WF6** Chatfuel DM | on Chatfuel webhook | Normalises a comment event → `/api/chatfuel/dm` | one DM into one conversation |

WF5 rings the bell; the app does the work. **G4 did not disappear** — it moved into
`agent_schedule.gate_status`, where a Pro member's first three publishes sit at `g4_review` until a
human approves them. A manual trigger cannot be the thing that publishes five surfaces to five
channels every day, and a cron that decides for itself is a second source of truth.

The publisher claims rows with one conditional `UPDATE … RETURNING`, so two overlapping runs cannot
post the same row twice — and it marks `published` only when Buffer returned a post id, because
Buffer answers **HTTP 200 for a failed mutation**.

---

## Before the first run

1. **n8n → Settings → Variables** — copy every key from `config/n8n_workflow_variables.json`.
   `JARVIS_BRAIN_URL`, `N8N_BRAIN_TOKEN`, `CRON_SECRET`, `TELEGRAM_CHAT_ID` are required; the rest
   have working defaults.
2. **Credentials** — two placeholders must be filled: `Neon (jarvis)` (Postgres) and `Jarvis Bot`
   (Telegram). They appear as `REPLACE_POSTGRES` / `REPLACE_TELEGRAM` until you do.
3. **Run WF4 first.** It is the only workflow with no write side effects.
4. Then WF1, and read the Telegram message before running WF2.

---

## The brain door

n8n has no session cookie, so before today it could not reach the model at all — `/api/jarvis`
answered 401 to every machine caller, and the "n8n + Claude brain" architecture had no link
between its two halves.

`POST /api/brain` fixes that:

```
Authorization: Bearer $N8N_BRAIN_TOKEN
{ "prompt": "...", "expect": "script" | "rank" | "reframe" | "chat" }
→ 200 { ok: true, data: "...", provider: "claude", model: "...", publishable: true }
→ 503 { ok: false, error: "brain_unavailable", retryable: true }
```

**Models are not named anywhere in these workflows.** A node sends an `expect` value
(`script`, `rank`, `chat`, …) and the app picks the model for that lane. A model id typed into
n8n would be a second source of truth, which is exactly how the tier bug happened.

WF1 and WF2 also send a `schema`, so the reply arrives as `parsed` — a real object — instead of a
paragraph the Code node has to scrape. The scraping fallback is still there for a provider that
ignores the schema, but it should never be the path taken.

**A 503 must stop the workflow.** Every brain node here is followed by an `ok?` IF, and the false
branch sends a "STOPPED — nothing was written" message. A queue filled with the words
"brain unavailable" is worse than an empty queue.

`publishable: false` means the answer came from a mock (only possible in non-production or with
`ALLOW_MOCK_BRAIN=true`). WF2 checks it explicitly.

---

## What is *not* built

The older documents reference WF6–WF14 (retention, pods, proof loop, follower gate, 72h demand
test, interview digest, global pause). **Those do not exist here.** Six workflows cover the money
loop; the rest is still plan. Do not let a document tell you otherwise — check the node count.

**One number was taken.** Their WF6 was the 05:45 leak finder. `wf6_chatfuel` is the sixth workflow
that actually exists, and it is the DM leg; the leak finder is still unbuilt and is referred to in
older documents as WF6. If you are reconciling the two, go by the filename in this directory, not
by the number in a plan.

---

## Cost

n8n Cloud Starter is ~$24/mo (2,500 executions). At five workflows the core loop is roughly
150 executions/month — the free execution tier on a smaller plan is enough to prove the loop
before paying for scale.
