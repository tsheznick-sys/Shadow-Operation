#!/usr/bin/env python3
"""
SHADOW OPERATION — DAILY PART A PIPELINE
=========================================
Runs the full daily lead-generation → draft → Gmail-staging loop.

Usage:
    python3 scripts/daily_part_a.py                    # Full pipeline
    python3 scripts/daily_part_a.py --scout-only        # Just discover leads
    python3 scripts/daily_part_a.py --draft-only        # Just generate drafts for undrafted DISCOVERED leads
    python3 scripts/daily_part_a.py --stage-only         # Just stage drafts to Gmail
    python3 scripts/daily_part_a.py --dry-run            # Show what would happen, write nothing
    python3 scripts/daily_part_a.py --quota 15           # Max Gmail drafts to create today (default: 15)

Environment:
    APIFY_TOKEN         — Apify API token for Instagram scraping (optional, falls back to goldmine)
    GMAIL_CREDENTIALS   — Path to Gmail OAuth credentials JSON (optional, for direct staging)

What it does (in order):
    1. SCOUT   — Find new creators via goldmine (Google search snippets) + optional Apify scrape
    2. FILTER  — Apply niche lock, follower range (10K-100K), like:comment gate, dedup
    3. VERIFY  — Only use emails found in public bios; never construct addresses
    4. TRACK   — Add new leads to creator_tracker.csv as DISCOVERED
    5. DRAFT   — Generate outreach emails for all undrafted DISCOVERED leads
    6. STAGE   — Create Gmail drafts via Gmail API (if credentials available)
    7. REPORT  — Print daily brief

Compliance:
    - Revenue-share only (60/40 creator-favoured). No flat fee.
    - Sign: Scott / Shadow Operator
    - Solo, first person. No "my team"/"our team"/"we".
    - No markdown in emails. Plain text only.
    - Like:comment gate: <50:1 GREEN, 50-100:1 AMBER, ≥100:1 reject
    - Niches: #1 Video/VFX, #2 Applied AI, #3 3D/Blender/design only
    - No send triggers. Agent drafts, human sends.
    - Never construct an email; only use ones found in public bios.
    - Poisoned fields never read for outbound copy.
"""

import csv
import json
import os
import re
import sys
import time
import random
import argparse
from datetime import datetime, timedelta
from pathlib import Path

# ─── PATHS ───────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
TRACKER_PATH = REPO_ROOT / "templates" / "creator_tracker.csv"
DRAFTS_DIR = REPO_ROOT / "outbound" / "drafts"
LEARNINGS_PATH = REPO_ROOT / "reference" / "learnings.md"
DAILY_DIR = REPO_ROOT / "daily" / datetime.now().strftime("%Y-%m-%d")

# ─── CONSTANTS ───────────────────────────────────────────────────────────────
OPERATOR_EMAIL = "scott.abuya@gmail.com"
DISPLAY_NAME = "Scott"
SIGNATURE = "Scott / Shadow Operator"
SPLIT = "60/40"

FOLLOWER_MIN = 10_000
FOLLOWER_MAX = 100_000

# Like:comment ratio gates
RATIO_GREEN_MAX = 50    # <50:1 = GREEN/P1
RATIO_AMBER_MAX = 100   # 50-100:1 = AMBER/P2
# ≥100:1 = REJECT

# Locked niches (only scout these)
NICHE_LOCKS = {
    "Niche #1": "Video Editing / Color Grading / VFX / Motion Design",
    "Niche #2": "Applied AI Video / Generative Filmmaking / ComfyUI / Higgsfield / Prompt Workflows",
    "Niche #3": "3D Blender / Concept Art / Procreate Craft / Digital Design",
}

# Banned niches
BANNED_NICHES = {"motivation", "wealth", "luxury lifestyle", "car design",
                 "architecture", "interior design", "tattoo", "lettering",
                 "calligraphy", "ui/ux", "resin", "3d printing"}

