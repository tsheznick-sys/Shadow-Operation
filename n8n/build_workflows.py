#!/usr/bin/env python3
"""
BUILD THE N8N WORKFLOWS — the generator is the source of truth; the JSON is the artifact.

Why this exists (2026-10-31, second deep pass):

  n8n/n8n_workflows_self_3man.json, _solo_content.json and _squad_hybrid.json all claimed to be
  importable workflows. Every one of them had **zero nodes**. They were prose: an array of strings
  like "IF approved → HTTP Publisher API", with an `import_hint` telling the owner to import them
  into n8n. n8n rejects those files. The /n8n page then told the owner to do exactly that.

  That is the same defect as lib/render-paid.ts having no importers and lib/jarvis.ts calling a
  model retired a year earlier: a document that reads like machinery. So the files are now
  generated from this one script — one definition, eight artifacts — and a test re-runs the
  generator and fails if a committed file has drifted from it.

  Run:  python3 n8n/build_workflows.py
"""

import json
import pathlib
import uuid

HERE = pathlib.Path(__file__).resolve().parent
NS = uuid.UUID("6f1c3a52-0d4e-4a7c-9a51-2b8f0a7d0001")

# n8n node types. Conservative typeVersions — these are the ones n8n Cloud has shipped for a
# long time, so an import does not depend on a version the owner may not have.
TRIGGER = "n8n-nodes-base.scheduleTrigger"
MANUAL = "n8n-nodes-base.manualTrigger"
POSTGRES = "n8n-nodes-base.postgres"
HTTP = "n8n-nodes-base.httpRequest"
CODE = "n8n-nodes-base.code"
IF = "n8n-nodes-base.if"
TELEGRAM = "n8n-nodes-base.telegram"
NOTE = "n8n-nodes-base.stickyNote"

PG_CRED = {"postgres": {"id": "REPLACE_POSTGRES", "name": "Neon (jarvis)"}}
TG_CRED = {"telegramApi": {"id": "REPLACE_TELEGRAM", "name": "Jarvis Bot"}}


def nid(wf, name):
    return str(uuid.uuid5(NS, wf + "::" + name))


def node(wf, name, typ, params, pos, creds=None, type_version=1):
    n = {
        "parameters": params,
        "id": nid(wf, name),
        "name": name,
        "type": typ,
        "typeVersion": type_version,
        "position": pos,
    }
    if creds:
        n["credentials"] = creds
    return n


def note(wf, text, pos, width=420, height=260):
    return {
        "parameters": {"content": text, "height": height, "width": width, "color": 4},
        "id": nid(wf, "note::" + text[:40]),
        "name": "README",
        "type": NOTE,
        "typeVersion": 1,
        "position": pos,
    }


def brain_node(wf, name, pos, expect, prompt_expr):
    """The one door from the automation to the model. Token, not a session."""
    return node(
        wf,
        name,
        HTTP,
        {
            "method": "POST",
            "url": "={{ $vars.JARVIS_BRAIN_URL }}/api/brain",
            "sendHeaders": True,
            "headerParameters": {
                "parameters": [
                    {"name": "Authorization", "value": "=Bearer {{ $vars.N8N_BRAIN_TOKEN }}"},
                    {"name": "content-type", "value": "application/json"},
                ]
            },
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": "={{ JSON.stringify({ prompt: " + prompt_expr + ", expect: " + json.dumps(expect) + " }) }}",
            # No `response.neverError`: on a 503 n8n must FAIL the node. A brain outage that
            # quietly returns a body is the whole defect this file exists to prevent.
            "options": {"timeout": 45000},
        },
        pos,
        type_version=4.2,
    )


