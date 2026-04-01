# Callisto Arts — Portfolio

Site vitrine **statique** pour **Frédérique Charton (CALLISTO)** : graphisme digital, demoscene, vidéo, outils créatifs et IA.

| | |
|---|---|
| **Site en production** | [portfolio.callistoarts.com](https://portfolio.callistoarts.com) |
| **Dépôt GitHub** | [github.com/GamePartsOnline/Portfolio-Callisto](https://github.com/GamePartsOnline/Portfolio-Callisto) |
| **Behance** | [behance.net/CallistoArtwork](https://www.behance.net/CallistoArtwork) |
| **LinkedIn** | [linkedin.com/in/frederique-charton](https://www.linkedin.com/in/frederique-charton) |

---

## Aperçu technique

- **Stack :** HTML, CSS, JavaScript (sans framework de build obligatoire).
- **Galerie :** `assets/images/portfolio_images.json` + fichiers sous `assets/images/` (chemins relatifs au site).
- **Textes optionnels :** `content.json` (sections About / Contact, chargement HTTP).
- **Déploiement :** IONOS (mutualisé) — procédures dans [`docs/DEPLOY.md`](docs/DEPLOY.md), contexte hébergement dans [`docs/HOSTING.md`](docs/HOSTING.md).

---

## Lancer en local

Le navigateur doit servir le site en **HTTP(S)** : en ouvrant `index.html` en `file://`, le chargement du JSON portfolio est bloqué ou dégradé.

```bash
chmod +x start-server.sh
./start-server.sh
```

Ou, par exemple :

```bash
python3 -m http.server 8080
```

Puis ouvrir `http://127.0.0.1:8080` (ou le port affiché).

---

## Structure du dépôt (résumé)

```
├── index.html              # Page unique
├── styles.css              # Styles
├── script.js               # Portfolio, filtres, lightbox, hero, mode nuit…
├── content.json            # Textes About/Contact (optionnel)
├── assets/images/          # JSON galerie + images par catégorie
├── assets/icons/           # Icônes « Software » (SVG)
├── docs/                   # Documentation ([INDEX.md](docs/INDEX.md))
└── scripts/                # Utilitaires (miniatures WebP, index Markdown…)
```

Détail : [`docs/STRUCTURE.md`](docs/STRUCTURE.md).

---

## Contenu et maintenance

| Besoin | Document |
|--------|----------|
| Ajouter ou modifier une œuvre | [`docs/GUIDE.md`](docs/GUIDE.md) |
| Suivi galerie / tâches | [`docs/TODO.md`](docs/TODO.md) |
| Analyse fonctionnelle du site | [`docs/SITE.md`](docs/SITE.md) |
| Piste d’évolution (ex. Rails) | [`docs/ROADMAP.md`](docs/ROADMAP.md) |

Scripts Python / shell à la racine et dans `scripts/` : génération de vignettes WebP, synchronisation JSON, etc. (voir [`docs/GUIDE.md`](docs/GUIDE.md)).

---

## Fonctionnalités notables (v2)

- Hero avec carousel alimenté par le même JSON que la grille.
- Portfolio filtrable ; **filtre par défaut « Graphics »** pour limiter le chargement initial (onglet « All » pour tout voir).
- Lightbox, timeline « Journey », mode nuit, accessibilité (ARIA, clavier, `prefers-reduced-motion`).

---

## Licence

© 2026 CALLISTO — Frédérique Charton. Tous droits réservés sur les œuvres et le site.

---

*My fun is DRAWING. ALWAYS. And forever.*