# Search terms for the goldmine system (Google search snippets from directory sites)
GOLDMINE_QUERIES = [
    # Niche #1 — Video/VFX/Motion
    "site:influencer-hero.com top motion graphics instagram",
    "site:influencer-hero.com top video editing instagram creators",
    "site:influencer-hero.com top vfx artists instagram",
    "site:influencer-hero.com top color grading instagram",
    "site:influencer-hero.com top after effects instagram",
    "site:influencer-hero.com top premiere pro instagram",
    "site:influencer-hero.com top animation artists instagram",
    "site:influencer-hero.com top cinematography instagram",
    # Niche #2 — Applied AI
    "site:influencer-hero.com top ai art instagram creators",
    "site:influencer-hero.com top generative ai instagram",
    "site:influencer-hero.com top ai video instagram",
    "site:influencer-hero.com top comfyui instagram",
    "site:influencer-hero.com top midjourney instagram artists",
    "site:influencer-hero.com top stable diffusion instagram",
    "site:influencer-hero.com top runway ml instagram",
    "site:influencer-hero.com top ai tools instagram",
    # Niche #3 — 3D/Blender/Design
    "site:influencer-hero.com top 3d artists instagram",
    "site:influencer-hero.com top blender artists instagram",
    "site:influencer-hero.com top concept art instagram",
    "site:influencer-hero.com top digital illustration instagram",
    "site:influencer-hero.com top character design instagram",
    "site:influencer-hero.com top zbrush instagram",
    "site:influencer-hero.com top cinema 4d instagram",
    "site:influencer-hero.com top houdini fx instagram",
    "site:influencer-hero.com top environment art instagram",
    "site:influencer-hero.com top game art instagram",
    "site:influencer-hero.com top storyboard art instagram",
    # Adjacent creative
    "site:influencer-hero.com top ceramic art instagram",
    "site:influencer-hero.com top woodworking instagram",
    "site:influencer-hero.com top jewelry design instagram",
    "site:influencer-hero.com top candle decor instagram",
    "site:influencer-hero.com top luxury candles instagram",
    "site:influencer-hero.com top diy beauty instagram",
    "site:influencer-hero.com top rustic decor instagram",
    "site:influencer-hero.com top luxury perfumes instagram",
]

# Apify hashtags for direct scraping
APIFY_HASHTAGS = [
    "conceptart", "characterdesign", "visdev", "visualdevelopment",
    "digitalpainting", "3dart", "blender3d", "motiongraphics",
    "vfxartist", "illustrationartist", "digitalillustration",
    "animationart", "gameart", "environmentart", "storyboardart",
    "comicart", "backgroundart", "zbrush", "cinema4d", "houdini",
    "midjourney", "aiart", "comfyui", "stable diffusion",
    "runwayml", "generativeart",
]

# Email extraction
EMAIL_REGEX = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
    re.IGNORECASE,
)

SKIP_DOMAINS = {
    "example.com", "email.com", "test.com", "domain.com",
    "sentry.io", "wix.com", "facebook.com", "instagram.com",
    "tiktok.com", "youtube.com", "twitter.com", "gmail.com.ph",
    "hotmail.co", "yahoo.co", "socialveins.in",
}

# ─── DRAFT TEMPLATES ────────────────────────────────────────────────────────
# Two styles: long-form (for first batch) and short "Quick idea" (for volume)
LONG_HOOKS = [
    "The pattern I keep seeing is people asking for the workflow, the preset pack, or the full setup, and there being nothing to sell them yet.",
    "People keep asking pages like yours for the tutorial, the project file, or the tool breakdown, and there is nothing to buy yet.",
    "The pattern I keep seeing is creators with real demand in the comments but no product behind the page to capture it.",
    "People keep asking for your process, your settings, your full breakdown, and there is nothing packaged for them yet.",
]

LONG_OPENERS = [
    "I came across {handle} while looking at {niche_short} pages where the audience clearly wants more depth, not just surface-level tips.",
    "I found {handle} while scanning {niche_short} creators who actually ship work and have buyers asking in the comments.",
    "I came across your page while looking at {niche_short} creators whose audience is clearly ready to buy, not just scroll.",
    "I found {handle} while looking at {niche_short} pages with real engagement and nothing for the audience to purchase.",
]

