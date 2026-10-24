from fastapi import APIRouter, Request
from fastapi.responses import PlainTextResponse
import os
router = APIRouter()
@router.get("/")
def verify(hub_mode: str = "", hub_challenge: str = "", hub_verify_token: str = ""):
    exp = os.getenv("META_VERIFY_TOKEN", "shadow_manychat_verify_2024")
    if hub_mode == "subscribe" and hub_verify_token == exp:
        return PlainTextResponse(hub_challenge)
    return PlainTextResponse("ok")
@router.post("/")
async def webhook(req: Request):
    return {"ok": True}
