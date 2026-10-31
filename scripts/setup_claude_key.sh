#!/bin/bash
# Setup Claude API Key Itself — prompt_on_first_run (secure, no key in repo)
# Run: bash scripts/setup_claude_key.sh  → prompts ANTHROPIC_API_KEY and writes jarvis-app/.env.local + offers vercel env add
set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/jarvis-app/.env.local"
EXAMPLE="$REPO_ROOT/jarvis-app/.env.example"
echo "Sir, Jarvis setup — Claude will set its own key (split: scott.abuya@gmail.com admin, info.wolf@gmail.com social)."
if [ ! -f "$EXAMPLE" ]; then echo "Missing $EXAMPLE"; exit 1; fi
# Ensure .env.local exists from example if not
if [ ! -f "$ENV_FILE" ]; then cp "$EXAMPLE" "$ENV_FILE"; echo "Created $ENV_FILE from example"; fi
echo "1) Get Claude key: https://console.anthropic.com/settings/keys → Create Key sk-ant-... (\$20 Pro for claude-3-5-sonnet-20241022)"
read -sp "Paste ANTHROPIC_API_KEY (sk-ant-): " CLAUDE_KEY; echo
if [[ -z "$CLAUDE_KEY" ]]; then echo "Empty — abort"; exit 1; fi
if [[ ! "$CLAUDE_KEY" == sk-ant-* ]]; then echo "Warning: should start sk-ant-"; fi
# Update jarvis-app/.env.local
if grep -q "CLAUDE_API_KEY" "$ENV_FILE"; then
  sed -i "s|^CLAUDE_API_KEY=.*|CLAUDE_API_KEY=$CLAUDE_KEY|" "$ENV_FILE"
else
  echo "CLAUDE_API_KEY=$CLAUDE_KEY" >> "$ENV_FILE"
fi
# Grok optional
echo "2) Grok fallback (optional): https://console.x.ai → API Keys → xai-..."
read -sp "Paste GROK_API_KEY/XAI_API_KEY (xai-... or skip Enter): " GROK_KEY; echo
if [[ -n "$GROK_KEY" ]]; then
  if grep -q "GROK_API_KEY" "$ENV_FILE"; then sed -i "s|^GROK_API_KEY=.*|GROK_API_KEY=$GROK_KEY|" "$ENV_FILE"; else echo "GROK_API_KEY=$GROK_KEY" >> "$ENV_FILE"; fi
  if grep -q "XAI_API_KEY" "$ENV_FILE"; then sed -i "s|^XAI_API_KEY=.*|XAI_API_KEY=$GROK_KEY|" "$ENV_FILE"; else echo "XAI_API_KEY=$GROK_KEY" >> "$ENV_FILE"; fi
fi
echo "✓ Wrote $ENV_FILE"
# Test via anthropic SDK if available
echo "Testing key (5 tokens)..."
(cd "$REPO_ROOT/jarvis-app" && npx -y -p @anthropic-ai/sdk node -e "import Anthropic from '@anthropic-ai/sdk'; const c=new Anthropic({apiKey: process.env.CLAUDE_API_KEY||'$CLAUDE_KEY'}); c.messages.create({model:'claude-3-5-sonnet-20241022',max_tokens:5,messages:[{role:'user',content:'hi'}]}).then(r=>console.log('✓ Claude live:', r.content[0].text.slice(0,80))).catch(e=>console.log('✗ Test failed:', e.message.slice(0,200)))" 2>&1 | head -20) || echo "Test skipped (install @anthropic-ai/sdk)"
echo ""
echo "Next: vercel env add? (needs vercel CLI login: vercel login with scott.abuya@gmail.com)"
read -p "Add CLAUDE_API_KEY to Vercel production now? [y/N]: " VERCEL_ADD
if [[ "$VERCEL_ADD" == y* ]]; then
  if command -v vercel >/dev/null; then echo "$CLAUDE_KEY" | vercel env add CLAUDE_API_KEY production --cwd "$REPO_ROOT/jarvis-app" && echo "✓ Vercel env added"; else echo "Install vercel CLI: npm i -g vercel → vercel login → re-run this script"; fi
else echo "Skip — manually: vercel env add CLAUDE_API_KEY production < .env.local or via https://vercel.com/dashboard → Project → Settings → Environment Variables"; fi
echo ""
echo "Done — social master info.wolf@gmail.com for 5 YT brands (TT/IG/X) via Buffer, admin scott.abuya@gmail.com for Vercel/Neon/n8n/Claude/Whop/Wise. See docs/LIVE_LINKS_SETUP.md for all live links."
