# Guide d'utilisation — Portfolio Callisto Arts (site statique v2)

> Pour la vision **Rails + admin**, voir [ADMIN.md](./ADMIN.md) et [SITE.md](./SITE.md).

---

## 📸 Ajouter des images au portfolio

### Méthode Automatique (Recommandée) - Via JSON

Le portfolio utilise un système automatique de gestion des images via le fichier `portfolio_images.json`.

#### 1. Préparer les images

- **Format recommandé** : JPG (photos) ou WebP (meilleure compression)
- **Taille optimale** : 1200x900px (ratio 4:3) ou plus grand
- **Poids** : < 500KB par image (optimiser avec TinyPNG ou ImageOptim)
- **Nommage** : Utiliser des noms descriptifs en minuscules avec tirets
  - ✅ `chromatic-resonance.jpg`
  - ✅ `pascals-lemur-leap.jpg`
  - ❌ `IMG_1234.jpg`

#### 2. Placer les images

Copier les images dans le dossier `assets/images/`

#### 3. Ajouter au JSON

Éditer `assets/images/portfolio_images.json` et ajouter une entrée :

```json
{
  "images": [
    {
      "filename": "mon-image.jpg",
      "category": "graphics",
      "title": "Titre de mon œuvre",
      "award": "1ère place @ Rsync 2024",
      "year": 2024
    }
  ]
}
```

**Champs disponibles :**
- `filename` (requis) : Nom du fichier dans `assets/images/`
- `category` (requis) : `graphics`, `animation`, `photo`, `gaming`, `paintover`, `IA`, etc.
- `title` (optionnel) : Titre de l'œuvre
- `award` (optionnel) : Texte de la récompense (ex: "1ère place @ Rsync 2024")
- `year` (optionnel) : Année de la récompense (utilisé pour trier les awards)

**L'image apparaîtra automatiquement dans le portfolio !**

#### Miniatures WebP + plein écran WebP (recommandé)

La grille et le hero chargent d’abord des fichiers générés : `assets/images/thumbs/.../<nom>-thumb.webp`.  
La lightbox privilégie `assets/images/webp/.../<nom>.webp`, puis retombe sur le JPG/PNG d’origine si besoin.

Après avoir ajouté des fichiers dans `assets/images/` et mis à jour le JSON :

