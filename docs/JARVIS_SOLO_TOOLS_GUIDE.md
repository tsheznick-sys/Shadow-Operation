# JARVIS SOLO — Full Tools to Rebuild Jarvis for Solo Shadow Operation on Another Software
**Revoked Here:** `arena/6c47af3d-shadow-operation` @ `6668bea` → archived to `archive/jarvis_revoked_2026-10-29/jarvis-app/` (port 3000 down) | **Status:** `pr_open` | **Date:** 2026-10-29

> You asked: revoke Jarvis here, then give all required tools to set up full Jarvis for solo Shadow Operation on another software tool. This doc is the solo handover. No squad, just you. One brain, one operator.

---

## 0) What Changes Solo vs Squad (your 30/30 squad → solo)
| Squad (revoked) | Solo (this guide) |
|---|---|
| 3-5 bros, equal approve, per-niche owner | Only you — no roles, no per-niche split — you own all |
| All ops unified (Shadow+Numinous+future) | You pick: solo can still be unified, but you control all niches |
| Auth: Google OAuth invite bros | Auth: only you (Google OAuth single account) |
| Hands-except-money: squad approves | Hands-except-money: you approve all (simpler) |
| Proactive all 3 channels to squad | Proactive to only you (Telegram+Gmail+Signal still, but solo) |
| Budget $150 cap for squad | Solo: $36-70/mo MVP (cheaper, no multi-user overhead) |
| Vercel+Neon+OpenAI (same) | Same stack, but no bros table — just `operator` |

---

## 1) REQUIRED TOOLS — Copy-Paste Solo Stack (Another Software)
Pick **ONE** "another software" host — all listed below work solo. Recommended **Vercel** (cheapest, same as revoked).

### A) Host + DB + Cron (pick one row)
| Option | What it is | Solo use | Cost solo MVP | Why solo |
|---|---|---|---|---|
| **① Vercel + Neon (RECOMMENDED)** | Vercel Frontend+Functions + Neon Postgres free | Your revoked stack, but solo — no bros code | $0 free 14d → $20/mo + Neon $0→$19/mo | Same code, delete `bros` page — fastest |
| **② n8n Cloud** | Workflow automation | No-code Jarvis: Gmail→Linear→Whop→Telegram flows | $20/mo starter → $50/mo | Best if you hate code, visual builder |
| **③ Zapier + Airtable** | Zapier Zaps + Airtable base | Trigger: new Gmail draft → update Airtable → ping Slack | $30/mo + $20/mo | No-code, but 6x weaker than n8n for logic |
| **④ Retool** | Internal tool builder | Build pipeline board + swipe deck without Next.js | $10/mo | Fastest UI if you don't want Next.js |
| **⑤ Bubble** | No-code web app | Full PWA without code (drag-drop) | $32/mo | Good if you want Bubble, slower brain |
| **⑥ Make (Integromat)** | Scenario builder | Like n8n, more connectors | $10/mo | Good Whop/ManyChat connectors |
| **⑦ OutSystems/Mendix** | Low-code | Enterprise, overkill solo | $0→$100/mo | Not needed solo |
| **⑧ Replit + Replit DB** | Hosted IDE | Replit Agent builds + hosts Jarvis | $7/mo | Good for solo, one-click deploy |

**Solo pick:** If you want code, use **Vercel+Neon** (reuse `archive/jarvis_revoked_2026-10-29/jarvis-app/`). If no-code, use **n8n**. This guide covers **both**.

### B) Brain (LLM)
| Tool | Use solo | Cost | Solo setting |
|---|---|---|---|
| **OpenAI gpt-4o-mini** | VET, draft outreach, triage replies, FINAL TERMS detection | $20-30/mo (1k emails) → $60/mo (10k) | `OPENAI_API_KEY=sk-proj-...` in Vercel/n8n |
| **OpenAI Whisper** | Voice-in (mic → text) | $0.006/min | In `/jarvis` mic button |
| **ElevenLabs** | Voice-out (Butler briefing 08:45) | $5/mo | TTS `Sir, 6 drafts await` |
| **Ollama local fallback** | Optional solo later (Beelink) | $0 after hardware | Keep `JARVIS_BRAIN=cloud_only_fast` solo (no Ollama v1) |

### C) Gmail / Comms (solo)
| Tool | Why solo | Setup |
|---|---|---|
| **Google Cloud Project** | Gmail API for `scott.abuya@gmail.com` — create drafts, list replies, batch_modify INBOX | Enable `gmail.modify` + `gmail.send` + `gmail.compose` → OAuth consent → `GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN` |
| **Linear** | Pipeline tracker solo (SHA team) | `LINEAR_API_KEY=lin_api_xxx` → team `SHA` `98004e03...` → project `Shadow Operation — Q4 2026` |
| **Telegram Bot** | Proactive ping solo (05:45 daily + 21:00 Omar nudge) | `@BotFather` → `TELEGRAM_BOT_TOKEN` + chat_id scott |
| **Signal** | Optional solo | `SIGNAL_API` → `signal.me/#p/+...` |
| **Gmail Shadow Hot filter** | Star+Label `Shadow Hot` for hot prospects | Keep — solo still needs it |

### D) Product / Launch (solo)
| Tool | Use solo | Solo note |
|---|---|---|
| **Whop** | Auto-create vault on PASS (PremiereProTutos style $27+$9+$79+$19/mo) | `WHOP_API_KEY` → `whop.py` / Make scenario → grant admin on PASS |
| **ManyChat** | 8ch DM flows | Push on Whop LIVE — solo owns all |
| **Publisher queue38** | 6/day IG+TikTok+YT | `marketing/publisher/` → queue38 → G4 approve |
| **Stripe (alt)** | If not Whop | Payouts — Whop preferred solo |

