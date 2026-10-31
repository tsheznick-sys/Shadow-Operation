# TEAM AUTH + THE INTERVIEW — 3 seats, one brain

**Built:** 2026-10-31 · branch `arena/6c47af3d-shadow-operation` · verified with `tsc --noEmit` + `next build` (0 errors)

Owner asked for: *a custom dashboard for what each person must give Jarvis so every one of them is deeply interviewed, plus auth for each of them, and an onboarding system that runs the interview per individual.*

That is three surfaces, one shared session:

| Surface | Route | What it does |
|---|---|---|
| **Sign in** | `/login` | Email + password → signed `shadow_session` cookie (7 days) |
| **The interview** | `/onboarding` | Role-specific deep interview, autosaves every answer |
| **Team dashboard** | `/team` | 3 seats, completeness, what Jarvis learned, access denial notices |

---

## 1. Auth design (no new dependency)

- **HMAC-SHA256 signed cookie**, `shadow_session`, `httpOnly`, `sameSite=lax`, `secure` in production.
- Node side signs with `lib/auth.ts` (`crypto.createHmac`); **edge middleware verifies with WebCrypto** — same token, two runtimes.
- Passwords never leave env. Comparison is `timingSafeEqual`, and a wrong email and a wrong password return the identical error (no user enumeration).
- `AUTH_REQUIRED=false` disables the gate entirely (local dev only).

**Seats and env:**

| Seat | Default email | Default password (rotate before live) | Env keys |
|---|---|---|---|
| Owner · Admin | `scott.abuya@gmail.com` | `shadow-owner-2026` | `TEAM_OWNER_EMAIL` `TEAM_OWNER_PASSWORD` `TEAM_OWNER_NAME` |
| Content Guy · G4 | `content@shadow.local` | `shadow-content-2026` | `TEAM_CONTENT_*` |
| Social Manager · Buffer + DM | `info.wolf@gmail.com` | `shadow-social-2026` | `TEAM_SOCIAL_*` |

Set `AUTH_SECRET` to a long random string in Vercel. `SHOW_DEMO_LOGINS=true` shows the seats on `/login` — production should leave it unset.

---

## 2. Permission matrix

| Route | Owner | Content | Social |
|---|---|---|---|
| `/content` (G4) | ✅ | ✅ | — |
| `/social` (Buffer, read-only since G5 removed) | ✅ | — | ✅ |
| `/retention` (money + save offers) | ✅ | — | ✅ |
| `/admin` | ✅ | — | — |
| `/team`, `/onboarding`, `/money` | ✅ | ✅ | ✅ |
| `/money` — grant payments authority | ✅ only | — | — |
| `/pods`, `/drafts`, `/jarvis`, `/n8n` | ✅ | ✅ | ✅ |

A blocked route redirects to `/team?denied=/path` and states plainly which lane is closed.

---

## 3. The interview — what Jarvis actually needs

Every question carries a `why` field, and the UI shows it before you answer. Nothing is asked for its own sake.

**Common to all three seats (3):** working hours + fastest channel · how you want decisions presented + instant-no triggers · the hard-stop list Jarvis must never cross unasked.

**Owner (9 more):** monthly net floor + deadline · revenue-mix priority · risk ceiling · voice spec (spoken vs written) · escalation point for a *call* not a text · what the team may approve without you · community funding split + when Jarvis may move money · 12-month definition of worked · blunt failure history.

**Content (9 more):** the G4 pass/fail rubric · hooks kept vs binned · stickman invariants vs variables · 30-minute script shape · niche ranking · caption/hashtag rules · reject path · review window · slide-style brief for Higgsfield.

**Social (9 more):** a real first DM in your words · buyer vs tire-kicker in three messages · objection library · per-platform differences · DM hours + reply SLA · conversations that must reach you · banned claims · what counts as a WWS win · plan until the 1K follower gate opens.

**Completion matters:** a question counts as answered only past its `minLength` — one-word answers do not clear a seat. The dashboard shows `%` per seat so you can see who is actually briefed.

**Where answers land:** Neon `team_profiles` (`email`, `role`, `answers jsonb`, `completeness`, `updated_at`). Without `DATABASE_URL` the app still runs — answers save to memory for the session and the UI says so. Run `jarvis-app/scripts/migrate.sql` to persist.

**How Jarvis consumes it:** WF12 (below) reads `team_profiles`, and every prompt that writes a DM, a caption, a slide or a proposal injects the relevant slice — Content's rubric into WF3/WF4, Social's voice into WF5/WF5A, Owner's floors into WF8/WF10.

---

## 4. WF12 — weekly interview digest

```
Mon 07:30 EAT
  read team_profiles (3 rows) + audit_log (7d)
  Claude: per seat — what changed, what is still missing, 3 questions to close the gap
  Telegram + /team card: "Content 78% — missing script_shape, slides_taste"
  if any seat < 60% -> flag to Owner: "Social cannot run DMs unsupervised yet"
```

The gate is deliberate: a seat below 60% does not get unsupervised authority over its lane.

---

## 5. Files

| File | Purpose |
|---|---|
| `jarvis-app/lib/auth.ts` | signing, verification, seats, permission matrix |
| `jarvis-app/middleware.ts` | edge gate + role routing |
| `jarvis-app/lib/interview.ts` | every question + why + min length |
| `jarvis-app/app/login/*` | sign-in surface |
| `jarvis-app/app/onboarding/*` | the wizard |
| `jarvis-app/app/api/onboarding/route.ts` | save + completeness (Neon → memory fallback) |
| `jarvis-app/app/team/page.tsx` | dashboard |
| `jarvis-app/scripts/migrate.sql` | `team_profiles`, `audit_log`, `sequence_assets`, `follower_gate`, `funding_ledger` |

---

## 6. Go-live checklist

1. `AUTH_SECRET` set (32+ chars).
2. Rotate the three default passwords in Vercel env.
3. `SHOW_DEMO_LOGINS` unset in production.
4. `scripts/migrate.sql` run against Neon.
5. Each seat signs in and completes its interview → `/team` shows 100%.
6. Owner reviews `/money` and decides on payments authority.
