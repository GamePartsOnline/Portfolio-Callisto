# ROADMAP — Portfolio Callisto Arts

**Priorité** : le **site statique** en production. La **sécurité** et la **conformité** sont un fil continu. Une **évolution applicative** (Rails, admin) reste **optionnelle** — périmètre et stack décrits dans [STACK.md](./STACK.md) et [ADMIN.md](./ADMIN.md), pas dans [ARCHITECTURE.md](./ARCHITECTURE.md) (réservé au statique).

Alignement référence : [SECURITY.md](./SECURITY.md), [securite_sites_internet.md](./securite_sites_internet.md).

**Règle projet** : à **chaque** évolution notable (infra, DNS, déploiement, sécurité, périmètre produit ou doc structurante), **mettre à jour cette ROADMAP** — cases à cocher, section *Dernières livraisons*, et ligne *Dernière révision* en bas de fichier. Évite de laisser la feuille de route diverger du dépôt.

---

## Documents de référence

| Document | Rôle |
|----------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Site statique — schéma, pages, données, tiers |
| [STRUCTURE.md](./STRUCTURE.md) | Arborescence du dépôt |
| [HOSTING.md](./HOSTING.md) · [DEPLOY.md](./DEPLOY.md) | Domaine, DNS, IONOS, procédure de mise en ligne |
| [SECURITY.md](./SECURITY.md) | Posture sécurité : statique aujourd’hui, évolutions futures |
| [securite_sites_internet.md](./securite_sites_internet.md) | Guide général 6 couches (TLS, OWASP, CSP, infra, auth, monitoring) |
| [SITE.md](./SITE.md) | Analyse du site, **meta / SEO / i18n** |
| [GUIDE.md](./GUIDE.md) · [TEST.md](./TEST.md) · [PERFORMANCE.md](./PERFORMANCE.md) · [I18N.md](./I18N.md) | Maintenance et qualité du statique |

---

## Site statique (priorité)

| Statut | Tâche |
|--------|--------|
| [x] | i18n hybride (HTML FR + `i18n.json` + chargement côté client) |
| [x] | Navigation unifiée : accueil / portfolio / services / journal technique / mentions légales |
| [x] | UI portfolio : intro sous le titre (ligne, italique, espacement) |
| [ ] | **En-têtes HTTP** (HSTS, X-Frame-Options, etc.) selon IONOS / `.htaccess` — détail [SECURITY.md § En-têtes HTTP](./SECURITY.md#http-headers-ionos) |
| [ ] | **CSP** : proposition + tests préprod — détail [SECURITY.md § CSP](./SECURITY.md#csp-proposal) |
| [ ] | **Meta / SEO** : harmoniser `lang`, `og:locale`, descriptions FR/EN si besoin |
| [ ] | Poursuivre l’i18n (timeline, métas, libellés filtres depuis JSON si souhaité) |
| [ ] | **DNS** : faire pointer **`portfolio.callistoarts.com`** (sous-domaine de **callistoarts.com**) vers l’hébergement **v2** — aujourd’hui le DNS peut encore cibler l’**ancien** site ; suivi [HOSTING.md](./HOSTING.md), [DEPLOY.md](./DEPLOY.md) |

---

## Sécurité et conformité (continu)

| Statut | Tâche |
|--------|--------|
| [ ] | Contrôler **SSL Labs** / **Security Headers** après changement DNS ou hébergeur |
| [ ] | Relecture annuelle **mentions légales**, cookies, alignement RGPD avec le site réel |
| [ ] | **Assets et JSON** versionnés ; pas de données sensibles non revues dans les fichiers publics |
| [ ] | Si **Cloudflare** (ou équivalent) devant le domaine : documenter WAF / cache dans [HOSTING.md](./HOSTING.md) |

---

## Option — admin dynamique (Rails)

Uniquement si un besoin métier justifie une **galerie ou des textes éditables** sans repasser par le dépôt statique.

| Statut | Tâche |
|--------|--------|
| [ ] | Périmètre fonctionnel et parcours admin — [ADMIN.md](./ADMIN.md) |
| [ ] | Stack et conventions — [STACK.md](./STACK.md) |
| [ ] | Checklist **côté serveur** du guide [securite_sites_internet.md](./securite_sites_internet.md) (injection, CSRF, sessions, durcissement admin) |
| [ ] | Hébergement adapté — [HOSTING.md](./HOSTING.md), [DEPLOY.md](./DEPLOY.md) |

---

## Dernières livraisons (mémo)

- [x] Navigation à quatre entrées + page `services.html`, menu cohérent sur `mentions-legales`
- [x] Focus logo nav, sélecteur FR/EN, documentation **ARCHITECTURE** centrée sur le statique
- [x] **SECURITY** : en-têtes HTTP (IONOS / `.htaccess`) + **CSP** (Fonts, YouTube, inline) + liens depuis cette ROADMAP
- [x] **HOSTING** / **DEPLOY** : `portfolio.callistoarts.com` sur **callistoarts.com**, état DNS (ancien site jusqu’à bascule)
- [x] Règle **« toujours mettre à jour la ROADMAP »** + entrées HOSTING/DEPLOY dans le tableau des références
- [x] **Meta / SEO** : [SITE.md](./SITE.md#meta-seo-i18n) — harmonisation **index** (FR + `og:locale` / alternate) ; **build-log** / **services** : `og:locale` `en_US`

---

*Dernière révision — 1er avril 2026 (meta / SEO) · [INDEX.md](./INDEX.md)*
