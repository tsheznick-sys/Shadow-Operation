"""Make tools/ importable for the test suite regardless of the invocation cwd."""
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS_DIR = os.path.join(REPO_ROOT, "tools")

for path in (REPO_ROOT, TOOLS_DIR):
    if path not in sys.path:
        sys.path.insert(0, path)
