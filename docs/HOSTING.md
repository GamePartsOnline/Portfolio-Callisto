# HOSTING — Où est hébergé le site ?

---

## Production actuelle

| | |
|---|---|
| **Domaine public** | **`callistoarts.com`** — l'apex sert directement le site. `www` y est redirigé. |
| **Hébergement** | **GitHub Pages**, depuis la branche `main` du dépôt `GamePartsOnline/Portfolio-Callisto`. |
| **Domaine personnalisé** | Fichier **`CNAME`** à la racine du dépôt → `callistoarts.com`. GitHub Pages ne sert **que** le hostname qui y figure. |
| **TLS** | Certificat **Let's Encrypt émis et renouvelé par GitHub**, avec *Enforce HTTPS* activé. Aucun certificat à acheter ni à renouveler. |
| **Registrar / DNS** | **IONOS** — le domaine y reste enregistré et sa zone DNS y est gérée. IONOS n'héberge plus aucun fichier du site. |

---

## Enregistrements DNS

Chez IONOS, zone `callistoarts.com` :

| Nom | Type | Valeur |
|---|---|---|
| `callistoarts.com` | A | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `callistoarts.com` | AAAA | `2606:50c0:8000::153` → `2606:50c0:8003::153` |
| `www.callistoarts.com` | CNAME | `gamepartsonline.github.io` |

Ce sont les adresses officielles de GitHub Pages. **Aucun autre enregistrement A ou AAAA ne doit exister sur l'apex** : GitHub refuse la vérification du domaine s'il en trouve d'autres.

Les enregistrements de messagerie (`MX`, `SPF`, `_dmarc`, `autodiscover`, `*._domainkey`) sont **indépendants** et restent chez IONOS. Ils ne doivent jamais être touchés lors d'une opération sur le site : leur type diffère, le mail continue de fonctionner quoi qu'il arrive au site.

---

## L'ordre des opérations, s'il faut recommencer

Changer de domaine se fait **DNS d'abord, GitHub ensuite**. Jamais l'inverse.

GitHub Pages ne sert que le hostname du fichier `CNAME`. Si ce fichier est modifié avant que le DNS ne pointe vers GitHub, Pages cesse immédiatement de servir l'ancien hostname sans pouvoir servir le nouveau : **le site tombe**, avec une page *Site not found*. C'est arrivé le 25 août 2026.

1. Poser les enregistrements DNS chez IONOS.
2. Vérifier sur le serveur faisant autorité — la réponse est **immédiate**, il n'y a pas de propagation à attendre à ce stade :
   ```bash
   dig +norec @ns1121.ui-dns.com callistoarts.com A +short
   ```
   Tant que les quatre adresses GitHub n'apparaissent pas, ne pas continuer.
3. Renseigner le domaine dans **Settings → Pages → Custom domain**, qui réécrit le fichier `CNAME`.
4. Attendre l'émission du certificat — **là, il y a une vraie attente** de quelques minutes.
5. Cocher **Enforce HTTPS**.

La propagation ne concerne que les caches des résolveurs tiers (TTL 3600, soit une heure au pire). Le serveur faisant autorité, lui, répond juste après l'écriture : s'il ne renvoie pas la nouvelle valeur, c'est que l'écriture a échoué — il faut le constater, pas attendre.

---

## Fichiers de configuration inopérants

Deux fichiers présents à la racine ne sont **pas lus par GitHub Pages** :

- **`_headers`** — format Cloudflare Pages / Netlify. Les en-têtes de cache qu'il décrit ne sont pas appliqués. GitHub Pages impose son propre `Cache-Control` et ne permet pas de le configurer.
- **`wrangler.json`** — vide (0 octet), vestige d'une piste Cloudflare Pages.

Ils sont conservés pour l'instant, mais toute documentation qui s'appuie sur eux décrit un comportement qui n'a pas lieu.

---

## Si le site devait passer à Rails

Une application Rails ne tourne pas sur GitHub Pages, qui ne sert que des fichiers statiques. Il faudrait un environnement où **Puma** (ou équivalent) tourne en continu : VPS, PaaS type Fly.io, ou offre Ruby dédiée. Le choix reste à faire, et la procédure exacte sera documentée à ce moment-là.

---

*Mis à jour : 26 août 2026*
