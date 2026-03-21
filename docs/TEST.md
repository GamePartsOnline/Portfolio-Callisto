# Guide de test — Portfolio Callisto Arts (v2 statique)

Le site doit être servi en **HTTP** (pas en ouvrant `index.html` en `file://`), sinon le chargement du JSON échoue.

---

## 1. Lancer un serveur local

Dans le dossier du projet (`Portfolio-Callisto/`) :

**Option A — script (recommandé)**

```bash
chmod +x start-server.sh
./start-server.sh
```

Puis ouvre : **http://127.0.0.1:8765**

**Option B — Python**

```bash
cd chemin/vers/Portfolio-Callisto
python3 -m http.server 8765 --bind 0.0.0.0
```

**Option C — Cursor / VS Code**  
Extension **Live Server** → clic droit sur `index.html` → Open with Live Server.

---

## 2. Vérifications rapides (terminal)

À la racine du projet :

**JSON valide**

```bash
python3 -m json.tool assets/images/portfolio_images.json > /dev/null && echo "JSON OK"
```

**Nombre d’œuvres dans le JSON** (à adapter si le fichier change)

```bash
python3 -c "import json; d=json.load(open('assets/images/portfolio_images.json')); print(len(d['images']), 'images')"
```

**Images avec récompense (`award`)**

```bash
python3 -c "import json; d=json.load(open('assets/images/portfolio_images.json')); print(sum(1 for i in d['images'] if i.get('award')), 'avec award')"
```

---

## 3. Vérifications dans le navigateur

1. Ouvre l’URL du serveur local.
2. **F12** → onglet **Console** : pas d’erreurs rouges ; tu peux voir un message du type portfolio initialisé / background.
3. **Navigation** : liens Home, About, Timeline, Portfolio, Contact.
4. **Portfolio** : filtres par catégorie, grille d’images, clic → **lightbox**.
5. **Timeline** : section Journey, scroll jusqu’en bas.
6. **Contact** : liens réseaux (nouvel onglet).
7. **Mode Atelier** : bouton bougie (si présent) — ambiance + bannière.

**Test JSON manuel (console navigateur)**

```javascript
fetch('assets/images/portfolio_images.json')
  .then(r => r.json())
  .then(d => console.log('Images:', d.images.length))
```

---

## 4. Accessibilité / perf (optionnel)

- **Lighthouse** (F12 → Lighthouse) : Accessibilité, Performance.
- Réduire les animations : préférences système **réduire les mouvements** — le site doit rester utilisable.

---

## 5. Ce qui ne marche pas en `file://`

- `fetch('assets/images/portfolio_images.json')` → bloqué ou en erreur selon le navigateur.  
→ Toujours passer par un **serveur HTTP local**.

---

*Mis à jour — Mars 2026*
