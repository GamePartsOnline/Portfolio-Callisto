# Structure du dépôt — site statique v2

Application **vanilla** : pas de bundler obligatoire ; `index.html` charge `styles.css` et `script.js`.

```
Portfolio-Callisto/
├── index.html                 # Page unique (sections : hero, portfolio, about, journey, contact…)
├── mentions-legales.html      # Mentions + cookies
├── styles.css                 # Design system + layout
├── script.js                  # Catégories portfolio + logique UI (images via JSON HTTP)
├── content.json               # Textes About/Contact optionnels (fetch HTTP)
├── _headers                   # Cache HTTP (Cloudflare Pages)
├── robots.txt                 # Directives crawlers (Lighthouse SEO)
├── llms.txt                   # Manifeste pour assistants / LLMs (racine du site)
├── sitemap.xml                # URLs canoniques du site statique
├── CNAME                      # Domaine custom GitHub Pages / équivalent
├── wrangler.json              # Config CF (si utilisé)
│
├── assets/
│   ├── images/
│   │   ├── portfolio_images.json   # Source de vérité galerie (fetch en prod)
│   │   ├── thumbs/ …/ *-thumb.webp   # Générés (script Python)
│   │   ├── webp/ …/*.webp           # Plein écran WebP générés
│   │   └── <catégorie>/             # JPG/PNG sources par dossier
│   ├── js/
│   │   ├── cookie-consent.js
│   │   └── cursor-callisto.js
│   └── musique/               # MP3 lecteur
│
├── scripts/                   # Outils hors runtime navigateur
│   ├── generate_image_derivatives.py
│   ├── generate_portfolio_index.py
│   ├── setup_image_venv.sh
│   └── requirements-images.txt
│
├── docs/                      # Documentation (voir INDEX.md)
│   ├── archive/               # Brouillons, captures — pas déployés comme pages
│   ├── GUIDE.md
│   ├── PERFORMANCE.md
│   ├── A11Y_AUDIT.md
│   └── …
│
└── README.md
```

Suivi des tâches galerie : uniquement **[`docs/TODO.md`](./TODO.md)**. Ancienne feuille de route optimisation : [`archive/TODO-220326.md`](./archive/TODO-220326.md).

À la **racine** du dépôt se trouvent aussi des scripts de maintenance ponctuels (ex. `sync_portfolio_from_folders.py`, `update_awards.py`, `download_images.sh`) — non requis pour servir le site.

## Flux de données

| Fichier | Rôle |
|--------|------|
| `script.js` (`portfolioData`) | Catégories embarquées ; hero + grille après `fetch` du JSON (HTTP). |
| `assets/images/portfolio_images.json` | Source de vérité : liste d’images + métadonnées (même fetch que le hero). |
| `content.json` | Surcharge textes About/Contact si présent. |

## Ce qui ne va pas dans `assets/`

Les **captures, HTML de démo**, brouillons : placer dans **`docs/archive/`**, pas sous `assets/images/`, pour garder `assets/` réservé aux **fichiers servis** au visiteur.

## Évolution (hors scope)

Une **app Rails** cible est décrite dans `ARCHITECTURE.md` / `SITE.md` — périmètre futur, pas la structure actuelle.
