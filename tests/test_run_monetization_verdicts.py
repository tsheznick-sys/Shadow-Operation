"""The verdict engine must be importable and runnable from any directory."""
import os
import subprocess
import sys

TOOLS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools")


def test_tri_model_headline_is_the_lower_bound():
    sys.path.insert(0, TOOLS)
    import run_monetization_verdicts as rmv

    tm = rmv.tri_model_revenue(46000, 4.2, 82, 79)
    assert tm["hl_low"] == min(tm["ca_low"], tm["fn_low"])
    assert tm["hl_base"] == min(tm["ca_base"], tm["fn_base"])
    assert tm["op_base"] == pytest_approx(tm["hl_base"] * 0.40)
    assert tm["pool"] == 246
    # the naive workbook number must be exposed as inflated, not hidden
    assert tm["gap_x"] > 10


def pytest_approx(value):
    import pytest
    return pytest.approx(value)


def test_script_runs_from_a_foreign_cwd_and_regenerates_identical_output(tmp_path):
    repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target = os.path.join(repo, "MONETIZATION_VERDICTS.md")
    before = open(target, encoding="utf-8").read()
    out = subprocess.run([sys.executable, os.path.join(TOOLS, "run_monetization_verdicts.py")],
                         capture_output=True, text=True, cwd=str(tmp_path))
    assert out.returncode == 0, out.stderr
    assert "29 full creator assessments" in out.stdout
    assert open(target, encoding="utf-8").read() == before
