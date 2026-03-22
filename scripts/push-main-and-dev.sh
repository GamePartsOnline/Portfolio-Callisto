#!/usr/bin/env bash
# Publie main sur origin, puis aligne Dev sur main (force) sur origin.
# À lancer depuis la racine du dépôt : bash scripts/push-main-and-dev.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Push origin main"
git checkout main
git push origin main

echo "==> Force push origin Dev (= main)"
git checkout Dev
git reset --hard main
git push origin Dev --force

echo "==> OK"
git log -1 --oneline main
git log -1 --oneline Dev
git checkout main