def wf_research():
    """WF1 — Monday 08:00: rank the pool, keep the top five monetizable."""
    name = "WF1 Research"
    return {
        "name": name,
        "nodes": [
            note(
                name,
                "### WF1 — Research\n"
                "Mon 08:00 EAT. Reads the GREEN pool, asks the brain to rank it, writes the top five.\n\n"
                "**Requires:** `JARVIS_BRAIN_URL` and `N8N_BRAIN_TOKEN` in n8n → Settings → Variables.\n"
                "If the brain answers 503 the workflow stops. It never substitutes text.",
                [-380, 0],
            ),
            node(name, "Mon 08:00", TRIGGER, {"rule": {"interval": [{"field": "cronExpression", "expression": "0 8 * * 1"}]}}, [0, 0], type_version=1.1),
            node(
                name,
                "GREEN pool",
                POSTGRES,
                {
                    "operation": "executeQuery",
                    "query": "SELECT handle, platform, followers, avg_comments, buyer_pool_x3, ratio, er FROM creators WHERE gate = 'GREEN' ORDER BY buyer_pool_x3 * er DESC LIMIT 50",
                    "options": {},
                },
                [220, 0],
                PG_CRED,
                type_version=2.4,
            ),
            node(
                name,
                "Build prompt",
                CODE,
                {
                    "jsCode": "\n".join(
                        [
                            "const rows = $input.all().map(r => r.json);",
                            "if (rows.length === 0) { throw new Error('no GREEN creators — refusing to rank an empty pool'); }",
                            "const table = rows.map((r, i) => `${i + 1}. ${r.handle} (${r.platform}) followers=${r.followers} comments=${r.avg_comments} pool_x3=${r.buyer_pool_x3} ratio=${r.ratio} er=${r.er}`).join('\\n');",
                            "const prompt = [",
                            "  'Rank these creators by how monetizable their audience is for a stickman faceless video agent at Circle $44 / Pro $53 / Team $62.',",
                            "  'GREEN = ratio < 50:1 and ER >= 5%. Return strict JSON: {\"top5\":[{\"handle\":\"...\",\"why\":\"one sentence\"}]}. No prose outside the JSON.',",
                            "  table,",
                            "].join('\\n');",
                            "return [{ json: { prompt, count: rows.length } }];",
                        ]
                    )
                },
                [440, 0],
                type_version=2,
            ),
            brain_node(name, "Ask brain (rank)", [660, 0], "rank", "prompt"),
            node(
                name,
                "Brain ok?",
                IF,
                {
                    "conditions": {
                        "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose"},
                        "conditions": [
                            {"id": "ok", "leftValue": "={{ $json.ok }}", "rightValue": "", "operator": {"type": "boolean", "operation": "true", "singleValue": True}}
                        ],
                        "combinator": "and",
                    },
                    "options": {},
                },
                [880, 0],
                type_version=2,
            ),
            node(
                name,
                "Parse top5",
                CODE,
                {
                    "jsCode": "\n".join(
                        [
                            "const body = $input.first().json;",
                            "const text = body.data || '';",
                            "// The model was asked for JSON. If it wrapped it in prose or fences, recover it —",
                            "// and if it cannot be recovered, throw rather than writing garbage to Postgres.",
                            "const start = text.indexOf('{');",
                            "const end = text.lastIndexOf('}');",
                            "if (start === -1 || end === -1) throw new Error('brain reply was not JSON: ' + text.slice(0, 200));",
                            "const parsed = JSON.parse(text.slice(start, end + 1));",
                            "const top5 = Array.isArray(parsed.top5) ? parsed.top5 : [];",
                            "if (top5.length === 0) throw new Error('brain returned an empty top5');",
                            "return top5.map(t => ({ json: { handle: t.handle, why: t.why || '', provider: body.provider || null, model: body.model || null } }));",
                        ]
                    )
                },
                [1100, -60],
                type_version=2,
            ),
            node(
                name,
                "Rank saved",
                POSTGRES,
                {
                    "operation": "executeQuery",
                    "query": "INSERT INTO solo_domains (handle, why, ranked_at, marked_by) VALUES ($1, $2, NOW(), 'wf1') ON CONFLICT (handle) DO UPDATE SET why = EXCLUDED.why, ranked_at = NOW()",
                    "options": {"queryReplacement": "={{ $json.handle }},{{ $json.why }}"},
                },
                [1320, -60],
                PG_CRED,
                type_version=2.4,
            ),
            node(
                name,
                "Telegram Sir",
                TELEGRAM,
                {
                    "chatId": "={{ $vars.TELEGRAM_CHAT_ID }}",
                    "text": "=WF1 done — {{ $('Parse top5').all().length }} domains ranked. Top: {{ $('Parse top5').first().json.handle }}",
                    "additionalFields": {},
                },
                [1540, -60],
                TG_CRED,
                type_version=1.2,
            ),
            node(
                name,
                "Brain down — stop",
                TELEGRAM,
                {
                    "chatId": "={{ $vars.TELEGRAM_CHAT_ID }}",
                    "text": "=WF1 STOPPED: the brain did not answer. Nothing was ranked and nothing was written. Check ANTHROPIC_API_KEY / GROK_API_KEY on Vercel, then re-run.",
                    "additionalFields": {},
                },
                [1100, 140],
                TG_CRED,
                type_version=1.2,
            ),
        ],
        "connections": {
            "Mon 08:00": {"main": [[{"node": "GREEN pool", "type": "main", "index": 0}]]},
            "GREEN pool": {"main": [[{"node": "Build prompt", "type": "main", "index": 0}]]},
            "Build prompt": {"main": [[{"node": "Ask brain (rank)", "type": "main", "index": 0}]]},
            "Ask brain (rank)": {"main": [[{"node": "Brain ok?", "type": "main", "index": 0}]]},
            "Brain ok?": {
                "main": [
                    [{"node": "Parse top5", "type": "main", "index": 0}],
                    [{"node": "Brain down — stop", "type": "main", "index": 0}],
                ]
            },
            "Parse top5": {"main": [[{"node": "Rank saved", "type": "main", "index": 0}]]},
            "Rank saved": {"main": [[{"node": "Telegram Sir", "type": "main", "index": 0}]]},
        },
        "settings": {"executionOrder": "v1"},
        "pinData": {},
    }


