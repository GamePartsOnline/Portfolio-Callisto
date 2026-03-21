# Callisto Arts — Portfolio

Portfolio professionnel de **Frédérique Charton (CALLISTO)**  
Graphiste digitale, illustratrice, artiste demoscene, AI builder.

**Site en production :** [portfolio.callistoarts.com](https://portfolio.callistoarts.com)  
**Dépôt GitHub :** [github.com/GamePartsOnline/Portfolio-Callisto](https://github.com/GamePartsOnline/Portfolio-Callisto)

---

## À propos

CALLISTO est une graphiste professionnelle basée à Châlons-en-Champagne, France. Active dans la scène internationale depuis 2015 :

- Primée dans les plus grandes demoparties mondiales (Revision, Rsync, Inercia, Assembly, Tokyo Demo Fest)
- Manager de GPO SARL, studio de création digitale
- Membre organisatrice de Shadow Party
- Certifiée TOSA Illustrator & InDesign
- Exposée à la Pinacothèque du Luxembourg (2021)

---

## Version actuelle — v2.0.0

Site statique vanilla (HTML / CSS / JavaScript), **hébergé en production chez IONOS (mutualisé)**. Voir [docs/HOSTING.md](./docs/HOSTING.md) pour le détail et la stratégie pour la future version Rails.

### Lancer en local

Le site requiert un serveur HTTP (pas d'ouverture directe de `index.html`).

**Option recommandée — script inclus :**
```bash
chmod +x start-server.sh
./start-server.sh
```

**Option Python :**
```bash
python3 -m http.server 8765 --bind 0.0.0.0
# Ouvrir http://127.0.0.1:8765
```

**Option VS Code / Cursor :**  
Clic droit sur `index.html` → Open with Live Server

---

### Structure

```
Portfolio-Callisto/
├── index.html                     ← Application complète (SPA)
├── styles.css                     ← Design system Liquid Glass 2026
├── script.js                      ← Logique, animations, chargement JSON
├── content.json                   ← Textes About/Contact éditables
├── start-server.sh                ← Serveur local
├── assets/
│   ├── images/
│   │   ├── portfolio_images.json  ← Catégories + œuvres (métadonnées)
│   │   ├── graphics/ …            ← Dossiers par type
│   └── js/
│       └── cursor-callisto.js     ← Curseur pixel art custom
├── docs/                          ← Documentation (voir docs/INDEX.md)
└── README.md                      ← Ce fichier
```

---

### Fonctionnalités

**Interface publique**
- Hero animé avec carousel automatique (5 images aléatoires)
- Portfolio : grille 24 œuvres, filtres par catégorie
- Lightbox plein écran avec métadonnées complètes
- Badges récompense sur les œuvres + détail dans la **timeline** (journey)
- Timeline chronologique 2011–2026 (style neon)
- Mode Nuit d'Atelier (ambiance bougie, curseur flamme, étoiles)
- Curseur pixel art custom avec traînée neon et burst au clic
- Background animé 5 couches (gradient, mesh, orbes, grille, particules)

**Technique**
- Design Liquid Glass 2026 (glassmorphism, backdrop-filter)
- Palette : rose `#f472b6`, turquoise `#00ffe0`, or `#ffd700`
- WCAG AA/AAA (contraste 7:1, navigation clavier, ARIA complet)
- Responsive : Mobile < 640px / Tablet 640–1024px / Desktop > 1024px
- Chargement JSON dynamique avec fallback embarqué
- `prefers-reduced-motion` respecté (toutes animations désactivées)

---

### Gestion du contenu (v2.0.0)

**Ajouter une œuvre :**

1. Placer l'image dans `assets/images/{categorie}/`
2. Ajouter l'entrée dans `assets/images/portfolio_images.json` :

```json
{
  "filename": "mon-oeuvre.jpg",
  "category": "graphics",
  "title": "Titre de l'œuvre",
  "description": "Description optionnelle",
  "year": 2026,
  "award": "1ère place @ Événement 2026"
}
```

3. Déployer sur **IONOS** (FTP / gestionnaire de fichiers) — voir [docs/DEPLOY.md](./docs/DEPLOY.md)

**Scripts utilitaires :**
- `rename_legacy_image_files.sh` — renomme les fichiers **sur le disque** vers des slugs (à n’utiliser **que** si le `portfolio_images.json` pointe déjà vers ces noms cibles ; sinon les images 404). Après renommage, déployer les fichiers + JSON ensemble.
- `sync_images_to_json.py` — synchronise les fichiers images avec le JSON
- `sync_portfolio_from_folders.py` — génère le JSON depuis la structure de dossiers
- `organize_images_by_category.py` — trie les images dans les sous-dossiers
- `update_awards.py` — met à jour les métadonnées de récompenses

**Catégories disponibles :**

| Catégorie | Description |
|---|---|
| `graphics` | Œuvres graphiques pour compétitions (demoparties) |
| `paintover` | Paintover et retouches artistiques |
| `photo` | Photographies |
| `IA` | Créations assistées par IA (prompt art) |
| `logo` | Logos (exclus de la grille portfolio) |

---

### Récompenses (champ `award` dans le JSON)

Les œuvres avec un champ `award` affichent un **badge** sur la grille ; le détail des prix est aussi dans la **timeline** (section Journey).

---

## Prochaine version — Rails 8

Refonte vers **Rails 8**, **SQLite**, **Hotwire**, **Tailwind** — même esprit visuel (Liquid Glass), avec une **admin simple** :

- **Galerie** : images, titres, catégories, ordre, champs optionnels (année, ligne récompense)
- **Textes** : hero, about, contact, footer (sans tout complexifier)

**Voir :** [docs/ROADMAP.md](./docs/ROADMAP.md), [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md), [docs/ADMIN.md](./docs/ADMIN.md)

---

## Compatibilité navigateurs

| Navigateur | Support |
|---|---|
| Chrome / Edge | Complet |
| Firefox | Complet |
| Safari | Complet |
| Mobile browsers | Optimisé |

---

## Documentation

Toute la documentation est dans le dossier [`docs/`](./docs/) :

| Fichier | Contenu |
|---|---|
| [docs/INDEX.md](./docs/INDEX.md) | Sommaire de la documentation |
| [docs/SITE.md](./docs/SITE.md) | **Analyse du site actuel** (structure, JSON, technique) |
| [docs/STACK.md](./docs/STACK.md) | Rails 8 + SQLite + Hotwire + Tailwind |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Architecture Rails cible (simple) |
| [docs/ADMIN.md](./docs/ADMIN.md) | Admin : galerie + catégories + textes |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Étapes de migration |
| [docs/HOSTING.md](./docs/HOSTING.md) | IONOS (actuel) · hébergement Rails (plus tard) |
| [docs/DEPLOY.md](./docs/DEPLOY.md) | Déploiement statique · Rails à documenter |
| [docs/DESIGN.md](./docs/DESIGN.md) | Design system Liquid Glass |
| [docs/CONTENT.md](./docs/CONTENT.md) | Rappel contenus |
| [docs/GUIDE.md](./docs/GUIDE.md) | Guide maintenance site statique v2 |
| [docs/BACKGROUND.md](./docs/BACKGROUND.md) | Background animé |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Historique des versions |
| [docs/TEST.md](./docs/TEST.md) | Tests manuels v2 |

---

## Licence

© 2026 CALLISTO — Charton Frédérique / GPO SARL  
Tous droits réservés. Les œuvres du portfolio appartiennent à leurs auteurs respectifs.

---

## Remerciements

Merci à toute la communauté demoscene internationale :
Revision · Assembly · Syntax · Tokyo Demo Fest · Atascii · Shadow Party · Inercia · Rsync · Sessions · et tous les demosceners

---

*My fun is DRAWING. ALWAYS. And forever.*
