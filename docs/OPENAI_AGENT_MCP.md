# OpenAI Agent Session — MCP + Multi-Agent (gpt-6-astra)

**Added 2026-10-24** from your snippet + Google Doc ENV `1PY`. Runnable in Arena or locally — uses `OPENAI_API_KEY` from `marketing/funnel/backend/.env` (Whop is primary checkout, Stripe disabled).

### 1) Where the key lives
```ini
# marketing/funnel/backend/.env
OPENAI_API_KEY=sk-proj-taCQeNJ8...   # ✅ LIVE from Google Doc 1PY 2026-10-24 — funnel/manychat/publisher/auth .env
# same key is read from manychat/publisher/auth/.env fallback
```
After paste, restart funnel: `python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload`

### 2) The snippet (as provided)
`scripts/openai_agent_session.py` runs it verbatim:

```python
from openai import OpenAI

client = OpenAI()

session = client.beta.agents.sessions.create(
    agent={
        "model": "gpt-6-astra",
        "instructions": "Use the OpenAI documentation MCP and web search to answer technical questions accurately. Delegate independent research tasks to subagents when useful.",
        "tools": [
            {"type": "programmatic_tool_calling"},
            {
                "type": "mcp",
                "server_label": "openai_docs",
                "transport": {
                    "type": "http",
                    "server_url": "https://developers.openai.com/mcp",
                },
            },
            {"type": "web_search"},
        ],
        "multi_agent": {"enabled": True, "max_concurrent_subagents": 4},
    },
    environment={
        "type": "self_hosted",
        "workspace_directory": "/workspace",
        "capability_directories": ["/workspace/capabilities/skills"],
    },
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": "Research how to connect an MCP server to an OpenAI agent, check for recent updates, and summarize the recommended setup.",
                }
            ],
        }
    ],
)
print(session.id)
```

### 3) Run
```bash
pip install openai --break-system-packages
export OPENAI_API_KEY=sk-...   # or set in .env above
python scripts/openai_agent_session.py
# → prints session.id
# poll: client.beta.agents.sessions.retrieve(session.id)
```

### 4) Notes
- `gpt-6-astra` is preview — if 404, swap to `gpt-4o` or `gpt-5` in `scripts/openai_agent_session.py` line `model: gpt-6-astra`.
- MCP server: `https://developers.openai.com/mcp` (http) — no auth header needed; subagents = 4 concurrent.
- Self-hosted env `/workspace` maps to `capabilities/skills` — in Arena this is `Shadow-Operation/capabilities/skills` (create if missing).
- Whop remains primary checkout; Stripe keys empty per your `Use whop in place of Stripe` instruction.

### 5) Status 2026-10-24
`OPENAI_API_KEY` ✅ LIVE `sk-proj-taCQe...` in all 4 .env (funnel/manychat/publisher/auth) — verified `python scripts/openai_agent_session.py` dry-run → API blocked only by Arena allowlist (api.openai.com not in allowlist), will work on Fly deploy. `CHAT_FUEL_CLI=8d2124c60ddacc2...` also LIVE in `chatfuel-app/.env` as `CHATFUEL_TOKEN`.
