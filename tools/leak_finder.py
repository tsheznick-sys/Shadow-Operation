#!/usr/bin/env python3
"""Pipeline ops for the Shadow Operation Agent Kit (prompts/07_pipeline_ops.md).

Implements the three things the kit tells the operator to run every day but had
no code for:

  leaks   - stage-to-stage funnel conversion + the single biggest leak + its fix
  queue   - who is due for Touch 2 / Touch 3 today, inside the daily send cap
  brief   - the DAILY BRIEF (money, replies waiting, tomorrow's sends, leaks, risks)

Usage:
    python tools/leak_finder.py leaks   [--file templates/creator_tracker.csv]
    python tools/leak_finder.py queue   [--today 2026-10-10] [--cap 8]
    python tools/leak_finder.py brief   [--today 2026-10-10]

Everything the kit marks as an ASSUMPTION is labelled ASSUMPTION here. The
tracker is the only source of truth; nothing is fetched, nothing is sent.
"""
import argparse
import csv
import os
import re
import sys
from datetime import date, datetime

TRACKER_DEFAULT = os.path.join("templates", "creator_tracker.csv")

# Cumulative funnel stages, in order. A lead sits at its most advanced stage.
STAGES = [
    ("scouted", "Scouted / vetted"),
    ("staged", "Draft staged (not sent)"),
    ("contacted", "Contacted (touch 1 sent)"),
    ("replied", "Replied"),
    ("positive", "Positive reply"),
    ("audit_sent", "Audit sent"),
    ("call_booked", "Call booked"),
    ("test_running", "Demand test running"),
    ("committed", "Committed (written)"),
    ("paid", "Paid"),
]

TERMINAL = ("declined", "cold", "hold")

# prompts/07: "biggest leak -> ONE fix". Rates are ASSUMPTIONS until the
# operator's own 100+ sends replace them.
LEAK_FIXES = [
    ("contacted", "replied",
     "targeting / hook / timing",
     "Re-write the first-touch hook for the top 10 P1 leads using one verifiable "
     "observation each (prompts/02). Do not send more volume into a broken hook."),
    ("replied", "positive",
     "offer clarity / trust",
     "The reply handler is losing them: shorten the ask to one rung and answer the "
     "real objection in the first sentence (prompts/02 objection library)."),
    ("positive", "audit_sent",
     "delivery friction",
     "Send the audit inside the reply thread, same hour, one link, no attachment."),
    ("audit_sent", "call_booked",
     "weak audit or ask too big",
     "Rebuild the audit around 3 verifiable observations and drop the ask to a "
     "15-minute call, nothing else."),
    ("call_booked", "committed",
     "split / trust / reliability",
     "Run the reliability screen (prompts/02) and disclose the split on the call "
     "before anything is signed."),
    ("test_running", "committed",
     "niche / product fit",
     "One re-test with a changed problem framing (prompts/04), then change niche "
     "class if it fails again."),
    ("committed", "paid",
     "product / price / traffic",
     "Fix execution QA before D1: logged-out checkout test, daily creator "
     "checklist, link-sticker map (prompts/06)."),
]

# prompts/02 follow-up cadence: touch 2 at day 4, touch 3 at day 9, then COLD.
# These are the DEFAULT cadence; a follow-up date written in the tracker itself
# always wins, because the tracker is the operator's actual plan.
TOUCH2_DAY = 4
TOUCH3_DAY = 9
COLD_DAY = 10

# Convention: the operator records each follow-up as "Touch N sent YYYY-MM-DD" in
# notes. Without it the tracker only knows first vs last touch, which caps the
# counter at 2 and would re-schedule follow-ups forever.
_TOUCH_SENT = re.compile(r"Touch\s+(\d)\s+sent", re.I)

# Only a date explicitly framed as a follow-up counts. Matching any ISO date in
# notes would mistake "Touch 2 sent 2026-10-05" for a scheduled follow-up.
_ISO_DATE = re.compile(r"follow[^.]{0,40}?(20\d{2}-\d{2}-\d{2})", re.I)
_MONTH_DATE = re.compile(
    r"follow[^.]{0,40}?\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})\b",
    re.I)
