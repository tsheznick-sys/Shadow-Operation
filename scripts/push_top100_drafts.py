#!/usr/bin/env python3
"""
Push Top 100 highest conversion_score creators to Gmail Drafts
ONE-BY-ONE draft method (human-send gate compliant)
Usage: python3 scripts/push_top100_drafts.py
- Creates drafts in Gmail via Gmail API (Colab) OR via arena gmail__create_draft tool
- Saves state to logs/gmail_top100_push_log.csv
- Respects 6-10 per hour cadence if bulk; for agent: one call per turn
"""
import json, csv, time, os, sys, base64, re
from pathlib import Path
from datetime import datetime

REPO = Path("/home/user/Shadow-Operation")
MANIFEST = REPO / "templates" / "gmail_top100_manifest.json"
LOG = REPO / "logs" / "gmail_top100_push_log.csv"

print(f"Loading {MANIFEST}...")
manifest = json.loads(MANIFEST.read_text())
print(f" {len(manifest)} entries loaded")
# Show scoring
for i, m in enumerate(manifest, 1):
    print(f"{i:3d}. {m['handle']:25s} score {m['conversion_score']:3s} -> {m['email']:35s} | {m['subject'][:45]}")

# If run in Colab, will use Gmail API; if in Arena, agent will iterate gmail__create_draft
