# Callisto Arts - Portfolio 2026

Portfolio moderne et minimaliste pour Callisto (Frédérique Charton), artiste designer digitale spécialisée en digital painting, animation et demoscene.

**Dépôt GitHub :** [https://github.com/GamePartsOnline/Portfolio-Callisto](https://github.com/GamePartsOnline/Portfolio-Callisto)

---

## 🚀 Lancer le site en local

Le site doit être servi par un serveur HTTP (pas en ouvrant `index.html` directement), sinon le JavaScript et les ressources ne fonctionnent pas correctement.

### Étape 1 — Récupérer le projet depuis GitHub

**Si tu n'as pas encore le projet :**

1. Ouvre un terminal.
2. Va dans le dossier où tu veux placer le projet (par ex. `Documents` ou `Projets`).
3. Clone le dépôt :
   ```bash
   git clone https://github.com/GamePartsOnline/Portfolio-Callisto.git
   ```
4. Entre dans le dossier du projet :
   ```bash
   cd Portfolio-Callisto
   ```

**Si le projet est déjà cloné :** ouvre un terminal et va dans le dossier du projet :
```bash
cd chemin/vers/Portfolio-Callisto
```

### Étape 2 — Démarrer le serveur

**Option A – Script (recommandé)**

```bash
chmod +x start-server.sh
./start-server.sh
```

**Option B – Python (sans script)**

```bash
python3 -m http.server 8765 --bind 0.0.0.0
```

*Sur Windows, si `python3` ne fonctionne pas, essaie `python` à la place.*

**Option C – Extension Live Server (Cursor / VS Code)**

1. Installe l'extension **Live Server** (Ritwick Dey).
2. Clic droit sur `index.html` → **Open with Live Server**.  
   Le site s'ouvre dans le navigateur (souvent sur le port 5500).

### Étape 3 — Ouvrir le site dans le navigateur

- **Avec le script ou Python :** ouvre ton navigateur et va sur :  
  **http://127.0.0.1:8765**
- **Avec Live Server :** le navigateur s'ouvre en général automatiquement.

> ⚠️ Utilise toujours une adresse **http://** (serveur local). N'ouvre pas le fichier en **file://** (double-clic sur `index.html`), sinon le site ne fonctionnera pas correctement.

---

## 🎨 Caractéristiques

- **Style Minimaliste** : Design épuré avec palette de couleurs gris et blanc
- **Liquid Glass 2026** : Effets de verre liquide modernes sur les cards
- **Background Animé** : Système multi-couches avec gradient animé, orbes flottants, particules et mesh
- **Gestion Automatique** : Chargement automatique des images depuis JSON avec métadonnées
- **Récompenses Automatiques** : Système de badges et section awards générés automatiquement
- **Mobile First** : Conception responsive optimisée pour mobile
- **WCAG Compliant** : Conforme aux normes d'accessibilité web (contraste, navigation clavier, aria-labels)
- **Performance** : Lazy loading des images, animations optimisées, GPU acceleration
- **Accessibilité** : Support complet du clavier, lecteurs d'écran, réduction de mouvement

## 🚀 Technologies

- HTML5 sémantique
- CSS3 (Custom Properties, Grid, Flexbox, Animations)
- JavaScript Vanilla (ES6+, Fetch API, Web Animations API)
- JSON pour la gestion des métadonnées d'images
- Fonts : Inter (Google Fonts)

## 📁 Structure

```
Portfolio/
├── index.html                    # Structure HTML principale
├── styles.css                    # Styles CSS (liquid glass, background animé, timeline)
├── script.js                     # Interactions, animations et chargement automatique
├── start-server.sh               # Script pour lancer le serveur local
├── README.md                     # Documentation principale
├── GUIDE.md                      # Guide d'utilisation détaillé
├── BACKGROUND.md                 # Documentation du système de background animé
├── .gitignore                    # Fichiers à ignorer
└── assets/
    └── images/
        ├── portfolio_images.json # Métadonnées des images (titre, catégorie, récompenses)
        ├── logo-cllisto.png      # Logo Callisto Arts
        └── [images du portfolio]  # Images optimisées du portfolio
```

## 🎯 Sections

1. **Hero** : Section d'accueil avec animation et background animé
2. **À propos** : Présentation de l'artiste + lien vers la timeline
3. **Timeline (Mon parcours)** : Parcours chronologique (neon) avec événements, prix et milestones
4. **Portfolio** : Grille d'images avec filtres par catégorie (chargement automatique depuis JSON)
5. **Récompenses** : Cards des prix obtenus (génération automatique depuis les images primées)
6. **Contact** : Liens sociaux et informations de contact

## 🎨 Effet Liquid Glass 2026

L'effet liquid glass est réalisé avec :

- `backdrop-filter: blur(20px)` pour l'effet de flou
- Bordures semi-transparentes
- Ombres multiples pour la profondeur
- Animation au survol avec transformation
- Effet de brillance animée sur les orbes

## 🌊 Background Animé Multi-Couches

Le portfolio inclut un système de background animé moderne composé de :

1. **Gradient Animé** : Déplacement lent des nuances de gris (20s)
2. **Mesh Gradient** : Overlay avec gradients radiaux pour la profondeur (25s)
3. **Orbes Flottants** : 3 orbes avec effet glassmorphism et mouvement organique
4. **Grille Animée** : Pattern subtil en mouvement continu (30s)
5. **Particules Flottantes** : 30-50 particules avec trajectoires complexes (JavaScript)

Toutes les animations respectent `prefers-reduced-motion` et sont optimisées pour la performance.

Voir `BACKGROUND.md` pour la documentation complète.

## 📊 Système de Gestion Automatique des Images

Le portfolio utilise un système JSON pour gérer automatiquement les images :

### Format JSON (`portfolio_images.json`)

```json
{
  "images": [
    {
      "filename": "Chromatic-Resonance.jpg",
      "category": "graphics",
      "title": "Chromatique résonance",
      "award": "1ère place @ Rsync 2024",
      "year": 2024
    }
  ]
}
```

### Catégories disponibles

- `digital` - Digital Painting
- `animation` - Animation/Video
- `graphics` - Graphics
- `photo` - Photos
- `gaming` - Gaming Artwork
- `traditional` - Traditional Arts
- `logo` - Logos (exclus de l'affichage portfolio)

### Fonctionnalités automatiques

- ✅ Chargement automatique des images depuis le JSON
- ✅ Génération automatique des badges de récompenses
- ✅ Section Awards générée automatiquement
- ✅ Filtres par catégorie fonctionnels
- ✅ Lightbox avec métadonnées complètes

## 🏆 Système de Récompenses

Les images avec le champ `award` dans le JSON affichent automatiquement :

- **Badge doré** sur l'image dans le portfolio
- **Card dans la section Awards** avec année, titre, événement et rang
- **Tri automatique** par année (plus récent en premier)
- **Extraction intelligente** de l'événement et du rang depuis le texte de l'award

## 🎨 Logo Intégré

Le logo Callisto Arts est intégré stratégiquement :

- **Navigation** : Logo + texte "Callisto Arts" (texte masqué sur mobile)
- **Footer** : Logo centré avec texte de copyright
- **Effets** : Hover et transitions fluides

## ♿ Accessibilité (WCAG)

- **Contraste** : Ratio de contraste AAA (7:1 pour texte normal, 4.5:1 pour texte large)
- **Navigation clavier** : Tous les éléments interactifs sont accessibles au clavier
- **ARIA Labels** : Labels appropriés pour les lecteurs d'écran
- **Focus visible** : Indicateurs de focus clairs
- **Réduction de mouvement** : Respect de `prefers-reduced-motion` (toutes les animations se désactivent)
- **Skip links** : Navigation rapide vers le contenu principal

## 📱 Responsive Design

- **Mobile** : < 640px (1 colonne, menu hamburger, logo seul)
- **Tablet** : 640px - 1024px (2 colonnes)
- **Desktop** : > 1024px (3 colonnes, logo + texte)

## 🔧 Installation

1. **Récupérer le projet** : voir [Lancer le site en local](#-lancer-le-site-en-local) (clone depuis GitHub).
2. Placer les images dans `assets/images/`.
3. Configurer les métadonnées (données dans `script.js` ou JSON) avec tes images.
4. **Lancer le site** : suivre les étapes 2 et 3 de la section « Lancer le site en local » (serveur HTTP obligatoire).

## 📝 Ajouter des Images

### Méthode Recommandée (JSON)

1. Placer l'image dans `assets/images/`
2. Ajouter l'entrée dans `portfolio_images.json` :
   ```json
   {
     "filename": "mon-image.jpg",
     "category": "digital",
     "title": "Titre de l'œuvre",
     "award": "1ère place @ Événement 2024", // Optionnel
     "year": 2024 // Optionnel si award présent
   }
   ```

L'image apparaîtra automatiquement dans le portfolio avec ses métadonnées !

### Modifier les couleurs

Éditer les variables CSS dans `styles.css` :

```css
:root {
  --color-bg-primary: #1a1a1a;
  --color-text-primary: #ffffff;
  /* ... */
}
```

## 🌐 Compatibilité

- Chrome/Edge : ✅ (toutes fonctionnalités)
- Firefox : ✅ (toutes fonctionnalités)
- Safari : ✅ (toutes fonctionnalités)
- Mobile browsers : ✅ (optimisé)

## 📚 Documentation Complémentaire

- **GUIDE.md** : Guide d'utilisation détaillé
- **BACKGROUND.md** : Documentation technique du background animé
- **assets/images/README.md** : Documentation des images

## 🐛 Dépannage

### Les images ne se chargent pas

1. Vérifier que `portfolio_images.json` est valide (JSON valide)
2. Vérifier les chemins des images dans le JSON
3. Vérifier la console du navigateur (F12) pour les erreurs

### Le background animé ne fonctionne pas

1. Vérifier que JavaScript est activé
2. Vérifier la console pour les erreurs
3. Vérifier que `prefers-reduced-motion` n'est pas activé dans les préférences système

### Les récompenses ne s'affichent pas

1. Vérifier que le champ `award` est présent dans le JSON
2. Vérifier le format : `"award": "Xème place @ Événement Année"`

## 📄 Licence

© 2026 Callisto - Charton Frédérique / GPO

## 🙏 Remerciements

- Revision Demoparty
- Assembly
- Syntax
- Tokyo Demo Fest
- Atascii
- Shadow Party
- Inercia
- Rsync
- Sessions
- Tous les demosceners

---

**My fun is DRAWING !!! ALWAYS... end for ever.**

# Portfolio-Callisto

#proposition de modification , j'suis trop contente merci
