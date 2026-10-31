# JARVIS FULL-STACK APP — 30 QUESTIONS TO BUILD REAL-LIFE JARVIS
Branch: `arena/6c47af3d-shadow-operation` | Date: 2026-10-29 | Mode: Cloud-hosted + Agent Primary + Bros Ops

> Goal: App that runs Shadow Operation 24/7 like Marvel's JARVIS — voice, eyes, hands — for you + your bros. Hosted in cloud, agent does 90% work, you do human gates (send, call, sign, money).

---

## A) CORE VISION & BROS (1-6)
1. Who are "my bros" — how many operators? Just you + Numinous bro, or 3-5 bros with shared pipeline? Do they need separate logins + permissions?
2. Real-life JARVIS style: Do you want **voice-first** (wake word "Hey Jarvis", spoken replies, TTS) like Iron Man, or **chat-first** (Telegram/Signal/WhatsApp) with voice optional?
3. What does "any operation I do with my bros all time" mean — should JARVIS track **all** your businesses (Shadow, Numinous, future niches) in one dashboard, or Shadow Operation only?
4. 24/7 brain: Should agent act **autonomously** (drafts, vet, follow-ups) while you sleep, or **ask before every action** (Gate G4 manual)?
5. Butler vs Bro personality: Current config is Butler (Alfred formal). Keep Butler for brand, or switch to Bro-casual for internal ops?
6. Success metric for v1: What proves JARVIS works? e.g., "10 drafts auto-written + approved in app + 1 demand test launched without Gmail"?

## B) CLOUD, HOSTING & AGENT (7-12)
7. Hosting: Fly.io $7/mo (global edge) vs Vercel $0 (cron) vs Railway — you picked Fly + Supabase. Confirm: **Fly.io primary + Supabase Postgres + Upstash Redis** OK?
8. Agent brain: Hybrid (Cloud gpt-4o-mini + Local Ollama fallback + Claude Code for repo) — keep hybrid, or go 100% cloud (OpenAI) for speed?
9. Always-on: Does JARVIS need **wake-on-voice** even when phone locked (like Siri), or is opening app + pressing mic enough?
10. Cloud vs Local split: You said "Hosted & connected to Cloud, then with an agent primarily" — should cloud be **source of truth** and local (Beelink) be hot standby, or local-first with cloud sync?
11. Multi-device: Bros on iPhone + Android + laptop — need **native mobile app** (Expo), or **PWA web app** (installable, cheaper, works everywhere)?
12. Offline: If internet dies in Nairobi, should JARVIS queue work locally and sync when back (Tailscale), or just show "offline"?

## C) SHADOW PIPELINE — WHAT JARVIS AUTOMATES (13-18)
13. Full pipeline: Scout → VET (8-Gate) → Outreach (G4) → Reply triage → Audit → Demand test (3 Stories) → Whop build → 14-day launch → Optimize — which **3 steps** should be fully auto in v1?
14. VET: Apparatus 1000 GREEN uses buyer_pool_x3, ratio<50:1, ER 3%+ — should JARVIS **auto-reject** RED (<2% ER) or flag for your manual review?
15. Outreach: Gate G4 requires your swipe to SEND — keep **human SEND** (Gmail DRAFT+INBOX), or allow **auto-send 6/day** with your pre-approval template?
16. Demand test: Omar locked strict 1%+25 raw + screenshot-only until PASS — should app have **camera scan** (photo of IG Story views → auto-read numbers) + auto PASS/FAIL email to you?
17. Whop: $28+$17+$35+$89+$44+$53+$62/mo via whop.py — should JARVIS **auto-create Whop product** on PASS (PremiereProTutos Official Vault style) + grant admin, or draft only?
18. ManyChat 8ch: Should JARVIS push DM flows to ManyChat automatically on launch, or you wire ManyChat manually?

## D) REAL-LIFE JARVIS POWERS (19-24)
19. Voice: Need **inbound voice** (you speak: "JARVIS, how's Omar?") + **outbound voice** (JARVIS speaks: "Sir, Omar posted Story 1, 2.1% replied")?
20. Eyes: Should JARVIS have **screen vision** — screenshot IG/TikTok, read comments/views, Social Blade pull — without you copy-pasting?
21. Hands: Can JARVIS **control your phone** — open Gmail, press SEND, post to IG via API, create Whop — or only suggest + you click?
22. Memory: How long should JARVIS remember? Every DM/email/reply forever (like 1,462 GREEN + learnings.md), or rolling 30-day window?
23. Proactive: Should JARVIS **ping you** (e.g., "Sir, Thu 21:00 — Omar hasn't posted Story 1, DM him now?") via Telegram + Gmail Shadow Hot + Signal?
24. Bros collaboration: Real life JARVIS serves Tony only — should yours serve **all bros equally**, or you are admin + bros are viewers?

## E) INTEGRATIONS & SECURITY (25-30)
25. Integrations priority: Rank — Gmail (scott.abuya@gmail.com), Linear (SHA team), Whop, ManyChat, IG/TikTok/YT Publisher (queue38), Stripe? Which 2 to connect **first**?
26. Gmail risk: scott.abuya@gmail.com holds 200/200 drafts — auto-pause on 2×550 bounces is locked. Keep **Strict deliverability** (0% 550, warmup), or relax to scale faster?
27. Auth: How do bros log in? **Google OAuth** (same Google Cloud Project) + magic link, or email/password + 2FA?
28. Data: Hosted cloud holds creator data + OAuth tokens — need **encryption at rest** + Litestream→R2 daily backup ($5/mo) + Tailscale private VPN — OK?
29. Cost ceiling: MVP $70/mo → scaled $196/mo → $2,472/yr to 1M — is **$70/mo hard cap** for v1, or $150/mo OK if it ships 2 weeks faster?
30. Launch: Ship **PWA web app first** (7 days) then native voice app (30 days), or wait for full native + voice (6 weeks) before any launch?

---

### How JARVIS Will Work Like Real-Life (Proposed Architecture)
**Cloud Hosted:**
- Frontend: Next.js 14 PWA (chat + voice mic + pipeline board + approve swipe)
- Backend: FastAPI (Python) — reuses `tools/algorithm_engine.py` + `reconcile_gmail.py` + `revenue_model.py`
- DB: Supabase Postgres (creators, drafts, replies, bros) + Upstash Redis (6/day queue)
- Hosting: Fly.io (always-on) + Vercel cron fallback + Supabase + Tailscale tunnel to local Beelink later
- Agent: OpenAI gpt-4o-mini primary + Ollama fallback + Claude Code for repo edits — runs every 15min cron: check Gmail → Hard Rule 1 filter → draft → Linear sync

**Agent Primarily:**
- You say: "JARVIS, vet @quietwolfzz"
- Agent does: scrape Social Blade + HypeAuditor → calc buyer_pool_x3/ratio/ER → 8-Gate GREEN? → draft email P1 style → push Gmail DRAFT+INBOX → Linear SHA issue → Telegram "Sir, draft ready for approval"
- You swipe: SEND in app → Gmail sent → tracker updated → 14-day Numinous sequence ready on PASS

**Bros Real-Time Ops:**
- Shared pipeline board (Linear-style) + Telegram group + Signal — JARVIS posts updates to all, but only you can SEND/approve money
- Voice in app: hold mic → Whisper → agent → ElevenLabs TTS → "Sir, 6 drafts await"

**Next Step:** Answer Q1-30 (even short), I build Cloud MVP in 7 days — hosted, connected, agent-first.

