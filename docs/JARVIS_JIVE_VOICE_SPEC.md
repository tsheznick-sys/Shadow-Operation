# JARVIS JIVE VOICE — One Permanent Number Broadcast + Feedback Call via Voiceflow + Vapi

**Branch:** `arena/6c47af3d-shadow-operation` `pr_open` `7ae9117` -> `fbb2ae9` -> now building | **Date:** 2026-10-30 Nairobi EAT | **Zip:** `jarvis_self_3man_bundle.zip` 54M -> 55M (n8n 6->7 WFs) | **Team:** you (Admin) + Content guy + Social manager = internal 3 only (strict) | **Presence:** both_heartbeat_plus_push (WebSocket 30s + FCM deliver/read) | **Vercel:** stay_hobby_0 $0 (n8n handles cron)

> Locked over 30 Qs via question tab with typing box (your 100% ask rule). Goal: Jive Jarvis One permanent number to call 3 Bros, converses with 3 in parallel mode via broadcast, then gives feedback call on fixes. Voice = 20yo Young Girl Female soft friendly (young_soft_friendly) via ElevenLabs + Vapi. KB = Owner All things, Social account only, Content content only (owner_all_social_account_content_content) with soft_role_emergency_share. Emergency only: change + emergency arised + query on what to do, ring_until_answered only then, Owner may trigger manually via Hey Jarvis / /parallel / Big Red Button. n8n hybrid: WF6 timer + WF7 voice share Neon memory.

---

## 1) ONE JIVE PERMANENT NUMBER — How broadcast works (your lock)

**Selected:** `one_number_broadcast` + `one_number_3_calls_parallel_broadcast` + `both_twilio_at`

```
Jarvis message in /jarvis chat (any bro) -> Postgres messages
   -> n8n WF6 detects presence both_heartbeat_plus_push
   -> IF no reply after 5 min AND (change+emergency+query OR owner manual trigger)
   -> n8n WF7 triggers Jive permanent number (ONE number via SIP to Vapi)
   -> Vapi dials 3 numbers IN PARALLEL but as 3 SEPARATE legs (broadcast, not conference):
      Leg 1: +254 Admin (you) -> Voiceflow flow #1
      Leg 2: +254 Content guy -> Voiceflow flow #2 (content KB only)
      Leg 3: +254 Social manager -> Voiceflow flow #3 (account KB only)
   -> Each hears same 20yo soft friendly female voice individually for ~60s to propose fix idea
   -> Transcript saved to Neon + Drive HQ 17KpzZCm/calls/
   -> WF7 ends legs
```

**Why broadcast not conference:** You chose broadcast 3 separate calls at same time - less chaos than 3-way conference, each bro speaks clean to Jarvis without overlapping. Merge later only if needed.

**Provider routing:** `both_twilio_at` + `ke_plus_intl`
- +254 KE -> Africa's Talking Voice $0.06/min primary (cheap Nairobi) -> if busy/no-answer 20s -> fallback Twilio $0.22/min
- +1 US / +44 EU -> Twilio primary (if bros travel)
- Vapi SIP handles routing, one permanent Jive number visible to all (they save as Jive Jarvis)

---

## 2) VOICE — 20yo Young Girl Female soft friendly via ElevenLabs + Vapi

**Lock:** `young_20_female_elevenlabs` -> `young_soft_friendly` -> `elevenlabs_plus_vapi_voice`

| Setting | Value |
|---|---|
| Age/Gender | 20yo Girl Female |
| Tone | **Young soft friendly** - warm, empathetic Nairobi assistant: "Hello Sir, I have a quick query about Shadow operation..." -> switches to formal only if emergency ring_until_answered loop |
| Engine | ElevenLabs voice_id (20yo soft friendly) via Vapi (Vapi supports ElevenLabs directly) -> so Butler 08:45 briefing male voice stays for /jarvis chat, female only for Jive calls (keep_male_butler_backup not needed, separate contexts) |
| Provider | Vapi phone number + Web SDK: online 5-min uses Vapi Web SDK WebRTC free in jarvis-app (no PSTN charge), offline escalates to same Vapi PSTN leg with same voice_id |
| Backup | If you later want male or different accent, swap ElevenLabs voice_id in Vapi dashboard without touching n8n |

**Business agent:** Voiceflow Creator designs intents, Vapi voices them - both_voiceflow_plus_vapi you locked.

---

## 3) ROLE KB — Owner All, Social account, Content content

**Lock:** `owner_all_social_account_content_content` + `soft_role_emergency_share`

| Caller phone | Voiceflow KB filtered view | What agent knows on call |
|---|---|---|
| **Owner (you, +254 Admin)** | **All things** - full pipeline 2026: Hard Rules 1-11, buyer_pool_x3, 1%+25 STRICT, Whop $27+$9+$79+$19 ladder, 1,462 GREEN, TubeGen 30m->OpusClip virality->Higgsfield LUT->Buffer Team $60 5ch, all 20 truly needed tools, payments totals MVP $60 SCALE $348-437 via Whop virtual card Wise $0 | Can ask anything, can authorize cross-role share on emergency |
| **Social manager** | **Account only** - Buffer Team queue + Publisher queue38 + Chatfuel+ManyChat 8ch + Social Blade ER + buyer_pool_x3 account-facing + analytics one-frontend only - cannot ask TubeGen scripts or Whop finance unless emergency shared | Emergency: if Owner says on feedback call share Content queue38, agent briefly shares |
| **Content guy** | **Content only** - TubeGen 30m script, OpusClip 5-8 shorts virality, Higgsfield fine-tune LUT per clip, queue38 pending_G4, captions/hashtags SEO, publisher queue70 - cannot ask Whop sales unless emergency | Same emergency override via Owner |