### E) Data / Memory (solo)
| Tool | What | Why |
|---|---|---|
| **Neon Postgres** (or Supabase/Airtable) | `creators` (1,462 GREEN), `drafts`, `replies`, `snapshots` (Story views OCR) | Forever memory (your Q22) — solo needs all |
| **R2/S3** | Daily backup `templates/backups/` | `R2 $5/mo` + Litestream |
| **Social Blade + HypeAuditor + Apify** | VET eyes (full vision Q20) | Solo eyes — auto-scrape ER/buyer_pool_x3 |

### F) Auth + Security (solo)
| Tool | Solo |
|---|---|
| **Google OAuth (NextAuth)** | Single user — only you can SEND/money (no squad) |
| **Encrypt at rest + Tailscale later** | `yes_encrypt_r2` — solo still private |
| **Strict 0%550** | Auto-pause 2×550 — solo sender protection |

---

## 2) HOW TO REBUILD ON "ANOTHER SOFTWARE" — Step-by-Step

### Path 1: Vercel+Neon (RECOMMENDED — reuse revoked app, solo mode)
1. Unzip `archive/jarvis_revoked_2026-10-29/jarvis-app/` to new software folder (or `git clone` branch `arena/6c47af3d-shadow-operation` @ `6668bea`)
2. Delete `app/bros/page.tsx` (squad gone) + simplify `bros` table → keep solo operator only
3. `npm install` → `cp .env.example .env.local` → fill: `DATABASE_URL` (Neon), `OPENAI_API_KEY`, `GMAIL_*`, `LINEAR_API_KEY`, `WHOP_API_KEY`, `TELEGRAM_BOT_TOKEN`
4. `npm run dev` → `0.0.0.0:3000` → Solo Pipeline board (no bros)
5. Vercel import `jarvis-app` → Env vars → `vercel.json` Crons `*/15` + `05:45` auto live → Deploy → Solo Jarvis live
6. Neon run `scripts/migrate.sql` → import `data/gmail_outreach_complete.json` (1,462 GREEN) → Forever memory
7. Test: say "JARVIS, vet @quietwolfzz" → draft → `DRAFT+INBOX` → you swipe SEND

### Path 2: n8n (No-Code Solo)
1. Create n8n Cloud ($20/mo) → Workflow 1: **VET** — Trigger manual `handle` → HTTP Request Social Blade → IF ER>3% → IF ratio<50 → Set `GREEN` → Airtable `creators`
2. Workflow 2: **DRAFT** — Cron 15min → Airtable `GREEN` not contacted → OpenAI node `gpt-4o-mini` prompt `Quick idea for @handle` → Gmail node `Create Draft` (your Gmail OAuth) → Linear node `Create Issue` SHA team
3. Workflow 3: **TRIAGE** — Gmail Trigger `Shadow Hot` → OpenAI classify reply → IF FINAL TERMS → create FINAL TERMS draft → Telegram node `Sir, reply from @handle`
4. Workflow 4: **OMAR** — Webhook for camera OCR → Tesseract node → IF PASS (1%+25) → Whop node Create Product → ManyChat node Push 8ch → Telegram `Sir, PASS — Whop live`
5. Set `Strict 0%550`: Gmail node error → IF 550 ×2 → Pause workflow + Telegram `Auto-paused`
6. Cost: n8n $20 + OpenAI $30 + Neon $0 = $50/mo solo — no code

### Path 3: Zapier+Airtable / Retool / Bubble — same logic, swap connectors. Pick one software and I map it.

---

## 3) ENV (.env.local solo) — Copy This
```bash
# Solo — one operator (scott.abuya@gmail.com)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
OPENAI_API_KEY=sk-proj-xxx
NEXTAUTH_URL=https://your-solo-jarvis.vercel.app
NEXTAUTH_SECRET=random-32-chars
GMAIL_CLIENT_ID=xxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxx
GMAIL_REFRESH_TOKEN=xxx
LINEAR_API_KEY=lin_api_xxx
WHOP_API_KEY=whop_xxx
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx
SIGNAL_API=xxx
# Solo cost: Vercel $0→$20 + Neon $0→$19 + OpenAI $30 + R2 $5 = $36 MVP → $75 scaled (no squad overhead)
```

---

## 4) WHAT TO DELETE (Squad → Solo)
- `app/bros/page.tsx` (or keep as solo profile)
- `bros` table `is_super_admin` + `niches_owned` logic → single `operator` row
- Multi-user approve flow → you approve all
- `TELEGRAM_CHAT_ID` squad group → your DM only

---

## 5) BUDGET SOLO
| MVP | Scaled (10k emails/mo) |
|---|---|
| Vercel $0→$20 + Neon $0→$19 + OpenAI $30 + R2 $5 = **$36→$75/mo** | $60 LLM + $29 hosting = ~$120/mo — still < $150 cap |

Solo cheaper than squad (no multi-user).

---

## 6) NEXT: Your Questions
I revoked here (port 3000 down, `jarvis-app` → `archive/jarvis_revoked_2026-10-29/`). Next turn I ask **many questions** to pick your "another software" (Vercel vs n8n vs Airtable etc.) and rebuild solo.

> File: `archive/jarvis_revoked_2026-10-29/jarvis-app/` is intact — unzip to new software and go solo. No data lost (`6668bea` safe).