def wf_content():
    """WF2 — 02:00: six scripts from the top five domains, straight into the G4 queue."""
    name = "WF2 Content"
    return {
        "name": name,
        "nodes": [
            note(
                name,
                "### WF2 — Content\n"
                "02:00 while you sleep. Six scripts (3×8s, 2×32s, 1×60s) for the top domains.\n\n"
                "Output goes to `publisher_queue38` with status `pending_G4`. **Nothing publishes from\n"
                "this workflow.** G4 is a human gate.\n\n"
                "A 503 from /api/brain stops the run — a queue filled with 'brain unavailable' is worse\n"
                "than an empty queue.",
                [-380, 0],
            ),
            node(name, "02:00 daily", TRIGGER, {"rule": {"interval": [{"field": "cronExpression", "expression": "0 2 * * *"}]}}, [0, 0], type_version=1.1),
            node(
                name,
                "Top domains",
                POSTGRES,
                {
                    "operation": "executeQuery",
                    "query": "SELECT handle, why FROM solo_domains WHERE ranked_at > NOW() - INTERVAL '14 days' ORDER BY ranked_at DESC LIMIT 5",
                    "options": {},
                },
                [220, 0],
                PG_CRED,
                type_version=2.4,
            ),
            node(
                name,
                "Build prompt",
                CODE,
                {
                    "jsCode": "\n".join(
                        [
                            "const rows = $input.all().map(r => r.json);",
                            "if (rows.length === 0) { throw new Error('no ranked domains — run WF1 first'); }",
                            "const domains = rows.map(r => r.handle).join(', ');",
                            "const prompt = [",
                            "  'Write 6 vertical scripts for these domains: ' + domains + '.',",
                            "  'Three 8-second shorts, two 32-second pieces, one 60-second piece.',",
                            "  'Stickman character, one locked character design, no faces, no finance advice, no health claims.',",
                            "  'Return strict JSON: {\"scripts\":[{\"kind\":\"8s|32s|60s\",\"domain\":\"...\",\"hook\":\"...\",\"script\":\"...\",\"caption\":\"...\"}]}.',",
                            "].join('\\n');",
                            "return [{ json: { prompt } }];",
                        ]
                    )
                },
                [440, 0],
                type_version=2,
            ),
            brain_node(name, "Ask brain (script)", [660, 0], "script", "prompt"),
            node(
                name,
                "Brain ok?",
                IF,
                {
                    "conditions": {
                        "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose"},
                        "conditions": [
                            {"id": "ok", "leftValue": "={{ $json.ok }}", "rightValue": "", "operator": {"type": "boolean", "operation": "true", "singleValue": True}},
                            {"id": "pub", "leftValue": "={{ $json.publishable }}", "rightValue": "", "operator": {"type": "boolean", "operation": "true", "singleValue": True}},
                        ],
                        "combinator": "and",
                    },
                    "options": {},
                },
                [880, 0],
                type_version=2,
            ),
            node(
                name,
                "Queue for G4",
                CODE,
                {
                    "jsCode": "\n".join(
                        [
                            "const body = $input.first().json;",
                            "const text = body.data || '';",
                            "const start = text.indexOf('{');",
                            "const end = text.lastIndexOf('}');",
                            "if (start === -1 || end === -1) throw new Error('brain reply was not JSON');",
                            "const parsed = JSON.parse(text.slice(start, end + 1));",
                            "const scripts = Array.isArray(parsed.scripts) ? parsed.scripts : [];",
                            "if (scripts.length === 0) throw new Error('brain returned no scripts');",
                            "const today = new Date().toISOString().slice(0, 10);",
                            "return scripts.map((s, i) => ({ json: {",
                            "  date: today,",
                            "  slot: i + 1,",
                            "  kind: s.kind || '8s',",
                            "  domain: s.domain || '',",
                            "  hook: s.hook || '',",
                            "  caption: s.caption || '',",
                            "  body: s.script || '',",
                            "  status: 'pending_G4',",
                            "} }));",
                        ]
                    )
                },
                [1100, -60],
                type_version=2,
            ),
            node(
                name,
                "Insert queue38",
                POSTGRES,
                {
                    "operation": "executeQuery",
                    "query": "INSERT INTO publisher_queue38 (date, caption, body, status) VALUES ($1, $2, $3, 'pending_G4')",
                    "options": {"queryReplacement": "={{ $json.date }},{{ $json.caption }},{{ $json.body }}"},
                },
                [1320, -60],
                PG_CRED,
                type_version=2.4,
            ),
            node(
                name,
                "Telegram Sir",
                TELEGRAM,
                {
                    "chatId": "={{ $vars.TELEGRAM_CHAT_ID }}",
                    "text": "=WF2 done — {{ $('Queue for G4').all().length }} scripts waiting for G4 on /drafts. Nothing published.",
                    "additionalFields": {},
                },
                [1540, -60],
                TG_CRED,
                type_version=1.2,
            ),
            node(
                name,
                "Brain down — stop",
                TELEGRAM,
                {
                    "chatId": "={{ $vars.TELEGRAM_CHAT_ID }}",
                    "text": "=WF2 STOPPED: no usable scripts were returned. The queue is unchanged. Nothing was published.",
                    "additionalFields": {},
                },
                [1100, 140],
                TG_CRED,
                type_version=1.2,
            ),
        ],
        "connections": {
            "02:00 daily": {"main": [[{"node": "Top domains", "type": "main", "index": 0}]]},
            "Top domains": {"main": [[{"node": "Build prompt", "type": "main", "index": 0}]]},
            "Build prompt": {"main": [[{"node": "Ask brain (script)", "type": "main", "index": 0}]]},
            "Ask brain (script)": {"main": [[{"node": "Brain ok?", "type": "main", "index": 0}]]},
            "Brain ok?": {
                "main": [
                    [{"node": "Queue for G4", "type": "main", "index": 0}],
                    [{"node": "Brain down — stop", "type": "main", "index": 0}],
                ]
            },
            "Queue for G4": {"main": [[{"node": "Insert queue38", "type": "main", "index": 0}]]},
            "Insert queue38": {"main": [[{"node": "Telegram Sir", "type": "main", "index": 0}]]},
        },
        "settings": {"executionOrder": "v1"},
        "pinData": {},
    }


