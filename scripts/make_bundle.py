#!/usr/bin/env python3
"""Build jarvis_self_3man_bundle.zip — the deliverable the team downloads.

Run: python3 scripts/make_bundle.py
Out: jarvis_self_3man_bundle.zip (repo root)

Excludes build noise, secrets and large binaries; includes the app, workflows,
configs, docs and the workflow poster.
"""
import os
import zipfile

OUT = "jarvis_self_3man_bundle.zip"

INCLUDE_DIRS = [
    "jarvis-app/app",
    "jarvis-app/lib",
    "jarvis-app/config",
    "jarvis-app/scripts",
    "jarvis-app/public",
    "n8n",
    "config",
    "docs",
    "scripts",
    "assets",
]
INCLUDE_FILES = [
    "jarvis-app/package.json",
    "jarvis-app/package-lock.json",
    "jarvis-app/tsconfig.json",
    "jarvis-app/tailwind.config.js",
    "jarvis-app/next.config.js",
    "jarvis-app/vercel.json",
    "jarvis-app/middleware.ts",
    "jarvis-app/next-env.d.ts",
    "jarvis-app/.env.example",
    "jarvis-app/README.md",
    "README.md",
]

SKIP_DIRS = {
    "node_modules", ".next", ".git", "__pycache__", ".turbo",
    ".vercel", "coverage", "dist", "build", ".cache",
}
SKIP_EXT = {".pyc", ".pyo", ".log", ".zip", ".mp4", ".mov", ".psd"}
SKIP_NAMES = {".DS_Store", "package-lock.json.bak"}


def wanted(path: str) -> bool:
    parts = path.split(os.sep)
    if any(p in SKIP_DIRS for p in parts):
        return False
    if os.path.basename(path) in SKIP_NAMES:
        return False
    if os.path.splitext(path)[1].lower() in SKIP_EXT:
        return False
    if ".env" in os.path.basename(path) and not path.endswith(".env.example"):
        return False
    return True


def main() -> None:
    files: list[str] = []
    for base in INCLUDE_DIRS:
        if not os.path.isdir(base):
            continue
        for root, dirs, names in os.walk(base):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for name in names:
                p = os.path.join(root, name)
                if wanted(p):
                    files.append(p)

    for f in INCLUDE_FILES:
        if os.path.isfile(f) and wanted(f):
            files.append(f)

    files = sorted(set(files))

    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for f in files:
            z.write(f, f)

    size = os.path.getsize(OUT)
    print(f"{len(files)} files · {size/1_048_576:.2f}MB → {OUT}")


if __name__ == "__main__":
    main()
