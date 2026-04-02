# ROADMAP — Migration Next.js (App Router) — Portfolio Callisto Arts

## Objectif
Migrer le site actuel vers **Next.js récent** (App Router) en conservant le comportement, les routes, les composants, les styles et les données existants autant que possible.

## Contraintes (priorité absolue)
- Préserver le comportement et les IDs/classes attendus par les scripts existants.
- Minimiser le risque : petites étapes + vérifications à chaque étape.
- Déployer sur **GitHub Pages** (build statique).
- Préserver les URLs legacy : `services.html`, `build-log.html`, `mentions-legales.html` via stubs/redirects au build.

## Stratégie (résumé)
- Construire une app Next **exportable**.
- Porter les 4 pages et la structure DOM en JSX.
- Servir `styles.css`, `script.js`, `i18n.json`, `content.json` et `assets/` depuis `public/`.
- Charger les scripts avec `defer` (côté client), sans dépendre d’un router SPA.
- Ajouter la compatibilité legacy `.html` au moment de l’export.

---
## Étapes de migration

### 0) Cadrage & baseline
| Statut | Tâche |
|--------|--------|
| [ ] | Baseline fonctionnelle : i18n, hero/carrousel, portfolio filters + lightbox, timeline, cookie banner, routes. |
| [ ] | Baseline SEO : title/meta/canonical + OG/twitter par page. |
| [ ] | Baseline performance : LCP/CLS (au moins une mesure de référence). |

### 1) Setup Next.js
| Statut | Tâche |
|--------|--------|
| [ ] | Scaffolder Next.js App Router + TypeScript strict. |
| [ ] | Configurer le build statique compatible GitHub Pages. |
| [ ] | Vérifier localement : `build` + export. |

### 2) Layout global (head + base URL)
| Statut | Tâche |
|--------|--------|
| [ ] | `app/layout.tsx` : `<base href="/">`, `html lang`, head/meta, chargement `styles.css`. |
| [ ] | Répliquer les conteneurs nécessaires : `#heroSlides`, `#portfolioGrid`, `#lightbox`, etc. |
| [ ] | Répliquer les métas SEO/OG/twitter au bon niveau (page-level si nécessaire). |

### 3) Pages Next (portage DOM 1:1)
| Statut | Tâche |
|--------|--------|
| [ ] | `app/page.tsx` : migration de `index.html`. |
| [ ] | `app/services/page.tsx` : migration de `services.html`. |
| [ ] | `app/build-log/page.tsx` : migration de `build-log.html`. |
| [ ] | `app/mentions-legales/page.tsx` : migration de `mentions-legales.html`. |
| [ ] | Conserver les body classes attendues par `script.js` (ex. `legal-page-body`, `build-log-body`, `services-page-body`). |

### 4) Intégration scripts existants (côté client)
| Statut | Tâche |
|--------|--------|
| [ ] | Charger `assets/js/cookie-consent.js` avec `defer` sur toutes les pages. |
| [ ] | Charger `script.js` avec `defer` sur toutes les pages. |
| [ ] | Index uniquement : charger `assets/js/music-player-init.js` avec `defer`. |
| [ ] | Vérifier `fetch` : `assets/images/portfolio_images.json` et `content.json` sous Next. |
| [ ] | Vérifier i18n : `i18n.json?v=...` + `localStorage` sur toutes les pages. |

### 5) Compatibilité legacy `.html`
| Statut | Tâche |
|--------|--------|
| [ ] | Dans le dossier exporté : générer `services.html`, `build-log.html`, `mentions-legales.html`. |
| [ ] | Chaque stub redirige vers `/services/`, `/build-log/`, `/mentions-legales/`. |
| [ ] | Vérifier navigation depuis le footer et les liens existants. |

### 6) SEO/Meta/SEO technique
| Statut | Tâche |
|--------|--------|
| [ ] | `robots.txt`, `sitemap.xml`, `llms.txt` dans `public/`. |
| [ ] | Vérifier `og:image` et `twitter:*` sur les pages clés. |

### 7) CI/CD GitHub Actions (déploiement)
| Statut | Tâche |
|--------|--------|
| [ ] | Workflow : build + export + deploy GitHub Pages. |
| [ ] | Smoke test : 4 routes + 3 stubs `.html`. |

### 8) Checklist régression (BUILD)
| Statut | Tâche |
|--------|--------|
| [ ] | Pas d’erreurs console sur desktop + mobile (min. sur les 4 pages). |
| [ ] | i18n FR/EN OK partout. |
| [ ] | Hero : carousel + dots + caption OK. |
| [ ] | Portfolio : filtres + lightbox OK. |
| [ ] | Cookies : persistance localStorage OK. |
| [ ] | SEO : title/canonical/OG/twitter conformes. |

---
## Journal d’avancement
- Quand une tâche sera terminée, je mettrai ` [x] ` et je noterai la date en une ligne ici.

---
## Dernière mise à jour
- Dernière révision : 2 avril 2026