**Option A — Ubuntu / Debian récents (PEP 668)** : un **venv** dans le projet (recommandé ; n’installe rien dans le Python système) :

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements-images.txt
python scripts/generate_image_derivatives.py
```

Si `python3 -m venv` échoue (« ensurepip » / module manquant), installe le paquet une fois :  
`sudo apt update && sudo apt install -y python3-venv`  
puis relance les commandes ci‑dessus.

Raccourci : `./scripts/setup_image_venv.sh` (crée `.venv`, installe Pillow, affiche la commande pour lancer le script).

**Option B — sans venv** : Pillow fourni par le système (nécessite `sudo`) :

```bash
sudo apt update && sudo apt install -y python3-pil
python3 scripts/generate_image_derivatives.py
```

Aperçu sans écrire de fichiers (avec le venv activé, ou ` .venv/bin/python` à la place de `python`) :

```bash
python scripts/generate_image_derivatives.py --dry-run
```

Les sous-dossiers reprennent le chemin du `filename` dans le JSON (ex. `graphics/foo.jpg` → `thumbs/graphics/foo-thumb.webp` et `webp/graphics/foo.webp`).

##### Si « ça ne fonctionne pas » — causes fréquentes

1. **`sudo` refuse le mot de passe** → `python3-pil` n’est pas installé, le script affiche *Install Pillow* et s’arrête. Il faut soit le bon mot de passe administrateur, soit une installation **sans sudo** (voir ci‑dessous).

2. **`No module named pip`** → n’utilise pas le Python système pour `pip install` : crée un **venv** (option A ci‑dessus) ou installe `python3-pil` avec `sudo apt`.

3. **`externally-managed-environment` (PEP 668)** → Ubuntu/Debian **interdisent** `pip install` sur le Python du système. Utilise un **venv** (`.venv` dans le projet) — voir option A — ou `sudo apt install python3-pil`.

4. **`--dry-run: command not found`** → tu as lancé `--dry-run` seul. Il faut :  
   `python scripts/generate_image_derivatives.py --dry-run`  
   (ou `.venv/bin/python scripts/generate_image_derivatives.py --dry-run` si tu n’actives pas le venv.)

**Depuis Windows** (le dépôt est sous `C:\Users\...`) : dans **cmd** / **PowerShell** :  
`py -m venv .venv` → `.venv\Scripts\activate` → `pip install -r scripts\requirements-images.txt` → `py scripts\generate_image_derivatives.py`

### Catégories disponibles

- `animation` - Animation/Video
- `graphics` - Graphics (inclut l’illustration / peinture numérique type demoscene)
- `photo` - Photos
- `gaming` - Gaming Artwork
- `pastel-sec` - Pastel sec · `acrylique` - Acrylique · `aquarelle` - Aquarelle
- `logo` - Logos (exclus de l'affichage portfolio)

## 🏆 Ajouter une récompense

### Méthode Automatique (Recommandée)

Ajouter simplement les champs `award` et `year` dans le JSON :

```json
{
  "filename": "mon-image.jpg",
  "category": "graphics",
  "title": "Mon œuvre primée",
  "award": "1ère place @ Rsync 2024",
  "year": 2024
}
```

**Format de l'award :**
- Le système extrait automatiquement l'événement et le rang
- Format recommandé : `"Xème place @ Nom de l'événement Année"`
- Exemples :
  - `"1ère place @ Rsync 2024"`
  - `"10ème place @ Revision 2025"`
  - `"Session - Frontl1ne Demoparty"`

**Résultat automatique :**
- ✅ Badge doré sur l'image dans le portfolio
- ✅ Card dans la section Awards
- ✅ Tri automatique par année

## 🎨 Logo

### Emplacements du logo

Le logo est automatiquement intégré dans :

1. **Navigation** (`nav-logo`)
   - Logo + texte "Callisto Arts" sur desktop
   - Logo seul sur mobile
   - Effet hover avec scale

2. **Footer** (`footer-logo`)
   - Logo centré avec texte de copyright
   - Effet hover avec opacity

### Modifier le logo

1. Remplacer `assets/images/logo-cllisto.png`
2. Conserver le même nom de fichier ou mettre à jour les références dans `index.html`

## 🎨 Personnaliser les couleurs

Éditer les variables CSS dans `styles.css` :

```css
:root {
    --color-bg-primary: #1a1a1a;      /* Fond principal */
    --color-bg-secondary: #2a2a2a;    /* Fond secondaire */
    --color-bg-tertiary: #3a3a3a;     /* Fond tertiaire */
    --color-text-primary: #ffffff;    /* Texte principal */
    --color-text-secondary: #e0e0e0; /* Texte secondaire */
    --color-text-tertiary: #b0b0b0;   /* Texte tertiaire */
    --color-accent: #ffffff;          /* Couleur d'accent */
    --color-border: rgba(255, 255, 255, 0.1); /* Bordures */
}
```

## 🌊 Personnaliser le Background Animé

Voir `BACKGROUND.md` pour la documentation complète du système de background animé.

### Désactiver le background animé

Dans `index.html`, commenter ou supprimer la section :
```html
<!-- Animated Background -->
<div class="animated-background" aria-hidden="true">
    ...
