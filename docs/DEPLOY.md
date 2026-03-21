# DEPLOY — Déploiement

---

## Aujourd’hui — site statique v2 (IONOS mutualisé)

1. Générer les fichiers (HTML, CSS, JS, `assets/`).
2. Envoyer sur l’hébergement mutualisé (**FTP** ou gestionnaire de fichiers IONOS).
3. Vérifier que le domaine pointe vers le bon répertoire (`index.html` à la racine du site).

`content.json` et `portfolio_images.json` doivent être **déployés avec** le reste.

Détails contexte : [HOSTING.md](./HOSTING.md).

---

## Demain — application Rails 8

Une app Rails **ne tourne pas** sur un mutualisé classique. Il faudra :

- un **VPS**, un **PaaS** (ex. Fly.io), ou une offre **Ruby** spécifique si IONOS en propose une,
- processus type **Puma** + **reverse proxy** (nginx, etc.) selon l’hébergeur.

**Pas de doc détaillée tant que le choix d’hébergeur n’est pas fixé** — on documentera la procédure exacte à ce moment-là (variables d’environnement, `SECRET_KEY_BASE`, Active Storage, etc.).

---

*Mars 2026*
