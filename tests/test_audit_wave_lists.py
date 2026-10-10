"""Wave-list gating: re-pitches, live threads, banned niches, volume caps."""
import json
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))), "tools"))

import audit_wave_lists as aw  # noqa: E402


def cfg(**waves):
    return waves


# ------------------------------------------------------------------- blocking
def test_already_emailed_recipient_is_blocked():
    findings, s = aw.audit({"w1": ["a@b.com"]}, {}, {"a@b.com"})
    assert s["blocked"] == 1
    assert "re-pitch" in findings[0]["reason"]


def test_declined_lead_is_blocked_by_gate_g8():
    idx = {"a@b.com": {"handle": "@a", "stage": "declined"}}
    findings, s = aw.audit({"w1": ["a@b.com"]}, idx, set())
    assert s["blocked"] == 1
    assert "G8" in findings[0]["reason"]


def test_live_conversation_is_blocked():
    for stage in ("positive", "replied", "call_booked"):
        idx = {"a@b.com": {"handle": "@a", "stage": stage}}
        _, s = aw.audit({"w1": ["a@b.com"]}, idx, set())
        assert s["blocked"] == 1, stage


def test_any_tracked_lead_is_blocked_even_if_quarantined():
    idx = {"a@b.com": {"handle": "@a", "stage": "quarantined"}}
    _, s = aw.audit({"w1": ["a@b.com"]}, idx, set())
    assert s["blocked"] == 1


def test_banned_wealth_niche_is_blocked():
    for addr in ("invest.billionaire3@gmail.com", "millennialwealthsarah@gmail.com",
                 "forexsalary.india@gmail.com", "growasentrepreneurs@gmail.com"):
        _, s = aw.audit({"w1": [addr]}, {}, set())
        assert s["blocked"] == 1, addr


def test_clean_lead_passes():
    _, s = aw.audit({"w1": ["brandnew@creator.com"]}, {}, set())
    assert s["verdict"] == "CLEAR"
    assert s["clean"] == 1


# ------------------------------------------------------------ normalisation
def test_plus_tag_and_case_are_the_same_recipient():
    _, s = aw.audit({"w1": ["Biz+tag@Gmail.com"]}, {}, {"biz@gmail.com"})
    assert s["blocked"] == 1


# -------------------------------------------------------------------- volume
def test_volume_over_the_daily_cap_blocks_even_with_a_clean_list():
    emails = [f"new{i}@creator.com" for i in range(30)]
    _, s = aw.audit({"w1": emails}, {}, set(), cap=25)
    assert s["over_cap"] is True
    assert s["verdict"] == "BLOCKED"


def test_volume_within_cap_is_clear():
    emails = [f"new{i}@creator.com" for i in range(10)]
    _, s = aw.audit({"w1": emails}, {}, set(), cap=25)
    assert s["verdict"] == "CLEAR"


def test_cross_wave_duplicate_is_flagged():
    findings, _ = aw.audit({"w1": ["a@b.com"], "w2": ["a@b.com"]}, {}, set())
    assert any(f["severity"] == "WARN" and "duplicate" in f["reason"]
               for f in findings)


# ------------------------------------------------------------------ cli shape
def test_suppression_file_is_written(tmp_path):
    path = tmp_path / "waves.json"
    # millennialwealthsarah is banned-niche; clean@c.com passes every check
    path.write_text(json.dumps({"w1": ["millennialwealthsarah@gmail.com",
                                       "clean@c.com"]}), encoding="utf-8")
    out = tmp_path / "suppression.csv"
    rc = aw.main(["--waves", str(path), "--suppression-out", str(out)])
    assert rc == 1                       # blocked -> non-zero exit for CI
    text = out.read_text(encoding="utf-8")
    assert "millennialwealthsarah@gmail.com" in text
    assert "clean@c.com" not in text


def test_supported_config_shapes():
    assert aw.wave_emails({"waves": {"w1": {"emails": ["a@b.com"]}}}) == {"w1": ["a@b.com"]}
    assert aw.wave_emails({"w1": ["a@b.com"]}) == {"w1": ["a@b.com"]}
