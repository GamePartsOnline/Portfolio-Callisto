#!/usr/bin/env bash
# Encode une démo en WebM VP9 + Opus pour la lightbox (voir docs/MEDIA_WEBM.md).
# Usage: ./scripts/encode_demo_webm.sh <fichier_source> <youtube_id_11_chars>
set -euo pipefail

src="${1:?Usage: $0 <input.mp4|mkv|...> <youtube_id>}"
yid="${2:?Usage: $0 <input> <youtube_id_11_chars>}"

if [[ ${#yid} -ne 11 ]]; then
  echo "Erreur: l'id YouTube doit faire 11 caractères (reçu: ${#yid})." >&2
  exit 1
fi

root="$(cd "$(dirname "$0")/.." && pwd)"
out_dir="${root}/assets/videos/webm"
out="${out_dir}/${yid}.webm"

mkdir -p "${out_dir}"

echo "Sortie: ${out}"
ffmpeg -y -i "${src}" \
  -c:v libvpx-vp9 -crf 32 -b:v 0 -row-mt 1 -cpu-used 2 \
  -c:a libopus -b:a 96k \
  -vf "scale='min(1920,iw)':-2" \
  "${out}"

echo "OK. Dans portfolio_images.json, ajoute \"localWebm\": true sur l'entrée avec youtubeId \"${yid}\"."
