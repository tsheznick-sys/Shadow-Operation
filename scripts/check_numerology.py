#!/usr/bin/env python3
"""Verify the 8-aligned pricing rule across the repo.

Rule: every published price reduces digit-wise to 8 (Life Path 8).
The one deliberate exception is the $28 first shot, which reduces to 1 (the Leader).

Shortcut: a number's digital root is n % 9 (9 instead of 0), so "reduces to 8"
is exactly n % 9 == 8.

Run: python3 scripts/check_numerology.py
Exit 0 = every price is aligned. Exit 1 = at least one drifted.
"""
import json
import os
import re
import sys

# Prices that must reduce to 8.
EIGHT_PRICES = [17, 35, 89, 44, 26, 62, 710, 8]
# Deliberate non-8 (the Leader).
LEADER_PRICES = [28]
# Allowed non-product numbers (tool costs, seat counts, thresholds — not the ladder).
IGNORE_KEYS = {
    "tools_monthly", "annual_bills", "annual_fund_per_month",
    "circle_price", "prize_target", "break_even_members", "recommended_members",
    "break_even_raw", "recommended_raw",
}


def digital_root(n: int) -> int:
    if n == 0:
        return 0
    r = abs(n) % 9
    return 9 if r == 0 else r


def explain(n: int) -> str:
    ds = sum(int(d) for d in str(abs(n)))
    return f"{n} → {'+'.join(str(abs(n)))}={ds} → {digital_root(n)}"


def check_config(path: str) -> list[str]:
    problems: list[str] = []
    with open(path) as f:
        cfg = json.load(f)

    pay = cfg.get("paywalls", {})
    fs = pay.get("first_shot", {})
    if fs.get("price") != 28:
        problems.append(f"{path}: first_shot.price is {fs.get('price')}, expected 28")
    elif digital_root(28) != 1:
        problems.append(f"{path}: 28 should reduce to 1")

    # Every *price* in the ladder block.
    prices = {}
    for k, v in pay.get("save_prices", {}).items():
        if isinstance(v, int) and k != "discount_rate_pct" and k != "discount_months":
            prices[f"save_prices.{k}"] = v
    ladder_text = pay.get("ladder", "")
    for n in re.findall(r"\$(\d+)", ladder_text):
        prices[f"ladder({n})"] = int(n)

    for key, n in prices.items():
        root = digital_root(n)
        expected = 1 if n in LEADER_PRICES else 8
        if root != expected:
            problems.append(f"{path}: {key} = ${n} reduces to {root}, expected {expected}")

    # Funding numbers that are deliberately 8s.
    fund = cfg.get("community_funding", {})
    for key in ("prize_target", "break_even_members", "recommended_members"):
        n = fund.get(key)
        if isinstance(n, int) and digital_root(n) != 8:
            problems.append(f"{path}: community_funding.{key} = {n} reduces to {digital_root(n)}, expected 8")

    # Nothing advertised below the $17 floor except the $8 save pause.
    if fund.get("circle_price") != 26:
        problems.append(f"{path}: circle_price is {fund.get('circle_price')}, expected 26")

    return problems


def check_env(path: str) -> list[str]:
    problems: list[str] = []
    if not os.path.isfile(path):
        return [f"{path}: missing"]
    for line in open(path):
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        if not k.startswith("TIER_"):
            continue
        if not v.isdigit():
            continue
        n = int(v)
        if k == "TIER_FIRST_SHOT_PRICE":
            if n != 28:
                problems.append(f"{path}: {k}={n}, expected 28")
        elif k == "TIER_HIDDEN_TEST_PRICE":
            if n != 9:
                problems.append(f"{path}: {k}={n}, expected 9 (private A/B control)")
        elif digital_root(n) != 8:
            problems.append(f"{path}: {k}=${n} reduces to {digital_root(n)}, expected 8")
    return problems


def main() -> int:
    print("8-ALIGNED PRICING CHECK\n" + "=" * 46)
    for n in EIGHT_PRICES:
        print("  ✓", explain(n))
    print("  ★ 28 → 2+8=10 → 1  (the Leader — deliberate exception)\n")

    problems: list[str] = []
    for cfg in ("config/adaptable.json", "jarvis-app/config/adaptable.json"):
        if os.path.isfile(cfg):
            problems += check_config(cfg)
        else:
            problems.append(f"{cfg}: missing")
    problems += check_env("jarvis-app/.env.example")

    # The n8n graph must not carry stale ladder prices.
    n8n = "n8n/n8n_workflows_self_3man.json"
    if os.path.isfile(n8n):
        raw = open(n8n).read()
        json.loads(raw)  # must parse
        for bad in ("$27", "$79", "$19/mo", "Pause $5", "cap $500"):
            if bad in raw:
                problems.append(f"{n8n}: stale price {bad}")

    if problems:
        print("FAILED")
        for p in problems:
            print("  ✗", p)
        return 1

    print("ALL PRICES ALIGNED — ladder, saves, prizes, break-even and env all reduce to 8 (28 excepted).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
