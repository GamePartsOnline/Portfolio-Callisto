# ROADMAP — Migration vers Rails 8

**Principe :** peu d’étapes, chaque étape livrable.

---

## État actuel — v2.0.0 ✅

Site **statique** (HTML/CSS/JS), données dans `portfolio_images.json` + `content.json`, hébergé **IONOS mutualisé**. Voir [SITE.md](./SITE.md).

---

## Phase 1 — App Rails + admin galerie

- [ ] Projet **Rails 8** avec **SQLite**, **Tailwind**, **importmap**, **Hotwire**
- [ ] Modèles **Category**, **Work** + **Active Storage** pour les images
- [ ] **Authentification** admin (`rails generate authentication`)
- [ ] Interface **/admin** : CRUD œuvres + CRUD catégories
- [ ] Page publique **portfolio** (grille + filtres) reprenant le comportement actuel

---

## Phase 2 — Textes des pages

- [ ] Modèle ou clés **SiteContent** (hero, about, contact, footer…)
- [ ] Formulaires admin pour éditer ces textes (Action Text ou simple `textarea` au début)
- [ ] Brancher les vues publiques sur ces contenus

---

## Phase 3 — Finitions (optionnel)

- [ ] Timeline **journey** éditable en base (si tu veux tout changer sans toucher aux vues)
- [ ] **i18n** FR/EN si besoin
- [ ] Recréer effets forts (background animé, mode Nuit d’Atelier, curseur) en Tailwind + Stimulus
- [ ] Choix **hébergement** Rails (VPS, Fly.io, etc.) + déploiement — voir [HOSTING.md](./HOSTING.md)

---

## Hors périmètre « simple »

- Pas de Next.js, pas de deuxième stack front.
- Pas d’obligation Docker / MinIO pour une première mise en ligne.

---

*ROADMAP allégée — Mars 2026.*