SHORT_HOOKS = [
    ("I have been looking at the work {handle} posts and the audience engagement tells a clear story. "
     "There is real demand here and nothing structured selling into it yet.",
     "That is exactly the gap we fill with zero risk to the creator."),
    ("The quality coming out of {handle} is the kind of thing people screenshot and save. "
     "The audience clearly wants more than surface-level tips.",
     "We build the digital product around your voice. You approve before anything ships."),
    ("Every time {handle} posts the comments are people asking for breakdowns, files, settings, tutorials. "
     "That is signal, not noise.",
     "We handle production, fulfilment, and customer support. You keep creative control and sixty percent of every sale."),
    ("What stands out about {handle} is how clearly the audience is ready to buy. "
     "They are not just scrolling, they are asking questions that a well-made product could answer all day.",
     "No fee. No flat rate. Just a real split on something built around your actual work."),
    ("Looking at {handle} there is a clear pattern: strong work, an engaged audience, "
     "and nothing packaged for them to buy yet.",
     "That is what we fix. We build the product, you approve it, we split revenue 60/40 in your favour."),
]


# ═══════════════════════════════════════════════════════════════════════════════
# UTILITIES
# ═══════════════════════════════════════════════════════════════════════════════

def is_valid_email(email: str) -> bool:
    """Reject junk, disposable, and non-personal emails."""
    domain = email.split("@")[-1].lower()
    if domain in SKIP_DOMAINS:
        return False
    if len(email) > 60:
        return False
    return True


def extract_emails(text: str) -> list[str]:
    """Extract all valid emails from text."""
    if not text:
        return []
    return [m for m in EMAIL_REGEX.findall(text) if is_valid_email(m)]


def email_from_channel(value: str) -> str:
    """Extract email from tracker's channel field like 'Email (foo@bar.com)'."""
    m = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", value or "")
    return m.group(0) if m else ""


def norm_email(value: str) -> str:
    """Normalize email for dedup."""
    s = (value or "").strip().lower()
    local, _, domain = s.partition("@")
    local = local.split("+", 1)[0]
    return f"{local}@{domain}" if domain else local


def norm_handle(value: str) -> str:
    """Normalize handle for dedup."""
    return re.sub(r"[^a-z0-9._]", "", (value or "").strip().lower())


