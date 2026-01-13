# Background Animé - Documentation Technique

## 🎨 Système de Background Multi-Couches

Le portfolio utilise un système de background animé moderne composé de plusieurs couches superposées pour créer un effet de profondeur et de mouvement subtil.

## 📐 Architecture des Couches

### 1. **Gradient de Base** (`.bg-gradient`)
- Gradient linéaire animé avec 5 points de couleur
- Animation : `gradientShift` - 20s, boucle infinie
- Effet : Déplacement lent du gradient pour créer un mouvement organique
- Couleurs : Nuances de gris (#1a1a1a à #252525)

### 2. **Mesh Gradient** (`.bg-mesh`)
- Overlay avec gradients radiaux multiples
- Animation : `meshMove` - 25s, mouvement circulaire subtil
- Effet : Création de zones de lumière/darkness pour la profondeur
- Opacité : 0.8 pour rester subtil

### 3. **Orbes Flottants** (`.bg-orbs`)
- 3 orbes de tailles différentes avec effet glass
- Animation : `orbFloat` - 20-35s selon l'orb
- Effet : Mouvement flottant organique avec blur
- Filtre : `blur(60px)` pour effet glassmorphism
- Opacité : 0.4 pour ne pas distraire

### 4. **Grille Animée** (`.bg-grid`)
- Pattern de grille subtil
- Animation : `gridMove` - 30s, mouvement continu
- Effet : Ajoute de la texture sans surcharger
- Opacité : 0.3

### 5. **Particules Flottantes** (`.bg-particles`)
- 30-50 particules selon la taille d'écran
- Animation JavaScript avec trajectoires complexes
- Types de mouvement :
  - **Circulaire** : Mouvement orbital autour d'un point
  - **Sinusoïdal** : Mouvement en vague
- Effet : Ajoute de la vie et du mouvement organique

## ⚡ Performance

### Optimisations Implémentées

1. **Mobile First**
   - Réduction du nombre de particules sur mobile (30 vs 50)
   - Réduction de la taille des orbes
   - Réduction du blur pour économiser le GPU

2. **GPU Acceleration**
   - Utilisation de `transform` et `opacity` (propriétés GPU-accelerated)
   - Évite `left/top` qui forcent les reflows

3. **Debounce sur Resize**
   - Réinitialisation des particules avec délai de 300ms
   - Évite les recalculs excessifs

4. **RequestAnimationFrame**
   - Animations fluides synchronisées avec le refresh rate
   - Meilleure performance que `setInterval`

## ♿ Accessibilité WCAG

### Conformité Totale

1. **Contraste**
   - Toutes les couches utilisent des opacités faibles (< 0.1)
   - Le contenu reste toujours lisible (contraste AAA)

2. **Prefers-Reduced-Motion**
   - Toutes les animations sont désactivées si l'utilisateur préfère
   - Les particules deviennent statiques
   - Les gradients et orbes restent fixes

3. **Performance**
   - Pas d'impact sur la lisibilité
   - Pas de distraction excessive
   - Animations subtiles et lentes

## 🎛️ Personnalisation

### Modifier les Couleurs

Dans `styles.css`, modifier les variables :

```css
:root {
    --color-bg-primary: #1a1a1a;  /* Fond principal */
}
```

### Modifier la Vitesse des Animations

```css
.bg-gradient {
    animation: gradientShift 20s ease infinite; /* Changer 20s */
}

.orb {
    animation-duration: 25s; /* Changer la durée */
}
```

### Modifier le Nombre de Particules

Dans `script.js` :

```javascript
const particleCount = window.innerWidth < 768 ? 30 : 50; // Modifier ici
```

### Désactiver une Couche

Ajouter `display: none;` dans le CSS :

```css
.bg-grid {
    display: none; /* Désactiver la grille */
}
```

## 🔧 Dépannage

### Les animations ne fonctionnent pas

1. Vérifier que JavaScript est activé
2. Vérifier la console pour les erreurs
3. Vérifier que `prefers-reduced-motion` n'est pas activé

### Performance faible

1. Réduire le nombre de particules
2. Réduire la taille des orbes
3. Désactiver certaines couches sur mobile

### Le background est trop visible

1. Réduire les opacités dans le CSS
2. Augmenter le blur des orbes
3. Réduire l'intensité des gradients

## 📊 Structure HTML

```html
<div class="animated-background" aria-hidden="true">
    <div class="bg-gradient"></div>        <!-- Couche 1 -->
    <div class="bg-mesh"></div>            <!-- Couche 2 -->
    <div class="bg-particles"></div>       <!-- Couche 3 -->
    <div class="bg-orbs">                  <!-- Couche 4 -->
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
    </div>
    <div class="bg-grid"></div>            <!-- Couche 5 -->
</div>
```

## 🎯 Bonnes Pratiques

1. **Toujours tester avec `prefers-reduced-motion`**
   - Activer dans les DevTools
   - Vérifier que tout reste fonctionnel

2. **Tester sur Mobile**
   - Vérifier les performances
   - Ajuster le nombre d'éléments si nécessaire

3. **Respecter le Thème**
   - Garder les couleurs dans la palette gris/blanc
   - Maintenir la subtilité

4. **Performance First**
   - Privilégier CSS animations quand possible
   - Utiliser JavaScript uniquement si nécessaire

## 🚀 Améliorations Futures Possibles

- [ ] Effet de parallaxe au scroll de la souris
- [ ] Interaction avec le curseur (particules qui suivent)
- [ ] Mode sombre/clair dynamique
- [ ] Thèmes saisonniers
- [ ] Effets de particules au survol des cards

---

**Note** : Ce système est conçu pour être subtil et élégant, améliorant l'expérience sans distraire du contenu principal.