def wf_demand():
    """WF3 — 09:00: does yesterday's post clear the demand bar? If yes, the three SKUs."""
    name = "WF3 Demand → Whop"
    return {
        "name": name,
        "nodes": [
            note(
                name,
                "### WF3 — Demand → offer\n"
                "PASS = replies ≥ max(25, ceil(views × 1%)).\n\n"
                "The offer on PASS is the **three agent tiers, one Whop product each**:\n"
                "Circle **$44** · Pro **$53** · Team **$62**. The one-time ladder ($28 first shot,\n"
                "$17 Lite, $35 Good, $89 Better) is a separate door and never gates a tier.\n\n"
                "**Nothing is created in Whop by this workflow.** Whop product ids are set once by the\n"
                "owner and read by the app from env.",
                [-380, 0],
                height=300,
            ),
            node(name, "09:00 daily", TRIGGER, {"rule": {"interval": [{"field": "cronExpression", "expression": "0 9 * * *"}]}}, [0, 0], type_version=1.1),
            node(
                name,
                "Yesterday stats",
                POSTGRES,
                {
                    "operation": "executeQuery",
                    "query": "SELECT id, platform, views, replies FROM post_analytics WHERE posted_at::date = CURRENT_DATE - 1 ORDER BY id",
                    "options": {},
                },
                [220, 0],
                PG_CRED,
                type_version=2.4,
            ),
            node(
                name,
                "Demand gate",
                CODE,
                {
                    "jsCode": "\n".join(
                        [
                            "// The gate is arithmetic, not judgement. Same formula as lib/stickman-agent.ts.",
                            "const rows = $input.all().map(r => r.json);",
                            "const results = rows.map(r => {",
                            "  const views = Number(r.views || 0);",
                            "  const replies = Number(r.replies || 0);",
                            "  const bar = Math.max(25, Math.ceil(views * 0.01));",
                            "  return { id: r.id, platform: r.platform, views, replies, bar, pass: replies >= bar };",
                            "});",
                            "const passed = results.filter(r => r.pass);",
                            "return [{ json: {",
                            "  total: results.length,",
                            "  passed: passed.length,",
                            "  any_pass: passed.length > 0,",
                            "  detail: results,",
                            "  offer: passed.length > 0 ? 'Circle $44 / Pro $53 / Team $62 — one Whop product each' : null,",
                            "} }];",
                        ]
                    )
                },
                [440, 0],
                type_version=2,
            ),
            node(
                name,
                "Any PASS?",
                IF,
                {
                    "conditions": {
                        "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose"},
                        "conditions": [
                            {"id": "p", "leftValue": "={{ $json.any_pass }}", "rightValue": "", "operator": {"type": "boolean", "operation": "true", "singleValue": True}}
                        ],
                        "combinator": "and",
                    },
                    "options": {},
                },
                [660, 0],
                type_version=2,
            ),
            node(
                name,
                "PASS — offer the tiers",
                TELEGRAM,
                {
                    "chatId": "={{ $vars.TELEGRAM_CHAT_ID }}",
                    "text": "=PASS — {{ $json.passed }}/{{ $json.total }} posts cleared the bar. Offer: Circle $44 / Pro $53 / Team $62. Links: the three Whop products, one per tier. No discount.",
                    "additionalFields": {},
                },
                [880, -80],
                TG_CRED,
                type_version=1.2,
            ),
            node(
                name,
                "No PASS — hold",
                TELEGRAM,
                {
                    "chatId": "={{ $vars.TELEGRAM_CHAT_ID }}",
                    "text": "=No PASS — {{ $json.passed }}/{{ $json.total }} cleared the bar. No offer goes out. Improve the hook, not the price.",
                    "additionalFields": {},
                },
                [880, 120],
                TG_CRED,
                type_version=1.2,
            ),
        ],
        "connections": {
            "09:00 daily": {"main": [[{"node": "Yesterday stats", "type": "main", "index": 0}]]},
            "Yesterday stats": {"main": [[{"node": "Demand gate", "type": "main", "index": 0}]]},
            "Demand gate": {"main": [[{"node": "Any PASS?", "type": "main", "index": 0}]]},
            "Any PASS?": {
                "main": [
                    [{"node": "PASS — offer the tiers", "type": "main", "index": 0}],
                    [{"node": "No PASS — hold", "type": "main", "index": 0}],
                ]
            },
        },
        "settings": {"executionOrder": "v1"},
        "pinData": {},
    }


