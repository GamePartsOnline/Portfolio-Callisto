#!/usr/bin/env python3
"""
Met à jour portfolio_images.json à partir des dossiers assets/images/.
- Garde les catégories existantes (avec au moins un fichier ou conservées).
- Liste des images = tous les fichiers JPG/JPEG/WebP/PNG présents dans les sous-dossiers.
- Préserve title, award, year des entrées existantes quand le chemin correspond.
"""
import json
import os

IMAGES_DIR = os.path.join(os.path.dirname(__file__), "assets", "images")
JSON_PATH = os.path.join(IMAGES_DIR, "portfolio_images.json")
ALLOWED_EXT = {".jpg", ".jpeg", ".webp", ".png"}


def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Index par chemin et par basename (pour fichiers déplacés)
    by_path = {}
    by_basename = {}
    for img in data.get("images", []):
        fn = img.get("filename", "")
        if fn:
            by_path[fn] = img
            by_basename[os.path.basename(fn)] = img

    # Parcourir les dossiers et lister les fichiers
    new_images = []
    used_original_paths = set()

    for folder in sorted(os.listdir(IMAGES_DIR)):
        dir_path = os.path.join(IMAGES_DIR, folder)
        if not os.path.isdir(dir_path):
            continue
        for name in os.listdir(dir_path):
            if name.startswith("."):
                continue
            ext = os.path.splitext(name)[1].lower()
            if ext not in ALLOWED_EXT:
                continue
            path_key = f"{folder}/{name}"
            existing = by_path.get(path_key)
            if not existing and name in by_basename:
                cand = by_basename[name]
                if cand.get("filename") not in used_original_paths:
                    existing = cand
            if existing:
                used_original_paths.add(existing.get("filename"))
                entry = {k: v for k, v in existing.items()}
                entry["filename"] = path_key
                entry["category"] = folder
            else:
                title = name.replace(ext, "").replace("_", " ").replace("-", " ").strip()
                if len(title) > 50:
                    title = title[:47] + "..."
                entry = {
                    "filename": path_key,
                    "category": folder,
                    "title": title or "Artwork",
                }
                if folder == "logo" or "logo" in name.lower():
                    entry["isLogo"] = True
            new_images.append(entry)

    # Trier par catégorie puis filename
    new_images.sort(key=lambda x: (x["category"], x["filename"]))

    data["images"] = new_images

    # Catégories : garder celles qui ont des images + logo
    folders_with_files = {img["category"] for img in new_images}
    existing_cats = {c["id"]: c for c in data.get("categories", [])}
    new_cats = []
    for cid in ["graphics", "paintover", "IA", "photo", "gaming", "tradi", "logo", "pastel-sec", "acrylique", "animation", "other"]:
        if cid in existing_cats:
            new_cats.append(existing_cats[cid])
        elif cid in folders_with_files or cid == "logo":
            label = {
                "graphics": "Graphics",
                "paintover": "Paintover",
                "IA": "IA Art",
                "photo": "Photos",
                "gaming": "Gaming Artwork",
                "tradi": "Traditional Arts",
                "logo": "Logo (masqué du portfolio)",
                "pastel-sec": "Pastel sec",
                "acrylique": "Acrylique",
                "animation": "Animation",
                "other": "Other",
            }.get(cid, cid)
            new_cats.append({"id": cid, "label": label})
    data["categories"] = new_cats

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("Catégories:", [c["id"] for c in data["categories"]])
    print("Images:", len(data["images"]))
    for img in data["images"]:
        print(" ", img["filename"], "->", img.get("title", "")[:40])


if __name__ == "__main__":
    main()
