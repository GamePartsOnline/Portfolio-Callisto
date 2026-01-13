#!/bin/bash
# Script pour télécharger toutes les images du site callistoarts.com

OUTPUT_DIR="/home/flowtech/The_Hacking_Project/Mes-repo/Portfolio/assets/images"
BASE_URL="https://callistoarts.com"

mkdir -p "$OUTPUT_DIR"
cd "$OUTPUT_DIR"

echo "=========================================="
echo "Téléchargement des images depuis callistoarts.com"
echo "=========================================="
echo ""

# Liste des URLs d'images trouvées dans les requêtes réseau
IMAGES=(
    "https://callistoarts.com/wp-content/uploads/2025/12/IMG_0899-1240x817.jpg"
    "https://callistoarts.com/wp-content/uploads/2022/11/cropped-elevation-finale-scaled-1.jpg"
)

# Télécharger chaque image
for img_url in "${IMAGES[@]}"; do
    filename=$(basename "$img_url" | cut -d'?' -f1)
    echo "Téléchargement: $filename"
    curl -L -o "$filename" "$img_url" 2>/dev/null && echo "  ✓ Succès" || echo "  ✗ Échec"
done

echo ""
echo "Exploration des pages pour trouver plus d'images..."

# Pages à explorer
PAGES=(
    "$BASE_URL"
    "$BASE_URL/digital-painting-demoscene/"
    "$BASE_URL/animation-video/"
    "$BASE_URL/montage-video-demoscene/"
    "$BASE_URL/photos/"
    "$BASE_URL/traditional-arts/"
    "$BASE_URL/gaming-artwork/"
)

# Extraire les URLs d'images de chaque page
for page in "${PAGES[@]}"; do
    echo "Analyse de: $page"
    # Extraire les URLs d'images avec grep
    curl -s "$page" | grep -oE 'https://callistoarts\.com/wp-content/uploads/[^"'\'' ]+\.(jpg|jpeg|png|gif|webp)' | sort -u | while read img_url; do
        filename=$(basename "$img_url" | cut -d'?' -f1)
        if [ ! -f "$filename" ]; then
            echo "  Téléchargement: $filename"
            curl -L -o "$filename" "$img_url" 2>/dev/null && echo "    ✓ Succès" || echo "    ✗ Échec"
            sleep 0.5
        else
            echo "  ⊘ Déjà présent: $filename"
        fi
    done
    sleep 1
done

echo ""
echo "=========================================="
echo "Téléchargement terminé!"
echo "Dossier: $OUTPUT_DIR"
echo "=========================================="
ls -lh "$OUTPUT_DIR" | tail -n +2 | wc -l | xargs echo "Nombre d'images téléchargées:"
