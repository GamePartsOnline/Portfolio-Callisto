#!/usr/bin/env python3
"""Déplace les fichiers du portfolio vers le dossier indiqué par filename dans le JSON."""
import json
import os
import shutil

IMAGES_DIR = os.path.join(os.path.dirname(__file__), "assets", "images")
JSON_PATH = os.path.join(IMAGES_DIR, "portfolio_images.json")


def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Index: basename -> [(full_path, folder), ...] pour tous les sous-dossiers
    def list_all_files():
        index = {}
        for root, _, files in os.walk(IMAGES_DIR):
            rel_root = os.path.relpath(root, IMAGES_DIR)
            if rel_root == ".":
                continue
            for name in files:
                if name in (".gitkeep", "README.md", "portfolio_images.json"):
                    continue
                full = os.path.join(root, name)
                index.setdefault(name, []).append((full, rel_root))
        return index

    by_basename = list_all_files()

    for img in data.get("images", []):
        filename = img.get("filename", "")
        if "/" not in filename:
            continue
        target_full = os.path.join(IMAGES_DIR, filename)
        target_dir = os.path.dirname(target_full)
        basename = os.path.basename(filename)
        if os.path.isfile(target_full):
            continue
        candidates = by_basename.get(basename, [])
        for src, from_folder in candidates:
            if not os.path.isfile(src):
                continue
            os.makedirs(target_dir, exist_ok=True)
            shutil.move(src, target_full)
            print("OK:", from_folder + "/" + basename, "->", filename)
            by_basename[basename] = [(target_full, os.path.dirname(filename))]
            break
        else:
            print("Manquant:", filename)

    print("Sync terminé.")


if __name__ == "__main__":
    main()
