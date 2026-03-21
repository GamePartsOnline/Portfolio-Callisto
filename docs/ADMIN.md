# ADMIN — Périmètre (volontairement simple)

**Objectif :** gérer **la galerie** (images + métadonnées + catégories) et **les textes des pages**, sans tableau de bord surchargé.

---

## 1. Galerie

- **Liste des œuvres** : miniature, titre, catégorie, ordre, visible / masqué
- **Créer / modifier** une œuvre :
  - **Image** (upload, remplacement)
  - **Titre**
  - **Catégorie** (liste déroulante)
  - **Ordre d’affichage** (nombre ou glisser-déposer plus tard)
  - Optionnel : **année**, **ligne récompense** (comme `award` dans le JSON actuel), **description courte** pour lightbox
- **Supprimer** une œuvre
- Les **filtres** du site public reflètent les **catégories** existantes

---

## 2. Catégories

- **Liste** : identifiant technique (slug) + **libellé affiché** (ex. « Graphics »)
- **Créer / renommer** — attention à ne pas casser les œuvres si tu supprimes une catégorie (règle : réassigner ou interdire la suppression si des œuvres l’utilisent)

---

## 3. Textes du site (hors galerie)

À éditer depuis l’admin (une page par zone ou un formulaire par clé) :

| Zone | Exemples de contenu |
|---|---|
| **Hero** | Sous-titre « Owner at GPO… », éventuellement titre |
| **About** | Intro (équivalent `content.json` + paragraphes) — les **cartes domaines** peuvent être des enregistrements ou du HTML statique |
| **Contact** | Société, adresse, texte d’intro |
| **Footer** | Copyright, tagline |
| **Titres de sections** | Portfolio, About, Contact… si tu veux les traduire ou les changer |

*La **timeline** (My journey) peut rester en dur dans les vues au début, puis être **éditable** en phase 2 si besoin.*

---

## 4. Ce qui n’est pas dans la v1

- Pas de gestion multi-langue complexe (FR/EN peut être **plus tard** avec `I18n` ou champs `*_en`).
- Pas d’analytics intégrée dans l’admin.
- Pas de gestion de fichiers « presse » — hors périmètre sauf besoin explicite.

---

*Aligné avec [SITE.md](./SITE.md) et la stack [STACK.md](./STACK.md).*