def wf_brief():
    """WF4 — 05:45: the daily brief, fetched from the app so there is one source of numbers."""
    name = "WF4 Daily Brief"
    return {
        "name": name,
        "nodes": [
            note(
                name,
                "### WF4 — Brief\n"
                "05:45 EAT. Pulls `/api/cron/daily-brief` (Bearer `$CRON_SECRET`) and forwards it.\n\n"
                "The route returns `source: \"placeholder\"` until it is wired to Neon. The workflow\n"
                "**prints that field** so a placeholder brief can never be mistaken for a real one.",
                [-380, 0],
            ),
            node(name, "05:45 daily", TRIGGER, {"rule": {"interval": [{"field": "cronExpression", "expression": "45 5 * * *"}]}}, [0, 0], type_version=1.1),
            node(
                name,
                "GET daily-brief",
                HTTP,
                {
                    "method": "GET",
                    "url": "={{ $vars.JARVIS_BRAIN_URL }}/api/cron/daily-brief",
                    "sendHeaders": True,
                    "headerParameters": {"parameters": [{"name": "Authorization", "value": "=Bearer {{ $vars.CRON_SECRET }}"}]},
                    "options": {"timeout": 20000},
                },
                [220, 0],
                type_version=4.2,
            ),
            node(
                name,
                "Format",
                CODE,
                {
                    "jsCode": "\n".join(
                        [
                            "const d = $input.first().json;",
                            "const src = d.source || 'unknown';",
                            "const flag = src === 'placeholder' ? '\\n\\n[PLACEHOLDER — not live data]' : '';",
                            "return [{ json: { text: (d.briefing || 'no brief') + flag } }];",
                        ]
                    )
                },
                [440, 0],
                type_version=2,
            ),
            node(
                name,
                "Telegram Sir",
                TELEGRAM,
                {"chatId": "={{ $vars.TELEGRAM_CHAT_ID }}", "text": "={{ $json.text }}", "additionalFields": {}},
                [660, 0],
                TG_CRED,
                type_version=1.2,
            ),
        ],
        "connections": {
            "05:45 daily": {"main": [[{"node": "GET daily-brief", "type": "main", "index": 0}]]},
            "GET daily-brief": {"main": [[{"node": "Format", "type": "main", "index": 0}]]},
            "Format": {"main": [[{"node": "Telegram Sir", "type": "main", "index": 0}]]},
        },
        "settings": {"executionOrder": "v1"},
        "pinData": {},
    }


