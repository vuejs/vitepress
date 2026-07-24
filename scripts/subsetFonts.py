#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["fonttools>=4.63", "brotli"]
# ///
"""Regenerate the default theme's Inter webfont subsets.

Reads the subset definitions from scripts/fontSubsets.json, downloads the
pinned Inter release (cached in node_modules/.cache/inter), verifies that
every non-PUA codepoint of the full font is covered by some subset, writes
the woff2 files into src/client/theme-default/fonts, and regenerates the
@font-face declarations in the theme's fonts.css.

Usage: scripts/subsetFonts.py
"""

import io
import json
import sys
import urllib.request
import zipfile
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

INTER_VERSION = "4.1"

ROOT = Path(__file__).resolve().parent.parent
SUBSETS_JSON = ROOT / "scripts" / "fontSubsets.json"
FONTS_DIR = ROOT / "src" / "client" / "theme-default" / "fonts"
FONTS_CSS = ROOT / "src" / "client" / "theme-default" / "styles" / "fonts.css"
CACHE_DIR = ROOT / "node_modules" / ".cache" / "inter"

STYLES = {
    "italic": ("InterVariable-Italic.ttf", "italic"),
    "roman": ("InterVariable.ttf", "normal"),
}

# Inter maps its internal alternate glyphs into the Private Use Area. These
# are intentionally not shipped: they are not real text, and declaring PUA
# unicode-ranges would let Inter shadow icon fonts that live there.
PUA = range(0xE000, 0xF8FF + 1)

BASE_VAR = """\
:root {
  --vp-font-family-base:
    'Inter', -apple-system, BlinkMacSystemFont, sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}
"""

CJK_BASE_VAR = """\
[lang]:where(:lang(zh), :lang(ja), :lang(ko)) {
  --vp-font-family-base:
    'Inter4CJK', -apple-system, BlinkMacSystemFont, sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}
"""

# used instead of everything else in this file when `useWebFonts` is enabled
# (only the content between the markers survives) - see
# src/node/plugins/webFontsPlugin.ts. There is no Inter4CJK on Google Fonts,
# so CJK documents use the regular Inter there.
WEBFONT_IMPORT = f"""\
/* webfont-marker-begin */
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

{BASE_VAR}\
/* webfont-marker-end */
"""

# The `cjkExclusions` key of the json lists characters that have both a
# Western (proportional) and an East Asian (em-square) form with no
# encoding-level distinction - mostly East Asian Ambiguous punctuation and
# symbols (UAX #11). The generated Inter4CJK faces reuse the same font files
# but leave these out of their unicode-ranges so that CJK fonts render them
# in CJK documents. References:
# https://www.unicode.org/L2/L2014/14006-sv-western-vs-cjk.pdf
# https://www.unicode.org/L2/L2018/18013-svs-proposal.pdf
# https://www.unicode.org/L2/L2018/18073-svs-proposal.pdf
# https://www.unicode.org/L2/L2023/23212r-quotes-svs-proposal.pdf
# https://github.com/w3c/clreq/blob/gh-pages/local.css
# & U+2015 (used like U+2014 in Japanese), U+203B (Japanese reference mark),
# U+007E (zh's request; both forms are fine in ja because it is unused there)
CJK_COMMENT = """\
/* Inter4CJK reuses the files above, but leaves out characters that should
   be rendered by CJK fonts in CJK documents - see scripts/subsetFonts.py */
"""


def parse_ranges(value: str) -> set[int]:
    cps: set[int] = set()
    for part in value.split(","):
        lo, _, hi = part.strip().removeprefix("U+").partition("-")
        cps.update(range(int(lo, 16), int(hi or lo, 16) + 1))
    return cps


def format_ranges(cps: set[int]) -> str:
    ranges: list[tuple[int, int]] = []
    start = prev = -2
    for cp in sorted(cps):
        if cp != prev + 1:
            if start >= 0:
                ranges.append((start, prev))
            start = cp
        prev = cp
    ranges.append((start, prev))
    return ", ".join(
        f"U+{lo:04X}" if lo == hi else f"U+{lo:04X}-{hi:04X}" for lo, hi in ranges
    )


