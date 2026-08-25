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

## Ce que GitHub Pages ne permet pas

- **Aucun en-tête HTTP personnalisé.** Ni `.htaccess` (pas d'Apache), ni `_headers` (format Cloudflare Pages / Netlify). `Strict-Transport-Security` est posé automatiquement quand *Enforce HTTPS* est actif ; les autres en-têtes de sécurité ne sont pas disponibles depuis le dépôt.
- **Aucun réglage de cache.** `Cache-Control: max-age=600` est servi sur tout, sans exception — mesuré en production sur le HTML, le CSS et les images. Le seul levier est le bust via `?v=`.

Le dépôt a porté jusqu'en août 2026 des fichiers `_headers`, `wrangler.json` et `.wranglerignore`, vestiges d'une piste Cloudflare Pages abandonnée. Ils étaient sans effet et ont été supprimés. Si un besoin réel d'en-têtes personnalisés apparaît, il faudra un proxy devant le domaine (Cloudflare) ou un autre hébergeur.

---

## Si le site devait passer à Rails

Une application Rails ne tourne pas sur GitHub Pages, qui ne sert que des fichiers statiques. Il faudrait un environnement où **Puma** (ou équivalent) tourne en continu : VPS, PaaS type Fly.io, ou offre Ruby dédiée. Le choix reste à faire, et la procédure exacte sera documentée à ce moment-là.

---

*Mis à jour : 26 août 2026*
