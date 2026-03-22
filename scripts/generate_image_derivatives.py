#!/usr/bin/env python3
"""
Generate WebP thumbnails and full-size WebP copies for portfolio images.

Layout (must match script.js: assetImageThumbPath / assetImageWebpFullPath):
  assets/images/thumbs/<subdirs>/<basename>-thumb.webp
  assets/images/webp/<subdirs>/<basename>.webp

Source files stay under assets/images/<subdirs>/<file> as referenced in portfolio_images.json.

Usage:
  python3 -m venv .venv && . .venv/bin/activate && pip install -r scripts/requirements-images.txt
  python scripts/generate_image_derivatives.py
  # Or: sudo apt install -y python3-pil   # system Pillow, no venv
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps

    try:
        _LANCZOS = Image.Resampling.LANCZOS
    except AttributeError:  # Pillow < 9.1
        _LANCZOS = Image.LANCZOS
except ImportError:
    print(
        "Install Pillow, e.g.:\n"
        "  python3 -m venv .venv && . .venv/bin/activate && pip install -r scripts/requirements-images.txt\n"
        "  sudo apt install -y python3-pil          # alternative: system package\n",
        file=sys.stderr,
    )
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
IMAGES_DIR = ROOT / "assets" / "images"
JSON_PATH = IMAGES_DIR / "portfolio_images.json"
THUMB_ROOT = IMAGES_DIR / "thumbs"
WEBP_ROOT = IMAGES_DIR / "webp"

THUMB_MAX_SIDE = 400
THUMB_QUALITY = 82
FULL_QUALITY = 85

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp"}


def thumb_dest_path(relative: str) -> Path:
    rel = Path(relative)
    stem = rel.stem
    name = f"{stem}-thumb.webp"
    return THUMB_ROOT / rel.parent / name


def webp_full_dest_path(relative: str) -> Path:
    rel = Path(relative)
    stem = rel.stem
    return WEBP_ROOT / rel.parent / f"{stem}.webp"


def open_image(path: Path) -> Image.Image:
    im = Image.open(path)
    im = ImageOps.exif_transpose(im)
    return im


def save_webp(im: Image.Image, dest: Path, quality: int) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    out = im
    if out.mode == "P":
        out = out.convert("RGBA")
    elif out.mode == "L":
        out = out.convert("RGB")
    elif out.mode == "LA":
        out = out.convert("RGBA")
    elif out.mode not in ("RGB", "RGBA"):
        out = out.convert("RGB")
    out.save(dest, "WEBP", quality=quality, method=6)


def process_one(relative: str, dry_run: bool) -> str:
    rel_norm = relative.replace("\\", "/").strip("/")
    src = IMAGES_DIR / rel_norm
    if not src.is_file():
        return f"missing source: {rel_norm}"
    if src.suffix.lower() not in ALLOWED_EXT:
        return f"skip type {src.suffix}: {rel_norm}"

    if dry_run:
        print(f"  [dry-run] would write {thumb_dest_path(rel_norm)} + {webp_full_dest_path(rel_norm)}")
        return "ok"

    im = open_image(src)
    # Thumbnail (fit inside THUMB_MAX_SIDE box)
    thumb = im.copy()
    thumb.thumbnail((THUMB_MAX_SIDE, THUMB_MAX_SIDE), _LANCZOS)
    tpath = thumb_dest_path(rel_norm)
    save_webp(thumb, tpath, THUMB_QUALITY)

    # Full-size WebP (same pixels, re-encoded)
    fpath = webp_full_dest_path(rel_norm)
    save_webp(im, fpath, FULL_QUALITY)
    print(f"  ok: {rel_norm}")
    return "ok"


def main() -> int:
    parser = argparse.ArgumentParser(description="Build WebP thumbs + full WebP for portfolio JSON.")
    parser.add_argument("--dry-run", action="store_true", help="List actions without writing files.")
    args = parser.parse_args()

    if not JSON_PATH.is_file():
        print(f"Missing {JSON_PATH}", file=sys.stderr)
        return 1

    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    images = data.get("images") or []

    ok = 0
    skipped = 0
    for entry in images:
        if entry.get("hidden") is True:
            continue
        rel = entry.get("filename")
        if not rel:
            continue
        status = process_one(rel, args.dry_run)
        if status == "ok":
            ok += 1
        else:
            print(f"  {status}")
            skipped += 1

    print(f"Done: {ok} processed, {skipped} skipped/messages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