</div>
```

### Modifier la vitesse des animations

Dans `styles.css`, modifier les durées :
```css
.bg-gradient {
    animation: gradientShift 20s ease infinite; /* Changer 20s */
}
```

## 📱 Tester la responsivité

1. Ouvrir les outils de développement (F12)
2. Activer le mode responsive (Ctrl+Shift+M)
3. Tester les breakpoints :
   - Mobile : 375px, 414px
   - Tablet : 768px, 1024px
   - Desktop : 1280px, 1920px

## ♿ Vérifier l'accessibilité

### Outils recommandés

1. **Lighthouse** (Chrome DevTools)
   - Onglet "Accessibility"
   - Score cible : > 90

2. **WAVE** (Extension navigateur)
   - https://wave.webaim.org/

3. **axe DevTools** (analyse des contrastes et des rôles ARIA)
   - Extension Chrome / Edge / Firefox — voir la procédure détaillée : [A11Y_AUDIT.md](./A11Y_AUDIT.md)

4. **Navigation clavier**
   - Tab pour naviguer
   - Enter/Espace pour activer
   - Escape pour fermer les modals

### Checklist WCAG

- ✅ Contraste texte/fond : viser **AA (≥ 4,5:1)** pour le texte courant ; **AAA (≥ 7:1)** quand c’est faisable sans casser la charte néon
- ✅ Tous les éléments interactifs accessibles au clavier
- ✅ Labels ARIA présents
- ✅ Focus visible sur tous les éléments
- ✅ Images avec attribut `alt` descriptif
- ✅ Structure sémantique HTML5
- ✅ Respect de `prefers-reduced-motion`
- ✅ Renfort si `prefers-contrast: more` (Journey + filtres portfolio)

## 🚀 Optimiser les performances

> Lighthouse (render-blocking, cache, images, LCP) : voir **[PERFORMANCE.md](./PERFORMANCE.md)** — fichier **`_headers`** (Cloudflare Pages) + bonnes pratiques `script.js`.

### Images

1. Utiliser WebP avec fallback JPG
2. Lazy loading activé par défaut
3. Compresser avec TinyPNG ou ImageOptim
4. Garder seulement les meilleures résolutions (le script de tri supprime les doublons)

### CSS/JS

1. Minifier pour la production
2. Utiliser un CDN pour les fonts si nécessaire
3. Le background animé utilise GPU acceleration automatiquement

### JSON

1. Garder le fichier `portfolio_images.json` organisé
2. Supprimer les entrées d'images supprimées
3. Valider le JSON avant de déployer
4. Après une mise à jour du JSON en production : **incrémenter** le paramètre `?v=` dans l’URL de fetch (`script.js`, recherche `portfolio_images.json?v=`) pour invalider le cache

## 🔧 Débogage

### Les images ne se chargent pas

1. **Vérifier le JSON** :
   - Ouvrir `assets/images/portfolio_images.json`
   - Valider la syntaxe JSON (pas de virgule en trop)
   - Vérifier que les noms de fichiers correspondent

2. **Vérifier les chemins** :
   - Les chemins dans le JSON doivent être juste le nom de fichier
   - Les images doivent être dans `assets/images/`

3. **Console du navigateur** :
   - Ouvrir F12 → Console
   - Chercher les erreurs 404 ou de parsing JSON

### Le menu mobile ne s'ouvre pas

- Vérifier que `script.js` est chargé
- Vérifier la console pour les erreurs JavaScript
- Vérifier que le bouton a l'id `navToggle`

### Les filtres ne fonctionnent pas

- Vérifier que les catégories dans le JSON correspondent aux filtres
- Vérifier que `initPortfolioFilters()` est appelé après le chargement des images

### Les récompenses ne s'affichent pas

- Vérifier que le champ `award` est présent dans le JSON
- Vérifier que le champ `year` est présent si `award` est présent
- Vérifier la console pour les erreurs

### Le background animé ne fonctionne pas

- Vérifier que JavaScript est activé
- Vérifier la console pour les erreurs
- Vérifier que `prefers-reduced-motion` n'est pas activé dans les préférences système
- Vérifier que le navigateur supporte `backdrop-filter`

## 📝 Bonnes pratiques

1. **Alt text descriptif** : Le système utilise automatiquement le `title` du JSON
2. **Noms de fichiers** : Utiliser des noms descriptifs et cohérents
3. **Organisation JSON** : Garder les images triées par catégorie dans le JSON
4. **Backup** : Toujours garder une copie des images originales
5. **SEO** : Remplir les métadonnées Open Graph dans `index.html`
6. **Validation** : Valider le JSON avant chaque déploiement
7. **Performance** : Optimiser les images avant de les ajouter

## 🔄 Workflow Recommandé

1. **Préparer l'image** :
   - Optimiser la taille et le poids
   - Nommer de manière descriptive

2. **Placer l'image** :
   - Copier dans `assets/images/`

3. **Ajouter au JSON** :
   - Ouvrir `portfolio_images.json`
   - Ajouter l'entrée avec toutes les métadonnées

4. **Tester** :
   - Ouvrir le portfolio dans un navigateur
   - Vérifier l'affichage
   - Vérifier les filtres
   - Vérifier la lightbox

5. **Valider** :
   - Vérifier l'accessibilité
   - Vérifier la responsivité
   - Vérifier les performances

## 🆘 Support

Pour toute question ou problème, consulter :
- Documentation HTML5 : https://developer.mozilla.org/fr/docs/Web/HTML
- Documentation CSS : https://developer.mozilla.org/fr/docs/Web/CSS
- Documentation JavaScript : https://developer.mozilla.org/fr/docs/Web/JavaScript
- WCAG Guidelines : https://www.w3.org/WAI/WCAG21/quickref/
- Documentation du background : `BACKGROUND.md`

## 📋 Exemple Complet

### Ajouter une nouvelle œuvre primée

1. **Image** : `symphony-abyss.jpg` → Placer dans `assets/images/`

2. **JSON** : Ajouter dans `portfolio_images.json` :
```json
{
  "filename": "symphony-abyss.jpg",
  "category": "graphics",
  "title": "Symphony of the abyss",
  "award": "2ème place @ Rsync 2025",
  "year": 2025
}
```

3. **Résultat** :
   - ✅ Image dans le portfolio avec badge doré
   - ✅ Filtrable par catégorie "graphics"
   - ✅ Card dans la section Awards (triée par année)
   - ✅ Lightbox avec toutes les informations

---

**C'est tout ! Le système fait le reste automatiquement.**
