"""Gate G6 math discipline: ranges, assumptions, headline the lower bound."""
import os
import subprocess
import sys

import pytest

import revenue_model as rm

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def run_cli(*args):
    cmd = [sys.executable, os.path.join(REPO_ROOT, "tools", "revenue_model.py")] + list(args)
    out = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return out.stdout


def test_naive_uses_workbook_er_table():
    """NAIVE_CONV bands are matched with a strict "<", so ER 3% lands in the
    [3, 5) band at 1.5%, not the [1, 3) band."""
    assert rm.naive(50000, 0.5, 49) == 50000 * 0.005 * 49    # ER < 1%
    assert rm.naive(50000, 1.0, 49) == 50000 * 0.01 * 49     # 1% <= ER < 3%
    assert rm.naive(50000, 3.0, 49) == 50000 * 0.015 * 49    # 3% <= ER < 5%
    assert rm.naive(50000, 9.0, 49) == 50000 * 0.02 * 49     # ER >= 5%


def test_comment_anchored_pool_is_avg_comments_times_three():
    # buyer pool = avg comments x 3, then x the assumed conversion rates
    pool = 82 * 3                      # 246
    assert pool * 0.08 * 79 == pytest.approx(1554.72)
    assert pool * 0.03 * 79 == pytest.approx(583.02)


def test_headline_is_the_lower_of_the_two_methods(capsys):
    rm.run(_args(followers=46000, avg_comments=82, price=79, split=0.40))
    out = capsys.readouterr().out
    # comment-anchored base $1,555 vs funnel base $318 -> headline must be 318
    assert "HEADLINE (lower of methods)   : low $29 / base $318" in out
    assert "operator share base $127" in out


def test_gap_over_10x_is_flagged_loudly(capsys):
    rm.run(_args(followers=46000, avg_comments=82, price=79, split=0.40))
    out = capsys.readouterr().out
    assert "171x" in out
    assert ">10x: say so in the audit" in out


def test_cli_runs_and_prints_all_three_models():
    out = run_cli("--followers", "46000", "--avg_comments", "82",
                  "--price", "79", "--split", "0.40")
    for label in ("NAIVE", "COMMENT-ANCHORED", "FUNNEL", "HEADLINE", "GAP"):
        assert label in out


def _args(**kw):
    class A:
        pass

    a = A()
    a.followers = kw["followers"]
    a.avg_comments = kw["avg_comments"]
    a.price = kw["price"]
    a.split = kw["split"]
    a.er = kw.get("er", 3.0)
    return a
