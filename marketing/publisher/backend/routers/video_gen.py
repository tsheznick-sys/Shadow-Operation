from fastapi import APIRouter, Depends
from sqlmodel import Session
import time, os, pathlib, json, shutil
from models.database import get_session, ContentItem
router = APIRouter()

# --- Load .env (Arena reads from file, Fly from secrets) ---
try:
    from dotenv import load_dotenv
    load_dotenv()
    load_dotenv(dotenv_path=pathlib.Path(__file__).resolve().parents[1] / '.env')
except: pass
for _env in [pathlib.Path(__file__).resolve().parents[1] / '.env', pathlib.Path('marketing/publisher/backend/.env'), pathlib.Path(__file__).resolve().parents[3] / '.env']:
    if _env.exists():
        for line in _env.read_text().splitlines():
            if '=' in line and not line.strip().startswith('#'):
                try:
                    k,v = line.split('=',1)
                    k=k.strip(); v=v.strip()
                    if k and k not in os.environ:
                        os.environ[k]=v
                except: pass

RENDERS_DIR = pathlib.Path(__file__).resolve().parents[3] / "outbound" / "renders"
RENDERS_DIR_REL = pathlib.Path("outbound/renders")

def _render_placeholder(content: ContentItem, duration_sec: int = 3) -> str:
    """Enhanced 9:16 placeholder with real hook/story/offer — works in Arena (no network)"""
    try:
        from PIL import Image, ImageDraw, ImageFont
        import imageio, numpy as np
    except ImportError:
        p = RENDERS_DIR / content.page / f"{content.prompt_id}.mp4"
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text("placeholder")
        return f"outbound/renders/{content.page}/{content.prompt_id}.mp4"

    W,H = 720,1280
    out_rel = pathlib.Path(f"outbound/renders/{content.page}/{content.prompt_id}.mp4")
    out_abs = RENDERS_DIR / content.page / f"{content.prompt_id}.mp4"
    out_abs.parent.mkdir(parents=True, exist_ok=True)
    pathlib.Path(out_rel).parent.mkdir(parents=True, exist_ok=True)

    img = Image.new("RGB", (W,H), (10,10,10))
    d = ImageDraw.Draw(img)
    try:
        fb = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 34)
        fm = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        fs = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
    except:
        fb = fm = fs = ImageFont.load_default()

    d.rectangle([0,0,W,150], fill=(212,175,55))
    d.text((20,18), content.page, fill=(0,0,0), font=fm)
    d.text((20,50), content.platform.upper()+" • "+content.prompt_id, fill=(0,0,0), font=fs)
    d.text((20,85), "Arena placeholder → Fly = real Veo3 8s", fill=(0,0,0), font=fs)

    def wrap(t,w=24):
        ws=t.split(); ls=[]; cur=""
        for wrd in ws:
            if len(cur+" "+wrd) < w: cur=(cur+" "+wrd).strip()
            else: ls.append(cur); cur=wrd
        ls.append(cur); return ls

    y=320
    for line in wrap(content.hook, 22):
        bbox=d.textbbox((0,0), line, font=fb); tw=bbox[2]-bbox[0]
        d.text((W/2-tw/2, y), line, fill=(212,175,55), font=fb); y+=42
    y+=20
    for line in wrap(content.story[:130], 30):
        bbox=d.textbbox((0,0), line, font=fm); tw=bbox[2]-bbox[0]
        d.text((W/2-tw/2, y), line, fill=(240,240,240), font=fm); y+=30
    y=H-320
    for line in wrap(content.offer[:90], 30):
        bbox=d.textbbox((0,0), line, font=fs); tw=bbox[2]-bbox[0]
        d.text((W/2-tw/2, y), line, fill=(180,180,180), font=fs); y+=26
    d.rectangle([W//2-140, H-140, W//2+140, H-90], fill=(212,175,55))
    d.text((W/2-62, H-125), "DM VAULT", fill=(0,0,0), font=fb)
    d.text((10, H-22), "9:16 • Veo3 fallback — POST /generate/{id} on Fly = real", fill=(100,100,100), font=fs)

    frame=np.array(img)
    try:
        w=imageio.get_writer(str(out_abs), fps=24, macro_block_size=1)
        for _ in range(int(duration_sec*24)): w.append_data(frame)
        w.close()
        # copy to rel for DB path
        try: shutil.copy(str(out_abs), str(out_rel))
        except: pass
        return str(out_rel)
    except Exception as e:
        jpg=out_abs.with_suffix(".jpg"); img.save(jpg)
        return str(out_rel)

def _try_veo_generate(content: ContentItem) -> tuple[str, str]:
    """Real Veo 3.0 on Fly (generativelanguage.googleapis.com), fallback to enhanced placeholder in Arena"""
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("VEO_API_KEY") or ""
    if not api_key or "placeholder" in api_key:
        return _render_placeholder(content), "GOOGLE_API_KEY missing — enhanced placeholder (Arena). Set GOOGLE_API_KEY on Fly for real Veo3 8s 9:16."

    # Try google-genai SDK first (Fly has it), else REST
    prompt = f"Cinematic vertical 9:16 video, anamorphic golden hour 35mm, no text overlay, no watermark: Hook: {content.hook}. Story: {content.story}. Offer context: {content.offer}. Style: handheld, shallow depth, film grain."

    # 1) SDK path — google-genai (pip install google-genai)
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        op = client.models.generate_videos(model="veo-3.0-generate-001", prompt=prompt, config={"aspect_ratio":"9:16", "duration_seconds":8})
        # Veo is long-running: poll
        deadline = time.time()+120
        while not op.done and time.time() < deadline:
            time.sleep(5)
            op = client.operations.get(op)
        if op.done and op.response and hasattr(op.response, 'generated_videos'):
            vid = op.response.generated_videos[0]
            # Download
            out_abs = RENDERS_DIR / content.page / f"{content.prompt_id}.mp4"
            out_abs.parent.mkdir(parents=True, exist_ok=True)
            client.files.download(file=vid.video, file_path=str(out_abs))
            out_rel = pathlib.Path(f"outbound/renders/{content.page}/{content.prompt_id}.mp4")
            out_rel.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(str(out_abs), str(out_rel))
            return str(out_rel), "Veo 3.0 SDK success (Fly) — 8s 9:16 saved to "+str(out_rel)
        return _render_placeholder(content), f"Veo SDK op not done after 120s — fallback placeholder kept. Op: {op}"
    except Exception as e_sdk:
        sdk_err = str(e_sdk)[:200]

    # 2) REST fallback — generativelanguage.googleapis.com (longRunning)
    try:
        import requests
        url = f"https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-001:predictLongRunning?key={api_key}"
        payload = {"instances": [{"prompt": prompt}], "parameters": {"aspectRatio": "9:16", "durationSeconds": 8}}
        r = requests.post(url, json=payload, timeout=15)
        if r.status_code in (200,202):
            j=r.json()
            name=j.get("name") or j.get("operation", {}).get("name")
            if not name:
                return _render_placeholder(content), f"Veo REST 200 but no operation name — {j} — fallback kept (sdk_err: {sdk_err})"
            # Poll operation
            for _ in range(24):
                time.sleep(5)
                pr=requests.get(f"https://generativelanguage.googleapis.com/v1beta/{name}?key={api_key}", timeout=10)
                if pr.status_code==200:
                    pj=pr.json()
                    if pj.get("done"):
                        # Download uri in response
                        uri=(pj.get("response",{}).get("generateVideoResponse",{}).get("generatedSamples",[{}])[0].get("video",{}).get("uri") or pj.get("response",{}).get("video",{}).get("uri"))
                        if uri:
                            out_abs=RENDERS_DIR / content.page / f"{content.prompt_id}.mp4"
                            out_abs.parent.mkdir(parents=True, exist_ok=True)
                            vr=requests.get(uri, timeout=30)
                            out_abs.write_bytes(vr.content)
                            out_rel=pathlib.Path(f"outbound/renders/{content.page}/{content.prompt_id}.mp4"); out_rel.parent.mkdir(parents=True, exist_ok=True); shutil.copy(str(out_abs), str(out_rel))
                            return str(out_rel), f"Veo REST polling success — 8s 9:16 saved (Fly)"
                        return _render_placeholder(content), f"Veo REST done but no uri — {pj} — fallback kept"
            return _render_placeholder(content), f"Veo REST polling timeout — fallback kept (sdk: {sdk_err})"
        else:
            return _render_placeholder(content), f"Veo REST {r.status_code}: {r.text[:120]} — Arena allowlist blocks generativelanguage.googleapis.com, fallback kept. SDK err: {sdk_err}"
    except Exception as e:
        if "allowlist" in str(e).lower() or "blocked" in str(e).lower() or "Connection" in str(e):
            return _render_placeholder(content), f"Arena allowlist blocks Veo ({str(e)[:120]}) — enhanced placeholder kept. Works on Fly (sdk: {sdk_err})"
        return _render_placeholder(content), f"Veo REST error {str(e)[:120]} (sdk: {sdk_err}) — fallback kept"

@router.post("/generate/{content_id}")
def generate(content_id: int, session: Session = Depends(get_session)):
    c = session.get(ContentItem, content_id)
    if not c: return {"error":"not found"}
    path, note = _try_veo_generate(c)
    c.render_path = path; c.status="queued"; session.add(c); session.commit()
    return {"content": c, "render_path": path, "note": note, "preview": f"/renders/{c.page}/{c.prompt_id}.mp4", "arena_fallback": "generativelanguage.googleapis.com blocked in Arena (allowlist) — real on Fly"}

@router.post("/generate-day1")
def generate_day1(session: Session = Depends(get_session)):
    from sqlmodel import select
    items = session.exec(select(ContentItem)).all()
    res=[]
    for c in items:
        path, note = _try_veo_generate(c)
        c.render_path=path; c.status="queued"; session.add(c)
        res.append({"id":c.id, "prompt_id":c.prompt_id, "path":path, "note": note})
    session.commit()
    return {"generated": len(items), "renders":[r["path"] for r in res], "details": res, "note":"Arena = enhanced placeholder 9:16 with real hook/story; Fly = real Veo3 8s. Use GET /status to see key."}

@router.get("/status")
def status():
    key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or ""
    has = bool(key and "placeholder" not in key)
    return {"veo_configured": has, "key_prefix": key[:12]+"..." if has else "missing (set GOOGLE_API_KEY AQ.Ab8... in .env.prod / fly secrets)", "arena_allowlist":"github.com, codeload, api.github.com, registry.npmjs.org, pypi.org, files.pythonhosted.org — Veo blocked in Arena, works on Fly/prod", "fallback":"Enhanced 9:16 Pillow→imageio mp4 with real hook/story", "real_on_fly":"pip install google-genai + fly secrets set GOOGLE_API_KEY=AQ.Ab8... + POST /api/video/generate-day1 on https://api.shadowop.live", "renders_dir": str(RENDERS_DIR), "preview_mounts": ["/renders/...", "/outbound/renders/..."]}

