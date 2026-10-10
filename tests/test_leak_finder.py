"""Pipeline ops: funnel semantics, leak naming, follow-up cadence, money parsing."""
from datetime import date

import pytest

import leak_finder as lf

TODAY = date(2026, 10, 10)


def row(**kw):
    base = {
        "handle": "@x", "status": "", "channel": "", "first_touch_date": "",
        "last_touch_date": "", "replies": "0", "audit_sent": "no", "call_date": "",
        "committed_date": "", "demand_V": "0", "gross": "", "operator_share": "",
        "conversion_score": "0", "tier": "P2", "notes": "", "monetization_verdict": "",
        "gate_result": "", "product": "", "price": "",
    }
    base.update(kw)
    return base


# ------------------------------------------------------------------ stage model
def test_contacted_lead_is_not_credited_with_a_reply():
    rows = [row(handle="@a", status="OUTREACH_SENT_P1 (Follow-up 2026-10-10)",
                first_touch_date="2026-10-08")]
    cum, counts = lf.funnel(rows)
    reached = {k: n for k, _, n in cum}
    assert reached["contacted"] == 1
    assert reached["replied"] == 0
    assert reached["paid"] == 0


def test_paid_stage_needs_real_cash_not_a_projected_range():
    # gross holds launch projections like "$29-$318" - that is not money in
    assert lf.stage_of(row(status="OUTREACH_SENT", gross="$29-$318")) == "contacted"
    assert lf.stage_of(row(status="PAID", gross="$127")) == "paid"


def test_terminal_statuses():
    assert lf.stage_of(row(status="COLD")) == "cold"
    assert lf.stage_of(row(status="DECLINED")) == "declined"
    assert lf.stage_of(row(status="HOLD")) == "hold"


def test_archived_leads_do_not_inflate_the_funnel():
    rows = [row(handle="@old", status="COLD"), row(handle="@new", status="OUTREACH_SENT")]
    cum, counts = lf.funnel(rows)
    reached = {k: n for k, _, n in cum}
    assert reached["contacted"] == 1


# ------------------------------------------------------------------ money parsing
@pytest.mark.parametrize("value,expected", [
    ("$127", 127.0), ("1,234.50", 1234.5), ("$0", 0.0),
    ("$29-$318", 0.0), ("UNVERIFIED", 0.0), ("", 0.0), (None, 0.0),
])
def test_money_only_accepts_a_single_clean_amount(value, expected):
    assert lf.money(value) == expected


# ---------------------------------------------------------------------- leak finder
def test_biggest_leak_is_the_contacted_to_reply_stage():
    rows = [row(handle=f"@c{i}", status="OUTREACH_SENT",
                first_touch_date="2026-10-08") for i in range(10)]
    leak = lf.biggest_leak(rows)
    assert leak["from"] == "contacted"
    assert leak["to"] == "replied"
    assert leak["rate"] == 0.0
    assert "hook" in leak["fix"].lower()


def test_no_leak_reported_when_every_stage_is_too_small_to_judge():
    rows = [row(handle="@a", status="OUTREACH_SENT", first_touch_date="2026-10-08")]
    assert lf.biggest_leak(rows) is None


def test_leak_fix_maps_every_stage_pair():
    pairs = {(f, t) for f, t, _, _ in lf.LEAK_FIXES}
    assert ("contacted", "replied") in pairs
    assert ("call_booked", "committed") in pairs
    for leak_from, leak_to, _, _ in lf.LEAK_FIXES:
        assert leak_from and leak_to


# ------------------------------------------------------------------- send queue
def test_tracker_recorded_followup_date_wins_over_the_cadence():
    # status says Oct 10, notes say Oct 12 - the recorded date is the plan
    rows = [row(handle="@a", status="OUTREACH_SENT_P1 (Follow-up 2026-10-10)",
                first_touch_date="2026-10-08", last_touch_date="2026-10-08",
                notes="Follow-up Touch 2 due Oct 12 if no reply.")]
    state = lf.touch_state(rows[0], TODAY)
    assert state["state"] == "TOUCH2_DUE"
    assert state["scheduled"] == date(2026, 10, 10)


