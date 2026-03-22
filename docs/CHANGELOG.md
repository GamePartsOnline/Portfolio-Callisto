# Changelog - Portfolio Callisto Arts

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [Unreleased] - 2026-03-02

### Accessibilité

- `buildArtworkAltText()` pour vignettes, hero et lightbox ; logos `alt=""` + `aria-label` nav ; contrastes renforcés (footer, mentions, lecteur). Voir [A11Y.md](./A11Y.md).
- Mobile : cibles tactiles ≥ 44px, safe areas, `scroll-padding-top`, points du hero élargis au doigt.

### Légal / cookies

- Bandeau cookies (consentement, `localStorage`), script `assets/js/cookie-consent.js`, lien « Réglages cookies » au pied de page, ancre `#cookies` dans `mentions-legales.html`.

### Performance

- Grille / hero : miniatures WebP sous `assets/images/thumbs/…/*-thumb.webp` avec repli vers l’original.
- Lightbox : WebP plein écran sous `assets/images/webp/…/*.webp` avec repli JPG/PNG.
- Script `scripts/generate_image_derivatives.py` (Pillow) + doc dans `docs/GUIDE.md`.

## [Docs] - 2026-03-21

### Documentation

- Refonte complète de la documentation dans `docs/` : alignement sur le **site actuel** (analyse dans [SITE.md](./SITE.md)) et sur une cible **Rails 8 + SQLite + Hotwire + Tailwind** sans sur-ingénierie.
- Périmètre admin clarifié : **galerie** (images, catégories) + **textes des pages** — voir [ADMIN.md](./ADMIN.md).
- Suppression des références obsolètes (Next.js, stack lourde) dans les docs principales et le README.
- Hébergement : production actuelle **IONOS mutualisé** documentée dans [HOSTING.md](./HOSTING.md).

## [2.0.0] - 2026-01-14

### ✨ Ajouté

- **Système de gestion automatique des images**
  - Chargement automatique depuis `portfolio_images.json`
  - Métadonnées complètes (titre, catégorie, année, récompenses)
  - Génération automatique des éléments portfolio

- **Système de récompenses automatique**
  - Badges dorés sur les images primées
  - Section Awards générée automatiquement depuis le JSON
  - Tri automatique par année (plus récent en premier)
  - Extraction intelligente de l'événement et du rang

- **Background animé multi-couches**
  - Gradient animé de base
  - Mesh gradient overlay
  - 3 orbes flottants avec effet glassmorphism
  - Grille animée
  - Particules flottantes avec trajectoires complexes
  - Effet parallaxe au scroll
  - Documentation complète dans `BACKGROUND.md`

- **Logo intégré stratégiquement**
  - Logo dans la navigation (desktop + mobile)
  - Logo dans le footer
  - Effets hover et transitions

- **Optimisation des images**
  - Script de tri automatique (168 → 58 images)
  - Suppression des doublons et variantes de taille
  - Conservation des meilleures résolutions

- **Documentation complète**
  - README.md mis à jour avec toutes les fonctionnalités
  - GUIDE.md avec instructions détaillées
  - BACKGROUND.md pour le système de background
  - CHANGELOG.md pour l'historique des versions

### 🔄 Modifié

- **Structure HTML**
  - Section portfolio vide (chargement dynamique)
  - Section awards vide (génération automatique)
  - Navigation avec logo intégré
  - Footer avec logo intégré

- **JavaScript**
  - Fonction `loadPortfolioImages()` pour chargement automatique
  - Fonction `loadAwards()` pour génération des récompenses
  - Fonction `attachLightboxEvents()` pour événements dynamiques
  - Fonction `initParticles()` pour particules du background
  - Fonction `initParallax()` pour effet parallaxe
  - Amélioration de `openLightbox()` pour utiliser les données JSON

- **CSS**
  - Styles pour le logo dans navigation et footer
  - Styles pour le background animé
  - Optimisations mobile pour le background

### 🗑️ Supprimé

- Images redondantes (110 images supprimées)
- Placeholders HTML statiques remplacés par génération dynamique
- Code manuel de gestion des images

### 🐛 Corrections

- Correction des métadonnées dans `portfolio_images.json`
- Amélioration de la gestion des erreurs dans le chargement JSON
- Optimisation des performances pour mobile

## [1.0.0] - 2026-01-13

### ✨ Ajouté

- **Structure de base**
  - HTML5 sémantique
  - CSS avec effet liquid glass 2026
  - JavaScript pour interactions

- **Sections principales**
  - Hero section avec animation
  - Section À propos avec timeline
  - Section Portfolio avec filtres
  - Section Récompenses
  - Section Contact
  - Footer

- **Fonctionnalités**
  - Navigation mobile avec menu hamburger
  - Filtres de portfolio par catégorie
  - Lightbox pour afficher les images
  - Smooth scroll
  - Animations au scroll (Intersection Observer)
  - Lazy loading des images

- **Accessibilité**
  - Conformité WCAG
  - Navigation clavier complète
  - Labels ARIA
  - Support `prefers-reduced-motion`

- **Responsive Design**
  - Mobile First
  - Breakpoints : 640px, 1024px
  - Grille responsive (1 → 2 → 3 colonnes)

- **Documentation**
  - README.md initial
  - GUIDE.md initial

---

## Format

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

### Types de changements

- `✨ Ajouté` : Nouvelles fonctionnalités
- `🔄 Modifié` : Changements dans les fonctionnalités existantes
- `🗑️ Supprimé` : Fonctionnalités supprimées
- `🐛 Corrections` : Corrections de bugs
- `🔒 Sécurité` : Corrections de vulnérabilités
