#!/usr/bin/env python3
"""
APFY SCRAPE → DRAFT PIPELINE
Run locally where api.apify.com is reachable.
Uses your Apify free-tier ($6.06 remaining) to scrape ~500 Instagram artist
profiles, extract bio emails, and generate cold-outreach drafts.

Usage:
    pip install apify-client
    python3 apify_scrape_and_draft.py

Output:
    - New rows appended to templates/creator_tracker.csv
    - New draft files in outbound/drafts/
"""

import csv
import os
import re
import time
from datetime import datetime

# ─── CONFIG ───────────────────────────────────────────────────────────────────
APIFY_TOKEN = "YOUR_APIFY_TOKEN_HERE"  # Set via environment variable or paste here
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TRACKER_PATH = os.path.join(REPO_ROOT, "templates", "creator_tracker.csv")
DRAFTS_DIR = os.path.join(REPO_ROOT, "outbound", "drafts")

# Hashtags to search — these are the niches that yielded the most leads
HASHTAGS = [
    "conceptart",
    "characterdesign",
    "visdev",
    "visualdevelopment",
    "digitalpainting",
    "3dart",
    "blender3d",
    "motiongraphics",
    "vfxartist",
    "illustrationartist",
    "digitalillustration",
    "animationart",
    "gameart",
    "environmentart",
    "storyboardart",
    "comicart",
    "backgroundart",
    "zbrush",
    "cinema4d",
    "houdini",
]

MAX_PROFILES_PER_HASHTAG = 50  # ~$0.03 per 50 profiles, ~$0.60 total for 20 tags
FOLLOWER_MIN = 8000
FOLLOWER_MAX = 500000
DISPLAY_NAME = "Scott"
SPLIT = "60/40"

# ─── EMAIL EXTRACTION ────────────────────────────────────────────────────────
EMAIL_REGEX = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
    re.IGNORECASE,
)

# Domains to skip (not personal emails)
SKIP_DOMAINS = {
    "example.com", "email.com", "test.com", "domain.com",
    "sentry.io", "wix.com", "facebook.com", "instagram.com",
    "tiktok.com", "youtube.com", "twitter.com", "gmail.com.ph",
    "hotmail.co", "yahoo.co",
}

def is_valid_email(email: str) -> bool:
    domain = email.split("@")[-1].lower()
    if domain in SKIP_DOMAINS:
        return False
    if len(email) > 60:
        return False
    return True

def extract_email(bio: str) -> str | None:
    if not bio:
        return None
    matches = EMAIL_REGEX.findall(bio)
    for m in matches:
        if is_valid_email(m):
            return m
    return None

# ─── DRAFT GENERATION ────────────────────────────────────────────────────────
def pick_hook(handle: str, niche_label: str) -> tuple[str, str]:
    """Return (hook_line, detail_line) personalised to the niche."""
    hooks = [
        (f"I have been looking at the work {handle} posts and the audience engagement tells a clear story. There is real demand here and nothing structured selling into it yet.",
         "That is exactly the gap we fill with zero risk to the creator."),
        (f"The quality coming out of {handle} is the kind of thing people screenshot and save. The audience clearly wants more than surface-level tips.",
         "We build the digital product around your voice. You approve before anything ships."),
        (f"Every time {handle} posts the comments are people asking for breakdowns, files, settings, tutorials. That is signal, not noise.",
         "We handle production, fulfilment, and customer support. You keep creative control and sixty percent of every sale."),
        (f"What stands out about {handle} is how clearly the audience is ready to buy. They are not just scrolling, they are asking questions that a well-made product could answer all day.",
         "No fee. No flat rate. Just a real split on something built around your actual work."),
        (f"Looking at {handle} there is a clear pattern: strong work, an engaged audience, and nothing packaged for them to buy yet.",
         "That is what we fix. We build the product, you approve it, we split revenue 60/40 in your favour."),
    ]
    import random
    h = random.choice(hooks)
    return h

def generate_draft(handle: str, email: str, niche_label: str, followers: int) -> tuple[str, str]:
    """Generate a draft email. Returns (subject, body)."""
    hook, detail = pick_hook(handle, niche_label)

    subject_line = f"Quick idea for {handle}"

    body = f"""Hey,

{hook}

{detail}

Nothing paid until it sells. No retainer. No flat fee. Pure revenue share — sixty forty in your favour.

If that sounds interesting reply here and I will send the short version of how it works.

{DISPLAY_NAME} / Shadow Operator"""

    word_count = len(body.split())
    assert word_count < 90, f"Draft too long: {word_count}w"

    return subject_line, body

