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
| Meta / SEO | Voir [§ Meta / SEO et i18n](#meta-seo-i18n) — `lang`, Open Graph, Twitter |

---

<a id="meta-seo-i18n"></a>

## Meta / SEO et i18n

L’**accueil** (`index.html`) est en **français par défaut** avec bascule FR/EN via `i18n.json`. Les **pages satellites** partagent la **même navigation** et le **sélecteur FR/EN**. Le **journal technique** (`build-log.html`) : l’**en-tête** (titres, chapô, encadré explicatif) est **bilingue** (`buildLogPage.*`) ; les **articles** du journal restent en **anglais** par choix éditorial — voir [BUILD_LOG.md § Langue](./BUILD_LOG.md). `services` et `mentions` : contenu principal surtout en anglais dans le HTML statique.

Les **moteurs et réseaux sociaux** lisent surtout le HTML statique : les balises **meta** / Open Graph restent alignées sur la langue du **contenu principal** de chaque URL (voir tableau ci-dessous).

### Règles

| Règle | Détail |
|--------|--------|
| **`lang`** | Attribut initial `fr` sur toutes les pages du périmètre ; le JS peut le passer à `en` si l’utilisateur a choisi l’anglais. |
| **`og:locale`** | Aligné sur la langue des champs **og:title** / **og:description** : `fr_FR` pour l’index ; `en_US` pour les pages dont les métas sont en anglais. |
| **`og:locale:alternate`** | Sur l’index uniquement : indiquer l’autre locale (`en_US` si la principale est `fr_FR`) pour signaler le bilinguisme côté partages Open Graph. |
| **Descriptions** | `meta name="description"`, `og:description`, etc. : cohérents avec la langue du **contenu éditorial** de la page (FR pour l’accueil ; EN pour build-log, services, mentions). |

### État dans le dépôt (référence)

| Page | `<html lang>` (initial) | `og:locale` | Remarque |
|------|-------------------------|-------------|----------|
| `index.html` | `fr` | `fr_FR` + `alternate` `en_US` | Métas FR ; bascule FR/EN dans l’UI. |
| `build-log.html` | `fr` | `en_US` | Métas EN ; nav + sélecteur i18n comme l’accueil. |
| `services.html` | `fr` | `en_US` | Idem. |
| `mentions-legales.html` | `fr` | — | Pas d’Open Graph obligatoire ; `meta description` EN. |

Après toute modification de titres ou de textes partagés (OG/Twitter), revérifier la cohérence `lang` / locale / langue du snippet. Détail i18n côté JS : [I18N.md](./I18N.md).

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

*Document généré à partir de l’analyse du dépôt — Avril 2026.*
