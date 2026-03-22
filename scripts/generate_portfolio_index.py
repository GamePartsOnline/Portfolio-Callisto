#!/usr/bin/env python3
"""
Régénère docs/portfolio_images_INDEX.md à partir de assets/images/portfolio_images.json
(tableau catégorie | fichier | titre + stats par catégorie).
"""
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "assets/images/portfolio_images.json"
OUT_PATH = ROOT / "docs/portfolio_images_INDEX.md"


def main():
    with open(JSON_PATH, encoding="utf-8") as f:
        data = json.load(f)

    cats = {c["id"]: c.get("label", c["id"]) for c in data.get("categories", [])}
    images = data.get("images", [])

    lines = [
        "# Index — `portfolio_images.json`",
        "",
        "Table générée à partir de **`assets/images/portfolio_images.json`** (liste des œuvres : catégorie, fichier, titre).",
        "",
        "> **Régénérer** après modification du JSON :",
        "> ```bash",
        "> python3 scripts/generate_portfolio_index.py",
        "> ```",
        "",
        "## Statistiques",
        "",
        f"- **Nombre d’entrées** dans `images` : **{len(images)}**",
        "",
    ]

    by_cat = Counter(i.get("category", "?") for i in images)
    lines.append("| Catégorie (`id`) | Libellé | Nb |")
    lines.append("|------------------|---------|-----|")
    for cid, n in sorted(by_cat.items(), key=lambda x: (-x[1], x[0])):
        lbl = cats.get(cid, cid)
        lines.append(f"| `{cid}` | {lbl} | {n} |")

    lines.extend(
        [
            "",
            "## Tableau complet",
            "",
            "| Catégorie | Fichier | Titre |",
            "|-----------|---------|-------|",
        ]
    )

    for i in sorted(images, key=lambda x: (x.get("category", ""), x.get("filename", ""))):
        cat = i.get("category", "")
        fn = (i.get("filename") or "").replace("|", "\\|")
        title = (i.get("title") or "—").replace("|", "\\|")
        if i.get("isLogo"):
            title = f"{title} *(logo)*"
        lines.append(f"| `{cat}` | `{fn}` | {title} |")

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"OK → {OUT_PATH} ({len(images)} images)")


if __name__ == "__main__":
    main()