# ─── MAIN PIPELINE ───────────────────────────────────────────────────────────
def load_tracker() -> tuple[list[str], list[dict]]:
    """Load existing tracker. Returns (fieldnames, rows)."""
    if not os.path.exists(TRACKER_PATH):
        return [], []
    with open(TRACKER_PATH, "r") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = list(reader.fieldnames or [])
    return fieldnames, rows

def get_tracked_handles(rows: list[dict]) -> set[str]:
    return {r["handle"].strip().lower() for r in rows}

def get_next_draft_number() -> int:
    existing = []
    for f in os.listdir(DRAFTS_DIR):
        if f.startswith("draft_") and f.endswith(".txt") and not f.startswith("generate"):
            try:
                num = int(f.split("_")[1])
                existing.append(num)
            except ValueError:
                pass
    return max(existing, default=0) + 1

def main():
    from apify_client import ApifyClient

    client = ApifyClient(APIFY_TOKEN)
    fieldnames, rows = load_tracker()
    tracked = get_tracked_handles(rows)
    draft_num = get_next_draft_number()

    print(f"=== APFY SCRAPE + DRAFT PIPELINE ===")
    print(f"Tracker rows: {len(rows)}")
    print(f"Already tracked: {len(tracked)} handles")
    print(f"Next draft number: {draft_num}")
    print(f"Hashtags to search: {len(HASHTAGS)}")
    print(f"Budget: ~${len(HASHTAGS) * 0.03:.2f}")
    print()

    all_new_profiles = []

    for i, tag in enumerate(HASHTAGS):
        print(f"[{i+1}/{len(HASHTAGS)}] Scraping #{tag}...")
        try:
            run_input = {
                "hashtags": [tag],
                "resultsLimit": MAX_PROFILES_PER_HASHTAG,
                "resultsType": "profiles",
            }
            run = client.actor("apify/instagram-hashtag-scraper").call(
                run_input=run_input,
                timeout_secs=120,
            )
            dataset_items = client.dataset(run["defaultDatasetId"]).list_items().items

            new_count = 0
            for item in dataset_items:
                handle = item.get("username", "")
                if not handle:
                    continue
                handle = "@" + handle
                if handle.lower() in tracked:
                    continue

                bio = item.get("biography", "") or ""
                followers = item.get("followersCount", 0) or 0
                email = extract_email(bio)

                if not email:
                    continue
                if followers < FOLLOWER_MIN or followers > FOLLOWER_MAX:
                    continue

                # Determine niche label
                niche = f"#{tag} niche"

                # Add to tracker
                row = {fn: "" for fn in fieldnames}
                row["handle"] = handle
                row["niche"] = niche
                row["followers"] = str(followers)
                row["channel"] = f"Email ({email})"
                row["status"] = "DISCOVERED"
                row["replies"] = "0"
                row["split"] = SPLIT
                rows.append(row)
                tracked.add(handle.lower())

                # Generate draft
                subject, body = generate_draft(handle, email, niche, followers)
                safe_handle = handle.replace("@", "").replace(".", "_").replace("/", "_")
                filename = f"draft_{draft_num:03d}_{safe_handle}.txt"
                filepath = os.path.join(DRAFTS_DIR, filename)

                with open(filepath, "w") as f:
                    f.write(f"to: {email}\n")
                    f.write(f"subject: {subject}\n")
                    f.write(f"from: {DISPLAY_NAME} / Shadow Operator\n")
                    f.write(f"---\n\n")
                    f.write(body)

                draft_num += 1
                new_count += 1
                all_new_profiles.append({
                    "handle": handle,
                    "followers": followers,
                    "email": email,
                    "hashtag": tag,
                })

            print(f"  Found {len(dataset_items)} profiles, {new_count} new with email")

        except Exception as e:
            print(f"  ERROR: {e}")
            continue

        time.sleep(1)  # Rate limiting

    # Save tracker
    if all_new_profiles:
        with open(TRACKER_PATH, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

    # Summary
    draft_count = len([f for f in os.listdir(DRAFTS_DIR)
                       if f.endswith(".txt") and not f.startswith("generate")])

    print()
    print(f"=== RESULTS ===")
    print(f"New profiles found: {len(all_new_profiles)}")
    print(f"Total tracker rows: {len(rows)}")
    print(f"Total draft files: {draft_count}")
    print(f"Remaining to 500: {max(0, 500 - draft_count)}")

    if all_new_profiles:
        print()
        print("New leads:")
        for p in all_new_profiles[:20]:
            print(f"  {p['handle']:30s} {p['followers']//1000:3d}K {p['email']} (#{p['hashtag']})")
        if len(all_new_profiles) > 20:
            print(f"  ... and {len(all_new_profiles) - 20} more")

if __name__ == "__main__":
    main()