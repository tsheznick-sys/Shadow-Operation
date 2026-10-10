"""The append-only tracker writer must never lose or reorder state."""
import csv
import os
import subprocess
import sys

TOOLS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools")

FIELDS = ["handle", "status", "notes", "price", "first_touch_date", "last_touch_date"]


def seed(tmp_path):
    path = tmp_path / "creator_tracker.csv"
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerow({"handle": "@castt.ai", "status": "OUTREACH_SENT",
                    "notes": "msg_id=1a119ed807bff83f", "price": "$79",
                    "first_touch_date": "2026-10-08", "last_touch_date": "2026-10-08"})
    return path


def read(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def run(*args):
    out = subprocess.run([sys.executable, os.path.join(TOOLS, "tracker_log.py")] + list(args),
                         capture_output=True, text=True)
    assert out.returncode == 0, out.stderr + out.stdout
    return out.stdout


def test_note_appends_without_destroying_the_old_note(tmp_path):
    path = seed(tmp_path)
    run("note", "--handle", "@castt.ai", "--file", str(path),
        "--text", "Touch 2 draft staged 2026-10-10")
    row = read(path)[0]
    assert row["notes"] == "msg_id=1a119ed807bff83f | Touch 2 draft staged 2026-10-10"
    assert row["status"] == "OUTREACH_SENT"          # untouched
    assert row["price"] == "$79"                     # untouched


def test_touch_logs_the_sequence_number_and_moves_last_touch(tmp_path):
    path = seed(tmp_path)
    run("touch", "--handle", "@castt.ai", "--file", str(path), "--date", "2026-10-12")
    row = read(path)[0]
    assert row["last_touch_date"] == "2026-10-12"
    assert "Touch 2 sent 2026-10-12" in row["notes"]
    assert row["first_touch_date"] == "2026-10-08"   # never overwritten


def test_touch_counts_up_from_the_notes_convention(tmp_path):
    path = seed(tmp_path)
    run("touch", "--handle", "@castt.ai", "--file", str(path), "--date", "2026-10-12")
    run("touch", "--handle", "@castt.ai", "--file", str(path), "--date", "2026-10-17")
    assert "Touch 3 sent 2026-10-17" in read(path)[0]["notes"]


def test_column_order_and_unknown_columns_survive(tmp_path):
    path = seed(tmp_path)
    run("note", "--handle", "@castt.ai", "--file", str(path), "--text", "x")
    with open(path, newline="", encoding="utf-8") as f:
        assert next(csv.reader(f)) == FIELDS


def test_set_only_touches_the_named_cells(tmp_path):
    path = seed(tmp_path)
    run("set", "--handle", "@castt.ai", "--file", str(path), "--status", "WARM",
        "--replies", "1")
    row = read(path)[0]
    assert row["status"] == "WARM"
    assert row["replies"] == "1"
    assert row["notes"] == "msg_id=1a119ed807bff83f"


def test_unknown_handle_is_refused(tmp_path):
    path = seed(tmp_path)
    out = subprocess.run(
        [sys.executable, os.path.join(TOOLS, "tracker_log.py"), "note", "--handle", "@nobody",
         "--file", str(path), "--text", "x"], capture_output=True, text=True)
    assert out.returncode != 0
    assert "no such handle" in (out.stdout + out.stderr)


def test_dry_run_writes_nothing(tmp_path):
    path = seed(tmp_path)
    before = path.read_bytes()
    run("note", "--handle", "@castt.ai", "--file", str(path), "--text", "x", "--dry-run")
    assert path.read_bytes() == before


def test_backup_written_before_overwrite(tmp_path):
    path = seed(tmp_path)
    run("note", "--handle", "@castt.ai", "--file", str(path), "--text", "x")
    assert list((tmp_path / "backups").glob("creator_tracker_*.csv"))
