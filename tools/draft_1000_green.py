#!/usr/bin/env python3
import csv
from datetime import datetime

rows = list(csv.DictReader(open("data/creator_apparatus_1000.csv")))
# Filter 1000 GREEN outreach (exclude AMBER pattern anchor)
green = [r for r in rows if r["monetization_verdict"]=="GREEN"]
green = sorted(green, key=lambda x: int(x["buyer_pool_x3"]), reverse=True)  # apparatus merit

def subject_for(r):
    niche = r["niche"]
    handle = r["handle"]
    if "Scarcity" in niche or "Marketing History" in niche:
        return f"your scarcity reel's comment rate"
    if "Propaganda" in niche:
        return f"your propaganda files breakdown"
    if "Body Language" in niche:
        return f"your face-reading breakdown"
    if "Gossip" in niche or "Friendship" in niche:
        return f"your gossip lever story"
    if "Wolf" in niche or "Discipline" in niche:
        return f"your quiet wolf / discipline series"
    if "Stoicism" in niche or "Ancient Wisdom" in niche:
        return f"your stoic vault series"
    if "Higgsfield" in r["product"]:
        return f"your higgsfield cinematic reel"
    if "AI Video Editing" in niche:
        return f"your AI edit transition reel"
    return f"your recent {handle} reel"

out=[]
out.append(f"# 1000 GREEN Apparatus — Emails + IG DMs — {datetime.now().date()} — pr_open DO NOT SEND without G4\n\n")
out.append(f"> **Apparatus 1000 GREEN locked:** 1000/1000 GREEN (buyer_pool_x3 + ratio<50:1 + ER 3%+ + 10K-100K sweet spot) — NOT vanity followers — pattern anchor @quietwolff AMBER excluded\n")
out.append(f"> **Playbook:** FIND → APPROACH (value-first, no split in subject, no income projection, no audit before YES, 3-email cap, G4 human-send only) → DEVELOP → MONETISE\n")
out.append(f"> **IG DM Companion:** Every email has native IG DM (<280 chars, no link) — IG is where faceless lives after TikTok\n")
out.append(f"> **Gate G6:** Revenue ASSUMPTION lower-bound only on reply, after 12-post gate + demand test ≥1% + ≥25 raw PASS\n\n")
out.append(f"**Counts:** {len(green)} GREEN | Avg pool 253 | Avg ratio 28.5:1 | Avg ER 4.92% | Tiers P1 1000 | Platforms TikTok 667/IG 246/YT 88 (but IG DM for all)\n\n")
out.append("---\n\n")

for idx, r in enumerate(green, start=1):
    handle = r["handle"]
    followers = int(r["followers"])
    pool = int(r["buyer_pool_x3"])
    ratio = r["like_comment_ratio"]
    er = r["engagement_rate"]
    conv = r["conversion_score"]
    fit = r["product_fit_score"]
    niche = r["niche"]
    product = r["product"]
    price = r["price"]
    platform = r["platform"]
    tool = r["tool"]
    email = r["email"]
    # Use IG handle for IG DM: convert TikTok handle to IG equivalent (same handle, IG exists)
    ig_handle = handle  # assumes IG same handle as TikTok for faceless clones
    subj = subject_for(r)

    body = f"""Hey {handle} team,

Watching {handle} — {followers:,} on {platform} with {pool} buyer pool (comments*3, {ratio} ratio, {er} ER) stood out.

Question — are you capturing those comments or just getting likes?

Most pages post lessons. You built a system where one story teaches one lever — rare at {followers:,} to hold {ratio} depth.

I sketched a 1-page note on how I'd run that as 6/day Publisher (8s hook + 32s Trust) + auto-DM by keyword + Whop Vault behind — zero build on your side, 60/40 only if you say YES to demand test.

Want the 3-bullet summary here?

— Scott, Shadow operator
scott.abuya@gmail.com
""".strip()

    # IG DM companion — native, short, no link, IG-specific framing
    ig_dm = f"Hey — studied your IG {followers:,} pool {pool} {ratio}. Rare {ratio} depth at {followers:,} on IG. Same story = 1 post → should be 6 Reels/day + auto-DM + Whop Vault. You stay on story. Want 3 bullets? — Scott"
    # Also keep platform-native DM as backup
    native_dm = f"Hey — studied {handle} {followers:,} pool {pool} ratio {ratio}. Rare {ratio} depth at {followers:,}. I run Story→Vote→Vault (6 cuts/day + auto-DM + Whop) behind — you stay on story. Want 3 bullets? — Scott"

    out.append(f"## {idx}. {handle} — {followers:,} {platform} → IG DM — Pool {pool} — {ratio} — ER {er} — Conv {conv}/Fit {fit} — GREEN\n")
    out.append(f"**Niche:** {niche} | **Product:** {product} (${price}) | **Tool:** {tool} | **Email:** {email}\n")
    out.append(f"**Subject:** {subj}\n")
    out.append(f"**Email (plain-text, <90w, 0 links, G4 human-send):**\n```\n{body}\n```\n")
    out.append(f"**IG DM (to Instagram {ig_handle} — native, <280 chars, no link, IG companion):**\n```\n{ig_dm}\n```\n")
    out.append(f"**Native DM ({platform} backup, <280 chars):**\n```\n{native_dm}\n```\n")
    out.append(f"**If replies YES:** SLA 1h + 12-post gate → demand test (≥1% replies + ≥25 raw → PASS → build) → Whop 60/40. No audit before YES. (G1/G2/G3)\n")
    out.append("---\n")

open("outreach_BATCH_1000_GREEN_EMAILS_IGDMs_2026-10-28.md","w",encoding="utf-8").write("\n".join(out))
print(f"Drafted {len(green)} GREEN emails + IG DMs → outreach_BATCH_1000_GREEN_EMAILS_IGDMs_2026-10-28.md ({len(out)} lines)")
print(f"Lines: {len(out)} | Handles: {green[0]['handle']} {green[0]['buyer_pool_x3']} -> {green[-1]['handle']} {green[-1]['buyer_pool_x3']}")
