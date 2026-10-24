# Fly Prod = Real Veo3 8s (Arena → Fly — you chose "both")

You chose: Arena first → Fly prod, real Veo 8s 9:16, keep 5 funnels + 5 flows.

## Why Arena = placeholder
Arena allowlist: `github.com, codeload, api.github.com, registry.npmjs.org, pypi.org, files.pythonhosted.org` — **blocks** `generativelanguage.googleapis.com` (Veo) + `api.openai.com` + `api.chatfuel.com`. Code handles it:
- `GET /api/video/status` → `veo_configured: true` `AQ.Ab8...` but `arena_allowlist: blocked`
- `POST /api/video/generate-day1` → enhanced 9:16 Pillow→imageio mp4 with real hook/story (20KB, served at `/renders/`). Not real Veo.

**Fix = Fly (no allowlist).**

## Infra already here (from LIVE_MARKET_GAPS)
- `infra/fly.toml` — app `shadow-operation` `primary_region nbo` (Nairobi), `http_service 8000`, `DATABASE_URL postgresql://shadow:shadow@db.internal:5432/shadow_ops`
- `infra/docker-compose.prod.yml` — 1 Postgres `shadow_ops` + 4 backends (8000 ManyChat, 8001 Funnel, 8002 Auth, 8003 Publisher) + nginx + `docs/privacy.html` at `shadowop.live/privacy`
- `infra/nginx.conf` — mounts `privacy.html/terms.html`
- `.github/workflows/deploy.yml` — auto `flyctl deploy --config infra/fly.toml` on push to `arena/cb80955f-shadow-operation`

## Deploy steps (real Veo)
1. **Install fly**: `curl -L https://fly.io/install.sh | sh` + `fly auth login`
2. **Create app** (once): `fly launch --config infra/fly.toml --no-deploy --region nbo`
3. **Postgres** (once): `fly postgres create --name shadow-pg --region nbo --vm-size shared-cpu-1x --volume-size 10` → `fly postgres attach --app shadow-operation shadow-pg` (sets `DATABASE_URL` auto)
4. **Secrets** (your Google Doc 1PY keys):
```bash
fly secrets set --app shadow-operation \
  META_ACCESS_TOKEN=EAAd5puObp4EBSZBZCEPFkQrFCAz0IemhfrEex2hfuNvIASHZBWYZAQwlijFDjGmBrRzPrYRwGLhl7nOZC3MGnLdYLUmQ48O6iZAZAmFlfbejESR3cJA09XWVqbDBMz7kcE9m3Tfm6ZCrxwznngRDpkhPa9fQphZBhfEHGFZAwu1SRBHuin2FAI5waa76uPQ0rx1du8n1aOAZDZD \
  META_VERIFY_TOKEN=shadow_manychat_verify_2024 \
  WHOP_API_KEY=apik_kVrTnO9ZhQ70B_C7478685_C_451e6a89e60130d279cebe2b9c86b39568db62746efd42a97b6bc1da1af2d2 \
  GOOGLE_API_KEY=AQ.Ab8***MASKED***... \
  GEMINI_API_KEY=AQ.Ab8***MASKED***... \
  OPENAI_API_KEY=sk-proj-***MASKED***... \
  CHATFUEL_TOKEN=8d2124***MASKED*** \
  SECRET_KEY=442cf248391bbc260cad17065f14a9e2 \
  DATABASE_URL=postgresql://shadow:shadow@shadow-pg.internal:5432/shadow_ops
```
5. **Add google-genai**: `pip install google-genai` already in `marketing/publisher/backend/requirements.txt` (add if missing: `echo google-genai >> marketing/publisher/backend/requirements.txt`)
6. **Deploy**: `fly deploy --config infra/fly.toml --remote-only`
7. **Verify live**:
```bash
curl https://api.shadowop.live/health
curl https://api.shadowop.live/api/video/status | jq # veo_configured true, no allowlist block
curl -X POST https://api.shadowop.live/api/video/generate-day1 | jq # real 8s 9:16 polls ~60-120s, saves to outbound/renders
curl https://api.shadowop.live/renders/@shadow.cinema.ai/p01_20h_to_20m.mp4 -I # 200 video/mp4 (real Veo)
```

## What changes on Fly
- `marketing/publisher/backend/routers/video_gen.py` → `_try_veo_generate()` uses `google.genai.Client(api_key=GOOGLE_API_KEY).models.generate_videos(model="veo-3.0-generate-001", prompt=hook+story, config={"aspect_ratio":"9:16","duration_seconds":8})` → poll `client.operations.get` until `done` → `client.files.download` → `outbound/renders/...mp4`
- Fallback REST `predictLongRunning` + poll `/v1beta/{operation}` if SDK missing
- Arena keeps enhanced placeholder; Fly does real.

## Funnels/Flows (you chose keep_all)
- Keep 5 funnels (old Niche #2 Tripwire + Webinar + Challenge + VSL + new Vault Tripwire 4 pages). Pages at `vault-tripwire/squeeze|checkout|oto|thankyou` `published true` with Whop `?ref` + bump $9 + countdown.
- Keep 5 flows (VAULT + PROMPT + Welcome + Default AI + Post-Purchase). Deduped (deleted 5-8).

## Next after deploy
- Set Meta webhook to `https://api.shadowop.live/webhooks/instagram` + `.../messenger` (App Live requires `https://shadowop.live/privacy`)
- Run `POST https://api.shadowop.live/api/funnels/seed-tripwire` once + `POST https://api.shadowop.live/api/video/generate-day1` on Fly for real renders.

