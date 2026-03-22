# Images du Portfolio Callisto Arts

Ce dossier contient toutes les images téléchargées depuis le site https://callistoarts.com/

## 📋 Tableau de toutes les œuvres (`portfolio_images.json`)

La **liste complète** (catégorie, fichier, titre) est dans **`../../docs/portfolio_images_INDEX.md`** — [ouvrir le fichier `docs/portfolio_images_INDEX.md`](../../docs/portfolio_images_INDEX.md) à la racine du dépôt.

Pour **mettre à jour** ce tableau après avoir édité le JSON :

```bash
python3 scripts/generate_portfolio_index.py
```

## 📊 Statistiques

- **Total d'images** : 168 fichiers
- **Formats** : JPG, PNG
- **Source** : callistoarts.com
- **Date de téléchargement** : 2026-01-13

## 📁 Organisation

Sous-dossiers : `graphics/`, `paintover/`, `photo/`, `gaming/`, `logo/`, etc.

**Important :** les chemins dans `portfolio_images.json` doivent **exactement** correspondre aux fichiers présents dans `assets/images/` (sinon vignettes cassées). Le dépôt utilise en général les **noms d’origine** (hash Instagram, etc.).

**Optionnel — slugs** : on peut renommer les fichiers en **slug** + année (`howl-of-the-forest-2023.jpg`, etc.) **à condition** de lancer le script de renommage **et** de mettre le JSON à jour en même temps, puis de tout déployer d’un coup. Ne pas changer uniquement le JSON sans renommer les fichiers sur le serveur / en local.

### Exemples de fichiers renommés (référence)

- `graphics/chromatique-resonance-2024.jpg` — Chromatique résonance  
- `graphics/howl-of-the-forest-2023.jpg` — Howl Of The Forest  
- `graphics/pascals-lemur-leap-2025.jpg` — Pascal's lemur leap  
- `paintover/sharp-eyes-by-callisto-2016.jpg` — Sharp Eyes by Callisto  
- `photo/convergence-2023.jpg` — Convergence  

Les entrées **sans titre exploitable** (ex. id numérique seul, `Photo` générique, noms `010d.*`) gardent souvent l’ancien nom de fichier.

### Fichiers hérités (liste non exhaustive)

- `Luna-fly-by-callisto-finale-1-scaled.jpg`, `407845946_*`, hashes Instagram — selon dossier  
- `pastel-sec/`, `acrylique/`, `aquarelle/` : techniques trad. (pastels, acrylique, aquarelle).  
- `gaming/` : ex. `94688130_*.jpg`

## 📝 Notes

- Certaines images existent en plusieurs tailles (thumbnails, medium, large, full)
- Les images avec des numéros Instagram (ex: `339435602_*.jpg`) sont des captures d'écran ou exports depuis Instagram
- Les images sont principalement des œuvres de Callisto (Frédérique Charton)
- Beaucoup d'images sont liées aux compétitions demoscene (Revision, Assembly, Rsync, Inercia, etc.)

## 🎨 Utilisation

Ces images peuvent être utilisées dans le portfolio pour :
- La galerie de portfolio
- Les sections de récompenses
- Les exemples de travaux
- Les illustrations de la timeline

## ⚠️ Droits d'auteur

Toutes les images sont la propriété de Callisto (Frédérique Charton) / GPO SARL.
Utilisation uniquement pour le portfolio personnel de l'artiste.