def wf_publish():
    """WF5 — the G4 gate in front of Buffer. Manual by design."""
    name = "WF5 Publish (G4)"
    return {
        "name": name,
        "nodes": [
            note(
                name,
                "### WF5 — Publish\n"
                "**Manual trigger on purpose.** G4 is a human approving an asset, not a cron job.\n\n"
                "Only rows that a human moved to `approved` are sent to Buffer. A row still in\n"
                "`pending_G4` is skipped, and the workflow says so.",
                [-380, 0],
            ),
            node(name, "Manual G4", MANUAL, {}, [0, 0], type_version=1),
            node(
                name,
                "Approved rows",
                POSTGRES,
                {
                    "operation": "executeQuery",
                    "query": "SELECT id, caption, video_url FROM publisher_queue38 WHERE status = 'approved' AND scheduled_for <= NOW() ORDER BY id LIMIT 25",
                    "options": {},
                },
                [220, 0],
                PG_CRED,
                type_version=2.4,
            ),
            node(
                name,
                "Anything approved?",
                IF,
                {
                    "conditions": {
                        "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose"},
                        "conditions": [
                            {"id": "has", "leftValue": "={{ $json.id !== undefined && $json.id !== null }}", "rightValue": "", "operator": {"type": "boolean", "operation": "true", "singleValue": True}}
                        ],
                        "combinator": "and",
                    },
                    "options": {},
                },
                [440, 0],
                type_version=2,
            ),
            node(
                name,
                "Send to Buffer",
                HTTP,
                {
                    "method": "POST",
                    "url": "https://api.bufferapp.com/1/updates/create.json",
                    "sendHeaders": True,
                    "headerParameters": {"parameters": [{"name": "Authorization", "value": "=Bearer {{ $vars.BUFFER_TOKEN }}"}]},
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": "={{ JSON.stringify({ text: $json.caption, media: { link: $json.video_url }, now: false }) }}",
                    "options": {"timeout": 20000},
                },
                [660, -80],
                type_version=4.2,
            ),
            node(
                name,
                "Mark published",
                POSTGRES,
                {
                    "operation": "executeQuery",
                    "query": "UPDATE publisher_queue38 SET status = 'published', published_at = NOW() WHERE id = $1",
                    "options": {"queryReplacement": "={{ $('Approved rows').item.json.id }}"},
                },
                [880, -80],
                PG_CRED,
                type_version=2.4,
            ),
            node(
                name,
                "Nothing approved",
                TELEGRAM,
                {
                    "chatId": "={{ $vars.TELEGRAM_CHAT_ID }}",
                    "text": "=WF5 ran — nothing is approved for this window. G4 still holds {{ $('Approved rows').all().length }} rows.",
                    "additionalFields": {},
                },
                [660, 120],
                TG_CRED,
                type_version=1.2,
            ),
        ],
        "connections": {
            "Manual G4": {"main": [[{"node": "Approved rows", "type": "main", "index": 0}]]},
            "Approved rows": {"main": [[{"node": "Anything approved?", "type": "main", "index": 0}]]},
            "Anything approved?": {
                "main": [
                    [{"node": "Send to Buffer", "type": "main", "index": 0}],
                    [{"node": "Nothing approved", "type": "main", "index": 0}],
                ]
            },
            "Send to Buffer": {"main": [[{"node": "Mark published", "type": "main", "index": 0}]]},
        },
        "settings": {"executionOrder": "v1"},
        "pinData": {},
    }


