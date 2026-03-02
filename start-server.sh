#!/usr/bin/env bash
# Démarre un serveur local pour prévisualiser le portfolio
cd "$(dirname "$0")"
PORT="${PORT:-8765}"
echo ""
echo "  Portfolio Callisto Arts — serveur local"
echo "  ---------------------------------------"
echo "  Ouvre ton navigateur à l’adresse :"
echo ""
echo "    http://127.0.0.1:$PORT"
echo ""
echo "  Ou depuis un autre appareil (même réseau) :"
echo "    http://$(hostname -I 2>/dev/null | awk '{print $1}'):$PORT"
echo ""
echo "  Arrêt : Ctrl+C"
echo ""
exec python3 -m http.server "$PORT" --bind 0.0.0.0