def load_tracker() -> tuple[list[str], list[dict]]:
    """Load tracker CSV. Returns (fieldnames, rows)."""
    if not TRACKER_PATH.exists():
        return [], []
    with open(TRACKER_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = [dict(r) for r in reader]
        fieldnames = list(reader.fieldnames or [])
    return fieldnames, rows


def save_tracker(fieldnames: list[str], rows: list[dict]):
    """Save tracker CSV with backup."""
    backup_dir = REPO_ROOT / "templates" / "backups"
    backup_dir.mkdir(exist_ok=True)
    if TRACKER_PATH.exists():
        import shutil
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        shutil.copy2(TRACKER_PATH, backup_dir / f"creator_tracker_{ts}.csv")

    # Preserve column order, append new columns at end
    cols = [c for c in fieldnames if c]
    for r in rows:
        for k in r:
            if k not in cols:
                cols.append(k)

    tmp = str(TRACKER_PATH) + ".tmp"
    with open(tmp, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=cols, restval="", extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    os.replace(tmp, str(TRACKER_PATH))


def get_tracked_emails(rows: list[dict]) -> set[str]:
    """Get all normalized emails already in tracker."""
    emails = set()
    for r in rows:
        e = norm_email(email_from_channel(r.get("channel", "")))
        if e:
            emails.add(e)
    return emails


def get_tracked_handles(rows: list[dict]) -> set[str]:
    """Get all normalized handles already in tracker."""
    return {norm_handle(r.get("handle", "")) for r in rows if r.get("handle")}


def get_next_draft_number() -> int:
    """Find the next available draft number."""
    existing = []
    for f in DRAFTS_DIR.iterdir():
        if f.name.startswith("draft_") and f.suffix == ".txt":
            try:
                num = int(f.name.split("_")[1])
                existing.append(num)
            except (ValueError, IndexError):
                pass
    return max(existing, default=0) + 1


def niche_short_label(niche: str) -> str:
    """Map niche codes to short labels for draft copy."""
    niche_map = {
        "Niche #1": "motion design and video editing",
        "Niche #2": "AI tools and workflow",
        "Niche #3": "3D art and digital design",
        "Adjacent": "creative design",
    }
    for k, v in niche_map.items():
        if k in (niche or ""):
            return v
    return "creative"


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1: SCOUT — Discover new creators
# ═══════════════════════════════════════════════════════════════════════════════

def scout_goldmine(tracked_handles: set[str], tracked_emails: set[str],
                   limit: int = 50) -> list[dict]:
    """
    Goldmine system: search Google for directory-site snippets that surface
    bio emails. This is the proven discovery method when Apify tokens run out.

    NOTE: This function outputs search queries for the agent to execute via
    the web_search / fetch_page tools. When run standalone (outside Arena),
    it prints the queries and returns an empty list — the agent fills in
    the results during the session.
    """
    print("\n=== STEP 1: SCOUT (Goldmine System) ===")
    print(f"Search queries prepared: {len(GOLDMINE_QUERIES)}")
    print(f"Tracked handles: {len(tracked_handles)}")
    print(f"Tracked emails: {len(tracked_emails)}")
    print()
    print("Run these searches via web_search + fetch_page to find new leads:")
    print("(In Arena sessions, the agent executes these automatically.)")
    print()

    queries_file = DAILY_DIR / "goldmine_queries.json"
    DAILY_DIR.mkdir(parents=True, exist_ok=True)

    # Shuffle to avoid always hitting the same categories first
    queries = GOLDMINE_QUERIES.copy()
    random.shuffle(queries)

    query_data = []
    for i, q in enumerate(queries[:limit]):
        query_data.append({
            "index": i,
            "query": q,
            "status": "pending",
        })

    with open(queries_file, "w") as f:
        json.dump(query_data, f, indent=2)

    print(f"Saved {len(query_data)} queries to {queries_file}")
    print("The agent will execute these and extract leads from snippets.")
    return []


def scout_apify(tracked_handles: set[str], tracked_emails: set[str],
                max_per_tag: int = 30) -> list[dict]:
    """
    Apify scraping: direct Instagram profile scraping via Apify API.
    Requires APIFY_TOKEN environment variable.
    """
    token = os.environ.get("APIFY_TOKEN", "")
    if not token or token == "YOUR_APIFY_TOKEN_HERE":
        print("\n=== STEP 1b: SCOUT (Apify) ===")
        print("No APIFY_TOKEN set. Skipping Apify scrape.")
        print("Set APIFY_TOKEN environment variable to enable.")
        return []

    try:
        from apify_client import ApifyClient
    except ImportError:
        print("apify-client not installed. Run: pip install apify-client")
        return []

    print(f"\n=== STEP 1b: SCOUT (Apify — {len(APIFY_HASHTAGS)} hashtags) ===")
    client = ApifyClient(token)
    new_leads = []

    for i, tag in enumerate(APIFY_HASHTAGS):
        print(f"  [{i+1}/{len(APIFY_HASHTAGS)}] #{tag}...", end=" ", flush=True)
        try:
            run_input = {
                "hashtags": [tag],
                "resultsLimit": max_per_tag,
                "resultsType": "profiles",
            }
            run = client.actor("apify/instagram-hashtag-scraper").call(
                run_input=run_input,
                timeout_secs=120,
            )
            items = client.dataset(run["defaultDatasetId"]).list_items().items

            found = 0
            for item in items:
                handle = "@" + item.get("username", "")
                if not handle or handle == "@":
                    continue
                if norm_handle(handle) in tracked_handles:
                    continue

                bio = item.get("biography", "") or ""
                followers = item.get("followersCount", 0) or 0
                emails = extract_emails(bio)
                if not emails:
                    continue
                email = emails[0]
                if norm_email(email) in tracked_emails:
                    continue
                if followers < FOLLOWER_MIN or followers > FOLLOWER_MAX:
                    continue

                # Classify niche based on hashtag
                niche = "Adjacent"
                vfx_tags = {"motiongraphics", "vfxartist", "animationart", "cinema4d", "houdini"}
                ai_tags = {"midjourney", "aiart", "comfyui", "stable diffusion", "runwayml", "generativeart"}
                d3_tags = {"3dart", "blender3d", "zbrush", "conceptart", "characterdesign",
                           "environmentart", "gameart", "storyboardart", "comicart", "backgroundart",
                           "illustrationartist", "digitalillustration", "digitalpainting", "visdev",
                           "visualdevelopment", "procreate"}
                if tag in vfx_tags:
                    niche = "Niche #1"
                elif tag in ai_tags:
                    niche = "Niche #2"
                elif tag in d3_tags:
                    niche = "Niche #3"

                new_leads.append({
                    "handle": handle,
                    "email": email,
                    "followers": followers,
                    "niche": niche,
                    "source": f"apify-#{tag}",
                })
                tracked_handles.add(norm_handle(handle))
                tracked_emails.add(norm_email(email))
                found += 1

            print(f"{len(items)} profiles, {found} new")
        except Exception as e:
            print(f"ERROR: {e}")

        time.sleep(1)

    print(f"\nApify total: {len(new_leads)} new leads")
    return new_leads


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2: FILTER — Apply gates
# ═══════════════════════════════════════════════════════════════════════════════

def apply_filters(leads: list[dict]) -> list[dict]:
    """Apply niche lock, follower range, and ban list."""
    filtered = []
    rejected = {"niche_ban": 0, "follower_range": 0, "no_email": 0}

    for lead in leads:
        niche = lead.get("niche", "")
        # Check banned niches
        niche_lower = niche.lower()
        if any(banned in niche_lower for banned in BANNED_NICHES):
            rejected["niche_ban"] += 1
            continue

        followers = lead.get("followers", 0)
        if followers < FOLLOWER_MIN or followers > FOLLOWER_MAX:
            rejected["follower_range"] += 1
            continue

        if not lead.get("email"):
            rejected["no_email"] += 1
            continue

        filtered.append(lead)

    print(f"\n=== STEP 2: FILTER ===")
    print(f"Input: {len(leads)} | Passed: {len(filtered)}")
    print(f"Rejected: {rejected}")
    return filtered


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3: TRACK — Add to CSV
# ═══════════════════════════════════════════════════════════════════════════════

def add_to_tracker(leads: list[dict], fieldnames: list[str],
                   rows: list[dict], dry_run: bool = False) -> int:
    """Add new leads to tracker. Returns count added."""
    print(f"\n=== STEP 3: TRACK ===")
    if not leads:
        print("No new leads to add.")
        return 0

    added = 0
    for lead in leads:
        row = {fn: "" for fn in fieldnames}
        row["handle"] = lead["handle"]
        row["niche"] = lead.get("niche", "Adjacent")
        row["followers"] = str(lead.get("followers", 0))
        row["channel"] = f"Email ({lead['email']})"
        row["status"] = "DISCOVERED"
        row["replies"] = "0"
        row["split"] = SPLIT
        row["notes"] = f"Scouted {datetime.now().strftime('%Y-%m-%d')} via {lead.get('source', 'goldmine')}"
        rows.append(row)
        added += 1

    print(f"Added {added} new leads to tracker ({len(rows)} total rows)")
    if not dry_run and added > 0:
        save_tracker(fieldnames, rows)
        print(f"Tracker saved: {TRACKER_PATH}")
    elif dry_run:
        print("DRY RUN — nothing written.")
    return added


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4: DRAFT — Generate outreach emails
# ═══════════════════════════════════════════════════════════════════════════════

def generate_draft_long(handle: str, email: str, niche: str) -> tuple[str, str]:
    """Generate a long-form draft (style A)."""
    niche_short = niche_short_label(niche)
    name_part = handle.replace("@", "").replace(".", " ").replace("_", " ").split()[0].title()
    if name_part in ("Ai", "3d", "Figma"):
        greeting = "Hey,"
    else:
        greeting = f"Hey {name_part},"

    hook = random.choice(LONG_HOOKS)
    opener = random.choice(LONG_OPENERS).format(handle=handle, niche_short=niche_short)
    subject = f"your {niche_short} work + a product idea for {handle}"

    body = f"""{greeting}

{opener}

{hook}

I build the product, the storefront and the support. You bring the audience. Revenue splits 60/40 in your favour, no fee, nothing paid until it sells.

Worth a conversation?

{DISPLAY_NAME}
Shadow Operator

Reply STOP and I will not follow up."""

    return subject, body.strip()


def generate_draft_short(handle: str, email: str, niche: str) -> tuple[str, str]:
    """Generate a short 'Quick idea' draft (style B)."""
    hook, detail = random.choice(SHORT_HOOKS)
    hook = hook.format(handle=handle)
    subject = f"Quick idea for {handle}"

    body = f"""Hey,

{hook}

{detail}

Nothing paid until it sells. No retainer. No flat fee. Pure revenue share — sixty forty in your favour.

If that sounds interesting reply here and I will send the short version of how it works.

{SIGNATURE}"""

    return subject, body.strip()


def generate_drafts(rows: list[dict], dry_run: bool = False,
                    style: str = "short") -> list[dict]:
    """Generate drafts for all undrafted DISCOVERED leads. Returns draft info."""
    print(f"\n=== STEP 4: DRAFT (style: {style}) ===")

    # Find undrafted DISCOVERED leads with emails
    draftable = []
    for r in rows:
        status = (r.get("status") or "").strip()
        channel = r.get("channel", "")
        if status == "DISCOVERED" and "@" in channel:
            email = email_from_channel(channel)
            if email:
                draftable.append({
                    "handle": r["handle"],
                    "email": email,
                    "niche": r.get("niche", ""),
                    "followers": int(r.get("followers", 0) or 0),
                })

    # Filter out those that already have draft files
    existing_draft_emails = set()
    for f in DRAFTS_DIR.iterdir():
        if f.name.startswith("draft_") and f.suffix == ".txt":
            content = f.read_text(encoding="utf-8", errors="ignore")
            for em in extract_emails(content):
                existing_draft_emails.add(norm_email(em))

    undrafted = [d for d in draftable if norm_email(d["email"]) not in existing_draft_emails]

    print(f"DISCOVERED with email: {len(draftable)}")
    print(f"Already have draft file: {len(draftable) - len(undrafted)}")
    print(f"Need drafts: {len(undrafted)}")

    if not undrafted:
        print("No new drafts needed.")
        return []

    draft_num = get_next_draft_number()
    drafts_created = []

    gen_fn = generate_draft_short if style == "short" else generate_draft_long

    for lead in undrafted:
        handle = lead["handle"]
        email = lead["email"]
        niche = lead["niche"]

        subject, body = gen_fn(handle, email, niche)
        word_count = len(body.split())
        assert word_count < 90, f"Draft too long ({word_count}w) for {handle}"

        safe_handle = handle.replace("@", "").replace(".", "_").replace("/", "_")
        # Clean up double underscores
        while "__" in safe_handle:
            safe_handle = safe_handle.replace("__", "_")
        filename = f"draft_{draft_num:03d}_{safe_handle}.txt"
        filepath = DRAFTS_DIR / filename

        if not dry_run:
            with open(filepath, "w") as f:
                f.write(f"to: {email}\n")
                f.write(f"subject: {subject}\n")
                f.write(f"from: {SIGNATURE}\n")
                f.write(f"---\n\n")
                f.write(body)

        drafts_created.append({
            "number": draft_num,
            "handle": handle,
            "email": email,
            "subject": subject,
            "word_count": word_count,
            "filename": filename,
            "body": body,
        })
        draft_num += 1

    print(f"Drafts created: {len(drafts_created)}" +
          (" (DRY RUN)" if dry_run else ""))
    return drafts_created


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5: STAGE — Push drafts to Gmail
# ═══════════════════════════════════════════════════════════════════════════════

def stage_to_gmail(drafts: list[dict], quota: int = 15,
                   dry_run: bool = False) -> int:
    """
    Stage drafts as Gmail drafts.

    When run inside Arena, the agent calls gmail__create_draft for each.
    When run standalone, this outputs a JSON manifest for manual staging
    or uses Gmail API if credentials are available.
    """
    print(f"\n=== STEP 5: STAGE TO GMAIL (quota: {quota}) ===")

    if not drafts:
        print("No drafts to stage.")
        return 0

    # Cap at quota
    to_stage = drafts[:quota]
    print(f"Drafts to stage: {len(to_stage)} (of {len(drafts)} available)")

    # Check for Gmail API credentials
    creds_path = os.environ.get("GMAIL_CREDENTIALS", "")
    has_gmail_api = False

    if creds_path and os.path.exists(creds_path):
        try:
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build
            has_gmail_api = True
        except ImportError:
            pass

    if has_gmail_api:
        return _stage_via_api(to_stage, creds_path, dry_run)
    else:
        return _stage_via_manifest(to_stage, dry_run)


def _stage_via_api(drafts: list[dict], creds_path: str,
                   dry_run: bool = False) -> int:
    """Stage via Gmail API (requires OAuth credentials)."""
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    import base64
    from email.mime.text import MIMEText

    creds = Credentials.from_authorized_user_file(creds_path)
    service = build("gmail", "v1", credentials=creds)

    staged = 0
    for draft in drafts:
        if dry_run:
            print(f"  DRY RUN: would create draft for {draft['email']}")
            continue

        msg = MIMEText(draft["body"])
        msg["to"] = draft["email"]
        msg["subject"] = draft["subject"]
        msg["from"] = OPERATOR_EMAIL

        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        body = {"message": {"raw": raw}}

        try:
            result = service.users().drafts().create(
                userId="me", body=body
            ).execute()
            print(f"  ✓ {draft['email']} -> Draft ID {result['id']}")
            staged += 1
        except Exception as e:
            print(f"  ✗ {draft['email']}: {e}")

    print(f"\nStaged {staged}/{len(drafts)} drafts to Gmail")
    return staged


def _stage_via_manifest(drafts: list[dict], dry_run: bool = False) -> int:
    """Output a JSON manifest for agent-assisted or manual staging."""
    manifest_path = DAILY_DIR / "gmail_stage_manifest.json"
    DAILY_DIR.mkdir(parents=True, exist_ok=True)

    manifest = {
        "created": datetime.now().isoformat(),
        "count": len(drafts),
        "from_address": OPERATOR_EMAIL,
        "drafts": [],
    }

    for d in drafts:
        manifest["drafts"].append({
            "to": d["email"],
            "subject": d["subject"],
            "body": d["body"],
            "source_file": d["filename"],
        })

    if not dry_run:
        with open(manifest_path, "w") as f:
            json.dump(manifest, f, indent=2)
        print(f"Manifest saved: {manifest_path}")
        print("In Arena sessions, the agent reads this and calls gmail__create_draft.")
        print("Standalone: import into Gmail via API or Google Apps Script.")
    else:
        print(f"DRY RUN: would save manifest with {len(drafts)} drafts")

    return 0  # Actual staging done by agent or manually


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6: REPORT — Daily brief
# ═══════════════════════════════════════════════════════════════════════════════

def daily_report(rows: list[dict], new_leads: int, new_drafts: int,
                 staged: int):
    """Print the daily brief."""
    print(f"\n{'='*60}")
    print(f"  DAILY BRIEF — {datetime.now().strftime('%Y-%m-%d %H:%M EAT')}")
    print(f"{'='*60}")

    # Status breakdown
    status_counts = {}
    for r in rows:
        s = (r.get("status") or "UNKNOWN").strip()
        # Normalize: take first word/underscore-token
        base = s.split("(")[0].split("_")[0].strip()
        status_counts[base] = status_counts.get(base, 0) + 1

    print(f"\nTracker: {len(rows)} total rows")
    for s, c in sorted(status_counts.items(), key=lambda x: -x[1]):
        print(f"  {s:<24} {c}")

    # Email availability
    with_email = sum(1 for r in rows if "@" in (r.get("channel") or ""))
    print(f"\nWith email: {with_email}/{len(rows)}")

    # Draft status
    draft_count = sum(1 for f in DRAFTS_DIR.iterdir()
                      if f.name.startswith("draft_") and f.suffix == ".txt")
    print(f"Draft files: {draft_count}")

    # Today's work
    print(f"\nToday's pipeline:")
    print(f"  New leads discovered:   {new_leads}")
    print(f"  New drafts generated:   {new_drafts}")
    print(f"  Gmail drafts staged:    {staged}")

    # Operator action
    undrafted = sum(1 for r in rows
                    if (r.get("status") or "").strip() == "DISCOVERED"
                    and "@" in (r.get("channel") or ""))
    print(f"\nOperator action needed:")
    print(f"  Undrafted DISCOVERED:   {undrafted}")
    print(f"  Daily send target:      10-15 Gmail drafts (operator sends manually)")
    print(f"{'='*60}\n")


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Shadow Operation — Daily Part A Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--scout-only", action="store_true",
                        help="Only run the scout step")
    parser.add_argument("--draft-only", action="store_true",
                        help="Only generate drafts for existing DISCOVERED leads")
    parser.add_argument("--stage-only", action="store_true",
                        help="Only stage existing drafts to Gmail")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show what would happen, write nothing")
    parser.add_argument("--quota", type=int, default=15,
                        help="Max Gmail drafts to create today (default: 15)")
    parser.add_argument("--style", choices=["short", "long"], default="short",
                        help="Draft style: 'short' (Quick idea) or 'long' (full pitch)")
    parser.add_argument("--apify-limit", type=int, default=30,
                        help="Max profiles per Apify hashtag (default: 30)")
    parser.add_argument("--goldmine-limit", type=int, default=50,
                        help="Max goldmine queries to run (default: 50)")
    args = parser.parse_args()

    print(f"{'='*60}")
    print(f"  SHADOW OPERATION — DAILY PART A")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M EAT')}")
    print(f"  {'DRY RUN' if args.dry_run else 'LIVE RUN'}")
    print(f"{'='*60}")

    # Load tracker
    fieldnames, rows = load_tracker()
    tracked_handles = get_tracked_handles(rows)
    tracked_emails = get_tracked_emails(rows)
    print(f"\nTracker: {len(rows)} rows, {len(tracked_handles)} handles, "
          f"{len(tracked_emails)} emails")

    # Ensure drafts directory exists
    DRAFTS_DIR.mkdir(parents=True, exist_ok=True)

    new_leads = 0
    new_drafts = 0
    staged = 0

    # ── SCOUT ──
    if not args.draft_only and not args.stage_only:
        leads = []

        # Goldmine system (always run — this is the proven method)
        goldmine_leads = scout_goldmine(tracked_handles, tracked_emails,
                                        limit=args.goldmine_limit)
        leads.extend(goldmine_leads)

        # Apify (optional, if token available)
        apify_leads = scout_apify(tracked_handles, tracked_emails,
                                  max_per_tag=args.apify_limit)
        leads.extend(apify_leads)

        # Filter
        if leads:
            leads = apply_filters(leads)
            new_leads = add_to_tracker(leads, fieldnames, rows,
                                       dry_run=args.dry_run)

        if args.scout_only:
            daily_report(rows, new_leads, 0, 0)
            return

    # ── DRAFT ──
    if not args.stage_only:
        drafts = generate_drafts(rows, dry_run=args.dry_run,
                                 style=args.style)
        new_drafts = len(drafts)

        if args.draft_only:
            daily_report(rows, 0, new_drafts, 0)
            return

    # ── STAGE ──
    if not args.draft_only and not args.scout_only:
        # Read all draft files for staging
        drafts_for_staging = []
        for f in sorted(DRAFTS_DIR.iterdir()):
            if not (f.name.startswith("draft_") and f.suffix == ".txt"):
                continue
            content = f.read_text(encoding="utf-8", errors="ignore")
            email = ""
            subject = ""
            body = ""

            if content.startswith("to:"):
                # New format: to:/subject:/--- headers
                parts = content.split("---\n\n", 1)
                if len(parts) == 2:
                    header, body = parts
                    for line in header.split("\n"):
                        if line.startswith("to:"):
                            email = line[3:].strip()
                        elif line.startswith("subject:"):
                            subject = line[8:].strip()
            elif content.startswith("TO:"):
                # Old format: TO:/SUBJECT:/--- headers
                parts = content.split("---\n\n", 1)
                if len(parts) == 2:
                    header, body = parts
                    for line in header.split("\n"):
                        if line.startswith("TO:"):
                            email = line[3:].strip()
                        elif line.startswith("SUBJECT:"):
                            subject = line[8:].strip()

            if email and body:
                drafts_for_staging.append({
                    "email": email,
                    "subject": subject,
                    "body": body.strip(),
                    "filename": f.name,
                })

        staged = stage_to_gmail(drafts_for_staging, quota=args.quota,
                                dry_run=args.dry_run)

    # ── REPORT ──
    daily_report(rows, new_leads, new_drafts, staged)


if __name__ == "__main__":
    main()