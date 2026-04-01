# Vidéos demoscene en WebM (lightbox)

Les démos listées avec un `youtubeId` s’ouvrent par défaut dans une **iframe YouTube** (lourd : JS, tracking, player). Pour alléger l’expérience, tu peux héberger une **copie WebM** optimisée sur ton site : la lightbox la lit en **`<video>`** native ; si le fichier est absent ou invalide, **repli automatique sur YouTube**.

## Activer le WebM pour une entrée

Dans `assets/images/portfolio_images.json`, sur l’objet concerné :

### Option A — Fichier au nom de l’id YouTube

1. Encoder la vidéo en `assets/videos/webm/{youtubeId}.webm` (ex. `MNNEgh-VEaA.webm`).
2. Ajouter dans l’entrée :

```json
"localWebm": true
```

### Option B — Chemin personnalisé

```json
"videoWebm": "assets/videos/webm/mon-demo.webm"
```

`localWebm` + `videoWebm` : si `videoWebm` est défini, il est utilisé en priorité.

## Encodage recommandé (FFmpeg)

**VP9 + Opus** — bon compromis qualité / poids pour le web (navigateurs récents).

```bash
# Remplace INPUT.mp4 et YOUTUBE_ID (11 caractères)
mkdir -p assets/videos/webm
ffmpeg -y -i "INPUT.mp4" \
  -c:v libvpx-vp9 -crf 32 -b:v 0 -row-mt 1 -cpu-used 2 \
  -c:a libopus -b:a 96k \
  -vf "scale='min(1920,iw)':-2" \
  "assets/videos/webm/YOUTUBE_ID.webm"
```

- **`-crf`** : 28–36 (plus haut = fichier plus petit, qualité moindre). Ajuster à l’œil.
- **`-vf scale`** : limite la largeur à 1920 px pour éviter des fichiers énormes.
- **Sans audio** (aperçu muet) : ajouter `-an` à la place de `-c:a libopus …`.

Script d’aide : `scripts/encode_demo_webm.sh` (même logique).

## Déploiement

- Déployer le dossier `assets/videos/webm/` avec le reste du site statique.
- Vérifier que le serveur sert les `.webm` avec un type MIME correct (`video/webm`) — en général OK sur Apache / Nginx / mutualisé.

## Comportement du site

1. Si `videoWebm` ou `localWebm` + fichier présent → lecture WebM dans la lightbox.
2. Sinon, ou en cas d’erreur réseau / 404 → iframe **youtube-nocookie** comme avant.

Aucun changement pour la **vignette** de la grille : elle reste basée sur la miniature YouTube (ou ton image locale).
