# ROADMAP — Portfolio Callisto Arts

Version orientée **ce qu’il reste à faire**.

---

## 1) Priorité immédiate (cette semaine)

- [x] **Valider en prod mobile** les derniers correctifs UI :
  - timeline visible sur téléphone
  - barre sociale fixe à droite sur mobile
  - bannière cookies sans warning focus/`aria-hidden`
- [x] **Passer un cycle QA rapide** (Android + iPhone si possible) :
  - navigation, hero, filtres portfolio, lightbox, contact, cookies
  - pas de régression sur desktop
- [x] **Nettoyer le cache CDN/navigateur** après bump `?v=` si un rendu ancien persiste.

---

## 2) Court terme (maintenance statique v2.x)

- [x] **Contenu galerie** : ajouter/mettre à jour les œuvres dans `assets/images/portfolio_images.json` (titres génériques, années, descriptions).
- [x] **Workflow images** : après ajout massif, regénérer les dérivés (`thumbs/webp`) puis vérifier les fichiers manquants.
- [x] **Tests manuels** : garder la checklist de [TEST.md](./TEST.md) à jour (HTTP local, mobile, lightbox, filtres).
- [x] **Perf** : re-run Lighthouse en navigation privée et suivre surtout LCP/TBT après chaque lot de changements UI.

Références : [TODO.md](./TODO.md), [GUIDE.md](./GUIDE.md), [PERFORMANCE.md](./PERFORMANCE.md), [TEST.md](./TEST.md) (checklist manuelle).

---

## 3) Backlog utile (non bloquant)

- [x] Supprimer le CSS devenu inutilisé après retrait du bloc social en bas (allègement).
- [x] Option UX mobile : rendre la barre sociale auto-atténuée/auto-masquée pendant le scroll.
- [x] Option perf : minification build simple (`script.min.js`, `styles.min.css`) si déploiement figé.
- [x] Option contenu : micro-copy FR/EN homogène (menus, titres, mentions).

---

## 4) Moyen terme (optionnel) — migration Rails 8

À lancer seulement si besoin d’un **admin dynamique** :

- [ ] App Rails 8 + auth admin
- [ ] CRUD catégories/œuvres + upload images
- [ ] édition des textes de pages
- [ ] reprise du rendu public (hero, filtres, lightbox, timeline)

Détails d’architecture : [SITE.md](./SITE.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [HOSTING.md](./HOSTING.md)

---

## 5) Fait récemment (rappel)

- [x] Chargement galerie via JSON (allègement JS principal).
- [x] Ajout de `llms.txt` + cache header.
- [x] Fix timeline mobile (visibilité par défaut + animation opt-in desktop).
- [x] Fix a11y cookies (`aria-hidden`/focus).
- [x] Suppression du doublon social dans la section Contact.

---

*Dernière révision — Mars 2026 · [INDEX.md](./INDEX.md)*
