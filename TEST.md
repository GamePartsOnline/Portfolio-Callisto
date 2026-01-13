# Guide de Test - Portfolio Callisto Arts

## ✅ Vérifications Automatiques

Tout est déjà configuré et fonctionne automatiquement ! Le portfolio charge les images depuis le JSON au chargement de la page.

## 🚀 Pour Tester le Portfolio

### Option 1 : Serveur Local Simple (Recommandé)

```bash
cd /home/flowtech/The_Hacking_Project/Mes-repo/Portfolio
python3 -m http.server 8000
```

Puis ouvrir dans votre navigateur : **http://localhost:8000**

### Option 2 : Avec Node.js

```bash
cd /home/flowtech/The_Hacking_Project/Mes-repo/Portfolio
npx serve
```

### Option 3 : Ouvrir Directement

Vous pouvez aussi ouvrir `index.html` directement dans votre navigateur, mais certaines fonctionnalités (chargement JSON) nécessitent un serveur HTTP.

## ✅ Checklist de Vérification

### 1. Vérifier le JSON
```bash
python3 -m json.tool assets/images/portfolio_images.json
```
✓ Le JSON doit être valide (pas d'erreur)

### 2. Vérifier les Images
```bash
ls assets/images/*.jpg assets/images/*.png | wc -l
```
✓ Vous devriez avoir environ 59 fichiers

### 3. Vérifier les Récompenses
```bash
python3 << 'EOF'
import json
with open('assets/images/portfolio_images.json') as f:
    data = json.load(f)
awarded = [img for img in data["images"] if "award" in img]
print(f"✓ {len(awarded)} images avec récompenses")
EOF
```
✓ Vous devriez avoir 7 images avec récompenses

## 🎯 Ce qui Devrait Fonctionner Automatiquement

1. **Chargement des Images** : Au chargement de la page, toutes les images du JSON sont chargées automatiquement
2. **Badges de Récompenses** : Les images avec `award` affichent automatiquement un badge doré
3. **Section Awards** : La section récompenses est générée automatiquement avec les 7 images primées
4. **Filtres** : Les filtres par catégorie fonctionnent automatiquement
5. **Lightbox** : Clic sur une image ouvre la lightbox avec les métadonnées
6. **Background Animé** : Le background animé démarre automatiquement
7. **Logo** : Le logo s'affiche dans la navigation et le footer

## 🔍 Vérifications dans le Navigateur

### Console du Navigateur (F12)

1. Ouvrir la console (F12 → Console)
2. Vérifier qu'il n'y a pas d'erreurs
3. Vous devriez voir : `Portfolio Callisto Arts - Initialisé avec background animé`

### Vérifier le Chargement JSON

Dans la console, taper :
```javascript
fetch('assets/images/portfolio_images.json')
  .then(r => r.json())
  .then(data => console.log('✓ JSON chargé:', data.images.length, 'images'))
```

### Vérifier les Images Chargées

Dans la console :
```javascript
document.querySelectorAll('.portfolio-item').length
```
✓ Devrait afficher le nombre d'images dans le JSON (moins le logo)

### Vérifier les Récompenses

Dans la console :
```javascript
document.querySelectorAll('.portfolio-badge.award').length
```
✓ Devrait afficher 7 (nombre d'images avec récompenses)

## 🐛 Problèmes Courants

### Les images ne s'affichent pas

**Cause** : Le JSON n'est pas accessible (nécessite un serveur HTTP)

**Solution** : Utiliser un serveur local (voir Option 1 ci-dessus)

### Erreur 404 sur le JSON

**Cause** : Chemin incorrect ou fichier manquant

**Vérification** :
```bash
ls -lh assets/images/portfolio_images.json
```

### Les récompenses ne s'affichent pas

**Vérification** :
1. Ouvrir `assets/images/portfolio_images.json`
2. Vérifier que les images ont le champ `"award"`
3. Vérifier la syntaxe JSON (pas de virgule en trop)

### Le background animé ne fonctionne pas

**Vérification** :
1. Vérifier que JavaScript est activé
2. Vérifier la console pour les erreurs
3. Vérifier que `prefers-reduced-motion` n'est pas activé dans les préférences système

## 📊 Statistiques Attendues

- **Total d'images** : 22 (23 dans JSON - 1 logo)
- **Images avec récompenses** : 7
- **Catégories** : digital, animation, graphics, photo, gaming, traditional
- **Récompenses dans Awards** : 7 cards

## ✨ Tout est Prêt !

Aucune commande supplémentaire n'est nécessaire. Le portfolio fonctionne automatiquement dès que vous ouvrez la page avec un serveur HTTP local.
