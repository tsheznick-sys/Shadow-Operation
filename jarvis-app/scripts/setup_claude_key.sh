#!/bin/bash
# JARVIS Adaptable Setup — prompts for keys, writes jarvis-app/.env.local + Vercel env hint
set -e
echo "=== JARVIS Adaptable Setup — prompts for keys, writes .env.local ==="
echo "Leave empty to keep existing."
read -p "ANTHROPIC_API_KEY (sk-ant-...): " CLAUDE
read -p "GROK_API_KEY / XAI_API_KEY (xai-...): " GROK
read -p "NICHES_POOL CSV (default from config/adaptable.json): " NICHES
read -p "PAGES_COUNT (default 5): " PAGES
read -p "THRESHOLD_RATIO_GREEN (default 50): " TRG
read -p "THRESHOLD_ER_GREEN (default 5): " TEG
read -p "SOCIAL_MASTER_EMAIL (info.wolf@gmail.com): " SME
read -p "ADMIN_EMAIL (scott.abuya@gmail.com): " AE

if [ -f "jarvis-app/.env.local" ]; then
  OUT="jarvis-app/.env.local"
elif [ -f ".env.local" ]; then
  OUT=".env.local"
else
  OUT="jarvis-app/.env.local"
  mkdir -p "$(dirname "$OUT")"
  touch "$OUT"
fi

append_or_replace() {
  local key="$1" val="$2" file="$3"
  if [ -z "$val" ]; then return 0; fi
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    tmp=$(mktemp)
    grep -v "^${key}=" "$file" > "$tmp" || true
    echo "${key}=${val}" >> "$tmp"
    mv "$tmp" "$file"
  else
    echo "${key}=${val}" >> "$file"
  fi
}

append_or_replace "CLAUDE_API_KEY" "$CLAUDE" "$OUT"
if [ -n "$GROK" ]; then
  append_or_replace "GROK_API_KEY" "$GROK" "$OUT"
  append_or_replace "XAI_API_KEY" "$GROK" "$OUT"
fi
append_or_replace "NICHES_POOL" "$NICHES" "$OUT"
append_or_replace "PAGES_COUNT" "$PAGES" "$OUT"
append_or_replace "THRESHOLD_RATIO_GREEN" "$TRG" "$OUT"
append_or_replace "THRESHOLD_ER_GREEN" "$TEG" "$OUT"
append_or_replace "SOCIAL_MASTER_EMAIL" "$SME" "$OUT"
append_or_replace "ADMIN_EMAIL" "$AE" "$OUT"

echo "Wrote $OUT — now add same vars to Vercel Dashboard → Settings → Environment Variables"
echo "Full adaptable list: jarvis-app/.env.example + config/n8n_workflow_variables.json for n8n variables"
echo "Run: cat $OUT"
