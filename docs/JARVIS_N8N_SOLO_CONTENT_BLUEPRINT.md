# N8N SOLO CONTENT JARVIS — Full Blueprint
**Branch:** `arena/6c47af3d-shadow-operation` `pr_open` | **Revoked here:** `8e59224` (jarvis-app → archive) | **New build on:** **n8n Cloud $20/mo** | **Date:** 2026-10-29 | **Mode:** Solo Full-Time Content (no creator hunt, no 60/40)

> You: “N8N for making your own content to all the other domains. Skip finding the creator part and 60/40 if this n8n will make Jarvis work full time.” This is that build. Jarvis makes YOUR content full-time across custom domains — self sustained (money + content loops).

---

## 0) 24/24 ANSWERS SYNTHESIS (squad→solo pivot)
| Decision | Squad (revoked 6668bea) | Solo n8n Content (this doc) |
|---|---|---|
| Software host | Vercel+Neon squad PWA | **n8n Cloud $20/mo** (you picked n8n_20_only, self-host Fly/PI as fallback) |
| Scope | Squad 3-5 all ops | **Solo + all niches custom domains** — you own all 1,462 GREEN niches as YOUR content pillars (not outreach) |
| Content | Squad pipeline (VET→DRAFT→WHOP) | **Your content full-time: short 8s + long 32s/60s** (flow_pillow_wan), 6/day via Publisher queue38 |
| Autonomy | Auto while sleep + human swipe | **Auto while sleep content** — n8n drafts 6 videos/captions overnight, you wake to G4 approve |
| Whop | Auto Whop on PASS for creators | **Whop Vault auto on YOUR audience demand** — same 1%+25 gate (R10) but for your own 6/day views → $27+$9+$79+$19/mo ladder (you kept ladder_27_9_79_19) |
| ManyChat | Auto 8ch for creators | **Yes 8ch** (you kept yes_8ch) — solo DM flows to your Whop |
| Brain | Cloud-only fast | **Hybrid later solo** — OpenAI gpt-4o-mini now ($30/mo), Ollama Beelink later when $10k/mo (your pick) |
| Memory/Eyes | Forever + full vision | **Forever solo** + **Social Blade/HypeAuditor auto-research** → n8n ranks best performing + monetizable weekly → top 5 auto-rotate as domains |
| Notifications | All 3 to squad | **All 3 solo to you** — Telegram+Gmail Shadow Hot+Signal @scott.428 (you kept) |
| Voice | Mic+briefing | **Text only solo** (you picked) — Butler formal text in Telegram/Gmail briefs |
| Gmail | Creator outreach | **Gmail for brand deals + Whop notify only** (no outreach) + daily 05:45 brief |
| Self sustained | Revenue split | **Both loops:** Whop revenue funds n8n $20+OpenAI $30 (money) + top comments feed next video ideas (content) — fully self sustained |
| Domains | 8-Gate GREEN creators | **Custom domains you rank weekly:** best performing+most monetizable → n8n auto-asks you: “Top 5 this week: Psych Hack 8.2K pool 5.1% ER → make content?” |
| Launch | 7-day PWA | **14-day n8n full** (you picked): 6/day + demand→Whop + 8ch live in 14d |

---

## 1) REQUIRED TOOLS — Solo n8n Content Stack (Another Software = n8n)
### Must-have (Day 1, $50/mo total solo)
| Tool | What | Setup solo | Cost |
|---|---|---|---|
| **n8n Cloud** | Your Jarvis host (another software) — no code needed, visual workflows | n8n.cloud signup → new workflow → credentials | $20/mo Starter (5k executions) |
| **Neon Postgres** (or Airtable if pure n8n) | Forever memory: `creators` 1,462 as YOUR content pillars → `content_queue`, `publisher_queue38`, `snapshots`, `whop_sales` | Neon free 3GB → `DATABASE_URL` in n8n Postgres node OR Airtable base | $0 free → $19/mo |
| **OpenAI** | Brain hybrid later: gpt-4o-mini drafts scripts/captions + whisper (optional) + vision for OCR scan | `OPENAI_API_KEY` in n8n OpenAI node | $30/mo (1k videos/mo) |
| **Google Cloud Gmail** | Brand deals + Whop alerts + 05:45 daily brief `scott.abuya@gmail.com` | Enable Gmail API → OAuth `gmail.modify` → n8n Gmail OAuth2 cred | $0 |
| **Telegram Bot** | Solo Butler ping `Sir, 6 videos ready in queue38` | @BotFather → `TELEGRAM_BOT_TOKEN` n8n Telegram node | $0 |
| **Linear** | Solo pipeline tracker (keep SHA) | `LINEAR_API_KEY` n8n Linear node | $0 free |
| **Flow wisely** (via n8n HTTP + Drive) | 8s/32s/60s video gen (Tier0 Pillow 0cr + Tier2 Wan 1.3B T4 free, Higgsfield UI manual Tier1) | Flow API key + Drive `NUMINOUS_WHOP_DEPLOY/` + Katana p01_32s_9x16.mp4→ffmpeg schedule38 queue70 | $0 free rails (no card) |
| **Publisher queue38** | 6/day IG+TikTok+YT G4 approve (reuse `marketing/publisher/`) | n8n Postgres/Airtable → n8n HTTP Request to Publisher API | $0 |

