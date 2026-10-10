#!/usr/bin/env python3
"""Honest revenue ranges for a creator launch. ALL rates are ASSUMPTIONS: replace with your own data.
Usage: python revenue_model.py --followers 50000 --avg_comments 40 --price 49 --split 0.40 [--er 4]"""
import argparse

NAIVE_CONV = [(1, .005), (3, .01), (5, .015), (999, .02)]  # workbook ER->conversion table

def naive(f, er, price):
    c = next(c for t, c in NAIVE_CONV if er < t)
    return f * c * price

def run(a):
    n = naive(a.followers, a.er, a.price)
    pool = a.avg_comments * 3
    ca = {k: pool * r * a.price for k, r in (("low", .03), ("base", .08), ("high", .15))}
    fn = {}
    for k, (v, c, s) in {"low": (.02, .02, .02), "base": (.035, .05, .05), "high": (.05, .10, .10)}.items():
        viewers = a.followers * v          # unique story viewers
        sales = viewers * c * s            # unique clickers x checkout rate
        fn[k] = sales * a.price
    print(f"Creator: {a.followers:,} followers | avg comments {a.avg_comments} | price ${a.price} | operator share {a.split:.0%}")
    print(f"NAIVE (workbook formula)      : ${n:,.0f} gross  <- treat as marketing, not forecast")
    for name, d in (("COMMENT-ANCHORED (pool x 3)", ca), ("FUNNEL (views x click x buy)", fn)):
        print(f"{name:30s}: " + " | ".join(f"{k} ${v:,.0f}" for k, v in d.items()))
    low = min(ca["low"], fn["low"]); base = min(ca["base"], fn["base"])
    print(f"HEADLINE (lower of methods)   : low ${low:,.0f} / base ${base:,.0f} -> operator share base ${base*a.split:,.0f}")
    gap = n / base if base else float('inf')
    print(f"GAP naive vs base: {gap:,.0f}x" + ("  !! >10x: say so in the audit" if gap > 10 else ""))

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--followers", type=int, required=True)
    p.add_argument("--avg_comments", type=float, required=True)
    p.add_argument("--price", type=float, default=49)
    p.add_argument("--split", type=float, default=0.40)
    p.add_argument("--er", type=float, default=3.0, help="engagement rate %% (for naive method only)")
    run(p.parse_args())
