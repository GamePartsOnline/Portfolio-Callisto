# Audit accessibilité — Portfolio Callisto

Procédure courte après changements **CSS** (surtout **filtres portfolio** et section **My journey** / timeline néon).

## 1. Lighthouse (Chrome)

1. Servir le site en local (ex. `npx serve .` ou extension Live Server).
2. Ouvrir **DevTools** (F12) → onglet **Lighthouse**.
3. Cocher **Accessibility**, mode **Desktop** puis **Mobile**.
4. Lancer l’audit sur `index.html` (page d’accueil complète).
5. **Cible** : score Accessibilité **≥ 90** ; corriger les échecs « Contrast » et « Names and labels » en priorité.

> Les couleurs néon (turquoise, or, rose) sont surtout des **titres / accents**. Le **corps de texte** des cartes Journey utilise `--journey-text` (`styles.css`) pour viser **WCAG AA** sur fond sombre.

## 2. axe DevTools (optionnel)

1. Installer l’extension [axe DevTools](https://www.deque.com/axe/devtools/) (Chrome / Edge / Firefox).
2. Analyser la page → corriger les problèmes **Critical** et **Serious** liés au contraste ou aux rôles ARIA.

## 3. Vérifications manuelles ciblées

| Zone | Action |
|------|--------|
| **Filtres** (`#portfolioFilters`) | `Tab` / `Shift+Tab` : chaque `.filter-btn` reçoit le focus, **outline** visible (`:focus-visible`). Tester **actif** + **inactif** pour chaque catégorie présente dans le JSON. |
| **Journey** (`#journey`) | Lire sous-titre, légende, années, tags, listes de prix : texte lisible sur fond animé + cartes glass. Activer **contraste élevé** OS : le site applique `@media (prefers-contrast: more)` (texte et bordures renforcés). |
| **Réduction de mouvement** | `prefers-reduced-motion: reduce` : particules / animations ne doivent pas gêner la lecture (déjà pris en charge côté CSS/JS). |

## 4. Après modification de `styles.css`

- Regénérer ou vider le cache (paramètre `?v=` sur `styles.css` dans `index.html` si vous l’utilisez).
- Refaire un passage **Lighthouse** + coup d’œil **#journey** et **filtres**.

## `aria-hidden` et éléments focalisables

Ne pas mettre `aria-hidden="true"` sur un conteneur qui contient encore des boutons/liens/champs **sans** les retirer du tab order. Sur ce site : **`inert`** sur la lightbox fermée, le bandeau cookies masqué, et le menu mobile replié (`#navMenu`) ; les points du hero sont un `role="group"` avec `aria-label` (pas `aria-hidden`).

## Références

- [WCAG 2.1 — Contrast (minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- Attribut HTML [`inert`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert)
- Guide projet : [GUIDE.md § Accessibilité](./GUIDE.md#-vérifier-laccessibilité)
