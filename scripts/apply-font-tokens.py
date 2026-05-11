#!/usr/bin/env python3
"""Replace font-size / font-weight literals in SCSS with v.fs() / v.fw(). Skips _variables.scss."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"

_REM_PAIRS: list[tuple[str, str]] = [
    ("3.5rem", "t350"),
    ("3.25rem", "t325"),
    ("3rem", "t300"),
    ("2.5rem", "t250"),
    ("2.25rem", "t225"),
    ("2.125rem", "t2125"),
    ("2rem", "t200"),
    ("1.85rem", "3xl"),
    ("1.75rem", "t175"),
    ("1.7rem", "t170"),
    ("1.625rem", "t1625"),
    ("1.5rem", "2xl"),
    ("1.35rem", "t135"),
    ("1.3rem", "display-xs"),
    ("1.25rem", "xl"),
    ("1.125rem", "lg"),
    ("1.22rem", "t122"),
    ("1.2rem", "t120"),
    ("1.15rem", "t115"),
    ("1.1rem", "t110"),
    ("1.08rem", "t108"),
    ("1.0625rem", "md"),
    ("1.05rem", "lead"),
    ("1rem", "base"),
    ("0.98rem", "t098"),
    ("0.96875rem", "t96875"),
    ("0.95rem", "t095"),
    ("0.9375rem", "t9375"),
    ("0.92rem", "t092"),
    ("0.9rem", "body-sm"),
    ("0.88rem", "t088"),
    ("0.875rem", "sm"),
    ("0.86rem", "t086"),
    ("0.85rem", "t085"),
    ("0.84rem", "t084"),
    ("0.82rem", "t082"),
    ("0.8125rem", "t8125"),
    ("0.8rem", "t080"),
    ("0.78rem", "t078"),
    ("0.76rem", "t076"),
    ("0.75rem", "xs"),
    ("0.74rem", "t074"),
    ("0.72rem", "t072"),
    ("0.7rem", "t070"),
    ("0.6875rem", "t6875"),
    ("0.68rem", "t068"),
    ("0.65rem", "t065"),
    ("0.62rem", "t062"),
    ("0.6rem", "t060"),
    ("0.58rem", "t058"),
    ("0.5rem", "t050"),
    ("1.8rem", "t180"),
    ("0.625rem", "xxs"),
]

REM_TO_FS: list[tuple[str, str]] = sorted(_REM_PAIRS, key=lambda p: len(p[0]), reverse=True)

FW_REPLACE = [
    (re.compile(r"font-weight:\s*800\b"), "font-weight: v.fw(extrabold)"),
    (re.compile(r"font-weight:\s*700\b"), "font-weight: v.fw(bold)"),
    (re.compile(r"font-weight:\s*600\b"), "font-weight: v.fw(semibold)"),
    (re.compile(r"font-weight:\s*500\b"), "font-weight: v.fw(medium)"),
    (re.compile(r"font-weight:\s*400\b"), "font-weight: v.fw(regular)"),
]


def patch_font_size_line(line: str) -> str:
    if "font-size:" not in line or line.strip().startswith("//"):
        return line
    if "v.fs(" in line:
        return line
    if re.search(r"font-size:\s*inherit\b", line):
        return line
    if re.search(r"font-size:\s*var\(", line):
        return line
    if re.search(r"font-size:\s*clamp\([^)]*v\.fs\(", line):
        return line

    out = line
    if "font-size:" in out:
        out = out.replace("16px", "v.fs(base)")
        out = out.replace("12px", "v.fs(xs)")
    for rem, key in REM_TO_FS:
        if rem in out:
            out = out.replace(rem, f"v.fs({key})")
    return out


def patch_file(path: Path) -> bool:
    if path.name == "_variables.scss":
        return False
    text = path.read_text(encoding="utf-8")
    orig = text

    for rx, repl in FW_REPLACE:
        text = rx.sub(repl, text)

    lines = text.splitlines(keepends=True)
    new_lines: list[str] = []
    for line in lines:
        if "font-size:" in line:
            new_lines.append(patch_font_size_line(line))
        else:
            new_lines.append(line)
    text = "".join(new_lines)

    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = 0
    for path in sorted(ROOT.rglob("*.scss")):
        if patch_file(path):
            changed += 1
            print(path.relative_to(ROOT.parent))
    print(f"Updated {changed} files.")


if __name__ == "__main__":
    main()
