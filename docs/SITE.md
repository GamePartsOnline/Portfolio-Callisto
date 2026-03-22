# SITE — Analyse du site actuel
**portfolio.callistoarts.com · v2.0.0 (statique)**

*Analyse du dépôt local alignée avec la structure publique.*

---

## Technique

| Élément | Détail |
|---|---|
| Type | Site **statique** : une page (`index.html`), pas de backend |
| Styles | `styles.css` — design **Liquid Glass**, thème sombre |
| Scripts | `script.js` — portfolio dynamique, lightbox, filtres, hero carousel, timeline, mode « Nuit d’Atelier » |
| Curseur | `assets/js/cursor-callisto.js` — curseur pixel / trail |
| Données | `assets/images/portfolio_images.json` — catégories + liste d’images |
| Textes éditables | `content.json` — intro About + infos Contact (chargés en JS) ; **le reste du texte est dans le HTML** |
| Polices | Google Fonts : Inter, Share Tech Mono, Cinzel |
| Meta / SEO | `index.html` — description, Open Graph, Twitter (URLs `callistoarts.com` dans les balises) |

---

## Structure de la page (ancres)

| Section | ID | Contenu |
|---|---|---|
| Navigation | — | Logo, liens : Home, About, Timeline, Portfolio, Contact |
| Hero | `#home` | « Welcome to my world » / **Callisto Arts** — sous-titre GPO / artiste / AI Builder — **carousel d’images** (alimenté par le portfolio JSON) |
| Portfolio | `#portfolio` | Titre « Portfolio » — **filtres par catégorie** (générés depuis le JSON) — **grille d’images** — lightbox |
| About | `#about` | Carte intro (nom, bio) — lien Demozoo scener — **6 cartes domaines** (Digital Drawing, GPO, Demoscene, AI, Dev/THP, UI) — citation |
| Timeline | `#journey` | « My journey » — légende Event / Prizes / Certificates — **timeline 2011 → 2026** (HTML statique, riche en prix demoscene) |
| Contact | `#contact` | Réseaux : Behance, Instagram, Facebook, Demozoo — **GPO SARL** + adresse Châlons |
| Footer | — | Logo, copyright 2026, tagline |

**Hors contenu principal :** mode **Nuit d’Atelier** (bougie, overlays), **lightbox** sur les œuvres.

---

## Données galerie (`portfolio_images.json`)

- **Vue tableau (liste complète)** : [`portfolio_images_INDEX.md`](./portfolio_images_INDEX.md) — généré par `python3 scripts/generate_portfolio_index.py`
- **`categories`** : liste `{ id, label }` — ex. `graphics`, `photo`, `paintover`, `IA`, `logo` (masqué du portfolio selon la logique JS), etc.
- **`images`** : pour chaque entrée, typiquement :
  - `filename` (chemin sous `assets/images/`)
  - `category`
  - `title`
  - optionnel : `year`, `award` (texte libre, ex. place + événement)

Les **filtres** et la **grille** sont construits automatiquement à partir de ce fichier.

---

## Ce que l’admin Rails devra couvrir (périmètre simple)

1. **Galerie** : images (upload / remplacement), titres, ordre, visibilité, champs optionnels (année, récompense texte), lien éventuel.
2. **Catégories** : libellés affichés dans les filtres + association œuvre ↔ catégorie.
3. **Textes des blocs** : hero (titre / sous-titre), titres de sections si besoin, contenus About/Contact/footer, **ou** au minimum les zones aujourd’hui dans `content.json` + les chaînes clés du site.

La **timeline** (journey) peut rester en second temps (édition HTML → plus tard table `timeline_events` dans l’admin) pour ne pas surcharger la première version.

---

*Document généré à partir de l’analyse du dépôt — Mars 2026.*
