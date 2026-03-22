#!/usr/bin/env bash
# Create .venv in project root and install Pillow for generate_image_derivatives.py
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! python3 -m venv .venv 2>/dev/null; then
  echo "Failed: python3 -m venv. Install once: sudo apt install -y python3-venv" >&2
  exit 1
fi

"$ROOT/.venv/bin/pip" install -U pip
"$ROOT/.venv/bin/pip" install -r "$ROOT/scripts/requirements-images.txt"
echo ""
echo "OK. Generate WebP + thumbnails:"
echo "  $ROOT/.venv/bin/python $ROOT/scripts/generate_image_derivatives.py"
echo "Or: source .venv/bin/activate && python scripts/generate_image_derivatives.py"
