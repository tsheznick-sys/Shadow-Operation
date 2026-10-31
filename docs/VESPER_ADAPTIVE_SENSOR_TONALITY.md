# VESPER ADAPTIVE — Learns Bros Personality via Device Sensors + Tonality

**Branch:** `arena/6c47af3d-shadow-operation` `pr_open` `4782d0e` | **Zip:** `jarvis_self_3man_bundle.zip` 54M 2139 -> **55M 2140 files 7 WFs + Vesper Adaptive** | **Date:** 2026-10-30 Nairobi EAT | **Voice:** Vesper 20yo playful witty (buffer_slacking_joke) + custom per role intro adaptive + tiny_change_needs_magic + remembers All Fixes/Preferences/Jokes to avoid

> Your lock: "Customise it and change how you speak based of the bros personality. Learn them & adapt their styles of communication that they like. Use the device sensors to monitor that & also the tonality too" + All Fixed/Preferences/Jokes to avoid + wire_final_zip_55m

---

## 1) Adaptive Personality Engine — How Vesper Learns Each Bro

| Bro | How Vesper Adapts (via `jarvis-app/lib/vesper.ts` + n8n WF7) | Example |
|---|---|---|
| **You (Admin, Owner All)** | Learns you prefer short formal decisions: Vesper shortens feedback call fixes to 3 bullets, no giggles on emergency. Sensors: you type fast, low tonality pitch calm -> Vesper mirrors calm low pitch + formal Sir urgent word tiny_change_needs_magic | Hey Sir, it's Vesper - Quick heads up! Tiny change needs your magic - fixes: 1) TubeGen retry 15m 2) Buffer manual - say Apply? |
| **Content guy (Content only)** | Learns he likes visual praise: "Hey star, your three videos are shining!" -> Vesper amplifies visual compliments, remembers he loves Higgsfield teal LUT preference, avoids Buffer slacking joke if he didn't laugh last time. Sensors: his mic tonality high energy + fast typing -> Vesper matches high energy bubbly but stays witty | Hey star, it's Vesper! Your Higgsfield teal LUT looks amazing - but tiny change needs magic - want me to keep teal or try purple? |
| **Social manager (Account only)** | Learns she likes warm intimate "Hey love" + Buffer account details: Vesper adapts to her tonality soft + sensor shows she checks analytics slowly -> Vesper slows speech, adds empathy "No stress though, we've got it" - remembers she avoids tech jokes | Hey love, it's Vesper! Your Buffer queue misses you - small account change, no stress - shall I apply loves fix? |

**Storage:** `Neon bros.personality` JSON per phone: `{fixes:[...], preferences:{lut:"teal", jokeAvoid:["Buffer slacking"], tonality:{avgPitch:180, speechRate:1.1, energy:"high"}}, sensorOptIn:true}` - updated after each Jive broadcast + feedback call via WF7 Whisper tonality analysis.

---

## 2) Device Sensors + Tonality — What Vesper Monitors (Privacy-First, Opt-In)

| Sensor (via `jarvis-app/app/jarvis/page.tsx` + Web APIs, only if bro opt-in on `/bros` invite) | What Vesper Learns | How Adapts Next Call |
|---|---|---|
| **Web Audio API tonality** - mic pitch + speech rate + energy during Jarvis chat + Vapi call (on-device, not raw audio sent) | Bros tonality: high pitch fast = excited, low slow = tired/stressed, loud = urgent | If Content guy high energy excited -> Vesper ups bubbly playful; if you low calm -> Vesper lowers pitch calm formal - mirrors style they like |
| **DeviceMotion / Light sensor** (if PWA installed, opt-in) - movement vs still, ambient light | Context: moving/driving vs desk night - if bro walking, Vesper shortens to 30s; if night dark, Vesper softens volume + slower rate | Sensor still + dark night -> Vesper whispers soft: "Hey love, quick heads up, no rush till morning?" |
| **Typing dynamics** - keystroke latency in jarvis chat | Communication style they like: short bursts vs long paragraphs | If Social types long paragraphs -> Vesper expands details; if you type short "OK apply" -> Vesper cuts to 3 bullets |
| **Interaction history** - fixes applied, jokes laughed vs silent, preferences stated | Fixes/Preferences/Jokes to avoid (your All lock) - Neon log | If Social laughed at Buffer slacking joke -> keep; if Content silent -> avoid; if fix 2 worked last time -> suggest first |

