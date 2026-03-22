# ROADMAP — Portfolio Callisto Arts

**Principe :** peu d’étapes, chaque étape livrable. Deux horizons : **site statique** (maintenant) et **éventuelle app Rails** (plus tard).

---

## Court terme — site statique (HTML / CSS / JS)

*Maintenance continue, sans changer de stack.*

| Priorité | Piste | Détail |
|----------|--------|--------|
| Données | **JSON & fichiers** | Cohérence `portfolio_images.json` ↔ `script.js` (fallback), titres, fichiers manquants — voir [TODO.md](./TODO.md) |
| Contenu | **Œuvres** | Nouvelles images, catégories, `hidden`, renommages — [GUIDE.md](./GUIDE.md), index [portfolio_images_INDEX.md](./portfolio_images_INDEX.md) |
| Qualité | **Tests manuels** | Mobile, lightbox, filtres, `file://` vs serveur local — [TEST.md](./TEST.md) |
| Perf / UX | **Optionnel** | Délégation d’événements sur les filtres (éviter doublons), lazy-load affiné, WebP si pipeline |

**Hors scope immédiat :** refonte lourde du JS, second framework front.

---

## Moyen terme — migration Rails 8 *(optionnelle)*

**Principe :** peu d’étapes, chaque étape livrable. Voir aussi [SITE.md](./SITE.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [HOSTING.md](./HOSTING.md).

### État actuel — v2.x (statique) ✅

Site **statique** (HTML/CSS/JS), données dans `portfolio_images.json` + `content.json`, déploiement type **IONOS mutualisé** ou **Cloudflare Pages** selon [DEPLOY.md](./DEPLOY.md).

---

### Phase 1 — App Rails + admin galerie

- [ ] Projet **Rails 8** avec **SQLite**, **Tailwind**, **importmap**, **Hotwire**
- [ ] Modèles **Category**, **Work** + **Active Storage** pour les images
- [ ] **Authentification** admin (`rails generate authentication`)
- [ ] Interface **/admin** : CRUD œuvres + CRUD catégories
- [ ] Page publique **portfolio** (grille + filtres) reprenant le comportement actuel

---

### Phase 2 — Textes des pages

- [ ] Modèle ou clés **SiteContent** (hero, about, contact, footer…)
- [ ] Formulaires admin pour éditer ces textes (Action Text ou simple `textarea` au début)
- [ ] Brancher les vues publiques sur ces contenus

---

### Phase 3 — Finitions (optionnel)

- [ ] Timeline **journey** éditable en base (si tu veux tout changer sans toucher aux vues)
- [ ] **i18n** FR/EN si besoin
- [ ] Recréer effets forts (background animé, mode Nuit d’Atelier, curseur) en Tailwind + Stimulus
- [ ] Choix **hébergement** Rails (VPS, Fly.io, etc.) + déploiement — voir [HOSTING.md](./HOSTING.md)

---

## Hors périmètre « simple »

- Pas de Next.js, pas de deuxième stack front.
- Pas d’obligation Docker / MinIO pour une première mise en ligne.

---

*Dernière révision — Mars 2026 · [INDEX.md](./INDEX.md)*
