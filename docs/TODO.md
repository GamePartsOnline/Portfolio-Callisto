# TODO — Galerie & données (`portfolio_images.json`)

Document **généré / mis à jour manuellement** à partir du dépôt.  
Données : `assets/images/portfolio_images.json` + fichiers sous `assets/images/`.  
**Tableau récap** (toutes les œuvres) : [`portfolio_images_INDEX.md`](./portfolio_images_INDEX.md) — lancer `python3 scripts/generate_portfolio_index.py` après chaque grosse édition du JSON.

---

## 1. Catégories sans aucune œuvre (filtre invisibles)

Déclarées dans `categories` mais **aucune** entrée dans `images` avec vignette affichable (`filename` + fichier, `thumbnailUrl`, ou `youtubeId`).

| Catégorie (`id`) | Libellé UI | Note |
|------------------|------------|------|
| *(aucune vide de ce type en général)* | | Les catégories sans œuvre n’apparaissent pas dans les filtres. |

**Pastel sec, aquarelle, acrylique** : fichiers sous `assets/images/pastel-sec/`, `aquarelle/`, `acrylique/`.

---

## 2. Vignettes / fichiers manquants (références cassées)

**Contrôle :** chaque entrée avec `filename` doit pointer vers un fichier **réel** sous `assets/images/…`.

| Statut actuel | Détail |
|---------------|--------|
| OK            | Aucune entrée `filename` ne pointe vers un fichier absent (vérification locale). |

Si une vignette **ne s’affiche pas** en ligne : vérifier le **déploiement** (FTP/Git) du dossier `assets/images/` et le **MIME** sur l’hébergeur.

**Comportement site :** si l’URL de la vignette **échoue au chargement** (404, chemin incorrect), la **carte est retirée** de la grille (pas de cadre vide) et les **filtres** sont recalculés. Le hero vérifie les URLs **avant** d’afficher une diapo.

**Masquer sans supprimer l’entrée :** dans `portfolio_images.json`, ajouter `"hidden": true` sur l’objet — l’œuvre n’apparaît ni dans la grille ni dans les filtres.

**Entrées sans fichier local** (normal) : uniquement `thumbnailUrl` (Demozoo) ou **YouTube** — pas de fichier à fournir.

---

## 3. Titres à corriger ou enrichir

| Problème | Fichier / entrée | Suggestion |
|----------|------------------|------------|
| Titre **générique** « Photo » | `photo/183407402_10225214914982252_8102507980517360390_n-1024x768.jpg` | Remplacer par un titre descriptif (lieu, année, série). |
| Titre **générique** « Photo » | `photo/183672347_10225215575758771_3763955342084286418_n-1024x690.jpg` | Idem. |

**À surveiller :** titres dupliqués, fautes d’orthographe, années manquantes, `description` vide pour les œuvres importantes.

**Aquarelle (Mars 2026) :** 16 images renommées dans `assets/images/aquarelle/` — `filename` + titres alignés dans **`portfolio_images.json`** et **`script.js`** (fallback). Table fichier ↔ titre : **`assets/images/aquarelle/README.md`**.

**Pastel sec (Mars 2026) :** 14 images renommées dans `assets/images/pastel-sec/` — idem JSON + **`script.js`**. Table : **`assets/images/pastel-sec/README.md`**.

---

## 4. Cohérence JSON ↔ `script.js` (fallback hors ligne)

Le site charge en priorité **`portfolio_images.json`** (fetch).  
En cas d’échec (CORS, fichier absent), **`portfolioData`** dans `script.js` sert de **secours** et peut être **plus ancien** (pas d’acrylique, moins d’entrées).

**Action si besoin** : synchroniser les gros ajouts dans `script.js` ou accepter un mode dégradé hors ligne.

---

## 5. Filtres galerie (comportement actuel)

- Seules les catégories avec **au moins une vignette** apparaissent dans les boutons.
- Entrées **sans** `filename` + **sans** `thumbnailUrl` + **sans** `youtubeId` → **non affichées** (voir `getPortfolioThumbInfo` dans `script.js`).
- Entrées avec **`"hidden": true`** → non affichées.
- Après **échec de chargement** d’une image, la carte est supprimée et les filtres mis à jour (`rebuildPortfolioFiltersFromDom`).

---

## 6. Rappel workflow — nouvelle image

1. Placer le fichier : `assets/images/<catégorie>/nom-fichier.jpg`
2. Ajouter l’objet dans `images` :

```json
{
  "filename": "categorie/nom-fichier.jpg",
  "category": "categorie",
  "title": "Titre affiché",
  "year": 2026,
  "description": "Optionnel — crédits, lien Demozoo, etc.",
  "hidden": false
}
```

`"hidden": true` : garder l’entrée dans le JSON mais **ne pas l’afficher** (liste de maintenance / entrée retirée temporairement).

3. Vider le cache navigateur ; le script charge `portfolio_images.json?t=` (anti-cache).

---

## 7. Hors périmètre / notes

- **`logo`** : masqué du filtre public (usage logo / identité).
- **Musique** : fichier MP3 sous `assets/musique/` — pas dans ce TODO images.
- **Régénérer ce document** : relancer les contrôles (catégories vides, titres « Photo », `existsSync` sur fichiers) après chaque grosse mise à jour du JSON.

---

*Dernière mise à jour du contenu — Mars 2026.*
