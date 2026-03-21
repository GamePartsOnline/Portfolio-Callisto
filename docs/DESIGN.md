# DESIGN — Design System Liquid Glass 2026
**Portfolio Callisto Arts — Référence visuelle & tokens**

> **Source de vérité visuelle du site v2 :** fichier `styles.css` à la racine du projet. Ce document résume les tokens ; la migration **Rails + Tailwind** reprendra ces couleurs et effets.

---

## Philosophie

Le design system du portfolio CALLISTO est construit autour du concept **Liquid Glass 2026** : surfaces semi-transparentes avec effet de verre dépoli, profondeur par couches, palette sombre avec accents lumineux caractéristiques de l'esthétique demoscene.

---

## Palette de couleurs

### Couleurs de fond

| Token | Valeur | Usage |
|---|---|---|
| `--color-bg-primary` | `#1a1a1a` | Fond principal de la page |
| `--color-bg-secondary` | `#2a2a2a` | Surfaces élevées (cards) |
| `--color-bg-tertiary` | `#3a3a3a` | Éléments interactifs au repos |

### Couleurs de texte

| Token | Valeur | Usage |
|---|---|---|
| `--color-text-primary` | `#ffffff` | Titres, texte principal |
| `--color-text-secondary` | `#e0e0e0` | Corps de texte |
| `--color-text-tertiary` | `#b0b0b0` | Texte secondaire, légendes |

### Accents (identité CALLISTO)

| Token | Valeur | Usage |
|---|---|---|
| `--color-accent-rose` | `#f472b6` | Accent principal, hover, highlights |
| `--color-accent-neon` | `#00ffe0` | Accent secondaire, timeline neon |
| `--color-accent-gold` | `#ffd700` | Awards, badges, récompenses |
| `--color-border` | `rgba(255,255,255,0.1)` | Bordures glass |

### Effet Liquid Glass

| Token | Valeur | Usage |
|---|---|---|
| `--glass-bg` | `rgba(255,255,255,0.05)` | Fond des cards glass |
| `--glass-border` | `rgba(255,255,255,0.1)` | Bordure glass |
| `--glass-blur` | `blur(20px)` | backdrop-filter |
| `--glass-shadow` | Multiple box-shadows | Profondeur glass |

---

## Typographie

### Polices utilisées

| Famille | Poids | Usage | Source |
|---|---|---|---|
| **Inter** | 300, 400, 500, 600, 700 | Corps de texte, navigation, UI | Google Fonts |
| **Share Tech Mono** | 400 | Éléments techniques, timeline dates | Google Fonts |
| **Cinzel** | 400, 700 | Titres hero, nom artiste | Google Fonts |

### Échelle typographique

```
Hero title       : Cinzel 700, ~3.5rem desktop / 2rem mobile
Section title    : Inter 600, 2rem
Card title       : Inter 600, 1.25rem
Body text        : Inter 400, 1rem
Caption / meta   : Inter 300, 0.875rem
Code / timeline  : Share Tech Mono, 0.875rem
```

---

## Composants

### Glass Card (`.glass-card`)

```css
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.1);
backdrop-filter: blur(20px);
border-radius: 16px;
box-shadow:
  0 8px 32px rgba(0, 0, 0, 0.3),
  inset 0 1px 0 rgba(255, 255, 255, 0.1);
```

Hover : `transform: translateY(-4px)` + ombre renforcée + brillance animée

### Badge Award

```
Fond         : or (#ffd700) semi-transparent
Texte        : #1a1a1a (contraste AAA)
Icône        : étoile ★ ou trophée
Position     : coin supérieur gauche de l'image
```

### Bouton de filtre

```
État repos   : glass card, texte secondaire
État actif   : bordure rose (#f472b6), texte blanc
Transition   : 200ms ease
```

### Timeline neon

```
Ligne        : gradient turquoise → transparent
Point        : cercle turquoise (#00ffe0), glow effect
Texte date   : Share Tech Mono, turquoise
Type award   : or (#ffd700) avec glow
Type rose    : rose (#f472b6)
```

---

## Animations & Motion

### Keyframes CSS

| Animation | Durée | Propriété |
|---|---|---|
| `gradientShift` | 20s | background-position |
| `meshMove` | 25s | transform (translate + rotate) |
| `orbFloat` | 20–35s | transform (translate) |
| `gridMove` | 30s | background-position |
| `particleFloat` | Variable | transform (JS) |

### Règles

- Toutes les animations respectent `prefers-reduced-motion: reduce`
- Transitions UI : 200ms ease (boutons, hover)
- Transitions de page : 300ms
- Animations background : GPU-accelerated (`transform`, `opacity` uniquement)

### Mode Nuit d'Atelier

Ambiance spéciale activée via bouton toggle :
- Overlay vignette sombre progressif
- Canvas étoiles animées
- Lumière de bougie (orbe ambre pulsant)
- Curseur pixel flamme
- Grain de film
- Pas d'accès admin en mode nuit

---

## Curseur custom

Curseur pixel art CALLISTO :
- Sprite 16×16px neon sur fond transparent
- Traînée lumineuse (rose/turquoise) au déplacement
- Burst de particules au clic
- Désactivé sur mobile / touch
- Désactivé si `prefers-reduced-motion`

---

## Responsive

| Breakpoint | Largeur | Grille portfolio | Navigation |
|---|---|---|---|
| Mobile | < 640px | 1 colonne | Hamburger |
| Tablet | 640–1024px | 2 colonnes | Hamburger |
| Desktop | > 1024px | 3 colonnes | Logo + texte + liens |

---

## Icônes & assets

### Logo

- Fichier : `assets/images/logo/logo-cllisto.png`
- Usage : navigation (desktop : logo + texte / mobile : logo seul) + footer
- Format recommandé : PNG transparent ou SVG

### Réseaux sociaux

Icônes SVG custom intégrées dans le HTML :
- Behance
- Instagram
- Facebook
- Demozoo

---

## Tokens à migrer pour Rails 8 + Tailwind

Dans `tailwind.config.js` (v3.0.0) :

```javascript
theme: {
  extend: {
    colors: {
      'accent-rose':  '#f472b6',
      'accent-neon':  '#00ffe0',
      'accent-gold':  '#ffd700',
      'bg-primary':   '#1a1a1a',
      'bg-secondary': '#2a2a2a',
      'bg-tertiary':  '#3a3a3a',
    },
    fontFamily: {
      'display': ['Cinzel', 'serif'],
      'mono-tech': ['Share Tech Mono', 'monospace'],
      'sans': ['Inter', 'sans-serif'],
    },
    backdropBlur: {
      'glass': '20px',
    }
  }
}
```

---

## À préciser / Questions ouvertes

- [ ] Image Open Graph : quelle œuvre représente le mieux le site ?
- [ ] Favicon : version dark / light ? Format SVG ou ICO ?
- [ ] Page admin : même design Liquid Glass ou interface distincte (plus neutre) ?
- [ ] Mode clair (light theme) : souhaité ou dark only ?
- [ ] Logo : une version SVG du logo est-elle disponible ?

---

*Design system documenté le 21 Mars 2026 — Frédérique Charton (CALLISTO)*