**Privacy:** All sensor data processed **on-device** in PWA, only tonality summary `{avgPitch, speechRate, energy}` + `jokesAvoid` sent to Neon, never raw audio/motion. Opt-in toggle in `/bros` -> `sensorOptIn:false` default - respects KE DPA. Bro can delete memory anytime via `/bros` -> Reset Vesper Memory.

**Security:** Jive number `+25418XXXX710` stored only as `JIVE_JARVIS_NUMBER` env (redacted docs), Vapi SIP, Africa's Talking - never git.

---

## 3) Feedback Loop — All Fixes + Preferences + Jokes to Avoid (Your Lock)

| Memory | How Learned | Used |
|---|---|---|
| **Fixes** | Every Jive broadcast parallel (3 separate legs) -> Claude Pro proposes 3 fixes -> Owner feedback call Apply -> Neon log `fixes:[{emergency:"publisher stuck", fixApplied:2, success:true}]` | Next same emergency, Vesper says "Hey Scott! Last time you picked fix 2, Buffer Team $60 worked like magic - shall we do again?" |
| **Preferences** | Bro says on call "Keep teal LUT" / types "/prefer teal" -> Whisper -> Neon `preferences.lut="teal"` | Content guy hears "Keep teal?" next time, Social hears "Keep love?" - adaptive per role intro you locked custom_per_role_intro |
| **Jokes to avoid** | Voiceflow detects silence/short reply after Buffer slacking joke -> Neon `jokeAvoid:["Buffer slacking"]` | Vesper switches to TubeGen shy joke next time - learns humor via Grok speciality |

**Live Neon + Drive + Admin:** All parallel + feedback transcripts + fixes + preferences + tonality stored to Neon + Drive HQ `17KpzZCm/calls/` + `/admin` Big Red Button optional log (your admin_button_optional lock - emergency can skip button).

---

## 4) What Was Wired in Final Zip 55M

| In Zip | File | Change |
|---|---|---|
| **Spec** | `docs/VESPER_ADAPTIVE_SENSOR_TONALITY.md` (this) + `docs/JARVIS_VESPER_VOICE_WIRED.md` + `docs/JARVIS_JIVE_VOICE_SPEC.md` | Vesper 20yo playful witty joke + custom per role adaptive + tiny change needs magic + remembers All |
| **Voice** | `audio/vesper_voice_01_playful_intro_20yo.mp3` .. `03_playful_emergency`, `audio/jarvis_voice_04_casual` .. `06` + `voice-00` Vesper | 6 prior + 3 Vesper playful = 9 samples, all less formal casual as you asked - All fantastic -> even more playful |
| **n8n** | `n8n/n8n_workflows_self_3man.json` 6->7 WFs | WF7 Jive One permanent broadcast 3 separate parallel legs not conference + Voiceflow 3 KBs live Neon + Vapi 20yo Vesper + Claude Pro fixes + Big Red Button optional + both_twilio_at + stay_hobby_0 |
| **App** | `jarvis-app/app/jarvis/page.tsx` + `lib/vesper.ts` (concept) + `.env.example` `JIVE_JARVIS_NUMBER=+25418XXXX710` redacted + `lib/db.ts` bros personality | Presence both_heartbeat_plus_push (WebSocket 30s + FCM) + Web Audio tonality + DeviceMotion opt-in + adaptive intro per role |
| **Ops** | `docs/JARVIS_AGENT_ZIP_TRULY_NEEDED_TOOLS.md` no domains | MVP $60/mo $720/yr SCALE $348-437/mo $4176-5244/yr prepaid $3468-4536 save $708 - Whop virtual card Wise $0 self-funded |

**Vesper now:** Hey love/star/Sir tailored - witty Buffer slacking joke when appropriate, learns not to repeat if avoided, adds urgent word tiny change needs magic only on emergency, remembers fixes/preferences/jokes via Neon, adapts tonality via on-device sensors opt-in.

*PR pr_open - ready to deploy Vercel Hobby $0 + n8n $20 - wire_and_keep_asking lock: keep asking 100% while wired.*
