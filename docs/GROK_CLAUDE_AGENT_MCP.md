# Grok + Claude Agent Session — MCP + Multi-Agent (Claude 3.5 Sonnet + Grok-2) — Replaces OpenAI 2026-10-30, OPENAI_API_KEY fallback removed Sure

**Replaces:** `docs/OPENAI_AGENT_MCP.md` (gpt-6-astra) — **DEPRECATED OPENAI removed, fallback deleted per Sure** — New brain **Anthropic Claude 3.5 Sonnet primary + xAI Grok-2 secondary** at `api.x.ai/v1`.

```bash
CLAUDE_API_KEY=sk-ant-... # Anthropic console.anthropic.com/settings/keys
GROK_API_KEY=xai-...       # xAI console.x.ai/ (or XAI_API_KEY)
XAI_BASE_URL=https://api.x.ai/v1
GROK_MODEL=grok-2-latest
pip install anthropic openai --break-system-packages  # openai SDK for Grok at api.x.ai/v1
python scripts/grok_claude_agent_session.py
```

MCP: Anthropic https://docs.anthropic.com/mcp + xAI https://docs.x.ai/docs/mcp — Claude Tool Use + Grok programmatic_tool_calling + X real-time. Env reads CLAUDE first, then GROK/XAI — **OPENAI_API_KEY no longer checked** (deleted per Sure).