**Enforcement:** Voiceflow checks caller ID -> loads KB slice from Neon `bros` table (Google OAuth + phone). Soft share: emergency broadcast -> Owner can say "share Content status to Social" -> agent bridges knowledge for that call only.

---

## 4) FEEDBACK CALL ON FIXES — After parallel broadcast

**Lock:** `jarvis_auto_feedback_call` + `both_claude_plus_voiceflow` + `All up there, Claude Pro first`

```
Parallel broadcast ends (3 legs collect fixes ideas via voice -> Whisper transcribe -> Neon)
   -> n8n WF7 sends full transcript + live Neon queue38 + Buffer queue + whop_sales to Claude Pro (main brain you own in n8n)
   -> Claude Pro generates 3 fixes: e.g., "1) TubeGen retry 15m short, 2) Buffer manual post via Publisher, 3) Whop hold, refund $9 addon"
   -> Voiceflow receives 3 fixes via n8n webhook
   -> Vapi calls Owner ONLY via Jive permanent number (one leg feedback call) with 20yo soft friendly female -> reads: "Sir, parallel discussion was... fixes: 1)... 2)... 3)... Shall I apply?"
   -> Owner says "Apply 1 and 3" (voice) -> Whisper -> n8n WF7 executes -> logs to Neon + /admin dashboard
```

**Why Claude Pro first:** Claude generates fixes, Voiceflow speaks them. You said "All up there, Claude Pro first" - Claude is brain, Voiceflow is designer, Vapi is voice.

**Memory:** `wf6_wf7_share_jarvis_memory` + `All the above` you locked: WF6 timer logs to Neon, WF7 parallel transcript to Neon + Drive HQ 17KpzZCm/calls/ recording + Linear SHA + daily 05:45 brief + /admin big red button log.

---

## 5) EMERGENCY ONLY RING_UNTIL_ANSWERED + OWNER MANUAL TRIGGER

**Lock:** `Only call during time change & emergency has arised + query on what should be done` + `owner_may_trigger_manually` + `both_hey_jarvis_plus_slash` + `ring_until_answered` but limited to emergency

| Trigger | When Jive broadcast fires |
|---|---|
| **Auto emergency** | Change detected (publisher_queue38 stuck 24h via WF6 leak_finder, Buffer Team fail 2x, TubeGen quota exceeded, OpusClip virality <5, Higgsfield fail, Twilio 550 hard fail, Whop chargeback, n8n WF down) + query needs human decision -> ring_until_answered loop |
| **Ring loop limit** | **Smart escalation you locked:** 1st Vapi WebRTC 30s (online), 2nd Twilio 30s, 3rd Africa's Talking 30s, then voicemail + pause 10m -> repeat up to 3 loops max, only for urgent Admin decisions like PASS/FAIL Sun 09:00, not every queue38 -> you said "Only call during time change & emergency" |
| **Manual Owner** | You type/say at any time in `jarvis-app/jarvis` + Telegram + Signal: `Hey Jarvis call the bros parallel now` OR `/parallel Content queue38 stuck` OR click Big Red Button in `/admin` -> immediate Jive broadcast + feedback call, even without emergency - your lock both_hey_jarvis_plus_slash |

**Consent:** Each bro opt-in on `/bros` invite: "I agree to urgent 5-min calls via Jive number" logged to Neon `bros.consent_call=true` for KE DPA/GDPR.

---

## 6) N8N WIRING — Hybrid WF6 timer + WF7 voice (your lock)

**Lock:** `hybrid_wf6_wf7` -> `wf6_wf7_share_jarvis_memory` -> `wf6_timer_wf7_voice_split` -> `Attach it in the n8n workflow`

| Workflow | Nodes in Agent Zip (n8n 6->7 WFs) | Role |
|---|---|---|
| **WF6 Brand Extended (timer)** | Postgres presence both_heartbeat_plus_push -> IF online 5-min Wait (QStash) -> IF emergency/owner manual -> Webhook to WF7 + Postgres log Neon | Detects online/offline, 5-min timer, emergency query detection - stays as existing WF6, no new workflow count overhead |
| **WF7 Dedicated Call (voice)** | Webhook from WF6 -> Vapi SIP Jive permanent number -> Parallel broadcast 3 legs via Voiceflow Creator API (3 flows role-filtered) -> Whisper -> Claude Pro fixes -> Vapi feedback call to Owner -> Drive HQ save + Telegram/Signal + /admin log | Executes Jive broadcast + feedback fixes - new 7th workflow, makes Agent Zip 55M 2140 files |

**Why hybrid:** WF6 stays timer brain (stay_hobby_0 $0 Vercel still free - n8n does cron), WF7 stays voice brain (Voiceflow design + Vapi PSTN + Africa's Talking/Twilio routing). Share Neon memory as you locked.

**Cost in this Zip:** Vapi $0 free tier 10k mins WebRTC + PSTN mins only on emergency, Africa's Talking $0.06/min KE + Twilio $0.22/min fallback -> ~$1-5/mo mostly online WebRTC free, stays within Whop self-funded MVP $60 -> SCALE $348-437 loop.

---

*All 36 Qs locked via question tab typing box per your 100% rule. Next: wire Vapi SIP Jive permanent number + Voiceflow KB + ElevenLabs 20yo soft friendly female + WF6/WF7 to jarvis_self_3man_bundle.zip 55M. PR pr_open - not merged.*
