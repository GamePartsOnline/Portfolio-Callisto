# Performance (Lighthouse / Core Web Vitals)

Réponses courantes aux alertes **Performance** sur ce site statique.

## Render blocking requests

- **`styles.css`** reste bloquant (évite un flash sans style). Le gain principal vient des **polices Google** : une seule URL + chargement **non bloquant** (`preload` → `stylesheet` au `onload`) dans `index.html`.
- **`script.js`** et le lecteur audio : en **`defer`** (ordre : `cookie-consent.js` → `script.js` → `music-player-init.js`) — le parse HTML n’est plus bloqué par le JS principal ; les handlers `DOMContentLoaded` dans `script.js` s’enregistrent avant l’événement.

## Use efficient cache lifetimes

- Fichier **`_headers`** à la racine du dépôt (déploiement **Cloudflare Pages**) : TTL plus long pour `assets/`, plus court pour HTML et pour `styles.css` / `script.js` (bust via `?v=` dans `index.html`).
- **`portfolio_images.json`** : le fetch utilise `?v=1` — **incrémentez ce numéro** dans `script.js` (`PORTFOLIO_JSON_URL`) **et** dans le `<link rel="preload">` de `index.html` quand vous modifiez le JSON en prod (cache navigateur/CDN). Évitez `Date.now()` ou `cache: no-store` sur chaque visite.
- **Parse JS** : les images ne sont plus dans `script.js` (objet littéral ~800 lignes) ; elles sont chargées en JSON, ce qui réduit **parsing & compilation** du bundle principal.

## Improve image delivery

- Grille : miniatures WebP + `sizes`, `width`/`height` ; **`loading="lazy"`** sauf les **3 premières** vignettes (**`eager`**, la 1ʳᵉ avec **`fetchPriority="high"`**) pour coller aux audits « pas de lazy above the fold ».
- Hero : premier slide **`loading="eager"`**, `fetchPriority="high"`, `decoding="sync"` + **`<link rel="preload" as="image">`** injecté sur l’URL LCP ; les autres slides en `loading="lazy"` et `fetchPriority="low"`.

## Forced reflow

- Barre de navigation : état « scroll » via la classe **`.nav--scrolled`** + **`requestAnimationFrame`** au lieu de `setProperty` à chaque événement `scroll`.

## LCP / third parties

- **LCP** : souvent l’image du **hero**. Ne pas enchaîner des **requêtes de vérification** (`Image()` en série) *avant* d’injecter le `<img>` — cela pouvait repousser le LCP à **10–20 s**. Le script pose l’URL tout de suite (miniature WebP en priorité, repli `onerror` vers le fichier d’origine).
- **Premier slide** : `loading="eager"`, `fetchpriority="high"`, `decoding="sync"`, dimensions `500×300`, preload `<link>` sur la même URL.
- **Particules + parallax** : lancés via **`requestIdleCallback`** (repli `setTimeout`) pour moins bloquer le thread principal avant la première peinture.
- **Google Fonts** : toujours un tiers ; pour supprimer la dépendance, héberger les `.woff2` dans `assets/` et `@font-face` en local (chantier séparé).

## DOM size

- La section Journey et la grille portfolio augmentent le nombre de nœuds ; rester raisonnable sur le nombre d’entrées ou paginer si besoin (évolution).

---

Relancer Lighthouse en **navigation privée** après déploiement pour tenir compte des en-têtes `_headers`.

## Grille portfolio + hero

- La grille est injectée par **lots** (`requestAnimationFrame`, 10 cartes par frame) pour limiter les **long tasks**.
- Le **hero n’est pas reconstruit** après la grille : une construction au chargement après le **même** `fetch` du JSON (hero et grille alignés). Un `<link rel="preload" as="fetch">` sur le JSON démarre le téléchargement tôt.

## Preload d’une image LCP

On **ne** met pas de `<link rel="preload" as="image" href="…">` vers une image **fixe** tant que le **hero** choisit des œuvres **au hasard** : le navigateur préchargerait souvent un fichier **non utilisé** → avertissement Chrome *« preloaded using link preload but not used within a few seconds »*.  
Si un jour le hero affiche **toujours** la même URL en premier, on pourrait alors précharger **exactement** cette URL.

## Minifier (optionnel)

Réduit les audits « Minify CSS/JS » sans changer le comportement :

```bash
npx --yes terser script.js -c -m -o script.min.js
npx --yes lightningcss --minify styles.css -o styles.min.css
```

Puis pointe `index.html` vers `script.min.js` et `styles.min.css` (et `_headers` si besoin).
