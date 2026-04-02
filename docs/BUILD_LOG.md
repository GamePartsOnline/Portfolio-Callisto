# Build Log — mise à jour du journal technique

Page publique : **`build-log.html`** (preuve de travail, études de cas THP / backend / perf).

## Langue

| Zone | Règle |
|------|--------|
| **Chrome** (titre H1, sous-titre, chapô, ligne « Mis à jour », encadré langue, note avant contact, `<title>`) | Bilingue **FR/EN** via `buildLogPage.*` et `meta.buildLogDocumentTitle` dans **`i18n.json`** (même mécanisme que le reste du site). |
| **Articles** (`<article class="build-log-entry">`) | Rédaction en **anglais** par défaut (preuve de travail, audience internationale). Pour une entrée bilingue, dupliquer le bloc ou ajouter des sections FR selon le besoin. |

## Entrées récentes (référence)

| Période | Sujet |
|---------|--------|
| **Avril 2026** | Pages satellites : même i18n que l’accueil (`script.js`, sélecteur FR/EN, garde-fou sur le `document.title`) — voir premier `<article>` dans `build-log.html`. |
| Mars 2026 | Latence API type OpenAI (~5s → ~1s) — voir deuxième article. |

## À chaque nouvelle entrée

1. **Dupliquer** le bloc `<article class="legal-page-article glass-card build-log-entry" …>` existant (le placer **au-dessus** des articles plus anciens si tu veux un ordre anti-chronologique).
2. Renseigner :
   - `<h2 itemprop="headline">` — titre de l’article ;
   - `.build-log-meta` — auteur, contexte (ex. THP), `<time itemprop="datePublished" datetime="YYYY-MM-DD">` ;
   - paragraphes / listes / `.build-log-takeaway` selon le même schéma.
3. Mettre à jour la ligne **« Updated … »** dans `<p class="legal-page-updated build-log-updated">` (en-tête de page).
4. Incrémenter le cache CSS sur cette page :  
   `styles.css?v=…` dans `<head>` (évite un vieux cache navigateur après édition).
5. Vérifier le lien **Contact** en bas de page si besoin.

## Gabarit HTML (extrait)

Copier depuis le premier `<article>` de `build-log.html` ou reprendre :

```html
<article
  class="legal-page-article glass-card build-log-entry"
  itemscope
  itemtype="https://schema.org/TechArticle"
>
  <h2 itemprop="headline">Titre de l’entrée</h2>
  <p class="build-log-meta">
    <span itemprop="author">Callisto</span> · Contexte ·
    <time itemprop="datePublished" datetime="2026-04-01">April 2026</time>
  </p>
  <p itemprop="description"><strong>Context.</strong> …</p>
  <h3 class="build-log-h3">Section</h3>
  <ul class="build-log-list">
    <li>…</li>
  </ul>
  <p class="build-log-takeaway"><strong>Takeaway.</strong> …</p>
</article>
```

Les classes utilisées sont définies dans `styles.css` (section « BUILD LOG »).

## Idées d’entrées futures

- Mise en cache, auth, edge cases (déjà évoqué dans le pied de page).
- Mesure perf (Lighthouse, Web Vitals) avant / après.
- Intégration API / erreurs de prod et correctifs.
