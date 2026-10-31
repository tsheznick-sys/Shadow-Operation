#!/usr/bin/env python3
import csv
from datetime import datetime

# Load apparatus top 100 (skip anchor #1)
rows = list(csv.DictReader(open("data/creator_apparatus_1000.csv")))
top = [r for r in rows if r["handle"] != "@quietwolff"][:100]

# Playbook constants
def subject_for(r):
    # No split in subject, no income projection, specific observation
    handle = r["handle"]
    niche = r["niche"]
    # Specific-observation openers per playbook
    if "Scarcity" in niche or "Marketing History" in niche:
        return f"your scarcity reel's comment rate"
    if "Propaganda" in niche:
        return f"your propaganda files breakdown"
    if "Body Language" in niche:
        return f"your face-reading breakdown"
    if "Psychology" in niche and "Gossip" in r["niche"]:
        return f"your 7 levers / gossip lever story"
    if "Wolf" in niche or "Discipline" in niche:
        return f"your quiet wolf / discipline series"
    if "Stoicism" in niche:
        return f"your stoic vault series"
    if "Higgsfield" in r["product"] or "Cinematic" in r["product"]:
        return f"your higgsfield cinematic reel"
    return f"your recent {handle} reel"

out = []
out.append(f"# TOP 100 Apparatus Outreach Drafts — {datetime.now().date()} — pr_open DO NOT SEND without G4\n")
out.append(f"> Apparatus: 10K-100K followers, buyer_pool_x3=comments*3, ratio<50:1, ER 3%+, Gate GREEN, buyer_pool {top[0]['buyer_pool_x3']} max\n")
out.append(f"> Playbook: FIND (IG chevron/bio email) → APPROACH (value-first, no audit before YES, 3-email cap, human sends only G4) → DEVELOP → MONETISE\n")
out.append(f"> Rules: No split in subject, no income projection, ASSUMPTION only on reply, hard G1/G2/G3 gates, Hard Rule 2 no free audit before commitment\n\n")
for idx, r in enumerate(top, start=1):
    handle = r["handle"]
    followers = int(r["followers"])
    pool = int(r["buyer_pool_x3"])
    ratio = r["like_comment_ratio"]
    er = r["engagement_rate"]
    conv = r["conversion_score"]
    fit = r["product_fit_score"]
    gate = r["gate_result"]
    niche = r["niche"]
    product = r["product"]
    price = r["price"]
    platform = r["platform"]
    tool = r["tool"]
    email = r["email"]
    subj = subject_for(r)
    
    # Body template — specific observation opener, value-first, risk removal
    body = f"""Hey {handle} team,

Watching your {handle} — {followers:,} on {platform} with {pool} buyer pool (comments*3, {ratio} ratio, {er} ER) caught my eye.

Quick question — are you capturing those comments or just getting likes?

Most pages post lessons. You built a system where one story teaches one lever — rare at {followers:,} to have {ratio} comment depth.

I sketched a 1-page note on how I'd run that as 6/day Publisher (8s hook + 32s Trust) + auto-DM by comment word + Whop Vault behind — zero build on your side, 60/40 split only if you say YES to demand test.

Want the 3-bullet summary here?

— Scott, Shadow operator
scott.abuya@gmail.com
"""
    dm = f"Hey — studied {handle} {followers:,} pool {pool} ratio {ratio}. Rare to see {ratio} comment depth at {followers:,}. I run Story→Vote→Vault (6 cuts/day + auto-DM + Whop) behind — you stay on story. Want 3 bullets? — Scott"
    out.append(f"## {idx}. {handle} — {followers:,} {platform} — Pool {pool} — {ratio} — ER {er} — Conv {conv}/Fit {fit} — {gate.split('(')[0].strip()} — {niche}\n")
    out.append(f"**Product:** {product} (${price}) | **Tool:** {tool} | **Email:** {email}\n")
    out.append(f"**Subject:** {subj}\n")
    out.append(f"**Email (plain-text, <90w, 0 links, G4 human-send):**\n```\n{body.strip()}\n```\n")
    out.append(f"**DM ({platform}, <280 chars, no link):**\n```\n{dm}\n```\n")
    out.append(f"**Playbook Next:** If replies → SLA 1h + 12-post comment gate → demand test (≥1% replies + ≥25 raw → PASS → build). No audit before YES (G1/G2). Revenue ASSUMPTION only after PASS.\n")
    out.append("---\n")

open("outreach_BATCH_apparatus_TOP100_2026-10-28.md","w",encoding="utf-8").write("\n".join(out))
print(f"Drafted {len(top)} apparatus compliant emails+DMs → outreach_BATCH_apparatus_TOP100_2026-10-28.md")
print(f"Sample handle {top[0]['handle']} pool {top[0]['buyer_pool_x3']} ratio {top[0]['like_comment_ratio']}")
