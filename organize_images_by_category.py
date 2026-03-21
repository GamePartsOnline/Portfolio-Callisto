#!/usr/bin/env python3
"""Range les images de assets/images dans des sous-dossiers par catégorie (portfolio_images.json)."""
import json
import os
import shutil

IMAGES_DIR = os.path.join(os.path.dirname(__file__), "assets", "images")
JSON_PATH = os.path.join(IMAGES_DIR, "portfolio_images.json")
KEEP_IN_ROOT = {".gitkeep", "README.md", "portfolio_images.json"}


def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Dossiers de catégories (ids du JSON)
    category_ids = {c["id"] for c in data["categories"]}
    moved_filenames = set()

    for cat_id in category_ids:
        os.makedirs(os.path.join(IMAGES_DIR, cat_id), exist_ok=True)
    os.makedirs(os.path.join(IMAGES_DIR, "other"), exist_ok=True)

    # Déplacer chaque image du portfolio dans son dossier catégorie
    for img in data["images"]:
        old_name = img["filename"]
        # Si déjà avec sous-dossier (ex: "graphics/fichier.jpg"), ignorer
        if "/" in old_name:
            continue
        cat = img.get("category", "other")
        if cat not in category_ids:
            cat = "other"
        src = os.path.join(IMAGES_DIR, old_name)
        if not os.path.isfile(src):
            print("Skip (absent):", old_name)
            continue
        dest_dir = os.path.join(IMAGES_DIR, cat)
        dest = os.path.join(dest_dir, old_name)
        shutil.move(src, dest)
        img["filename"] = f"{cat}/{old_name}"
        moved_filenames.add(old_name)
        print("OK:", old_name, "->", cat + "/")

    # Déplacer les fichiers restants (non portfolio) dans other
    for name in os.listdir(IMAGES_DIR):
        path = os.path.join(IMAGES_DIR, name)
        if os.path.isfile(path) and name not in KEEP_IN_ROOT and name not in moved_filenames:
            dest = os.path.join(IMAGES_DIR, "other", name)
            shutil.move(path, dest)
            print("Other:", name)

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("portfolio_images.json mis à jour avec les chemins catégorie/filename.")


if __name__ == "__main__":
    main()
