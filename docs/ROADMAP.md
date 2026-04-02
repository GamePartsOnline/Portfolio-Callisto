# ROADMAP — Portfolio Callisto Arts

**Priorité** : le **site statique** en production. **Sécurité** et **conformité** en fil continu. Une **app admin (Rails)** reste **optionnelle** — [STACK.md](./STACK.md), [ADMIN.md](./ADMIN.md), pas [ARCHITECTURE.md](./ARCHITECTURE.md) (statique uniquement).

Alignement : [SECURITY.md](./SECURITY.md), [securite_sites_internet.md](./securite_sites_internet.md).

**Règle** : toute évolution notable (infra, DNS, déploiement, sécurité, produit, doc structurante) → mettre à jour **cette page** (cases, *Dernières livraisons*, *Dernière révision*).

---

## Documents de référence

| Document | Rôle |
|----------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Statique — schéma, pages, données, tiers |
| [STRUCTURE.md](./STRUCTURE.md) | Arborescence du dépôt |
| [HOSTING.md](./HOSTING.md) · [DEPLOY.md](./DEPLOY.md) | Domaine, DNS, IONOS, mise en ligne |
| [SECURITY.md](./SECURITY.md) | Posture sécurité, en-têtes, CSP |
| [securite_sites_internet.md](./securite_sites_internet.md) | Guide 6 couches |
| [SITE.md](./SITE.md) | Meta, SEO, i18n |
| [GUIDE.md](./GUIDE.md) · [TEST.md](./TEST.md) · [PERFORMANCE.md](./PERFORMANCE.md) · [I18N.md](./I18N.md) | Maintenance, perfs, i18n |

---

## Livré (ne pas rouvrir sans raison)

| | |
|--|--|
| [x] | i18n hybride (HTML FR + `i18n.json` + client) |
| [x] | Navigation : accueil · portfolio · services · journal · mentions légales |
| [x] | UI portfolio (intro, ligne sous le titre) |
| [x] | Meta / SEO de base ([SITE.md](./SITE.md#meta-seo-i18n) — `lang`, Open Graph, descriptions) |
| [x] | Pages satellites : FR/EN + `script.js` sur `build-log`, `services`, `mentions-legales` |
| [x] | Doc sécurité : en-têtes & CSP décrits dans [SECURITY.md](./SECURITY.md) (mise en œuvre serveur = backlog ci-dessous) |

---

## Backlog — par axe

### A. Performance & médias

| Statut | Tâche |
|--------|--------|
| [x] | **LCP** (côté code) : hero 1ʳᵉ slide `loading="eager"`, `fetchPriority="high"`, preload `<link as="image">` sur l’URL LCP · [PERFORMANCE.md](./PERFORMANCE.md) — *poids global des assets / ~68 fichiers = ligne « Images » ci-dessous* |
| [ ] | **Images** : ~68 fichiers « surdimensionnés » (~41 Mo d’économie signalés par audit SORANK) — `srcset` / largeurs réelles / pipeline WebP & thumbs existants |
| [x] | **Lazy** : pas de lazy sur le **hero LCP** ; **3 premières** vignettes portfolio en `eager` (1ʳᵉ en `fetchPriority="high"`) ; iframe lightbox YouTube sans `loading="lazy"` |
| [x] | **Scripts** : `script.js` en **`defer`** sur toutes les pages ; accueil : `music-player-init.js` extrait et en `defer` après `script.js` |

### B. SEO, GEO & contenu (audit SORANK — 2 avr. 2026 : SEO **86** note **B**, GEO **45/100**)

| Statut | Tâche |
|--------|--------|
| [ ] | **Méta description** accueil : **≤ ~160** caractères (audit : **186** — troncature SERP) · `index.html` + [i18n.json](../i18n.json) si applicable |
| [ ] | **JSON-LD** : `WebSite` / `Person` ou `Organization` (+ œuvres si pertinent) — citabilité IA & résultats enrichis · [SITE.md](./SITE.md) |
| [ ] | **GEO** : contenus plus factuels et citables (titres clairs, faits vérifiables) ; `llms.txt` déjà présent — compléter si besoin |
| [ ] | **Titres** : **1** `<h*>` vide signalé — supprimer ou remplir (grid portfolio / modale) |
| [ ] | **Lien** : **1** lien interne vide — corriger ou retirer |
| [ ] | **Mots-clés** : densité **> 4 %** sur un terme — alléger sans dénaturer (hero, about, alts) |
| [ ] | **Lisibilité** : phrases longues / Flesch faible — améliorer si retouche éditoriale |
| [ ] | **Réseaux sociaux** : confirmer **og:image**, **twitter:** sur l’URL canonique (HTTPS absolu, pas de cache obsolète) |

### C. Infra, DNS & durcissement

| Statut | Tâche |
|--------|--------|
| [ ] | **DNS** : `portfolio.callistoarts.com` → hébergement **v2** (basculer depuis l’ancien si encore actif) · [HOSTING.md](./HOSTING.md), [DEPLOY.md](./DEPLOY.md) |
| [ ] | **En-têtes HTTP** (HSTS, X-Frame-Options, etc.) via IONOS / `.htaccess` · [SECURITY.md § En-têtes](./SECURITY.md#http-headers-ionos) |
| [ ] | **CSP** : déployer + tests préprod · [SECURITY.md § CSP](./SECURITY.md#csp-proposal) |
| [ ] | Après changement DNS/hébergeur : **SSL Labs** + **Security Headers** |

### D. i18n & produit statique (mineur)

| Statut | Tâche |
|--------|--------|
| [ ] | Poursuivre i18n (timeline, filtres depuis JSON, etc.) · [I18N.md](./I18N.md) |

---

## Sécurité & conformité (continu)

| Statut | Tâche |
|--------|--------|
| [ ] | Relecture annuelle **mentions légales** / cookies / RGPD aligné au site |
| [ ] | Pas de données sensibles dans assets ou JSON publics non revus |
| [ ] | Si **Cloudflare** (ou équivalent) : documenter WAF / cache dans [HOSTING.md](./HOSTING.md) |

---

## Option — admin dynamique (Rails)

Uniquement si besoin métier (**galerie ou textes** éditables sans Git).

| Statut | Tâche |
|--------|--------|
| [ ] | Périmètre & parcours — [ADMIN.md](./ADMIN.md) |
| [ ] | Stack — [STACK.md](./STACK.md) |
| [ ] | Checklist serveur — [securite_sites_internet.md](./securite_sites_internet.md) |
| [ ] | Hébergement — [HOSTING.md](./HOSTING.md), [DEPLOY.md](./DEPLOY.md) |

---

## Dernières livraisons (mémo court)

- Avril 2026 : **Performance §A** — LCP (preload + eager hero), 3 vignettes portfolio eager, `defer` sur `script.js` + lecteur audio externalisé ; doc **PERFORMANCE.md**.
- **audit SORANK** intégré à la roadmap ; **mentions légales** FR + i18n ; **footer** / **hero** (points pagination).

---

*Dernière révision — 1er avril 2026 · [INDEX.md](./INDEX.md)*