def test_cadence_applies_when_no_date_is_recorded():
    rows = [row(handle="@a", status="OUTREACH_SENT",
                first_touch_date="2026-10-08", last_touch_date="2026-10-08")]
    assert lf.touch_state(rows[0], TODAY)["state"] == "WAIT"
    later = date(2026, 10, 12)
    assert lf.touch_state(rows[0], later)["state"] == "TOUCH2_DUE"


def test_touch_three_then_cold():
    # two touches sent (first Oct 1, follow-up Oct 5): Touch 3 falls due day 9
    r = row(handle="@a", status="OUTREACH_SENT", first_touch_date="2026-10-01",
            last_touch_date="2026-10-05")
    assert lf.touch_state(r, date(2026, 10, 14))["state"] == "TOUCH3_DUE"
    # Touch 2 sent Oct 5 -> Touch 3 (the graceful close) falls due day 9
    r2 = row(handle="@a", status="OUTREACH_SENT", first_touch_date="2026-10-01",
             last_touch_date="2026-10-05", notes="Touch 2 sent 2026-10-05")
    assert lf.touch_state(r2, date(2026, 10, 8))["state"] == "WAIT"
    assert lf.touch_state(r2, date(2026, 10, 10))["state"] == "TOUCH3_DUE"
    # Touch 3 sent -> sequence complete, then 10 days of silence means COLD (G8)
    r3 = row(handle="@a", status="OUTREACH_SENT", first_touch_date="2026-10-01",
             last_touch_date="2026-10-09", notes="Touch 3 sent 2026-10-09")
    assert lf.touch_state(r3, date(2026, 10, 12))["state"] == "SEQUENCE_DONE"
    assert lf.touch_state(r3, date(2026, 10, 19))["state"] == "COLD_STOP"


def test_queue_respects_the_daily_cap_and_orders_by_tier_then_score():
    rows = []
    for i, (tier, score) in enumerate([("P2", 99), ("P1", 80), ("P1", 95), ("P2", 10)]):
        rows.append(row(handle=f"@c{i}", tier=tier, conversion_score=str(score),
                        status="OUTREACH_SENT", first_touch_date="2026-10-01",
                        last_touch_date="2026-10-01",
                        channel="Email (a@b.com)" if i == 2 else "DM"))
    queue = lf.send_queue(rows, date(2026, 10, 12), cap=2)
    assert [q["handle"] for q in queue][:2] == ["@c2", "@c1"]   # P1 first, then score
    assert [q["send_today"] for q in queue] == [True, True, False, False]
    assert queue[0]["email"] == "a@b.com"


def test_touches_sent_is_counted_from_the_notes_convention():
    assert lf.touches_sent(row(first_touch_date="2026-10-08",
                               last_touch_date="2026-10-08")) == 1
    assert lf.touches_sent(row(first_touch_date="2026-10-08",
                               last_touch_date="2026-10-12")) == 2
    assert lf.touches_sent(row(first_touch_date="2026-10-08",
                               last_touch_date="2026-10-12",
                               notes="Touch 2 sent 2026-10-12. Touch 3 sent 2026-10-17")) == 3


def test_queue_ignores_cold_declined_and_staged_leads():
    rows = [
        row(handle="@cold", status="COLD", first_touch_date="2026-10-01",
            last_touch_date="2026-10-01"),
        row(handle="@no", status="DECLINED", first_touch_date="2026-10-01",
            last_touch_date="2026-10-01"),
        row(handle="@staged", status="DRAFT_STAGED", first_touch_date="2026-10-01",
            last_touch_date="2026-10-01"),
    ]
    assert lf.send_queue(rows, date(2026, 10, 20), cap=10) == []


