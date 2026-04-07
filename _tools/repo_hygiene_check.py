#!/usr/bin/env python3
"""Heuristic hygiene check for borjamoskv_site.

Detects local-machine leakage and accidental technical debris before it lands in Git.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

TEXT_EXTENSIONS = {
    ".css",
    ".html",
    ".js",
    ".json",
    ".md",
    ".mjs",
    ".py",
    ".toml",
    ".txt",
    ".webmanifest",
    ".yml",
}

FORBIDDEN_LOCAL_PATTERNS = {
    "absolute local path": re.compile(r"/Users/[^/\n]+"),
    "CORTEX workspace path": re.compile(r"/30_CORTEX\b"),
    "venv binary path": re.compile(r"\.venv/bin/"),
}

FORBIDDEN_RUNTIME_PATTERNS = {
    "direct localhost websocket": re.compile(
        r"new\s+WebSocket\(\s*['\"]ws://(?:localhost|127\.0\.0\.1)"
    ),
    "direct localhost http fetch": re.compile(
        r"fetch\(\s*`?['\"]http://(?:localhost|127\.0\.0\.1)"
    ),
    "raw localhost return": re.compile(
        r"return\s+['\"]ws://(?:localhost|127\.0\.0\.1)"
    ),
}

ROOT_FORBIDDEN_NAMES = {
    "copy_backup.py",
    "purge_white.py",
    "outfit.zip",
}

ROOT_FORBIDDEN_GLOBS = (
    "cortex_*.py",
    "forge_*.py",
)


def tracked_files() -> list[Path]:
    result = subprocess.run(
        ["git", "ls-files"],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return [REPO_ROOT / line for line in result.stdout.splitlines() if line]


def line_number(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def text_issues(path: Path) -> list[str]:
    if not path.exists():
        return []
    if path.suffix not in TEXT_EXTENSIONS:
        return []
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return []

    issues: list[str] = []
    rel_path = path.relative_to(REPO_ROOT)

    for label, pattern in FORBIDDEN_LOCAL_PATTERNS.items():
        for match in pattern.finditer(text):
            issues.append(
                f"{rel_path}:{line_number(text, match.start())}: forbidden {label}"
            )

    for label, pattern in FORBIDDEN_RUNTIME_PATTERNS.items():
        for match in pattern.finditer(text):
            issues.append(
                f"{rel_path}:{line_number(text, match.start())}: forbidden {label}"
            )

    return issues


def font_issues(path: Path) -> list[str]:
    if not path.exists():
        return []
    if path.suffix.lower() not in {".ttf", ".otf", ".woff", ".woff2"}:
        return []
    try:
        head = path.read_bytes()[:512]
    except OSError:
        return []

    lowered = head.lower().lstrip()
    html_signatures = (b"<!doctype html", b"<html", b"<head", b"<meta", b"<script")
    if any(lowered.startswith(sig) for sig in html_signatures):
        rel_path = path.relative_to(REPO_ROOT)
        return [f"{rel_path}: font asset is actually HTML"]
    return []


def root_issues() -> list[str]:
    issues: list[str] = []

    for name in ROOT_FORBIDDEN_NAMES:
        if (REPO_ROOT / name).exists():
            issues.append(f"{name}: forbidden root artifact present")

    for pattern in ROOT_FORBIDDEN_GLOBS:
        for path in REPO_ROOT.glob(pattern):
            if path.is_file():
                issues.append(f"{path.name}: forbidden root artifact present")

    return issues


def main() -> int:
    issues = root_issues()

    for path in tracked_files():
        issues.extend(text_issues(path))
        issues.extend(font_issues(path))

    if issues:
        print("Repo hygiene check failed:\n")
        for issue in sorted(set(issues)):
            print(f"- {issue}")
        return 1

    print("Repo hygiene check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
