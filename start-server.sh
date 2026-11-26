#!/usr/bin/env bash
# Démarre un serveur local pour prévisualiser le site buildé (dist/)
cd "$(dirname "$0")"
PORT="${PORT:-8765}"
if [ ! -d "dist" ]; then
  echo "  Build Astro absent — exécution de npm run build..."
  npm run build
fi
echo ""
echo "  Portfolio Callisto Arts — serveur local (dist/)"
echo "  ------------------------------------------------"
echo "  http://127.0.0.1:$PORT"
echo ""
exec python3 -m http.server "$PORT" --directory dist --bind 0.0.0.0
