# Sécurité — Portfolio Callisto Arts

Ce document **adapte** le guide général [securite_sites_internet.md](./securite_sites_internet.md) (6 couches + checklist OWASP) au **projet réel** : site **statique** aujourd’hui, **Rails** éventuel demain. Il ne remplace pas le guide : il en précise l’**applicabilité** et les **actions** concrètes.

---

## 1. Périmètre actuel (site statique)

| Couche (guide) | Applicabilité | Actions / notes pour Callisto |
|----------------|---------------|-------------------------------|
| **1 — Chiffrement & identité** | **Oui — côté hébergeur** | TLS/HTTPS sur le domaine (IONOS / certificat). Vérifier redirection HTTP→HTTPS. [SSL Labs](https://www.ssllabs.com/ssltest/) sur `portfolio.callistoarts.com`. Pas de mots de passe utilisateurs sur ce site statique. |
| **2 — Injections, XSS, CSRF** | **Partiel** | Pas de SQL ni de formulaires POST vers un backend maison. **Risque XSS** : contenu injecté en JS (`innerHTML` depuis JSON/i18n) — les fichiers sont **contrôlés par le dépôt** ; ne pas injecter de HTML provenant d’utilisateurs sans échappement. **CSRF** : non applicable aux formulaires serveur absents ; les formulaires futurs Rails devront utiliser les protections framework. |
| **3 — Infrastructure** | **Oui — hébergement** | Mises à jour **fichiers** du site (déploiement). Pas de PHP/Node sur le mutualisé pour cette app. Option **WAF/CDN** (ex. Cloudflare devant le domaine) si besoin de mitigation DDoS / règles. Permissions fichiers en déploiement (éviter 777). |
| **4 — En-têtes HTTP** | **Recommandé** | Configurer côté serveur ou `.htaccess` si disponible : `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options` ou `frame-ancestors`, `Referrer-Policy`. **CSP** : utile mais à tester (Google Fonts, YouTube, inline scripts éventuels). Vérifier : [Security Headers](https://securityheaders.com). |
| **5 — Authentification** | **N/A** (statique) | Pas de compte visiteur. **Back-office** : uniquement lors d’une migration **Rails** — 2FA admin, mots de passe forts, sessions sécurisées (voir guide). |
| **6 — Monitoring** | **Partiel** | Logs **hébergeur** / statistiques IONOS. Pas d’app logs applicatifs. Après Rails : logging + alertes selon guide. |

**Données personnelles** : mentions [RGPD dans les mentions légales](../mentions-legales.html) ; bannière cookies + `localStorage` pour le choix — pas de tracking publicitaire côté code maison documenté.

<a id="http-headers-ionos"></a>

### En-têtes HTTP — IONOS / `.htaccess` (détail)

Sur **mutualisé Apache**, les en-têtes se posent souvent via un **`.htaccess`** à la racine du site (dossier public), **si** l’hébergeur autorise `Header` et `mod_headers`. Sinon, chercher une rubrique **sécurité / en-têtes** dans l’espace client IONOS ou accepter les en-têtes déjà injectés par la plateforme.

**Ordre recommandé** : valider **HTTPS** + redirection HTTP→HTTPS **avant** d’activer **HSTS** (sinon risque de blocage des visiteurs en cas de mauvaise config TLS).

Exemple de base (Apache 2.4, à adapter après test sur préprod) :

```apache
<IfModule mod_headers.c>
  # HSTS — uniquement si le site est 100 % servi en HTTPS
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

- **`preload`** pour HSTS : optionnel ; l’inscription sur la liste preload est un engagement fort — voir les règles du projet HSTS preload.
- **`Content-Security-Policy`** : proposition et tests décrits dans [§ CSP ci-dessous](#csp-proposal).
- **Vérification** : [Security Headers](https://securityheaders.com) sur l’URL publique, en complément de [SSL Labs](https://www.ssllabs.com/ssltest/).

<a id="csp-proposal"></a>

### CSP — proposition et tests préprod (Fonts, YouTube, scripts inline)

**Contexte Callisto** (site statique v2) :

| Besoin | Origines / patterns |
|--------|---------------------|
| **Google Fonts** | `https://fonts.googleapis.com` (CSS), `https://fonts.gstatic.com` (fichiers de polices) |
| **YouTube** | iframes `https://www.youtube-nocookie.com/embed/…` (lightbox), miniatures `https://img.youtube.com/…` |
| **Scripts** | `assets/js/script.js`, `cookie-consent.js`, et **blocs `<script>` inline** dans les HTML (amorçage i18n, etc.) |
| **Inline** | Attributs **`onload`** sur les `<link>` de préchargement des polices (nonces peu réalistes sans étape de build) |
| **Données** | `fetch` same-origin : `portfolio_images.json`, `i18n.json`, `content.json` |
| **Vidéo locale** | WebM sous `assets/videos/webm/` (élément `<video>`) |

**Proposition — politique « pragmatique »** (à valider page par page en préprod) :

Les directives suivantes **autorisent explicitement** Fonts + YouTube + scripts / styles du site. **`'unsafe-inline'`** sur `script-src` et `style-src` reste une **dette** : elle compense les scripts inline et les handlers `onload` tant qu’on n’a pas extrait le JS vers des fichiers ou introduit des **nonces** (souvent via un outil de build).

Politique sur **une ligne** (pour en-tête HTTP ou test dans les DevTools) :

```http
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://img.youtube.com; media-src 'self'; connect-src 'self'; frame-src https://www.youtube-nocookie.com https://www.youtube.com; frame-ancestors 'self';
```

**Exemple Apache** (`mod_headers`), à fusionner avec le bloc des autres en-têtes :

```apache
Header always set Content-Security-Policy "default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://img.youtube.com; media-src 'self'; connect-src 'self'; frame-src https://www.youtube-nocookie.com https://www.youtube.com; frame-ancestors 'self';"
```

**Tests préprod** :

1. Ouvrir **chaque** page (`index`, `build-log`, `services`, `mentions-legales`) avec la CSP active.
2. Console du navigateur : absence de **violations** CSP (rouge). Si une ressource est bloquée, ajouter l’origine manquante **au plus juste** ou corriger le markup (éviter `https:` trop large sur `img-src` sauf besoin prouvé).
3. Vérifier le **portfolio** : grille, lightbox image, **vidéo YouTube** et **WebM** locale.
4. Vérifier **FR/EN** et la bannière cookies.
5. Re-tester après [Security Headers](https://securityheaders.com) — la note CSP peut rester « imparfaite » tant que `'unsafe-inline'` est présent ; documenter une **étape suivante** (nonces ou refactor JS) dans la ROADMAP si besoin.

---

## 2. Checklist courte — statique (à revoir au déploiement)

- [ ] HTTPS actif + redirection **HTTP → HTTPS**
- [ ] Certificat valide (renouvellement auto si Let’s Encrypt)
- [ ] En-têtes de sécurité de base (au minimum **HSTS** si possible, **nosniff**, cadre clickjacking)
- [ ] Revoir **CSP** en environnement de test avant production
- [ ] Contenu JSON / i18n **versionné** — pas de chaînes non fiables sans revue
- [ ] Dépendances **tiers** limitées (Fonts, YouTube) — politique de confidentialité à jour
- [ ] Sauvegardes : **dépôt Git** + copie des assets sur poste de déploiement

---

## 3. Migration Rails (quand elle existera)

Réutiliser la **checklist « avant déploiement »** du guide [securite_sites_internet.md](./securite_sites_internet.md) (section *Checklist de sécurité*) : TLS, hachage mots de passe, requêtes préparées, XSS, CSRF, permissions, **pas d’erreurs SQL en prod**, en-têtes, WAF optionnel, logging, rate limiting sur l’auth.

**OWASP Top 10** : le tableau des mitigations du guide s’applique pleinement une fois qu’il y a une **application serveur**.

---

## 4. Références croisées

| Document | Contenu |
|----------|---------|
| [securite_sites_internet.md](./securite_sites_internet.md) | Guide complet 6 couches, exemples Nginx/PHP, normes |
| [HOSTING.md](./HOSTING.md) | IONOS mutualisé vs futur PaaS/VPS |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Site statique — périmètre technique |
| [ROADMAP.md](./ROADMAP.md) | Tâches sécurité & conformité planifiées |

---

*Avril 2026 — à maintenir lors des changements d’hébergement ou de stack.*