### Scale (Week 2, add when needed)
| Tool | Use | Cost |
|---|---|---|
| **Whop API** | Whop vault $27+$9+$79+$19/mo ladder auto on PASS (1%+25 of YOUR content views) | $0 + 13% Whop fee |
| **ManyChat** | 8ch DM flows → Whop | $15/mo |
| **Apify/Social Blade** | n8n auto-research best monetizable → rank weekly | $49/mo (or manual 12-post check $0) |
| **R2** | Daily backup Litestream→R2 | $5/mo |
| **Signal** | Optional solo ping | $0 |

**Solo MVP total:** n8n $20 + Neon $0 + OpenAI $30 + R2 $5 = **$55/mo** → Whop 2 sales $54 covers it → self sustained money loop from Day 14.

---

## 2) SELF SUSTAINED LOOPS (both, your pick)
**Money loop:** n8n makes 6/day → Publisher queue38 → G4 approve → 6/day live → views ×1%+25 → PASS → n8n auto-creates Whop vault $27+$9+$79+$19/mo → sales → pays n8n $20+OpenAI $30 → self funded.
**Content loop:** Top video comments (buyer_pool_x3 logic repurposed for YOUR audience) → n8n scrapes comments → OpenAI extracts “next video idea from comments” → auto-queues next 6 → viral loop, no creator hunt.

---

## 3) N8N WORKFLOWS (4 core) — Import-ready

### WF1: Research — Best Performing + Most Monetizable Weekly (your ask)
**Trigger:** Cron `0 8 * * 1` (Mon 08:00 EAT)
**Nodes:** 
1. Postgres `SELECT * FROM creators ORDER BY pool*er DESC LIMIT 50` (1,462 GREEN as YOUR pillar pool)
2. HTTP Request → Social Blade + HypeAuditor (full vision) + Apify TikTok/IG scraper → `buyer_pool_x3`, `ratio`, `ER`
3. IF `ER>3% && ratio<50` → GREEN (reuse 8-Gate)
4. OpenAI `gpt-4o-mini`: Rank top 5 most monetizable: “Given pool/ER/ratio + Whop fit, rank 5 for solo content vault $27”
5. Telegram+ Gmail: “Sir, Week 44 top 5 monetizable domains: 1) Psych Hack 8.2K pool 5.1% ER 2) ... → Shall n8n build 6/day for these?”
6. Postgres `UPDATE solo_domains SET top5=[...]`
> You said: “I will ask on best performing + most monetizable before we get more — fully self sustained” → WF1 is that ask. You approve top 5, n8n rotates.

### WF2: Content Maker — Full-Time (6/day, Short+Long, Flow/Pillow/Wan)
**Trigger:** Cron `0 2 * * *` (daily 02:00 EAT, while you sleep)
**Nodes:**
1. Postgres `SELECT top5 FROM solo_domains` → for each domain
2. OpenAI `gpt-4o-mini`: Generate 6 scripts: 3×8s Short (hook+value+CTA) + 2×32s Long (Higgsfield style) + 1×60s deep → Butler formal tone (your pick) → output JSON `{title, script, captions, hashtags}`
3. HTTP Request Flow `generate 8s` + Pillow `mock HD 1080x1920` (Tier0 0cr) + Wan 1.3B T4 `32s` (Tier2, Colab T4 free) → ffmpeg Katana `p01_32s_9x16.mp4→queue70` → Drive `NUMINOUS_WHOP_DEPLOY/`
4. Postgres `INSERT INTO publisher_queue38 (date, caption, video_url, status='pending_G4')`
5. Linear `Create Issue` SHA: “6 videos ready for G4 approve — 3 short + 3 long — top domain Psych Hack”
6. Telegram “Sir, 6 videos ready in queue38 for your swipe — 02:15 EAT”

