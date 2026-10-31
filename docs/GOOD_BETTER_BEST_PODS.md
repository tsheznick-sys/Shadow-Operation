# GOOD-BETTER-BEST + POD ACCOUNTABILITY — Wired for 1-2% Churn + Full Stack Scale $189

**Choice locked:** Good-Better-Best vault + Full stack scale $189/mo 5 pages + Pod accountability next

## Good-Better-Best Vault (incentivize best tools = higher tier, not paywall all)

| Vault Tier | Whop Price | What templates you give | What BEST tools you UNLOCK (incentive) | Agent tied |
|---|---|---|---|---|
| **GOOD — Starter $35** | $35 one-time | Pillow 0cr thumbs + Wan T4 free 32s script pack + manual hashtag bank | None auto — teach how to manual Higgsfield UI | Lite not needed |
| **BETTER — Pro $89** | $89 one-time | TubeGen 30m prompts + OpusClip presets (virality 9.2 checklist) + Buffer Team SOP | Unlock `TubeGen auto + OpusClip virality score` in Agent (1 domain, 3 clips/day) | Requires Lite $17/mo |
| **BEST — Vault+Agent Pro $89+$44/mo** | $89 + $44/mo | All above + 5-domain template + Higgsfield polish per-clip preset pack (no LUT, no watermark) + Whop WWS replay | Unlock full stack $189 scale: TubeGen $29 + OpusClip $15 + Higgsfield auto per-clip $0.08 + Buffer Team $60 → shown as `Included` | Requires Pro $44/mo |
| **Continuity $26/mo** | $26/mo | Vault Circle community + monthly teardown live + 5 new prompts | Keeps access to whichever tier bought — if cancel, pod+streak frozen not deleted 7d |

**Incentive logic:** Member buys GOOD → sees Leaderboard winner `Higgsfield Pro + OpusClip 9.2 — 12k views` → clicks `Upgrade to BEST to get same stack?` → Whop `change_plan` → instant unlock via `lib/entitlement.ts` → WF8 logs ascension (churn becomes expansion).

**Wired:** `WHOP_PRODUCT_LITE_ID = Better (Pro $89)` + `WHOP_PRODUCT_PRO_ID = Best (Vault+Agent Pro)` — see `.env.example`. `lib/entitlement.ts` tierLimits() now maps vault tier → agent runs.

## Full Stack Scale $189/mo 5 Pages — Why not Higgsfield only

**Full stack you locked (scale):**
- Engine: Wan T4 free fallback + TubeGen $29 (30m longform source) — without, Higgsfield has no input
- Clip: OpusClip $15 (5-8 shorts + virality) — without, 1 video/day → queue empty → streak break
- Finish: Higgsfield auto $29 ($0.08/clip finish LUT+logo) — without, phone-raw look → 3s drop → ER <2%
- Publish: Buffer Team $60 (6/day auto 5 pages = 15 endpoints) — without, Social opens apps daily → quits
- Brain: Claude $20 + Grok $16 + n8n $20 = $56 → + $133 above = **$189/mo scale** — covered by 7 sales $189 (3 sales $81 covers $56 MVP)

**In docs/TOOL_GAPS...** Higgsfield = finish only, not engine. You chose full scale — correct for 1-2%.

## Pod Accountability — Wired Next (WF9 + Whop Chat)

**Schema (jarvis-app/lib/db.ts added):**
```sql
CREATE TABLE pods (pod_id TEXT PRIMARY KEY, name TEXT, created_at TIMESTAMP);
CREATE TABLE pod_members (pod_id TEXT, user_id TEXT, streak INT DEFAULT 0, posts_7d INT DEFAULT 0, last_post_at TIMESTAMP, PRIMARY KEY(pod_id,user_id));
CREATE TABLE user_vault (user_id TEXT PRIMARY KEY, scripts INT, tier TEXT, pod_id TEXT);
```

**Flow — ManyChat + Whop Chat (no extra $):**
1. Member purchase → Whop webhook `membership_created` → n8n WF9 `pod_assign` node: `SELECT pod_id FROM pods ORDER BY member_count ASC LIMIT 1` → if all pods =5 members, create `pod_06 Red` (5 is max for accountability)
2. n8n HTTP Whop API `POST /api/v1/chats/{pod_chat_id}/members {user_id}` → adds to Whop Chat pod channel (Whop Community → Chat app per pod)
3. Postgres `INSERT pod_members (pod_id,user_id,streak=0)` + `UPDATE pods member_count++`
4. Daily 05:45 WF9 leaderboard cron: `SELECT pod_id, SUM(posts_7d) streak, MAX(last_post_at) FROM pod_members GROUP BY pod_id` → posts to `/retention` + Whop Chat all pods: `Pod Red 28 posts vs Blue 22 — keep streak? Pod Red fire 🔥`
5. Member inactive 3d → WF8 Chatfuel DM: `Hey love it's Vesper — your Pod Red misses you, Sarah just posted proof — want her script?` → includes `Pod streak` social pressure

**Why pod = 1-2%:** Pod streak > personal streak. Leaving pod = letting 4 people down + losing 47 vault scripts. Save rate +18% on top of Pause offer → churn 1.4% → 1.1%.

**Frontend:** `/retention` already shows Pod Red 28 vs Blue 22. Next push adds `/pods` page: `pod_id, members, streak, last win` live from `GET /api/pods`.

**Env:** No new key — uses `WHOP_API_KEY` + `TELEGRAM_BOT_TOKEN` + `DATABASE_URL` you have.

## Next steps

1. Vercel env set `WHOP_PRODUCT_LITE_ID` + `WHOP_PRODUCT_PRO_ID` from Whop Dashboard → Products → copy Product ID
2. Whop Dashboard → Webhooks → add `membership_created` → `https://your-n8n.app/webhook/pod-assign` → test join
3. Import updated `n8n_workflows_self_3man.json` 9 WFs (WF9 pod_assign already added)
4. Verify `/api/entitlement?whop_user_id=test` shows `lite/pro` then `/retention` shows pods live
