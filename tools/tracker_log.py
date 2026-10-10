#!/usr/bin/env python3
"""Safe, append-only edits to templates/creator_tracker.csv.

Hand-editing a 39-column CSV is how state gets lost, and the old engine proved it.
This tool only ever changes the cells you name, keeps the file's own column order
and unknown columns, writes a backup first, and refuses to invent handles.

Usage:
    python tools/tracker_log.py note  --handle @castt.ai --text "Touch 2 sent 2026-10-10"
    python tools/tracker_log.py touch --handle @castt.ai --date 2026-10-10
    python tools/tracker_log.py set   --handle @castt.ai --status WARM --replies 1
    python tools/tracker_log.py show  --handle @castt.ai

The `touch` command follows the "Touch N sent YYYY-MM-DD" convention that
tools/leak_finder.py reads to count how far along a sequence a lead is.
"""
import argparse
import csv
import os
import shutil
import sys
from datetime import datetime

TRACKER = os.path.join("templates", "creator_tracker.csv")
BACKUP_DIRNAME = "backups"

# Cells an operator is allowed to set directly. Anything else is derived data and
# belongs to tools/algorithm_engine.py.
SETTABLE = ["status", "replies", "audit_sent", "call_date", "reliability_score",
            "demand_V", "demand_I", "demand_presales", "go_nogo", "committed_date",
            "launch_start", "first_touch_date", "last_touch_date", "notes", "tier"]


def repo_root():
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def resolve(path):
    return path if os.path.isabs(path) else os.path.join(repo_root(), path)


def load(path):
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [dict(r) for r in reader], list(reader.fieldnames or [])


def save(path, rows, fieldnames, backup=True):
    if backup and os.path.exists(path):
        bdir = os.path.join(os.path.dirname(path), BACKUP_DIRNAME)
        os.makedirs(bdir, exist_ok=True)
        shutil.copy2(path, os.path.join(
            bdir, f"creator_tracker_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"))
    cols = [c for c in fieldnames if c]
    for r in rows:
        for k in r:
            if k not in cols:
                cols.append(k)
    tmp = path + ".tmp"
    with open(tmp, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols, restval="", extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    os.replace(tmp, path)


def find(rows, handle):
    wanted = handle if handle.startswith("@") else "@" + handle
    for r in rows:
        if (r.get("handle") or "").strip().lower() == wanted.lower():
            return r
    return None


def append_note(row, text):
    old = (row.get("notes") or "").strip()
    row["notes"] = f"{old} | {text}" if old else text


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("command", choices=["note", "touch", "set", "show"])
    p.add_argument("--handle", required=True)
    p.add_argument("--file", default=TRACKER)
    p.add_argument("--text", help="note text (command: note)")
    p.add_argument("--date", help="YYYY-MM-DD (command: touch)")
    p.add_argument("--status")
    p.add_argument("--replies")
    p.add_argument("--dry-run", action="store_true")
    a = p.parse_args(argv)

    path = resolve(a.file)
    if not os.path.exists(path):
        raise SystemExit(f"tracker not found: {path}")
    rows, fields = load(path)
    row = find(rows, a.handle)
    if row is None:
        known = ", ".join(sorted((r.get("handle") or "") for r in rows)[:10])
        raise SystemExit(f"no such handle: {a.handle}\nknown handles include: {known} ...")

    if a.command == "show":
        for k in fields:
            print(f"{k:<24} {row.get(k, '')}")
        return 0

    if a.command == "note":
        if not a.text:
            raise SystemExit("--text is required")
        append_note(row, a.text)
        print(f"note appended to {a.handle}")

    elif a.command == "touch":
        when = a.date or datetime.now().strftime("%Y-%m-%d")
        n = 1
        first = (row.get("first_touch_date") or "").strip()
        if not first:
            row["first_touch_date"] = when
        else:
            n = 2
        for token in str(row.get("notes") or "").split("|"):
            token = token.strip()
            if token.lower().startswith("touch ") and " sent " in token.lower():
                try:
                    n = max(n, int(token.lower().split("touch ")[1].split(" ")[0]) + 1)
                except (ValueError, IndexError):
                    pass
        row["last_touch_date"] = when
        append_note(row, f"Touch {n} sent {when}")
        print(f"{a.handle}: touch {n} logged for {when}")

    elif a.command == "set":
        changed = []
        for field in SETTABLE:
            value = getattr(a, field, None)
            if value is None:
                continue
            row[field] = value
            changed.append(f"{field}={value}")
        if not changed:
            raise SystemExit(f"nothing to set. settable fields: {', '.join(SETTABLE)}")
        print(f"{a.handle}: " + ", ".join(changed))

    if a.dry_run:
        print("DRY-RUN: nothing written")
        return 0

    save(path, rows, fields)
    print(f"written: {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