def test_brief_reports_the_one_thing_and_the_cap():
    rows = [row(handle=f"@c{i}", status="OUTREACH_SENT",
                first_touch_date="2026-10-01", last_touch_date="2026-10-01",
                conversion_score="90", channel="Email (a@b.com)")
            for i in range(6)]
    brief = lf.daily_brief(rows, TODAY, cap=2)
    assert "DAILY BRIEF - 2026-10-10" in brief
    assert "cap 2" in brief
    assert "BIGGEST LEAK" in brief
    assert "ONE FIX" in brief
    assert "deferred" in brief


def test_email_extraction_from_channel_column():
    assert lf.email_of(row(channel="Email (lucianocasti27@gmail.com)")) == "lucianocasti27@gmail.com"
    assert lf.email_of(row(channel="DM")) == ""


# ------------------------------------------------------- quarantined / touches
def test_quarantined_is_a_terminal_state():
    assert lf.stage_of(row(status="QUARANTINED (raw-to-whop-48h) - untracked "
                                 "send found in Gmail")) == "quarantined"
    assert "quarantined" in lf.TERMINAL


def test_quarantined_lead_never_reaches_the_send_queue():
    """Quarantine means counted, not worked. It must never be re-pitched."""
    rows = [row(handle="@q", status="QUARANTINED (raw-to-whop-48h)",
                first_touch_date="2026-10-09", last_touch_date="2026-10-09",
                conversion_score="99", tier="P1")]
    assert lf.send_queue(rows, TODAY) == []


def test_a_lead_that_went_cold_or_quarantined_still_counts_as_a_touch():
    """The funnel counts a lead only at its most advanced stage, so a contacted
    lead that later went COLD or QUARANTINED drops out of 'contacted'. The kill
    criterion is per outreach TOUCH, so it needs the separate denominator."""
    rows = [
        row(handle="@live", status="OUTREACH_SENT", first_touch_date="2026-10-08"),
        row(handle="@cold", status="COLD", first_touch_date="2026-10-08"),
        row(handle="@quar", status="QUARANTINED (x)", first_touch_date="2026-10-09"),
    ]
    cum, _ = lf.funnel(rows)
    assert {k: n for k, _, n in cum}["contacted"] == 1   # the funnel sees one
    assert len(lf.touched(rows)) == 3                    # the operator sent three


def test_kill_criteria_not_evaluable_below_100_touches():
    rows = [row(handle=f"@h{i}", status="OUTREACH_SENT", first_touch_date="2026-10-08")
            for i in range(30)]
    kc = lf.kill_criteria(rows)
    assert kc["touches"] == 30
    assert kc["evaluable"] is False
    assert kc["triggered"] is False


def test_kill_criteria_triggers_at_100_touches_with_fewer_than_5_positives():
    rows = [row(handle=f"@h{i}", status="OUTREACH_SENT", first_touch_date="2026-10-08")
            for i in range(101)]
    rows[0]["status"] = "WARM (POSITIVE reply 2026-10-10)"
    rows[1]["status"] = "WARM (POSITIVE reply 2026-10-10)"
    kc = lf.kill_criteria(rows)
    assert kc["touches"] == 101
    assert kc["positives"] == 2
    assert kc["evaluable"] is True
    assert kc["triggered"] is True


def test_kill_criteria_clears_with_5_positives():
    rows = [row(handle=f"@h{i}", status="OUTREACH_SENT", first_touch_date="2026-10-08")
            for i in range(101)]
    for i in range(5):
        rows[i]["status"] = "WARM (POSITIVE reply 2026-10-10)"
    kc = lf.kill_criteria(rows)
    assert kc["triggered"] is False


def test_brief_tells_the_operator_to_stop_when_the_criterion_fires():
    rows = [row(handle=f"@h{i}", status="OUTREACH_SENT", first_touch_date="2026-10-08",
                last_touch_date="2026-10-08")
            for i in range(101)]
    brief = lf.daily_brief(rows, TODAY)
    assert "TRIGGERED - STOP ADDING VOLUME" in brief
    assert "do NOT send the queue above" in brief
