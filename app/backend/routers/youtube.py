from fastapi import APIRouter, Request
from fastapi.responses import PlainTextResponse
import os
router = APIRouter()
async def _verify_youtube(request: Request):
    exp = os.getenv("META_VERIFY_TOKEN", "shadow_manychat_verify_2024")
    # YouTube sends hub.mode / hub.challenge / hub.verify_token with dots; FastAPI maps with underscores — support both
    qp = request.query_params
    hub_mode = qp.get("hub.mode") or qp.get("hub_mode") or ""
    hub_challenge = qp.get("hub.challenge") or qp.get("hub_challenge") or ""
    hub_verify_token = qp.get("hub.verify_token") or qp.get("hub_verify_token") or ""
    if hub_mode == "subscribe" and hub_verify_token == exp:
        return PlainTextResponse(hub_challenge)
    # also support direct challenge echo for generic verify
    if hub_challenge:
        return PlainTextResponse(hub_challenge)
    return PlainTextResponse("ok")
@router.get("/")
async def verify_slash(request: Request):
    return await _verify_youtube(request)
@router.get("")
async def verify(request: Request):
    return await _verify_youtube(request)
@router.post("/")
async def webhook_slash(req: Request):
    body = await req.body()
    print(f"[youtube webhook] {len(body)} bytes")
    return {"ok": True, "channel": "UCkI9sxNJeOtLtmHdDNHtjMg", "brand": "@shadow.cinema.ai"}
@router.post("")
async def webhook(req: Request):
    body = await req.body()
    print(f"[youtube webhook] {len(body)} bytes")
    return {"ok": True, "channel": "UCkI9sxNJeOtLtmHdDNHtjMg", "brand": "@shadow.cinema.ai"}
