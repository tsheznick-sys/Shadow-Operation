"""
Shadow Operation — OpenAI Agent Session (MCP + Web Search + Multi-Agent)
Source: user snippet 2026-10-24 + .ENV Google Doc 1PY
Model: gpt-6-astra (preview) — swap to gpt-4o/gpt-5 if not yet enabled
Docs MCP: https://developers.openai.com/mcp  (http transport)
Workspace: /workspace  + capabilities/skills  → maps to repo root in Arena

Usage:
  export OPENAI_API_KEY=sk-...   # from marketing/funnel/backend/.env or .env root
  pip install openai --break-system-packages
  python scripts/openai_agent_session.py
  # prints session.id → use client.beta.agents.sessions.retrieve(session.id) to poll

Env: Reads OPENAI_API_KEY from env; falls back to marketing/funnel/backend/.env,
     marketing/manychat/backend/.env, or .env at repo root.
"""
import os
from pathlib import Path

def load_openai_key() -> str:
    # 1) env var wins
    if os.getenv("OPENAI_API_KEY") and "placeholder" not in os.getenv("OPENAI_API_KEY",""):
        return os.getenv("OPENAI_API_KEY")
    # 2) try repo .env files (funnel, manychat, publisher, auth, root)
    candidates = [
        Path("marketing/funnel/backend/.env"),
        Path("marketing/manychat/backend/.env"),
        Path("marketing/publisher/backend/.env"),
        Path("auth/backend/.env"),
        Path(".env"),
    ]
    for p in candidates:
        if p.exists():
            for line in p.read_text().splitlines():
                if line.strip().startswith("OPENAI_API_KEY="):
                    val = line.split("=",1)[1].strip().strip('"').strip("'")
                    if val and "placeholder" not in val and val.startswith("sk-"):
                        return val
    return ""

try:
    from openai import OpenAI
except ImportError:
    raise SystemExit("openai not installed — run: pip install openai --break-system-packages")

api_key = load_openai_key()
if not api_key:
    print("[WARN] OPENAI_API_KEY not set (still sk-placeholder) — set it in marketing/funnel/backend/.env then re-run.")
    print("       The script below will still validate syntax but will not call the API without a key.")
    # Use dummy for dry-run syntax check; comment out to force real key
    api_key = os.getenv("OPENAI_API_KEY", "sk-placeholder")

client = OpenAI(api_key=api_key) if "placeholder" not in api_key else OpenAI(api_key="sk-test-dry-run-will-fail-at-call")

# Optional: point workspace to repo root when running in Arena
workspace_dir = os.getenv("WORKSPACE_DIRECTORY", "/workspace")
# In Arena sandbox the repo is at /home/user/Shadow-Operation → /workspace symlink or direct
if Path("/home/user/Shadow-Operation").exists() and workspace_dir == "/workspace":
    # Keep as /workspace for OpenAI env, but ensure skills path exists
    skills_dir = "/workspace/capabilities/skills"
else:
    skills_dir = f"{workspace_dir}/capabilities/skills"

# This is the exact snippet you provided, wrapped with env guard + print
if "placeholder" in api_key or "dry-run" in api_key:
    print("[DRY RUN] Validating session payload without API call...")
    print(f"  model: gpt-6-astra")
    print(f"  workspace: {workspace_dir}")
    print(f"  skills: {skills_dir}")
    print(f"  tools: programmatic_tool_calling, mcp(openai_docs@https://developers.openai.com/mcp), web_search")
    print(f"  multi_agent: enabled (max 4 subagents)")
    print("[DRY RUN] Set OPENAI_API_KEY to run for real.")
else:
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