WORKFLOWS = {
    "wf1_research": wf_research(),
    "wf2_content": wf_content(),
    "wf3_demand": wf_demand(),
    "wf4_brief": wf_brief(),
    "wf5_publish": wf_publish(),
}

BUNDLES = {
    "n8n_workflows_self_3man.json": ["wf1_research", "wf2_content", "wf3_demand", "wf4_brief", "wf5_publish"],
    "n8n_workflows_solo_content.json": ["wf1_research", "wf2_content", "wf4_brief"],
    "n8n_workflows_squad_hybrid.json": ["wf1_research", "wf2_content", "wf3_demand", "wf4_brief", "wf5_publish"],
}

BUNDLE_NOTES = {
    "n8n_workflows_self_3man.json": "All five core workflows.",
    "n8n_workflows_solo_content.json": "Solo subset: research, content, brief. No G4.",
    "n8n_workflows_squad_hybrid.json": "Squad subset: all five, G4 held by three humans.",
}


def dump(obj):
    return json.dumps(obj, indent=2, ensure_ascii=False) + "\n"


def main():
    written = []
    for key, wf in WORKFLOWS.items():
        p = HERE / (key + ".json")
        p.write_text(dump(wf))
        written.append(p.name)

    for fname, keys in BUNDLES.items():
        # A bare array of workflow objects is what n8n's Import accepts for several at once.
        # Not {"workflows": [...]} — that wrapper is not a format n8n reads, and shipping one
        # is how the previous files came to be unimportable while claiming otherwise.
        bundle = [WORKFLOWS[k] for k in keys]
        p = HERE / fname
        p.write_text(dump(bundle))
        written.append(fname)

    print("wrote:", ", ".join(sorted(written)))
    for key, wf in WORKFLOWS.items():
        print(f"  {key}: {len(wf['nodes'])} nodes, {len(wf['connections'])} connection sources")


if __name__ == "__main__":
    main()
