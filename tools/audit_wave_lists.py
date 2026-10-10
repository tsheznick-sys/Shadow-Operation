#!/usr/bin/env python3
"""Gate a bulk-send wave list BEFORE anything is scheduled or sent.

Why this exists
---------------
On 2026-10-10 the operator produced a Google Apps Script, "Shadow Operator Wave
Autopilot v4.4", that installs a 24/7 hourly trigger firing 12 Gmail drafts an
hour (288/day) from the primary inbox through three hard-coded 50-recipient wave
lists plus a fallback that sends *any other draft in the account*.

Checked against the repo's own data, that script would have:

  * re-pitched **50 of 50** Wave-3 recipients, who were emailed 1-2 days earlier
    and did not reply - the fastest known way to farm spam complaints;
  * emailed **both live positive leads** (@ainewscentral, who was waiting on a
    promised gameplan, and @premiereprotutos, who had already been sent a
    commitment) a fresh cold email;
  * emailed **10 recipients in the Motivation/Wealth niche**, which the
    learnings log banned from scouting outright (#15/15, 37/100);
  * run at **288/day** against the kit's own 20-30/day/inbox ceiling, on the
    primary inbox, in breach of Gate G4 (human sends only);
  * done all of it while the VERDICT.md kill criterion was TRIGGERED at
    2 positive / 130 touches.

This tool makes that class of mistake checkable in one command instead of
discoverable after the send.

Usage:
    python tools/audit_wave_lists.py --waves daily/2026-10-10/wave_autopilot_v4.4_lists.json
    python tools/audit_wave_lists.py --waves <file> --sent-export <gmail-export.csv>
    python tools/audit_wave_lists.py --waves <file> --suppression-out templates/suppression.csv
    python tools/audit_wave_lists.py --waves <file> --format json

Exit code 1 when anything is BLOCKED, so it can be wired into CI.
"""
import argparse
import csv
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import leak_finder as lf  # noqa: E402

TRACKER_DEFAULT = os.path.join("templates", "creator_tracker.csv")

# learnings.md: "Motivation/Wealth quotes ranked #15/15 (37/100) and banned from
# scouting." Also VERDICT.md #6 - skill/B2B niches over aesthetic/inspirational.
BANNED_NICHE_KEYWORDS = [
    "wealth", "millionaire", "billionaire", "finance", "forex", "stock",
    "invest", "entrepreneur", "motivation", "mindset", "hustle", "money",
    "trading", "salary", "luxury",
]

# prompts/02 hard rule: 20-30/day/inbox, and only from a warmed separate domain.
DEFAULT_DAILY_CAP = 25

# Stages that must never receive another email without an explicit override.
HARD_BLOCK_STAGES = ("declined",)

# Stages where another cold email would be actively destructive.
LIVE_STAGES = ("positive", "replied", "audit_sent", "call_booked",
               "test_running", "committed", "paid", "launching", "building")


def norm_email(value):
    s = (value or "").strip().lower()
    if not s:
        return ""
    local, _, domain = s.partition("@")
    local = local.split("+", 1)[0]
    return f"{local}@{domain}" if domain else local


def email_from_row(row):
    m = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", row.get("channel") or "")
    return norm_email(m.group(0)) if m else ""


def load_tracker(path):
    rows = lf.load_rows(path)
    index = {}
    for r in rows:
        e = email_from_row(r)
        if e:
            index[e] = {"handle": r.get("handle", ""), "stage": lf.stage_of(r)}
    return index