_MONTHS = {m: i + 1 for i, m in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"])}


# --------------------------------------------------------------------------- io
def load_rows(filepath):
    if not os.path.exists(filepath):
        raise SystemExit(f"tracker not found: {filepath}")
    with open(filepath, newline="", encoding="utf-8") as f:
        return [dict(r) for r in csv.DictReader(f)]


def _num(value, default=0.0):
    try:
        return float(str(value).replace("$", "").replace(",", "").strip())
    except (TypeError, ValueError):
        return default


# Only a single clean amount counts as money. Ranges ("$29-$318"), "UNVERIFIED"
# and blanks must never be read as cash - the tracker's gross column holds
# projected launch ranges, not received payments.
_MONEY = re.compile(r"^\$?\s*-?[\d,]+(\.\d+)?$")


def money(value, default=0.0):
    s = str(value if value is not None else "").strip()
    if not _MONEY.match(s):
        return default
    try:
        return float(s.replace("$", "").replace(",", ""))
    except ValueError:
        return default


def _int(value, default=0):
    return int(_num(value, default))


def _date(value):
    value = (value or "").strip()
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def email_of(row):
    channel = (row.get("channel") or "").strip()
    if channel.lower().startswith("email") and "(" in channel:
        return channel.split("(", 1)[1].rstrip(")").strip()
    return ""


def handle(row):
    return (row.get("handle") or "").strip()


# ---------------------------------------------------------------------- staging
def _stage_from_signals(row):
    """Map the raw tracker columns onto a stage, ignoring status keywords."""
    if (row.get("committed_date") or "").strip():
        return "committed"
    if "LAUNCH" in (row.get("status") or "").upper():
        return "launching"
    if "BUILD" in (row.get("status") or "").upper():
        return "building"
    if "TEST" in (row.get("status") or "").upper() or _num(row.get("demand_V")) > 0:
        return "test_running"
    if (row.get("call_date") or "").strip() or "CALL" in (row.get("status") or "").upper():
        return "call_booked"
    if ((row.get("audit_sent") or "").strip().lower() == "yes"
            or "AUDIT" in (row.get("status") or "").upper()):
        return "audit_sent"
    if "WARM" in (row.get("status") or "").upper() or "POSITIVE" in (row.get("status") or "").upper():
        return "positive"
    if _num(row.get("replies")) > 0:
        return "replied"
    return None


def stage_of(row):
    """Most advanced pipeline stage a row has reached."""
    status = (row.get("status") or "").upper()
    if "DECLINED" in status:
        return "declined"
    if "COLD" in status:
        return "cold"
    if "HOLD" in status or "BLOCK" in status:
        return "hold"
    if "PAID" in status or money(row.get("gross")) > 0:
        return "paid"
    from_signals = _stage_from_signals(row)
    if from_signals:
        return from_signals
    if "OUTREACH_SENT" in status or "SENT" in status:
        return "contacted"
    if "DRAFT_STAGED" in status:
        return "staged"
    return "scouted"


def stage_counts(rows):
    counts = {key: 0 for key, _ in STAGES}
    for key in TERMINAL:
        counts[key] = 0
    for row in rows:
        counts[stage_of(row)] += 1
    return counts


def funnel(rows):
    """Cumulative counts: how many leads have REACHED each stage.

    A lead is counted at its most advanced stage only, so "reached replied" means
    every lead sitting at replied or beyond. Summing forward would wrongly credit
    a lead that is still only "contacted" with having replied.
    """
    counts = stage_counts(rows)
    reached, running = {}, 0
    for key, _ in reversed(STAGES):
        running += counts[key]
        reached[key] = running
    out = [(key, label, reached[key]) for key, label in STAGES]
    return out, counts


# ------------------------------------------------------------------------- leaks
def stage_rates(rows):
    """(from_stage, to_stage, from_n, to_n, rate) for each consecutive pair."""
    cum, _ = funnel(rows)
    pairs = []
    for i in range(len(cum) - 1):
        (fk, _, fn), (tk, _, tn) = cum[i], cum[i + 1]
        pairs.append((fk, tk, fn, tn, (tn / fn) if fn else None))
    return pairs


def biggest_leak(rows):
    """Name the single biggest leak and the ONE fix for it (prompts/07)."""
    pairs = stage_rates(rows)
    live = [(f, t, fn, tn, r) for f, t, fn, tn, r in pairs if fn >= 5 and tn < fn]
    if not live:
        return None
    f, t, fn, tn, rate = min(live, key=lambda p: p[4])
    for lf, lt, fix_name, fix_text in LEAK_FIXES:
        if lf == f and lt == t:
            return {
                "from": f, "to": t, "from_n": fn, "to_n": tn, "rate": rate,
                "leak": fix_name, "fix": fix_text,
            }
    return {"from": f, "to": t, "from_n": fn, "to_n": tn, "rate": rate,
            "leak": "unnamed stage", "fix": "Inspect this stage by hand."}


# ------------------------------------------------------------------ send queue
def followup_date(row, today):
    """The follow-up date the tracker itself records, if any.

    Reads "(Follow-up 2026-10-10)" in status and "Follow-up Touch 2 due Oct 12"
    in notes. Month names are resolved against `today` so a stale year never
    schedules a send in the past or far future.
    """
    text = f"{row.get('status') or ''} {row.get('notes') or ''}"
    m = _ISO_DATE.search(text)
    if m:
        return _date(m.group(1))
    m = _MONTH_DATE.search(text)
    if m:
        month = _MONTHS.get(m.group(1)[:3].lower())
        if month:
            try:
                cand = date(today.year, month, int(m.group(2)))
            except ValueError:
                return None
            if (cand - today).days > 60:      # clearly last year
                cand = date(today.year - 1, month, int(m.group(2)))
            return cand
    return None


def touches_sent(row):
    """How many touches have actually gone out (1 = first touch only).

    Floor is derived from first_touch_date vs last_touch_date; any
    "Touch N sent <date>" markers in notes raise it. prompts/02 caps a sequence
    at 3 touches, then the lead goes COLD.
    """
    first, last = _date(row.get("first_touch_date")), _date(row.get("last_touch_date"))
    n = 1
    if first and last and last > first:
        n = 2
    text = f"{row.get('notes') or ''} {row.get('status') or ''}"
    for m in _TOUCH_SENT.findall(text):
        n = max(n, int(m))
    return n


def touch_state(row, today, touch2_day=TOUCH2_DAY, touch3_day=TOUCH3_DAY,
                cold_day=COLD_DAY):
    """Where a contacted lead sits on the follow-up cadence.

    Priority: a follow-up date recorded in the tracker itself, else the day-based
    cadence from prompts/02 (Touch 2 at day 4, Touch 3 at day 9, then COLD).
    A lead is never re-contacted after its 3-touch sequence completes (Gate G8).
    """
    first = _date(row.get("first_touch_date"))
    last = _date(row.get("last_touch_date")) or first
    if first is None:
        return {"state": "NO_TOUCH_DATE", "days": None, "touch": 0, "scheduled": None}

    touches = touches_sent(row)
    days_since = (today - last).days
    scheduled = followup_date(row, today)

    if touches >= 3:
        state = "COLD_STOP" if days_since >= cold_day else "SEQUENCE_DONE"
    elif scheduled is not None:
        state = ("WAIT" if scheduled > today
                 else "TOUCH3_DUE" if touches >= 2 else "TOUCH2_DUE")
    elif touches >= 2:
        state = "TOUCH3_DUE" if days_since >= (touch3_day - touch2_day) else "WAIT"
    else:
        state = "TOUCH2_DUE" if days_since >= touch2_day else "WAIT"

    return {"state": state, "days": days_since, "touch": touches,
            "first_touch": first, "last_touch": last, "scheduled": scheduled}


def send_queue(rows, today, cap=8, tier_first=True, touch2_day=TOUCH2_DAY,
               touch3_day=TOUCH3_DAY, cold_day=COLD_DAY):
    """Leads due for a follow-up today, ordered by score then days waiting."""
    due = []
    for row in rows:
        stage = stage_of(row)
        if stage not in ("contacted", "replied"):
            continue
        state = touch_state(row, today, touch2_day, touch3_day, cold_day)
        if state["state"] not in ("TOUCH2_DUE", "TOUCH3_DUE"):
            continue                      # WAIT / SEQUENCE_DONE / COLD_STOP
        due.append({
            "handle": handle(row),
            "email": email_of(row),
            "tier": (row.get("tier") or "").strip(),
            "stage": stage,
            "due": state["state"],
            "days_since_touch": state["days"],
            "scheduled": state["scheduled"].isoformat() if state["scheduled"] else "",
            "touch": state["touch"] + 1,
            "score": _num(row.get("conversion_score")),
            "verdict": (row.get("monetization_verdict") or row.get("gate_result") or "").strip(),
            "first_touch": row.get("first_touch_date", ""),
            "product": (row.get("product") or "").strip(),
            "price": (row.get("price") or "").strip(),
        })
    if tier_first:
        tier_rank = {"P1": 0, "P1_NEW_APIFY": 1, "P2": 2, "P2_NEW_APIFY": 3}
        due.sort(key=lambda d: (tier_rank.get(d["tier"], 9), -d["score"], -d["days_since_touch"]))
    else:
        due.sort(key=lambda d: -d["days_since_touch"])
    for i, item in enumerate(due):
        item["send_today"] = i < cap
        item["queue_position"] = i + 1
    return due


# ------------------------------------------------------------------------ brief
def pipeline_value(rows):
    """Operator share (base case) sitting in contacted-or-better stages."""
    total = 0.0
    for row in rows:
        if stage_of(row) in ("contacted", "replied", "positive", "audit_sent",
                             "call_booked", "test_running", "committed"):
            total += money(row.get("operator_share"))
    return total


def money_in(rows):
    return sum(money(r.get("operator_share")) for r in rows if stage_of(r) == "paid")


def daily_brief(rows, today, cap=8, touch2_day=TOUCH2_DAY, touch3_day=TOUCH3_DAY,
                cold_day=COLD_DAY):
    counts = stage_counts(rows)
    cum, _ = funnel(rows)
    leak = biggest_leak(rows)
    queue = send_queue(rows, today, cap=cap, touch2_day=touch2_day,
                       touch3_day=touch3_day, cold_day=cold_day)
    today_sends = [q for q in queue if q["send_today"]]
    overflow = [q for q in queue if not q["send_today"]]
    waiting = [r for r in rows if _num(r.get("replies")) > 0]

    lines = []
    lines.append(f"# DAILY BRIEF - {today.isoformat()}")
    lines.append("")
    lines.append(f"1. MONEY: ${money_in(rows):,.0f} verified in (paid partnerships). "
                 f"Pipeline at risk if nothing converts: ${pipeline_value(rows):,.0f} of "
                 f"base-case operator share sitting in contacted-or-better leads "
                 f"(ASSUMPTION, sum of the tracker's operator_share column - "
                 f"not a forecast).")
    lines.append(f"2. REPLIES WAITING (SLA 1h): {len(waiting)}"
                 + ("" if not waiting else " -> " + ", ".join(handle(r) for r in waiting)))
    lines.append(f"3. TODAY'S SENDS (cap {cap}, human-sent, Gate G4): {len(today_sends)}")
    for q in today_sends:
        lines.append(f"   - {q['handle']} <{q['email']}> touch {q['touch']} "
                     f"({q['due']}, {q['days_since_touch']}d silent, "
                     f"score {q['score']:.0f}, {q['tier']})")
    if overflow:
        lines.append("   deferred to stay inside the cap: "
                     + ", ".join(q["handle"] for q in overflow))
    lines.append(f"4. LAUNCHES LIVE: {counts.get('launching', 0)}")
    lines.append("5. FUNNEL (at stage): " + " > ".join(
        f"{key} {counts[key]}" for key, _ in STAGES if counts[key]))
    if leak:
        lines.append(f"6. BIGGEST LEAK: {leak['from']} -> {leak['to']} "
                     f"({leak['to_n']}/{leak['from_n']} = {leak['rate']:.1%}) = {leak['leak']}")
        lines.append(f"   ONE FIX: {leak['fix']}")
    else:
        lines.append("6. BIGGEST LEAK: none measurable yet (no stage has 5+ leads).")
    lines.append("7. BIGGEST RISK: 0 replies at 48h+ on a 29-send batch. "
                 "Do not add volume until the hook is fixed (kill criteria: <5 positive "
                 "replies per 100 compliant touches).")
    lines.append("8. THE ONE THING: send Touch 2 to the P1 queue above, then re-run "
                 "`python tools/leak_finder.py leaks` after the replies land.")
    lines.append("")
    return "\n".join(lines)


# --------------------------------------------------------------------------- cli
def _print_leaks(rows):
    cum, counts = funnel(rows)
    print("FUNNEL (cumulative, from templates/creator_tracker.csv)")
    print(f"  {'stage':<14}{'at stage':>10}{'cumulative':>12}")
    for key, label in STAGES:
        print(f"  {key:<14}{counts[key]:>10}{dict((k, n) for k, _, n in cum)[key]:>12}")
    print()
    print("STAGE-TO-STAGE CONVERSION")
    for f, t, fn, tn, rate in stage_rates(rows):
        if fn == 0:
            continue
        flag = "  <-- LEAK" if rate is not None and rate < 0.05 and fn >= 5 else ""
        print(f"  {f:<14}-> {t:<14} {tn:>4}/{fn:<4} = "
              f"{rate:.1%}{flag}")
    print()
    leak = biggest_leak(rows)
    if leak:
        print(f"BIGGEST LEAK: {leak['from']} -> {leak['to']} "
              f"({leak['to_n']}/{leak['from_n']} = {leak['rate']:.1%})")
        print(f"  leak type : {leak['leak']}")
        print(f"  ONE FIX   : {leak['fix']}")
    else:
        print("BIGGEST LEAK: none measurable yet (no stage has 5+ leads).")
    print()
    print("TERMINAL / PARKED")
    for key in TERMINAL:
        names = [handle(r) for r in rows if stage_of(r) == key]
        if names:
            print(f"  {key:<10} {len(names):>3}  {', '.join(names[:8])}"
                  + (" ..." if len(names) > 8 else ""))
    print()
    print("NOTE: every rate above is an ASSUMPTION (prompts/07). Only compare "
          "variants with 100+ sends each.")


def _print_queue(queue, cap):
    print(f"SEND QUEUE (cap {cap}/day, human-sent only - Gate G4)")
    if not queue:
        print("  nothing due today")
        return
    for q in queue:
        mark = "SEND" if q["send_today"] else "hold"
        print(f"  [{mark}] {q['queue_position']:>2}. {q['handle']:<28} "
              f"touch {q['touch']}  {q['due']:<12} {q['days_since_touch']:>3}d silent  "
              f"score {q['score']:.0f}  {q['tier']:<14} {q['email']}")
    print()
    print("  Rules: one ask per message, touch 2 adds NEW value, touch 3 is a "
          "graceful close, then COLD. Never contact after a 'no' (G8).")


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("command", nargs="?", default="leaks",
                   choices=["leaks", "queue", "brief"])
    p.add_argument("--file", default=TRACKER_DEFAULT)
    p.add_argument("--today", default=date.today().isoformat())
    p.add_argument("--cap", type=int, default=8,
                   help="daily human-send cap for the primary Gmail (default 8)")
    p.add_argument("--touch2-day", type=int, default=TOUCH2_DAY,
                   help="days after last touch before Touch 2 (prompts/02: 4)")
    p.add_argument("--touch3-day", type=int, default=TOUCH3_DAY,
                   help="days after Touch 2 before Touch 3 (prompts/02: 9)")
    p.add_argument("--cold-day", type=int, default=COLD_DAY,
                   help="days of silence after which a lead goes COLD")
    a = p.parse_args(argv)

    rows = load_rows(a.file)
    today = _date(a.today) or date.today()

    if a.command == "leaks":
        _print_leaks(rows)
    elif a.command == "queue":
        _print_queue(send_queue(rows, today, cap=a.cap, touch2_day=a.touch2_day,
                                touch3_day=a.touch3_day, cold_day=a.cold_day), a.cap)
    else:
        print(daily_brief(rows, today, cap=a.cap, touch2_day=a.touch2_day,
                          touch3_day=a.touch3_day, cold_day=a.cold_day))
    return 0


if __name__ == "__main__":
    sys.exit(main())
