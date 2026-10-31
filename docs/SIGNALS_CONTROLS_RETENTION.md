# SIGNALS · CONTROLS · RETENTION · GO-LIVE

Final round of the workflow pipeline interview (2026-10-31). These are the operational decisions that sit under every workflow — how Jarvis reaches you, how you stop it, how long we keep data, and how the whole thing switches on.

---

## 1. Signals — how Jarvis reaches the three of you

Jarvis signs every message **as Vessy** (the agent's own name), not as a system.

| Order | Rail | When | Why this rail |
|---|---|---|---|
| 1 | **Daily email to all 3 seats** | Every morning | The record. Everyone gets the same facts, nobody has to ask |
| 2 | **In-app update (PWA)** | On every meaningful change | Zero cost, opens like an app on the phone |
| 3 | **SMS** | When a seat is offline / unreachable | Tells you it matters even with no data |
| 4 | **Voice call** | **No reply within 10 minutes** | The last mile — a call is the only thing that cannot be ignored |

**Escalation clock:** an SMS that gets no reply for 10 minutes triggers WF7 to call that seat directly. The clock is per seat, not per message, so three people do not all get rung for one event.

**Env:** `AFRICASTALKING_*` (primary SMS, cheaper in KE) or `TWILIO_*` (fallback) · `VAPI_API_KEY` for the callback · email provider (`RESEND_API_KEY`).

**Cost:** SMS at ~$0.02–0.05 per message in Kenya, ~3 seats × ~2 messages/day ≈ **$5–10/mo**. Voice only fires on silence, so PSTN stays near zero.

---

## 2. Controls — the Global Pause

**One switch, absolute.** `/control` (owner only), the `/admin` Big Red Button, or "press 1" on the Jive call.

| Pause stops | Pause keeps running |
|---|---|
| WF4 Buffer publishing (Shorts, longform, carousels) | WF1 research — scanning is free and keeps the pool fresh |
| WF5 / WF5A inbound DMs and the 14-day sequence | WF2 / WF3 rendering — assets stack up in R2 |
| WF7 voice broadcasts and remote fixes | WF6 alerts, WF9 proof, WF12 interview digest |
| WF8 / WF10 save offers, autopay, sequence rollouts | Inbound Whop webhooks (never lost) |
| WF11 sequence unlocking | — |

**Rules that make it safe:**
- Only the owner can resume. Paused workflows never auto-resume.
- Every pause and resume writes an `audit_log` row with actor, time and reason.
- Every outbound workflow calls `mayActOutbound()` **before** acting, so a pause is enforced at the workflow level, not just in the UI.
- The voice path uses a signed owner token against the same `/api/control` endpoint — the button works from a phone without opening the app.

**Implementation:** `jarvis-app/lib/control.ts` (`getControl`, `setControl`, `mayActOutbound`), `app/api/control/route.ts`, `app/control/page.tsx`, state stored in `app_config.control_state` with an in-memory fallback.

---

## 3. Retention — 30-day masters

| Asset | Kept | Why |
|---|---|---|
| Longform masters (30-min renders) | **30 days, then deleted** | Huge files, regenerable from script + character lock |
| Published assets (finals, shorts, slides) | **Forever** | These are the product and the proof |
| Transcripts + call recordings | 12 months | Enough for coaching and disputes |
| Neon index rows | Forever | Row + prompt hash survives after the object is deleted |

**Storage lane:** R2 canonical (content), Drive deliverables only, Neon indexes. The 30-day rule keeps R2 at the **$5 tier** indefinitely.

---

## 4. When you are offline

Full autonomy continues. Nothing throttles, nothing waits for you.

- Every day, all three seats receive the SMS feedback line: what shipped, what earned, what needs a decision.
- A Global Pause is still honoured, so "offline" never means "uncontrolled".
- On return, `/control`, `/team` and `/money` are the three screens that rebuild the whole picture in about a minute.

---

## 5. The 2-channel YouTube split

**One brand = two YouTube channels** (owner decision, 2026-10-31):

| Channel | Content | Cadence |
|---|---|---|
| `<Brand> Shorts` | Every short from WF3 | 6/day via Buffer |
| `<Brand>` (longform) | 30-min longforms | 3×/week, Mon/Wed/Fri |

At 5 brands that is **10 YouTube channels**, plus each brand's TikTok and IG (and X discovery).

**Why split:** Shorts channels gain subscriber velocity from volume; longform channels protect watch-time and ad RPM. Mixing both on one channel splits the algorithm signal and depresses RPM.

**Shared:** one master prompt + one reference frame per brand, so the character is identical across both channels.

**Env:** `YT_CHANNELS_PER_BRAND=2` (set `1` for the legacy single-channel mode).

---

## 6. Go-live order

**One page at a time.** Page 1 (Stickman) runs alone until it posts a GREEN week; each later page is a 3-of-3 board vote (docs/PAGE_LAW_ONE_NICHE.md).

1. Neon → run `scripts/migrate.sql`
2. n8n → import `n8n_workflows_self_3man.json` (**14 workflows**)
3. Vercel → env matrix + crons, connect domain
4. All three seats sign in → complete the 18-question interviews
5. Owner reviews `/autonomy` and `/control`
6. Start WF1 → WF2 → WF3 → WF4 for **every page at once**, with 2 YT channels per brand
7. First 72 hours: watch G4 queue, `/autonomy`, first demand test

**First-week target:** **page 1 live** (Stickman, 5 channels) · **30 clips out** · **first 3 Circle members**. The other four pages are designed and queued, not live — one page at a time (docs/PAGE_LAW_ONE_NICHE.md).

**Phase 2 (triggered by numbers, not dates):** once the Shadow Operation role converts the required number of clients, Jarvis gets the full backend — run the pipeline end-to-end, monetise the pages, and make the sales itself.

---

## 7. Parameter table (all env-overridable)

| Decision | Value | Env |
|---|---|---|
| Daily email | all 3 seats | — |
| SMS when offline | on | `AFRICASTALKING_*` / `TWILIO_*` |
| Call after no reply | 10 minutes | `CALLBACK_MINUTES=10` |
| Kill switch scope | global | `CONTROL_STATE` |
| Masters retention | 30 days | `RETENTION_MASTERS_DAYS=30` |
| Offline behaviour | full autonomy | — |
| Go-live | 1 page live, 4 queued | `PAGES_COUNT=1` |
| Channels per page | 5 (2 YouTube, no X) | `CHANNELS_PER_PAGE=5` |
| Longform publish days | Mon/Wed/Fri | `LONGFORM_PUBLISH_DAYS=1,3,5` |

---

*Closes the 5-round workflow interview. Every answer is applied in `config/adaptable.json`, `n8n/n8n_workflows_self_3man.json` and the app — not just written down.*
