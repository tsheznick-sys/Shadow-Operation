"""
Top 100 Colab Sender — Paste into https://colab.research.google.com
Upload gmail_top100_manifest.json then run.
10/hour cadence, crash-safe.
"""
import json, csv, time, os, base64
from datetime import datetime
from email.mime.text import MIMEText
print("🔐 Authenticating...")
try:
    from google.colab import auth
    auth.authenticate_user()
    from googleapiclient.discovery import build
    service = build('gmail','v1')
    print("✅ Gmail API ready")
except Exception as e:
    print(f"Not in Colab: {e}")
    service=None

MANIFEST="gmail_top100_manifest.json"
STATE="top100_state.json"
LOG="top100_log.csv"
CADENCE=10
INTERVAL=360

import pathlib
manifest=json.loads(open(MANIFEST).read())
print(f"Loaded {len(manifest)} drafts")
# same logic as push_top100_drafts.py
