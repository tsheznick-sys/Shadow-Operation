"""
Shadow Operation — Grok + Claude Agent Session (OPENAI removed, fallback deleted Sure)
Model: claude-3-5-sonnet-20241022 primary + grok-2-latest secondary
"""
import os
from pathlib import Path
def load_keys():
    c=os.getenv("CLAUDE_API_KEY")
    if c and "placeholder" not in c: return ("claude",c)
    for p in [Path("marketing/funnel/backend/.env"),Path(".env"),Path("jarvis-app/.env.local")]:
        if p.exists():
            for l in p.read_text().splitlines():
                if l.strip().startswith("CLAUDE_API_KEY="):
                    v=l.split("=",1)[1].strip().strip('"').strip("'")
                    if v and "placeholder" not in v: return ("claude",v)
    g=os.getenv("GROK_API_KEY") or os.getenv("XAI_API_KEY")
    if g and "placeholder" not in g: return ("grok",g)
    return (None,"")
try:
    import anthropic
    from openai import OpenAI
except ImportError:
    raise SystemExit("pip install anthropic openai --break-system-packages")
provider, api_key = load_keys()
print(f"Provider: {provider} — OPENAI_API_KEY fallback deleted per Sure — only CLAUDE/GROK")
