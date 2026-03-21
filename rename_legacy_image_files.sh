#!/usr/bin/env bash
# Renomme les fichiers locaux pour coller à portfolio_images.json (titres → slugs).
# Exécuter depuis Portfolio-Callisto/ :  bash rename_legacy_image_files.sh
set -euo pipefail
BASE="assets/images"

mv -v "$BASE/graphics/339435602_905924634051246_6940335715669469411_n.jpg" "$BASE/graphics/howl-of-the-forest-2023.jpg"
# (doublon Luna Fly retiré du portfolio — fichier 344736827_… supprimé du JSON)
mv -v "$BASE/graphics/376688281_353500107001250_6102064824076954240_n.jpg" "$BASE/graphics/between-dream-and-reality-2023.jpg"
mv -v "$BASE/graphics/Callisto_Pascals-lemur-leap_step-finale-2048x1152.jpg" "$BASE/graphics/pascals-lemur-leap-2025.jpg"
mv -v "$BASE/graphics/Chromatic.jpg" "$BASE/graphics/chromatique-resonance-2024.jpg"
mv -v "$BASE/graphics/oeil_de_tigre.jpg" "$BASE/graphics/tigre-by-callisto-2016.jpg"
mv -v "$BASE/graphics/IAinercia.jpg" "$BASE/graphics/ia-inercia-2975-2025.jpg"
# You Seem So Delicious → graphics/b2c6.287706.jpg (portfolio_images.json)
mv -v "$BASE/graphics/cropped-elevation-finale-scaled-1.jpg" "$BASE/graphics/elevation-2079-2022.jpg"
mv -v "$BASE/graphics/paintover2024_callisto_refresh_step05.jpg" "$BASE/graphics/refresh-2024.jpg"
mv -v "$BASE/graphics/rift.jpg" "$BASE/graphics/the-rift-2021.jpg"
mv -v "$BASE/graphics/sky_code.jpg" "$BASE/graphics/sky-code-2025.jpg"
mv -v "$BASE/paintover/c6ce.pl187430.jpg" "$BASE/paintover/sharp-eyes-by-callisto-2016.jpg"
mv -v "$BASE/graphics/3f29.85342.jpg" "$BASE/graphics/pacman-to-space-2015.jpg"
mv -v "$BASE/photo/312518226_10228185642768590_4918581913671770871_n-1024x652.jpg" "$BASE/photo/digital-painting-2023.jpg"
mv -v "$BASE/photo/Callisto_convergence-1024x510.jpg" "$BASE/photo/convergence-2023.jpg"
mv -v "$BASE/photo/Callisto_photo_revision2023-1024x547.jpg" "$BASE/photo/photo-revision-2023-2023.jpg"
mv -v "$BASE/photo/dino.jpg" "$BASE/photo/dino-sort-2025.jpg"

echo "OK — pense à déployer les fichiers renommés avec le JSON."