### WF3: Publisher → Demand → Whop Vault Auto (solo version of Omar 1%+25)
**Trigger A:** `publisher_queue38` status `pending_G4` → you approve via Telegram “Approve” button or n8n form → `approved` → HTTP Request Publisher API → 6/day IG+TikTok+YT live
**Trigger B:** Cron `0 9 * * *` (09:00 EAT daily) — measure YOUR content demand (repurpose Omar R9-11 for yourself):
1. HTTP Request IG/TikTok/YT analytics → views + replies for last 3 stories/posts
2. IF `replies >= max(25, ceil(views*0.01))` → PASS → Whop node `Create Product` `Your Domain Official Vault` $27+$9+$79+$19/mo (ladder_27_9_79_19) + grant admin (you)
3. ManyChat node `Push Flow 8ch` → DM “Reply VAULT for 40 early” → Whop
4. Gmail “Sir, PASS — 32 replies ≥ 28 needed (1% of 2,800 views) — Whop vault live — Vault Circle $19/mo” → you decide live (like Omar Sun 09:00)
5. IF FAIL → log → content loop: OpenAI “Why FAIL? Next reframe?” → auto-queue next 6
> No Whop before PASS (R9) — same hard rule, but for YOUR audience. Text-only solo notify.

### WF4: ManyChat 8ch + Brand Gmail + Daily Brief (solo)
**Trigger:** ManyChat webhook `new subscriber` → n8n → Postgres `replies` → Whop entitlement → Telegram “New vault buyer $27”
**Gmail:** IMAP Gmail `brand@*` → OpenAI classify → Telegram “Sir, brand deal inbound from @brand — reply template ready”
**Daily brief:** Cron `45 5 * * *` → Telegram+ Gmail Shadow Hot: “Sir, 6 videos live, 2.1K views, 18 replies, 1 Whop $27 sale — n8n spent $1.20 OpenAI today”

---

## 4) HOW TO SET UP ON N8N (14-day solo full)
**Day 1-2:** n8n.cloud → import `n8n_workflows_solo_content.json` (4 workflows below) → add creds: OpenAI, Gmail OAuth2, Neon Postgres, Telegram, Linear
**Day 3-5:** Connect Flow/Pillow/Wan: n8n HTTP Request to Flow wisely (8s) + Pillow mock + Wan Colab T4 webhook → Drive OAuth2 → test 1×8s + 1×32s
**Day 6-7:** Wire Publisher queue38: Postgres table `publisher_queue38` → Publisher API → G4 approve button (Telegram inline keyboard)
**Day 8-9:** Test 6/day: Run WF2 once → 6 videos → queue38 → approve → live on IG/TikTok/YT
**Day 10-12:** Wire WF3 demand→Whop: Whop API key → test PASS 1%+25 on YOUR views → vault auto → ManyChat 8ch
**Day 13-14:** WF1 weekly + both loops live → n8n full-time: Research Mon → Make 6/day → Measure daily → Whop auto → Telegram brief
**After 14d:** Hybrid Ollama later (Beelink) when $10k/mo → switch `JARVIS_BRAIN=hybrid` in n8n OpenAI node to local

---

## 5) N8N CREDENTIALS Checklist (copy to n8n)
- [ ] n8n Cloud $20/mo (host)
- [ ] `DATABASE_URL` Neon free → n8n Postgres node
- [ ] `OPENAI_API_KEY` → n8n OpenAI node (gpt-4o-mini + whisper optional)
- [ ] Gmail OAuth2 `GMAIL_CLIENT_ID/SECRET` + refresh token → n8n Gmail node (scope gmail.modify)
- [ ] `TELEGRAM_BOT_TOKEN` + chat_id → n8n Telegram node
- [ ] `LINEAR_API_KEY` → n8n Linear node
- [ ] `WHOP_API_KEY` → n8n HTTP Request Whop `POST /products`
- [ ] `MANYCHAT_API_KEY` → n8n ManyChat node
- [ ] Flow/Pillow/Wan: Flow API key + Drive OAuth2 + Wan T4 Colab URL
- [ ] `R2_ACCESS_KEY` optional → n8n S3 node daily backup

---

## 6) FILES IN THIS REPO FOR SOLO
- `archive/jarvis_revoked_2026-10-29/jarvis-app/` → reuse Publisher queue38 logic (`marketing/publisher/`) + ManyChat 8ch (`tools/apparatus_1000.py` logic as research)
- `data/creator_apparatus_1000.csv` → 1,462 GREEN repurposed as YOUR content pillars (not outreach)
- `reference/SHADOW_OPERATION_RULES.md` R9-11 → reuse for solo demand gate (no Whop before PASS, strict 1%+25)
- `n8n_workflows_solo_content.json` → import to n8n (4 workflows, see `n8n/` folder)

---

## 7) BUDGET SOLO N8N CONTENT (self sustained)
| MVP 14d | Scaled 30d |
|---|---|
| n8n $20 + Neon $0 + OpenAI $30 + R2 $5 = **$55/mo** | n8n $20 + Neon $19 + OpenAI $60 + R2 $5 + ManyChat $15 = **$119/mo** |
| 2 Whop sales $54 covers MVP | 5 sales $135 covers scaled → profit after — self sustained |

---

**Next:** Import `n8n/n8n_workflows_solo_content.json` to n8n Cloud → run WF1 to get your first Top 5 monetizable domains → WF2 will make 6/day full-time. No creator hunt, no 60/40 — Jarvis works for you full-time.

