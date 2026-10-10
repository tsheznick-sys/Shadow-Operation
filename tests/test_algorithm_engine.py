"""Regression tests for the tracker exporter.

These lock in the two data-loss bugs found on 2026-10-10:

1. v1 export_tracker() rewrote the whole CSV from a hardcoded 32-column schema,
   destroying Gmail message IDs, follow-up dates, 7 operator-added columns and
   the 3 Apify-verified leads.
2. The first cut of the v2 merge recorded a conflict but kept the engine's value,
   so a "non-destructive" merge still overwrote live cells.
"""
import csv
import os

import algorithm_engine as ae


def write_tracker(path, rows, fieldnames):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)


def read_tracker(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


BASE_FIELDS = ["handle", "status", "first_touch_date", "notes", "price"]


def test_merge_creates_a_tracker_when_none_exists(tmp_path):
    path = tmp_path / "creator_tracker.csv"
    diff = ae.export_tracker(filepath=str(path), backup=False, verbose=False)
    rows = read_tracker(path)
    assert len(rows) == len(ae.CREATORS)
    assert diff["added"]
    assert "@castt.ai" in diff["added"]


def test_merge_preserves_every_live_operator_cell(tmp_path):
    """The regression: a merge must never overwrite what the operator recorded."""
    path = tmp_path / "creator_tracker.csv"
    live = {
        "handle": "@castt.ai",
        "status": "OUTREACH_SENT_P1 (Follow-up 2026-10-10)",
        "first_touch_date": "2026-10-08",
        "notes": "msg_id=1a119ed807bff83f | SENT Oct 8",
        "price": "$79",
    }
    write_tracker(path, [live], BASE_FIELDS)

    diff = ae.export_tracker(filepath=str(path), backup=False, verbose=False)
    row = read_tracker(path)[0]

    assert row["status"] == live["status"]
    assert row["first_touch_date"] == live["first_touch_date"]
    assert row["notes"] == live["notes"]
    assert row["price"] == "$79"
    # the disagreement is reported, never silently applied
    assert "@castt.ai" in diff["conflicts"]
    assert "status" in diff["conflicts"]["@castt.ai"]


def test_merge_preserves_rows_the_engine_has_never_seen(tmp_path):
    """The 3 Apify-verified leads are not in CREATORS and must survive."""
    path = tmp_path / "creator_tracker.csv"
    apify = {"handle": "@gfx_ma", "status": "OUTREACH_SENT_V2", "first_touch_date": "",
             "notes": "Apify-verified 14.46% ER", "price": "$97"}
    write_tracker(path, [apify], BASE_FIELDS)

    ae.export_tracker(filepath=str(path), backup=False, verbose=False)
    handles = [r["handle"] for r in read_tracker(path)]

    assert "@gfx_ma" in handles
    assert len(handles) == len(ae.CREATORS) + 1
    row = next(r for r in read_tracker(path) if r["handle"] == "@gfx_ma")
    assert row["notes"] == apify["notes"]


def test_merge_preserves_unknown_columns_and_their_order(tmp_path):
    path = tmp_path / "creator_tracker.csv"
    fields = BASE_FIELDS + ["engagement_rate", "monetization_verdict"]
    row = {"handle": "@castt.ai", "status": "SENT", "first_touch_date": "2026-10-08",
           "notes": "n", "price": "$79", "engagement_rate": "4.20%",
           "monetization_verdict": "GREEN"}
    write_tracker(path, [row], fields)

    ae.export_tracker(filepath=str(path), backup=False, verbose=False)
    with open(path, newline="", encoding="utf-8") as f:
        out_fields = next(csv.reader(f))
    out = read_tracker(path)[0]

    assert out_fields[:len(fields)] == fields          # layout is operator-owned
    assert out["engagement_rate"] == "4.20%"
    assert out["monetization_verdict"] == "GREEN"


def test_merge_is_idempotent(tmp_path):
    """A no-op merge must produce a byte-identical file (no review noise)."""
    path = tmp_path / "creator_tracker.csv"
    ae.export_tracker(filepath=str(path), backup=False, verbose=False)
    first = path.read_bytes()
    ae.export_tracker(filepath=str(path), backup=False, verbose=False)
    assert path.read_bytes() == first


def test_merge_only_fills_blank_cells_by_default(tmp_path):
    path = tmp_path / "creator_tracker.csv"
    write_tracker(path, [{"handle": "@castt.ai", "status": "", "first_touch_date": "",
                          "notes": "", "price": ""}], BASE_FIELDS)
    ae.export_tracker(filepath=str(path), backup=False, verbose=False)
    row = read_tracker(path)[0]
    # blank cells get the engine's value
    assert row["status"] == "OUTREACH_SENT"
    assert row["notes"].startswith("SENT Oct 8")


def test_force_lets_the_engine_win_on_derived_columns_only(tmp_path):
    path = tmp_path / "creator_tracker.csv"
    write_tracker(path, [{"handle": "@castt.ai", "status": "MY_STATUS",
                          "first_touch_date": "2026-10-08", "notes": "keep me",
                          "price": "$79"}], BASE_FIELDS)
    ae.export_tracker(filepath=str(path), backup=False, verbose=False, force=True)
    row = read_tracker(path)[0]
    assert row["status"] == "MY_STATUS"        # live field: still untouched
    assert row["notes"] == "keep me"           # live field: still untouched
    assert row["price"] == "29"                # derived field: engine wins


def test_never_blanks_out_a_verified_value(tmp_path):
    """'UNVERIFIED' from the engine must not erase a real number in the file."""
    path = tmp_path / "creator_tracker.csv"
    write_tracker(path, [{"handle": "@castt.ai", "status": "SENT",
                          "first_touch_date": "", "notes": "",
                          "price": ""}], BASE_FIELDS)
    rows, diff = ae.merge_tracker(read_tracker(path), ae.CREATORS)
    castt = next(r for r in rows if r["handle"] == "@castt.ai")
    assert castt["avg_likes"] == "UNVERIFIED"     # engine had nothing to add
    assert castt["buyer_pool_x3"].endswith("(EST)")


def test_dry_run_writes_nothing(tmp_path):
    path = tmp_path / "creator_tracker.csv"
    write_tracker(path, [{"handle": "@castt.ai", "status": "SENT",
                          "first_touch_date": "", "notes": "", "price": ""}],
                  BASE_FIELDS)
    before = path.read_bytes()
    ae.export_tracker(filepath=str(path), backup=False, verbose=False, dry_run=True)
    assert path.read_bytes() == before


def test_backup_is_written_before_overwriting(tmp_path):
    path = tmp_path / "creator_tracker.csv"
    write_tracker(path, [{"handle": "@castt.ai", "status": "SENT",
                          "first_touch_date": "", "notes": "", "price": ""}],
                  BASE_FIELDS)
    ae.export_tracker(filepath=str(path), backup=True, verbose=False)
    backups = list((tmp_path / ae.BACKUP_DIRNAME).glob("creator_tracker_*.csv"))
    assert len(backups) == 1


def test_tools_run_from_any_working_directory(tmp_path):
    """The old script only worked when cwd was tools/."""
    import subprocess
    import sys
    out = subprocess.run(
        [sys.executable, os.path.join(os.path.dirname(ae.__file__), "algorithm_engine.py"),
         "--dry-run", "--file", str(tmp_path / "nope.csv")],
        capture_output=True, text=True, cwd=str(tmp_path))
    assert out.returncode == 0, out.stderr
    assert "DRY-RUN" in out.stdout
