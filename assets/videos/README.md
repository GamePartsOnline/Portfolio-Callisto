# Vidéos démo (WebM)

Les entrées portfolio avec **YouTube** peuvent servir une **vidéo WebM** locale dans la lightbox : chargement plus léger qu’une iframe YouTube, lecture directe dans le navigateur.

- **Dossier des fichiers :** `webm/` (fichiers `*.webm` déployés avec le site).
- **Convention de nom :** `assets/videos/webm/{youtubeId}.webm` (même id que dans `portfolio_images.json`).
- **Documentation encodage :** [`docs/MEDIA_WEBM.md`](../docs/MEDIA_WEBM.md).

Les fichiers volumineux ne sont pas versionnés par défaut : les ajouter au déploiement (FTP, CI) ou les committer si le dépôt reste raisonnable.
