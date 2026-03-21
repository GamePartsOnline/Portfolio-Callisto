# ARCHITECTURE — App Rails cible (simple)

**Rails 8 · SQLite · Hotwire (Turbo + Stimulus) · Tailwind CSS · importmap**

Objectif : remplacer le site statique par une application **facile à faire évoluer**, avec une **admin légère** pour la galerie et les textes — sans pile technique inutile.

---

## Vue d’ensemble

```
Navigateur
    │
    ▼
Rails 8 (Puma)
    ├── Pages publiques (vues + Hotwire)
    ├── Zone /admin (authentification Rails 8)
    ├── SQLite (fichier(s) sous storage/ ou config)
    └── Active Storage (disque local en dev ; S3-compatible plus tard si besoin)
```

---

## Modèles (principe)

| Modèle | Rôle |
|---|---|
| **User** | Compte admin (généré par `rails generate authentication`) |
| **Category** | `slug` + `label` (ex. graphics → « Graphics ») — alimente les filtres |
| **Work** | Œuvre : titre, catégorie, ordre, texte optionnel, année, ligne « award » optionnelle, `visible` |
| **Work** + **Active Storage** | Fichier image attaché |
| **SiteContent** (ou clé/valeur) | Textes éditables : hero, about, contact, footer, etc. (clé + contenu HTML ou texte) |

*La **timeline** (journey) peut être une table séparée dans une phase ultérieure, ou des enregistrements `SiteContent` par bloc — à trancher lors de l’implémentation.*

---

## Authentification

- **Rails 8** : `rails generate authentication` — sessions, mot de passe, pas besoin de Devise pour démarrer.
- Toutes les routes sous `/admin` protégées par un `before_action`.

---

## Front public

- **Turbo** : navigations fluides, formulaires sans rechargement complet.
- **Stimulus** : filtres portfolio, lightbox, toggles (ex. mode atelier si conservé).
- **Tailwind** : recréer les tokens du design actuel (voir [DESIGN.md](./DESIGN.md) et `styles.css`).

---

## Ce qu’on évite (volontairement)

- Pas de Node.js / npm pour le JS (importmap).
- Pas de Next.js / pas de deuxième base de données.
- Pas d’admin lourde type moteur CMS complet — **CRUD + éditeur de texte** suffisent.

---

## Hébergement

| Aujourd’hui | Demain |
|---|---|
| Site statique sur **IONOS mutualisé** | Rails nécessite un **serveur applicatif** (VPS, PaaS type Fly.io, etc.) — voir [HOSTING.md](./HOSTING.md) |

---

*Architecture volontairement minimale — Mars 2026.*
