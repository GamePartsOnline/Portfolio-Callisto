# HOSTING — Où est hébergé le site ?

---

## Production actuelle

| | |
|---|---|
| **Domaine** | **callistoarts.com** — le portfolio est prévu en sous-domaine **`portfolio.callistoarts.com`**. |
| **Hébergement cible (v2)** | **IONOS — mutualisé** — site **statique** : HTML/CSS/JS + `assets/`. |
| **DNS (état documenté)** | Tant que les enregistrements DNS pointent encore vers l’**ancien** site, l’URL publique `portfolio.callistoarts.com` peut afficher ce dernier. Mettre à jour **A** / **CNAME** (ou équivalent) chez le gestionnaire DNS (souvent **IONOS** si le domaine y est) pour viser le **nouvel** hébergement ou le bon répertoire une fois le déploiement v2 prêt. |

Le mutualisé convient au **HTML statique**. Il ne convient **pas** à une application **Ruby on Rails** en production classique.

---

## Après migration Rails

Il faudra un environnement où **Puma** (ou équivalent) peut tourner en continu. **Le choix précis (VPS, Fly.io, autre) est à faire plus tard** — sans obligation de Docker ou MinIO pour commencer.

---

## DNS

- **Court terme** : aligner `portfolio.callistoarts.com` sur l’hébergement qui sert le **site statique v2** (même dépôt que cette doc), lorsque vous basculez depuis l’ancienne cible.
- **Plus tard (Rails)** : faire pointer le domaine ou un sous-domaine vers la **nouvelle** IP ou URL fournie par l’hébergeur applicatif, depuis l’interface **IONOS** ou le registrar qui gère **callistoarts.com**.

---

*Avril 2026*
