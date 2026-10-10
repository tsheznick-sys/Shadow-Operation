#!/usr/bin/env python3
"""Reconcile a Gmail sent-mail export against templates/creator_tracker.csv.

Why this exists
---------------
The tracker is the source of truth for the funnel, the kill criteria and Gate
G8. But it only knows about sends somebody remembered to write down. On
2026-10-10 an audit found a ~102-send campaign in Gmail that was not in the
tracker at all: the tracker said "29 contacted, 0 replies" while the truth was
"101 contacted, 2 positive". Every funnel rate and the operator's own
pre-registered kill criterion were therefore measuring a denominator that
never existed.

Rule (learnings.md): the tracker is not the pipeline - Gmail is. Any send that
is not written to the tracker is invisible to the funnel, the kill criteria
and Gate G8.

What it does
------------
  * matches export rows to tracker rows by email, then by handle;
  * ADDS unmatched recipients as new rows;
  * fills BLANK cells on matched rows and never overwrites a filled one;
  * marks imported rows QUARANTINED by default, so they count as real outreach
    touches but can never re-enter the send queue or be re-pitched;
  * keeps the file's own column order, appends unknown columns at the end;
  * writes a timestamped backup to templates/backups/ before every write.

Usage:
    python tools/reconcile_gmail.py --export daily/2026-10-10/gmail_export_raw_to_whop.csv --dry-run
    python tools/reconcile_gmail.py --export daily/2026-10-10/gmail_export_raw_to_whop.csv

The export CSV needs: handle,email,sent_date[,gmail_msg_id][,campaign].
"""
import argparse
import csv
import os
import re
import shutil
import sys
from datetime import datetime

TRACKER_DEFAULT = os.path.join("templates", "creator_tracker.csv")
BACKUP_DIRNAME = "backups"

# Status used for imported recipients. "QUARANTINED" is read by
# tools/leak_finder.py: it counts toward the outreach-touch denominator so the
# kill criterion is honest, but it is terminal, so these leads never appear in
# a send queue and are never re-pitched.
QUARANTINE_STATUS = "QUARANTINED ({campaign}) - untracked send found in Gmail"

REQUIRED_EXPORT_COLUMNS = ("handle", "email", "sent_date")


def repo_root():
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def resolve(path):
    return path if os.path.isabs(path) else os.path.join(repo_root(), path)


def norm_email(value):
    """Gmail treats these as the same recipient; so does G8."""
    s = (value or "").strip().lower()
    if not s:
        return ""
    # Strip the +tag a few of the exported addresses carry. It is the same
    # mailbox, and re-pitching it would reach the same human.
    local, _, domain = s.partition("@")
    local = local.split("+", 1)[0]
    return f"{local}@{domain}" if domain else local


def norm_handle(value):
    return re.sub(r"[^a-z0-9._]", "", (value or "").strip().lower())


def load_csv(path):
    if not os.path.exists(path):
        raise SystemExit(f"file not found: {path}")
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = [dict(r) for r in reader]
        return rows, list(reader.fieldnames or [])


def email_from_channel(value):
    m = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", value or "")
    return m.group(0) if m else ""


def build_index(rows):
    by_email, by_handle = {}, {}
    for row in rows:
        e = norm_email(email_from_channel(row.get("channel")) or row.get("email") or "")
        if e:
            by_email.setdefault(e, row)
        h = norm_handle(row.get("handle"))
        if h:
            by_handle.setdefault(h, row)
    return by_email, by_handle


def new_row(fieldnames, export_row, campaign):
    """A quarantined tracker row for a recipient found only in Gmail."""
    row = {name: "" for name in fieldnames}
    email = (export_row.get("email") or "").strip()
    handle_v = (export_row.get("handle") or "").strip()
    sent = (export_row.get("sent_date") or "").strip()
    msg_id = (export_row.get("gmail_msg_id") or "").strip()
    row_campaign = (export_row.get("campaign") or campaign).strip()

    row["handle"] = handle_v
    row["channel"] = f"Email ({email})" if email else "Email"
    row["status"] = QUARANTINE_STATUS.format(campaign=row_campaign)
    row["tier"] = "UNVETTED"
    row["first_touch_date"] = sent
    row["last_touch_date"] = sent
    row["replies"] = "0"
    row["campaign"] = row_campaign
    row["notes"] = (
        f"Imported {datetime.now().strftime('%Y-%m-%d')} from a Gmail sent-mail audit - "
        f"this send was never written to the tracker. "
        f"gmail_msg_id={msg_id or 'n/a'} | sent {sent or 'n/a'} | campaign {row_campaign}. "
        f"QUARANTINED: counts as an outreach touch for the kill criterion, but do NOT "
        f"follow up - the campaign breached gates and the lead was never vetted "
        f"(see daily/2026-10-10/CAMPAIGN_AUDIT_RAW_TO_WHOP.md)."
    )
    return row