def load_sent_export(path):
    out = set()
    with open(path, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            e = norm_email(r.get("email") or "")
            if e:
                out.add(e)
    return out


def banned_keywords(email, keywords=None):
    local = (email or "").split("@")[0]
    return [k for k in (keywords or BANNED_NICHE_KEYWORDS) if k in local]


def audit(waves, tracker_index, already_sent, cap=DEFAULT_DAILY_CAP,
          keywords=None):
    """waves: {name: [emails]}. Returns (findings, summary)."""
    findings = []
    seen = {}

    for wave, emails in waves.items():
        for raw in emails:
            e = norm_email(raw)
            if not e:
                findings.append({"email": raw, "wave": wave, "severity": "BLOCK",
                                 "reason": "unparseable address"})
                continue
            if e in seen:
                findings.append({"email": e, "wave": wave, "severity": "WARN",
                                 "reason": f"duplicate - already queued in {seen[e]}"})
            seen[e] = wave

            info = tracker_index.get(e)
            stage = info["stage"] if info else None

            if stage in HARD_BLOCK_STAGES:
                findings.append({"email": e, "wave": wave, "severity": "BLOCK",
                                 "reason": f"DECLINED in tracker - Gate G8, never re-pitch",
                                 "handle": info.get("handle", "")})
                continue
            if stage in LIVE_STAGES:
                findings.append({"email": e, "wave": wave, "severity": "BLOCK",
                                 "reason": f"LIVE conversation (stage={stage}) - a cold "
                                           f"email here would land mid-thread",
                                 "handle": info.get("handle", "")})
                continue
            if stage is not None:
                findings.append({"email": e, "wave": wave, "severity": "BLOCK",
                                 "reason": f"already in tracker (stage={stage}) - re-pitch",
                                 "handle": info.get("handle", "")})
                continue
            if e in already_sent:
                findings.append({"email": e, "wave": wave, "severity": "BLOCK",
                                 "reason": "already emailed (sent-mail export) - re-pitch"})
                continue

            kw = banned_keywords(e, keywords)
            if kw:
                findings.append({"email": e, "wave": wave, "severity": "BLOCK",
                                 "reason": f"banned niche keyword(s): {', '.join(kw)}"})

    total = sum(len(v) for v in waves.values())
    blocked = [f for f in findings if f["severity"] == "BLOCK"]
    clean = total - len({f["email"] for f in blocked})
    summary = {
        "total_planned": total,
        "blocked": len({f["email"] for f in blocked}),
        "clean": clean,
        "daily_cap": cap,
        "over_cap": len(waves) and total > cap,
        "verdict": "BLOCKED" if blocked or total > cap else "CLEAR",
    }
    return findings, summary


def wave_emails(cfg):
    """Accept either {waves:{name:{emails:[...]}}} or {name: [emails]}."""
    if "waves" in cfg:
        return {name: list(w.get("emails") or [])
                for name, w in cfg["waves"].items()}
    return {k: list(v) for k, v in cfg.items() if isinstance(v, list)}


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--waves", required=True, help="wave-list JSON")
    p.add_argument("--tracker", default=TRACKER_DEFAULT)
    p.add_argument("--sent-export", action="append", default=[],
                   help="Gmail sent-mail export CSV (repeatable)")
    p.add_argument("--cap", type=int, default=DEFAULT_DAILY_CAP,
                   help=f"max sends/day/inbox (prompts/02: {DEFAULT_DAILY_CAP})")
    p.add_argument("--suppression-out",
                   help="write blocked addresses to this CSV for the sender script")
    p.add_argument("--format", choices=["text", "json"], default="text")
    a = p.parse_args(argv)

    cfg = json.load(open(a.waves, encoding="utf-8"))
    waves = wave_emails(cfg)
    tracker_index = (load_tracker(a.tracker)
                     if os.path.exists(a.tracker) else {})
    already_sent = set()
    for path in a.sent_export:
        already_sent |= load_sent_export(path)

    findings, summary = audit(waves, tracker_index, already_sent, cap=a.cap)

    if a.format == "json":
        print(json.dumps({"summary": summary, "findings": findings}, indent=1))
    else:
        print("WAVE LIST AUDIT")
        print(f"  planned recipients : {summary['total_planned']}")
        print(f"  clean              : {summary['clean']}")
        print(f"  blocked            : {summary['blocked']}")
        print(f"  daily cap          : {summary['daily_cap']}"
              f"{'  <-- OVER CAP' if summary['over_cap'] else ''}")
        print(f"  VERDICT            : {summary['verdict']}")
        print()
        by_wave = {}
        for f in findings:
            by_wave.setdefault(f["wave"], []).append(f)
        for wave, fs in by_wave.items():
            bl = [f for f in fs if f["severity"] == "BLOCK"]
            print(f"  {wave:<12} {len(bl):>3} blocked / {len(waves.get(wave, []))}")
        print()
        for f in findings:
            if f["severity"] == "BLOCK":
                print(f"  BLOCK  {f['wave']:<10} {f['email']:<42} {f['reason']}")
        print()
        if summary["verdict"] == "BLOCKED":
            print("  Do not install the trigger. Fix the list, re-run, then re-check "
                  "`python tools/leak_finder.py brief` for the kill criterion.")

    if a.suppression_out:
        blocked = sorted({f["email"] for f in findings
                          if f["severity"] == "BLOCK" and "@" in f["email"]})
        with open(a.suppression_out, "w", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh)
            w.writerow(["email", "reason"])
            for f in findings:
                if f["severity"] == "BLOCK" and f["email"] in blocked:
                    w.writerow([f["email"], f["reason"]])
        print(f"\nwrote {len(blocked)} blocked addresses to {a.suppression_out}")

    return 1 if summary["verdict"] == "BLOCKED" else 0


if __name__ == "__main__":
    sys.exit(main())
