# Performance (Lighthouse / Core Web Vitals)

Réponses courantes aux alertes **Performance** sur ce site statique.

## Render blocking requests

- **`styles.css`** reste bloquant (évite un flash sans style). Le gain principal vient des **polices Google** : une seule URL + chargement **non bloquant** (`preload` → `stylesheet` au `onload`) dans `index.html`.
- Les scripts en bas de page : **`cursor-callisto.js`** est en `defer` (moins prioritaire que `script.js`).

## Use efficient cache lifetimes

- Fichier **`_headers`** à la racine du dépôt (déploiement **Cloudflare Pages**) : TTL plus long pour `assets/`, plus court pour HTML et pour `styles.css` / `script.js` (bust via `?v=` dans `index.html`).
- **`portfolio_images.json`** : le fetch utilise `?v=1` — **incrémentez ce numéro** dans `script.js` quand vous modifiez le JSON en prod (pour invalider le cache navigateur/CDN). Évitez `Date.now()` ou `cache: no-store` sur chaque visite.

## Improve image delivery

- Grille : miniatures WebP générées + `loading="lazy"`, `sizes`, `width`/`height` pour limiter le **CLS**.
- Hero : premier slide avec `fetchPriority="high"` + dimensions ; les autres en `loading="lazy"` et `fetchPriority="low"`.

## Forced reflow

- Barre de navigation : état « scroll » via la classe **`.nav--scrolled`** + **`requestAnimationFrame`** au lieu de `setProperty` à chaque événement `scroll`.

## LCP / third parties

- **LCP** : souvent l’image du **hero**. Ne pas enchaîner des **requêtes de vérification** (`Image()` en série) *avant* d’injecter le `<img>` — cela pouvait repousser le LCP à **10–20 s**. Le script pose l’URL tout de suite (miniature WebP en priorité, repli `onerror` vers le fichier d’origine).
- **Premier slide** : `fetchpriority="high"`, `decoding="sync"`, dimensions `500×300`.
- **Particules + parallax** : lancés via **`requestIdleCallback`** (repli `setTimeout`) pour moins bloquer le thread principal avant la première peinture.
- **Google Fonts** : toujours un tiers ; pour supprimer la dépendance, héberger les `.woff2` dans `assets/` et `@font-face` en local (chantier séparé).

## DOM size

- La section Journey et la grille portfolio augmentent le nombre de nœuds ; rester raisonnable sur le nombre d’entrées ou paginer si besoin (évolution).

---

Relancer Lighthouse en **navigation privée** après déploiement pour tenir compte des en-têtes `_headers`.

## Grille portfolio + hero

- La grille est injectée par **lots** (`requestAnimationFrame`, 10 cartes par frame) pour limiter les **long tasks**.
- Le **hero n’est plus reconstruit** après `fetch(portfolio_images.json)` : une seule construction au chargement (meilleur LCP). Après mise à jour du JSON seul, **redéployer** aussi `script.js` (données embarquées) pour que le hero reste cohérent, ou accepter une légère différence jusqu’au prochain build.

## Preload LCP (`index.html`)

Un `<link rel="preload" as="image" … href="…/sky_code-thumb.webp">` aide la découverte LCP. Si le fichier n’existe pas encore, lance `scripts/generate_image_derivatives.py` ou retire / adapte le `href`.

## Minifier (optionnel)

Réduit les audits « Minify CSS/JS » sans changer le comportement :

```bash
npx --yes terser script.js -c -m -o script.min.js
npx --yes lightningcss --minify styles.css -o styles.min.css
```

Puis pointe `index.html` vers `script.min.js` et `styles.min.css` (et `_headers` si besoin).
