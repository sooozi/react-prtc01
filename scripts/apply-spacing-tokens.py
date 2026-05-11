#!/usr/bin/env python3
"""
Replace rem/px literals in margin, padding, gap, column-gap, row-gap (and common longhands)
with v.space(<key>) where keys match src/styles/_variables.scss $spacing map.
Skips lines containing clamp(, var(, calc(, #, minmax(, % when ambiguous.
Adds @use "@/styles/variables" as v; if missing (after first @use).
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"

# float rem -> canonical Sass key (must match $spacing in _variables.scss)
REM_TO_KEY: dict[float, str] = {
    0.05: "r005",
    0.12: "r012",
    0.125: "xxs",
    0.15: "r015",
    0.18: "r018",
    0.2: "r020",
    0.25: "xs",
    0.28: "r028",
    0.3: "r030",
    0.32: "r032",
    0.35: "r035",
    0.38: "r038",
    0.4: "r040",
    0.42: "r042",
    0.45: "r045",
    0.48: "r048",
    0.5: "sm",
    0.55: "r055",
    0.58: "r058",
    0.6: "r060",
    0.62: "r062",
    0.65: "r065",
    0.7: "r070",
    0.72: "r072",
    0.75: "md",
    0.78: "r078",
    0.82: "r082",
    0.85: "r085",
    0.875: "input-block",
    0.9: "r090",
    0.95: "r095",
    1.0: "lg",
    1.05: "r105",
    1.1: "table-y",
    1.125: "input-inline",
    1.15: "r115",
    1.2: "r120",
    1.25: "xl",
    1.35: "r135",
    1.4: "r140",
    1.5: "2xl",
    1.55: "r155",
    1.65: "r165",
    1.75: "loft",
    1.85: "r185",
    2.0: "3xl",
    2.25: "r225",
    2.5: "4xl",
    3.0: "5xl",
    4.0: "6xl",
    4.25: "r425",
}

# px -> key
PX_TO_KEY = {
    2: "px2",
    3: "px3",
    10: "px10",
}

PROP_PREFIXES = (
    "margin",
    "padding",
    "gap",
    "column-gap",
    "row-gap",
    "scroll-margin",
    "scroll-padding",
)

REM_TOKEN = re.compile(r"^(-?)(\d+\.?\d*|\.\d+)rem$")
PX_TOKEN = re.compile(r"^(-?)(\d+)px$")

DECL = re.compile(
    r"^(\s*)(margin|padding|gap|column-gap|row-gap|scroll-margin|scroll-padding)(-[a-z-]+)?\s*:\s*(.+?)\s*;\s*(//.*)?$"
)


def replace_value(value: str) -> str | None:
    if any(
        x in value
        for x in (
            "clamp(",
            "var(",
            "calc(",
            "minmax(",
            "#{",
            "linear-gradient",
            "rgba(",
            "color-mix(",
        )
    ):
        return None
    if "%" in value and "rem" not in value and "px" not in value:
        return None

    parts = value.split()
    out: list[str] = []
    changed = False

    for raw in parts:
        tok = raw.strip()
        if not tok:
            continue
        m = REM_TOKEN.match(tok)
        if m:
            neg, num_s = m.groups()
            num = round(float(num_s), 4)
            key = REM_TO_KEY.get(num)
            if key is None:
                return None
            if neg:
                out.append(f"calc(-1 * v.space({key}))")
            else:
                out.append(f"v.space({key})")
            changed = True
            continue
        m = PX_TOKEN.match(tok)
        if m:
            neg, num_s = m.groups()
            num = int(num_s)
            key = PX_TO_KEY.get(num)
            if key is None:
                out.append(raw)
                continue
            if neg:
                out.append(f"calc(-1 * v.space({key}))")
            else:
                out.append(f"v.space({key})")
            changed = True
            continue
        out.append(raw)

    if not changed:
        return None
    return " ".join(out)


def ensure_variables_use(lines: list[str]) -> list[str]:
    if any("@use" in ln and '"@/styles/variables"' in ln or "'@/styles/variables'" in ln for ln in lines):
        return lines
    # skip _variables.scss itself
    return lines


def process_file(path: Path) -> bool:
    if path.resolve() == (SRC / "styles" / "_variables.scss").resolve():
        return False
    text = path.read_text(encoding="utf-8")

    lines = text.splitlines(keepends=True)
    new_lines: list[str] = []
    modified = False
    has_v_use = any("@/styles/variables" in ln for ln in lines)

    for line in lines:
        m = DECL.match(line.rstrip("\n"))
        if m:
            indent, prop, longhand, value = m.group(1), m.group(2), m.group(3) or "", m.group(4)
            trail = m.group(5) or ""
            nv = replace_value(value.strip())
            if nv is not None:
                suf = "\n" if line.endswith("\n") else ""
                new_lines.append(f"{indent}{prop}{longhand}: {nv};{trail}{suf}")
                modified = True
                continue
        new_lines.append(line)

    if not modified:
        return False

    if not has_v_use and path.suffix == ".scss" and "_variables.scss" not in str(path):
        out2: list[str] = []
        inserted = False
        for ln in new_lines:
            out2.append(ln)
            if not inserted and ln.strip().startswith("@use "):
                out2.append('@use "@/styles/variables" as v;\n')
                inserted = True
        if not inserted:
            out2.insert(0, '@use "@/styles/variables" as v;\n')
        new_lines = out2

    path.write_text("".join(new_lines), encoding="utf-8")
    return True


def main() -> int:
    changed = 0
    for path in sorted(SRC.rglob("*.scss")):
        if process_file(path):
            print("updated", path.relative_to(ROOT))
            changed += 1
    print("files changed:", changed)
    return 0


if __name__ == "__main__":
    sys.exit(main())
