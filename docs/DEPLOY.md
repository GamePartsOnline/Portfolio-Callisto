# DEPLOY — Déploiement

---

## Aujourd'hui — GitHub Pages

**Le déploiement, c'est le push.** Il n'y a ni FTP, ni build, ni étape manuelle.

```bash
git add .
git commit -m "…"
git push origin main
```

GitHub lance alors le workflow *pages build and deployment*, qui publie la branche `main` telle quelle. Le site est en ligne sur `https://callistoarts.com` en une à deux minutes.

Suivre le déploiement : onglet **Actions** du dépôt, ou

```bash
gh run list --workflow "pages build and deployment" --limit 3
```

Contexte d'hébergement, DNS et TLS : [HOSTING.md](./HOSTING.md).

---

## Ce qui part en production

Le dépôt **est** le site : tout ce qui est commité à la racine est servi. Il faut donc veiller à ce que ces fichiers soient bien versionnés, faute de quoi la galerie se vide ou les textes disparaissent en ligne alors que tout fonctionne en local :

- `assets/images/portfolio_images.json` et les images de `assets/images/`
- `content.json`, `i18n.json`
- `styles.css`, `script.js` — et **incrémenter le `?v=` dans les pages HTML** à chaque modification, sinon les navigateurs servent l'ancienne version depuis leur cache
- `CNAME` — **ne jamais le modifier à la main** : il est géré par Settings → Pages, et une valeur incohérente avec le DNS met le site hors ligne

---

## Vérifier après un déploiement

```bash
curl -sI https://callistoarts.com/ | head -3          # 200, server: GitHub.com
curl -sI https://callistoarts.com/nimportequoi/       # 404 + la page 404 du site
```

Si une vignette manque en ligne alors qu'elle s'affiche en local, la cause est presque toujours un fichier non commité dans `assets/images/` — pas un problème d'hébergement.

---

## Rollback

L'historique Git est le mécanisme de retour arrière : `git revert <sha>` puis push republie l'état précédent. Il n'y a pas de sauvegarde séparée à restaurer, le dépôt fait foi.

---

## Demain — si passage à Rails 8

Une app Rails ne tourne pas sur GitHub Pages. Il faudra :

- un **VPS**, un **PaaS** (ex. Fly.io), ou une offre **Ruby** dédiée,
- un processus type **Puma** + reverse proxy selon l'hébergeur.

**Pas de doc détaillée tant que le choix d'hébergeur n'est pas fixé** — la procédure exacte sera écrite à ce moment-là (variables d'environnement, `SECRET_KEY_BASE`, Active Storage, etc.).

---

*Mis à jour : 26 août 2026*
