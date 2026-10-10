"""Gmail -> tracker reconciliation: quarantined imports, fill-only, no dupes."""
import csv
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))), "tools"))

import reconcile_gmail as rg  # noqa: E402

COLUMNS = ["handle", "niche", "followers", "status", "channel",
           "first_touch_date", "last_touch_date", "replies", "tier", "notes",
           "conversion_score", "price", "gross", "operator_share"]


def make_tracker(tmp_path, rows=None, columns=None):
    path = tmp_path / "tracker.csv"
    cols = list(columns or COLUMNS)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for r in (rows or []):
            w.writerow(r)
    return path


def make_export(tmp_path, rows, name="export.csv"):
    path = tmp_path / name
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["handle", "email", "sent_date",
                                          "gmail_msg_id", "campaign"])
        w.writeheader()
        for r in rows:
            w.writerow(r)
    return path


def read(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


# ------------------------------------------------------------------- importing
def test_untracked_recipient_is_imported_as_quarantined(tmp_path):
    tracker = make_tracker(tmp_path, [{"handle": "@known", "channel": "Email (a@b.com)"}])
    export = make_export(tmp_path, [
        {"handle": "@newguy", "email": "new@guy.com", "sent_date": "2026-10-09",
         "gmail_msg_id": "abc123", "campaign": "spray"},
    ])
    rg.main(["--export", str(export), "--tracker", str(tracker), "--campaign", "spray"])

    rows = read(tracker)
    assert len(rows) == 2
    imported = rows[1]
    assert imported["handle"] == "@newguy"
    assert imported["channel"] == "Email (new@guy.com)"
    assert "QUARANTINED" in imported["status"]
    assert imported["first_touch_date"] == "2026-10-09"
    assert imported["campaign"] == "spray"
    assert "abc123" in imported["notes"]


def test_quarantine_keeps_the_lead_out_of_the_send_queue(tmp_path):
    import leak_finder as lf
    tracker = make_tracker(tmp_path, [{"handle": "@known", "channel": "Email (a@b.com)"}])
    export = make_export(tmp_path, [
        {"handle": "@newguy", "email": "new@guy.com", "sent_date": "2026-10-09",
         "gmail_msg_id": "abc123", "campaign": "spray"},
    ])
    rg.main(["--export", str(export), "--tracker", str(tracker), "--campaign", "spray"])

    rows = lf.load_rows(str(tracker))
    assert lf.stage_of(rows[1]) == "quarantined"
    assert lf.send_queue(rows, __import__("datetime").date(2026, 10, 10)) == []
    # ...but it is still a real touch, so the kill-criterion denominator is honest
    assert len(lf.touched(rows)) == 1


# ------------------------------------------------------------------ de-duping
def test_match_by_email_inside_the_channel_column(tmp_path):
    tracker = make_tracker(tmp_path, [
        {"handle": "@known", "channel": "Email (Known@Mail.com)",
         "status": "WARM (POSITIVE reply 2026-10-10)", "first_touch_date": "2026-10-09",
         "tier": "P1", "notes": "operator wrote this"},
    ])
    export = make_export(tmp_path, [
        {"handle": "@totally-different", "email": "known@mail.com",
         "sent_date": "2026-10-09", "gmail_msg_id": "xyz", "campaign": "spray"},
    ])
    rg.main(["--export", str(export), "--tracker", str(tracker), "--campaign", "spray"])

    rows = read(tracker)
    assert len(rows) == 1                                  # no duplicate row
    assert rows[0]["status"] == "WARM (POSITIVE reply 2026-10-10)"   # not quarantined
    assert rows[0]["notes"] == "operator wrote this"                 # not clobbered
    assert rows[0]["campaign"] == "spray"                            # blank cell filled


def test_match_by_handle_when_no_email_matches(tmp_path):
    tracker = make_tracker(tmp_path, [
        {"handle": "@known", "channel": "", "first_touch_date": "2026-10-09"},
    ])
    export = make_export(tmp_path, [
        {"handle": "@known", "email": "different@address.com",
         "sent_date": "2026-10-10", "gmail_msg_id": "q", "campaign": "spray"},
    ])
    rg.main(["--export", str(export), "--tracker", str(tracker), "--campaign", "spray"])
    assert len(read(tracker)) == 1


def test_plus_tagged_address_is_the_same_recipient(tmp_path):
    tracker = make_tracker(tmp_path, [{"handle": "@known", "channel": "Email (biz@gmail.com)"}])
    export = make_export(tmp_path, [
        {"handle": "@other", "email": "biz+linuxmemes@gmail.com",
         "sent_date": "2026-10-09", "gmail_msg_id": "p", "campaign": "spray"},
    ])
    rg.main(["--export", str(export), "--tracker", str(tracker), "--campaign", "spray"])
    assert len(read(tracker)) == 1


def test_existing_rows_are_never_overwritten(tmp_path):
    """A filled cell must survive reconciliation - the original engine bug."""
    tracker = make_tracker(tmp_path, [
        {"handle": "@known", "channel": "Email (a@b.com)", "status": "OUTREACH_SENT_P1",
         "first_touch_date": "2026-10-08", "last_touch_date": "2026-10-08",
         "price": "$79", "notes": "curated by hand"},
    ])
    export = make_export(tmp_path, [
        {"handle": "@known", "email": "a@b.com", "sent_date": "2026-10-09",
         "gmail_msg_id": "z", "campaign": "spray"},
    ])
    rg.main(["--export", str(export), "--tracker", str(tracker), "--campaign", "spray"])

    row = read(tracker)[0]
    assert row["price"] == "$79"
    assert row["notes"] == "curated by hand"
    assert row["status"] == "OUTREACH_SENT_P1"
    assert row["first_touch_date"] == "2026-10-08"   # operator's date wins


# ------------------------------------------------------------------- file shape
def test_dry_run_writes_nothing(tmp_path):
    tracker = make_tracker(tmp_path, [{"handle": "@known", "channel": "Email (a@b.com)"}])
    before = open(tracker, encoding="utf-8").read()
    export = make_export(tmp_path, [
        {"handle": "@newguy", "email": "new@guy.com", "sent_date": "2026-10-09",
         "gmail_msg_id": "d", "campaign": "spray"},
    ])
    rg.main(["--export", str(export), "--tracker", str(tracker),
             "--campaign", "spray", "--dry-run"])
    assert open(tracker, encoding="utf-8").read() == before


def test_column_order_is_preserved_and_new_columns_appended(tmp_path):
    tracker = make_tracker(tmp_path, [{"handle": "@known", "channel": "Email (a@b.com)"}])
    export = make_export(tmp_path, [
        {"handle": "@newguy", "email": "new@guy.com", "sent_date": "2026-10-09",
         "gmail_msg_id": "c", "campaign": "spray"},
    ])
    rg.main(["--export", str(export), "--tracker", str(tracker), "--campaign", "spray"])

    with open(tracker, newline="", encoding="utf-8") as f:
        cols = next(csv.reader(f))
    assert cols[:len(COLUMNS)] == COLUMNS       # original order untouched
    assert cols[-1] == "campaign"               # appended, not spliced in


def test_a_backup_is_written_before_the_overwrite(tmp_path):
    tracker = make_tracker(tmp_path, [{"handle": "@known", "channel": "Email (a@b.com)"}])
    export = make_export(tmp_path, [
        {"handle": "@newguy", "email": "new@guy.com", "sent_date": "2026-10-09",
         "gmail_msg_id": "b", "campaign": "spray"},
    ])
    rg.main(["--export", str(export), "--tracker", str(tracker), "--campaign", "spray"])
    backups = list((tmp_path / "backups").glob("*.csv"))
    assert len(backups) == 1


def test_export_missing_a_required_column_is_rejected(tmp_path):
    path = tmp_path / "bad.csv"
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["handle", "email"])
        w.writeheader()
        w.writerow({"handle": "@a", "email": "a@b.com"})
    with pytest.raises(SystemExit):
        rg.main(["--export", str(path), "--tracker",
                 str(make_tracker(tmp_path)), "--dry-run"])