def download_release() -> Path:
    release_dir = CACHE_DIR / f"Inter-{INTER_VERSION}"
    zip_path = CACHE_DIR / f"Inter-{INTER_VERSION}.zip"
    if not zip_path.exists():
        url = f"https://github.com/rsms/inter/releases/download/v{INTER_VERSION}/Inter-{INTER_VERSION}.zip"
        print(f"downloading {url}")
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(url) as res:
            zip_path.write_bytes(res.read())
    with zipfile.ZipFile(zip_path) as zf:
        for file, _ in STYLES.values():
            if not (release_dir / file).exists():
                zf.extract(file, release_dir)
    return release_dir


def check_coverage(release: Path, subsets: dict[str, str]) -> None:
    covered = set().union(*(parse_ranges(v) for v in subsets.values()))
    ok = True
    for file, _ in STYLES.values():
        cmap = set(TTFont(release / file).getBestCmap())
        missing = sorted(cp for cp in cmap - covered if cp not in PUA)
        if missing:
            ok = False
            print(f"{file}: {len(missing)} codepoints not covered by any subset:")
            print("  " + ", ".join(f"U+{cp:04X}" for cp in missing))
    if not ok:
        sys.exit("add the missing codepoints to a subset in scripts/fontSubsets.json")


def build_subsets(release: Path, subsets: dict[str, str]) -> None:
    for style, (file, _) in STYLES.items():
        for name, value in subsets.items():
            options = subset.Options()
            options.flavor = "woff2"
            options.layout_features = [*options.layout_features, "pnum", "tnum"]
            font = subset.load_font(release / file, options)
            subsetter = subset.Subsetter(options)
            subsetter.populate(unicodes=parse_ranges(value))
            subsetter.subset(font)
            buf = io.BytesIO()
            subset.save_font(font, buf, options)
            out = FONTS_DIR / f"inter-{style}-{name}.woff2"
            changed = not out.exists() or out.read_bytes() != buf.getvalue()
            if changed:
                out.write_bytes(buf.getvalue())
            print(
                f"{out.name:36} {font['maxp'].numGlyphs:4} glyphs "
                f"{buf.tell() / 1024:6.1f} KB{'' if changed else '  (unchanged)'}"
            )


def face(family: str, css_style: str, file: str, ranges: str) -> str:
    return (
        "@font-face {\n"
        f"  font-family: {family};\n"
        f"  font-style: {css_style};\n"
        "  font-weight: 100 900;\n"
        "  font-display: swap;\n"
        f"  src: url('../fonts/{file}') format('woff2');\n"
        f"  unicode-range: {ranges};\n"
        "}\n"
    )


def write_css(subsets: dict[str, str], cjk_exclusions: set[int]) -> None:
    inter = []
    cjk = []
    for style, (_, css_style) in STYLES.items():
        for name, value in subsets.items():
            file = f"inter-{style}-{name}.woff2"
            inter.append(face("Inter", css_style, file, value.replace(",", ", ")))
            cjk_cps = parse_ranges(value) - cjk_exclusions
            if cjk_cps:
                cjk.append(
                    face("Inter4CJK", css_style, file, format_ranges(cjk_cps))
                )

    FONTS_CSS.write_text(
        f"{WEBFONT_IMPORT}\n"
        "/* Generated by scripts/subsetFonts.py from scripts/fontSubsets.json */\n\n"
        + "\n".join(inter)
        + f"\n{CJK_COMMENT}\n"
        + "\n".join(cjk)
        + f"\n{BASE_VAR}\n{CJK_BASE_VAR}"
    )


def main() -> None:
    subsets: dict[str, str] = json.loads(SUBSETS_JSON.read_text())
    cjk_exclusions = parse_ranges(subsets.pop("cjkExclusions"))
    release = download_release()
    check_coverage(release, subsets)
    build_subsets(release, subsets)
    write_css(subsets, cjk_exclusions)
    print(f"\nwrote {len(subsets) * len(STYLES)} subsets and {FONTS_CSS.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