def reconcile(tracker_rows, tracker_cols, export_rows, campaign):
    """Return (new_rows, fills, matches) without mutating tracker_rows."""
    by_email, by_handle = build_index(tracker_rows)
    new_rows, fills, matches = [], [], []

    for exp in export_rows:
        email = norm_email(exp.get("email") or "")
        handle_v = norm_handle(exp.get("handle") or "")
        existing = by_email.get(email) if email else None
        how = "email" if existing is not None else None
        if existing is None and handle_v:
            existing = by_handle.get(handle_v)
            how = "handle" if existing is not None else None

        if existing is None:
            new_rows.append(new_row(tracker_cols, exp, campaign))
            continue

        matches.append((existing.get("handle", ""), how))
        # Fill-only: never overwrite a cell the operator has filled.
        for col, value in (
            ("first_touch_date", (exp.get("sent_date") or "").strip()),
            ("last_touch_date", (exp.get("sent_date") or "").strip()),
            ("campaign", (exp.get("campaign") or campaign).strip()),
        ):
            if not value:
                continue
            if not (existing.get(col) or "").strip():
                if col in tracker_cols:
                    fills.append((existing.get("handle", ""), col, value))
                    existing[col] = value
    return new_rows, fills, matches


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
        writer = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    os.replace(tmp, path)


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--export", required=True,
                   help="CSV of sent mail: handle,email,sent_date[,gmail_msg_id][,campaign]")
    p.add_argument("--tracker", default=TRACKER_DEFAULT)
    p.add_argument("--campaign", default="untracked-gmail-send",
                   help="campaign label stamped onto imported rows")
    p.add_argument("--dry-run", action="store_true",
                   help="show what would change; write nothing")
    a = p.parse_args(argv)

    export_path, tracker_path = resolve(a.export), resolve(a.tracker)
    export_rows, export_cols = load_csv(export_path)
    missing = [c for c in REQUIRED_EXPORT_COLUMNS if c not in export_cols]
    if missing:
        raise SystemExit(f"export is missing required column(s): {', '.join(missing)}")

    tracker_rows, tracker_cols = load_csv(tracker_path)
    if "campaign" not in tracker_cols:
        tracker_cols.append("campaign")

    before = len(tracker_rows)
    new_rows, fills, matches = reconcile(tracker_rows, tracker_cols,
                                         export_rows, a.campaign)

    print(f"EXPORT      {len(export_rows):>4} sent messages from {os.path.relpath(export_path)}")
    print(f"TRACKER     {before:>4} rows before")
    print()
    print(f"MATCHED     {len(matches):>4} already in the tracker (no status change)")
    print(f"NEW         {len(new_rows):>4} recipients found only in Gmail "
          f"-> imported as QUARANTINED")
    print(f"FILLED      {len(fills):>4} blank cells on existing rows "
          f"(never an overwrite)")
    print()
    for h, col, v in fills[:20]:
        print(f"  fill  {h:<28} {col} = {v}")
    if len(fills) > 20:
        print(f"  ... and {len(fills) - 20} more")
    print()
    for r in new_rows[:10]:
        print(f"  new   {r['handle']:<28} {r['channel']}")
    if len(new_rows) > 10:
        print(f"  ... and {len(new_rows) - 10} more")

    if a.dry_run:
        print()
        print("DRY RUN - nothing written.")
        return 0

    tracker_rows.extend(new_rows)
    save(tracker_path, tracker_rows, tracker_cols)
    print()
    print(f"WROTE {len(tracker_rows)} rows ({before} before) to "
          f"{os.path.relpath(tracker_path)}")
    print("Backup in templates/backups/. Re-run `python tools/leak_finder.py leaks` "
          "for the corrected funnel.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
