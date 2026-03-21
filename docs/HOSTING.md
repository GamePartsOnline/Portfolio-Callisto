# HOSTING — Où est hébergé le site ?

---

## Production actuelle

| | |
|---|---|
| **Site** | portfolio.callistoarts.com (et équivalent selon DNS) |
| **Type** | **IONOS — hébergement mutualisé** |
| **Contenu** | Site **statique** v2 : fichiers HTML/CSS/JS + assets |

Le mutualisé convient au **HTML statique**. Il ne convient **pas** à une application **Ruby on Rails** en production classique.

---

## Après migration Rails

Il faudra un environnement où **Puma** (ou équivalent) peut tourner en continu. **Le choix précis (VPS, Fly.io, autre) est à faire plus tard** — sans obligation de Docker ou MinIO pour commencer.

---

## DNS

Lors du passage à Rails : faire pointer le domaine (ou un sous-domaine) vers la **nouvelle** IP ou URL fournie par l’hébergeur, depuis l’interface **IONOS** ou le registrar qui gère le domaine.

---

*Mars 2026*
