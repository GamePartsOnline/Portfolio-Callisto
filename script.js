/**
 * True si la page est ouverte en file:// (double-clic sur index.html).
 * Dans ce cas fetch() vers des fichiers locaux est bloqué par le navigateur (CORS).
 */
function isFileProtocol() {
  return window.location.protocol === "file:";
}

/** Fichiers renommés : ancienne clé JSON → nom actuel sur disque */
const LEGACY_IMAGE_FILENAMES = {
  "aquarelle/ouvaton?.jpg": "aquarelle/ouvaton.jpg",
};

/**
 * Chemin d’image portfolio : encode chaque segment (encodeURI ne encode pas `?`
 * ni `#` dans le nom de fichier).
 */
function assetImagePath(filename) {
  if (!filename) return "";
  let normalized = String(filename).replace(/\\/g, "/").replace(/^\/+/, "");
  if (LEGACY_IMAGE_FILENAMES[normalized]) {
    normalized = LEGACY_IMAGE_FILENAMES[normalized];
  }
  const segments = normalized.split("/").filter(Boolean);
  if (!segments.length) return "";
  return "assets/images/" + segments.map(encodeURIComponent).join("/");
}

// ============================================
// ANIMATED BACKGROUND PARTICLES
// ============================================
function initParticles() {
  const particlesContainer = document.getElementById("bgParticles");
  if (!particlesContainer) return;

  // Verify container existence and set heavy z-index to ensure visibility
  // DO THIS FIRST to ensure it applies even if reduced motion is on
  if (particlesContainer) {
    particlesContainer.style.zIndex = "10"; // Force visibility above other layers
  }

  // Vérifier si l'utilisateur préfère réduire les animations
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) {
    // Créer quelques particules statiques seulement
    const staticParticles = window.innerWidth < 768 ? 6 : 12;
    for (let i = 0; i < staticParticles; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";

      // Large & bright for visibility even without motion
      const size = Math.random() * 3 + 2; // 2-5px
      particle.style.width = size + "px";
      particle.style.height = size + "px";
      particle.style.opacity = Math.random() * 0.4 + 0.4; // 0.4-0.8

      particlesContainer.appendChild(particle);
    }
    return;
  }

  // Moins de particules + une seule boucle rAF (évite 40–80 timers GPU en parallèle)
  const particleCount = window.innerWidth < 768 ? 8 : 16;
  const particles = [];
  const states = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    const size = Math.random() * 2.5 + 1.5; // 1.5-4px
    particle.style.width = size + "px";
    particle.style.height = size + "px";

    const opacity = Math.random() * 0.4 + 0.4;
    particle.style.opacity = opacity;

    particlesContainer.appendChild(particle);
    particles.push(particle);

    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    particle.style.left = startX + "px";
    particle.style.top = startY + "px";

    states.push({
      particle,
      trajectoryType: Math.random() > 0.5 ? "circular" : "sinusoidal",
      duration: 15000 + Math.random() * 15000,
      radius: 50 + Math.random() * 100,
      speed: Math.random() * 0.02 + 0.01,
      startTime: null,
      angle: Math.random() * Math.PI * 2,
    });
  }

  function animateParticlesFrame(currentTime) {
    states.forEach((s) => {
      const particle = s.particle;
      if (!s.startTime) s.startTime = currentTime;
      let elapsed = (currentTime - s.startTime) / s.duration;
      if (elapsed >= 1) {
        s.startTime = currentTime;
        s.angle = Math.random() * Math.PI * 2;
        elapsed = 0;
      }

      let x;
      let y;
      if (s.trajectoryType === "circular") {
        s.angle += s.speed;
        x = Math.cos(s.angle) * s.radius;
        y = Math.sin(s.angle) * s.radius;
      } else {
        x = Math.sin(s.angle) * s.radius;
        y = Math.cos(s.angle * 2) * s.radius * 0.5;
        s.angle += s.speed;
      }

      const driftX = Math.sin(elapsed * Math.PI * 2) * 30;
      const driftY = Math.cos(elapsed * Math.PI * 2) * 20;

      particle.style.transform = `translate(${x + driftX}px, ${y + driftY}px)`;

      const baseOpacity = particle.dataset.baseOpacity
        ? parseFloat(particle.dataset.baseOpacity)
        : 0.5;
      if (!particle.dataset.baseOpacity)
        particle.dataset.baseOpacity = String(baseOpacity);

      const opacityVariation = Math.sin(elapsed * Math.PI * 4) * 0.2;
      particle.style.opacity = Math.max(
        0.3,
        Math.min(1.0, baseOpacity + opacityVariation),
      );
    });
    requestAnimationFrame(animateParticlesFrame);
  }

  requestAnimationFrame(animateParticlesFrame);

  // Réinitialiser au redimensionnement (avec debounce)
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      particles.forEach((p) => p.remove());
      initParticles();
    }, 300);
  });
}

// ============================================
// PARALLAX EFFECT SUR SCROLL (subtile)
// ============================================
function initParallax() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) return;

  const orbs = document.querySelectorAll(".orb");
  const mesh = document.querySelector(".bg-mesh");

  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.1; // Facteur de parallaxe très subtil

        orbs.forEach((orb, index) => {
          const speed = (index + 1) * 0.05;
          orb.style.transform = `translateY(${rate * speed}px)`;
        });

        if (mesh) {
          mesh.style.transform = `translateY(${rate * 0.03}px)`;
        }

        ticking = false;
      });
      ticking = true;
    }
  });
}

// ============================================
// NAVIGATION MOBILE
// ============================================
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navDesktopMq = window.matchMedia("(min-width: 768px)");

/**
 * aria-hidden sur #navMenu : ne jamais le poser tant qu’un descendant a le focus
 * (sinon avertissement navigateur + utilisateurs AT exclus). Déplacer le focus avant.
 * En vue bureau, ne pas masquer le menu aux lecteurs d’écran.
 */
function syncNavMenuAriaHidden() {
  if (!navToggle || !navMenu) return;
  if (navDesktopMq.matches) {
    navMenu.removeAttribute("aria-hidden");
    return;
  }
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navMenu.setAttribute("aria-hidden", expanded ? "false" : "true");
}

function focusNavToggleIfNeeded() {
  if (navMenu && document.activeElement && navMenu.contains(document.activeElement)) {
    navToggle.focus();
  }
}

if (navToggle && navMenu) {
  syncNavMenuAriaHidden();
  navDesktopMq.addEventListener("change", syncNavMenuAriaHidden);

  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      focusNavToggleIfNeeded();
    }
    navToggle.setAttribute("aria-expanded", String(!isExpanded));
    syncNavMenuAriaHidden();
  });

  // Fermer le menu au clic sur un lien (mobile uniquement : menu ouvert)
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navToggle.getAttribute("aria-expanded") !== "true") return;
      navToggle.focus();
      navToggle.setAttribute("aria-expanded", "false");
      syncNavMenuAriaHidden();
    });
  });

  // Fermer le menu avec Escape — focus avant aria-hidden
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      navToggle.getAttribute("aria-expanded") === "true"
    ) {
      navToggle.focus();
      navToggle.setAttribute("aria-expanded", "false");
      syncNavMenuAriaHidden();
    }
  });
}

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href === "#") return;

    e.preventDefault();
    const target = document.querySelector(href);

    if (target) {
      const offsetTop = target.offsetTop - 60; // Compenser la nav fixe
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  });
});

// ============================================
// PORTFOLIO AUTO-LOAD FROM JSON
// ============================================
// ============================================
// PORTFOLIO DATA (Embedded to fix local CORS issues)
// ============================================
const portfolioData = {
  categories: [
    { id: "graphics", label: "Graphics" },
    { id: "paintover", label: "Paintover" },
    { id: "IA", label: "IA Art" },
    { id: "photo", label: "Photos" },
    { id: "gaming", label: "Gaming Artwork" },
    { id: "pastel-sec", label: "Pastel sec" },
    { id: "acrylique", label: "Acrylique" },
    { id: "aquarelle", label: "Aquarelle" },
    { id: "animation", label: "Animation" },
    { id: "other", label: "Others" },
    { id: "logo", label: "Logo (masqué du portfolio)" },
  ],
  images: [
    {
      filename: "graphics/sky_code.jpg",
      category: "graphics",
      title: "Sky Code",
      year: 2025,
      award: "Inércia 2025 Graphics Showcase",
      description:
        "by Callisto / Flush ^ GPO ^ Silicium\n\nReleased 7 December 2025.",
    },
    {
      filename: "graphics/armonia.jpg",
      category: "graphics",
      title:
        "Aerolia Harmonia by Callisto / Flush ^ Vital Motion Group",
      year: 2023,
      award: "Inércia Demoparty 2023 Graphics Showcase",
      description: "Released 2 December 2023.",
    },
    {
      filename: "graphics/teddy-beer-syntax-2022.png",
      category: "graphics",
      title: "I come with my teddy BEER !!!",
      year: 2022,
      award: "3rd in the Syntax 2022 Nuskool Graphics competition",
      description:
        "by Callisto / Flush ^ Vital-Motion!\n\nReleased 13 November 2022.\n\nhttps://demozoo.org/graphics/315433/",
    },
    {
      filename: "graphics/5f43.132281.jpg",
      category: "graphics",
      title: "The Mystic River by Callisto",
      year: 2017,
      award: "9th in the Revision 2017 Modern Graphics competition",
      description: "Released 15 April 2017 — Windows.",
    },
    {
      filename: "graphics/d776.375292.jpg",
      category: "graphics",
      title: "IRL Gfx Squirrel Is Here",
      year: 2026,
      award: "5th in the Rsync 2026 Graphics competition",
      description: "by Callisto\n\nReleased 9 January 2026.",
    },
    {
      filename: "graphics/Callisto_Pascals-lemur-leap_step-finale-2048x1152.jpg",
      category: "graphics",
      title: "Pascal's Lemur Leap",
      year: 2025,
      award: "10th in the Revision 2025 Modern Graphics competition",
      description: "by Callisto / Flush\n\nReleased 20 April 2025.",
    },
    {
      filename: "graphics/Chromatic.jpg",
      category: "graphics",
      title: "Chromatique résonance",
      year: 2024,
      award: "1st in the Rsync 2024 Graphics competition",
      description:
        "Chromatic Resonance by Callisto\n\nReleased 5 January 2024.",
    },
    {
      filename: "IA/digital/dba8.371782.jpg",
      category: "IA",
      title: "Inercia 2925 by Callisto",
      year: 2025,
      award: "Inércia 2025 genAI Showcase",
      description:
        "In the Inércia 2025 genAI Showcase.\n\nReleased 7 December 2025 — Windows.",
    },
    {
      filename: "graphics/abyss_of-symphony.jpg",
      category: "graphics",
      title: "Symphony Of The Abyss by Callisto",
      year: 2025,
      award: "2nd in the Rsync 2025 Graphics competition",
      description: "Released 10 January 2025.",
    },
    {
      filename: "graphics/paul_le_poulpe.png",
      category: "graphics",
      title: "Paul le poulpe by Callisto",
      year: 2024,
      award: "Shadow Party 2024 Newschool Graphics competition",
      description: "Released 29 June 2024.",
    },
    {
      filename: "graphics/paintover2024_callisto_refresh_step05.jpg",
      category: "paintover",
      title: "Refresh",
      year: 2024,
      award: "12th in the Revision 2024 Paintover competition",
      description:
        "by Callisto / Flush ^ Vital-Motion!\n\nReleased 31 March 2024.",
    },
    {
      filename: "graphics/pixelmouse.jpg",
      category: "graphics",
      title: "The Pixel Mouse Love Story by Callisto / Flush ^ Vital-Motion!",
      year: 2024,
      award: "7th in the Revision 2024 Modern Graphics competition",
      description: "Released 31 March 2024.",
    },
    {
      filename: "paintover/76b3.160407.jpg",
      category: "paintover",
      title: "Sisters and Company",
      year: 2018,
      award: "8th in the Revision 2018 Paintover competition",
      description: "by Callisto\n\nReleased 1 April 2018.",
    },
    {
      filename: "paintover/010d.307657.jpg",
      category: "paintover",
      title: "Head in the Stars by Callisto / Flush",
      year: 2022,
      award: "10th in the Revision 2022 Paintover competition",
      description:
        "Invitation for Shadow Party 2022\n\nReleased 17 April 2022.",
    },
    {
      filename: "paintover/25aa.264370.jpg",
      category: "paintover",
      title: "Fairy Butter Ponny by Callisto",
      year: 2020,
      award: "16th in the Revision Online 2020 Paintover competition",
      description: "Released 12 April 2020.",
    },
    {
      filename: "graphics/3f29.85342.jpg",
      category: "paintover",
      title: "Pac'man to space",
      year: 2015,
      award: "9th in the Revision 2015 Paintover competition",
      description:
        "by Callisto\n\nReleased 5 April 2015 — Windows.",
    },
    {
      filename: "graphics/407845946_398297489188178_8033467046376857047_n.jpg",
      category: "graphics",
      title: "Elevation 2079",
      year: 2022,
      award:
        "1st in the Inércia Demoparty 2022 Freestyle Graphics competition",
      description:
        "by Callisto / Flush ^ Vital-Motion!\n\nReleased 5 November 2022.",
    },
    {
      filename: "graphics/Luna-fly-by-callisto-finale-1-scaled.jpg",
      category: "graphics",
      title: "Luna Fly",
      year: 2023,
      award:
        "5th in the SESSIONS in C4 LAN 2023 SPRING Combined Graphics competition",
      description:
        "by Callisto / Flush ^ GPO ^ Vital-Motion!\n\nReleased 29 April 2023.",
    },
    {
      filename: "graphics/cropped-elevation-finale-scaled-1.jpg",
      category: "graphics",
      title: "Elevation 2079",
      award: "1ère place @ Inercia",
      year: 2022,
    },
    {
      filename: "graphics/339435602_905924634051246_6940335715669469411_n.jpg",
      category: "graphics",
      title: "Howl Of The Forest",
      year: 2023,
      award: "11th in the Revision 2023 Modern Graphics competition",
      description:
        "by Callisto / Flush ^ Vital-Motion!\n\nReleased 9 April 2023.",
    },
    {
      filename: "graphics/b2c6.287706.jpg",
      category: "graphics",
      title: "You Seem So Delicious",
      year: 2021,
      award: "1st in the Assembly 2021 Winter Online Graphics competition",
      description: "by Callisto / Syn[Rj]\n\nReleased 19 March 2021.",
    },
    {
      filename: "graphics/rift.jpg",
      category: "graphics",
      title: "The rift",
      year: 2021,
      award: "11th  revision - saarbrucken - Allemagne",
    },
    {
      filename: "graphics/sharko.png",
      category: "graphics",
      title: "Sharko",
      year: 2021,
      award: "5th in the TokyoDemoFest 2021 Graphics competition",
      description:
        "by Callisto / Flush\n\nReleased 11 December 2021.\n\nhttps://demozoo.org/graphics/303081/",
    },
    {
      filename: "photo/Callisto_convergence-1024x510.jpg",
      category: "photo",
      title: "Convergence by Callisto / Flush ^ Vital-Motion!",
      year: 2024,
      award: "18th in the Revision 2024 Photo competition",
      description: "Released 30 March 2024.",
    },
    {
      filename: "photo/Callisto_photo_revision2023-1024x547.jpg",
      category: "photo",
      title: "Balls Of Steel by Callisto / Flush ^ Vital-Motion!",
      year: 2023,
      award: "16th in the Revision 2023 Photo competition",
      description: "Released 8 April 2023.",
    },
    {
      filename: "photo/myhungryman.jpg",
      category: "photo",
      title: "My Angry Husband by Callisto / Flush ^ Vital-Motion!",
      year: 2023,
      award: "19th in the Function 2023 Photo competition",
      description: "Released 9 September 2023.",
    },
    {
      filename: "photo/dino.jpg",
      category: "photo",
      title: "Dino Sort",
      year: 2025,
      award: "9th in the Shadow Party 2025 Photo competition",
      description: "by Callisto / Flush\n\nReleased 5 July 2025.",
    },
    {
      filename: "photo/da05.354142.jpg",
      category: "photo",
      title: "Um Toque de Luz with Polo",
      year: 2024,
      award: "Inércia 2024 Graphics Showcase",
      description: "by Callisto and Polo\n\nReleased 7 December 2024.",
    },
    {
      filename: "photo/9013.346292.jpg",
      category: "photo",
      title: "Snail's Pace by Callisto",
      year: 2024,
      award: "Shadow Party 2024 Photo competition",
      description: "Released 29 June 2024.",
    },
    {
      filename: "other/7a53.346293.png",
      category: "other",
      title: "Flush by Callisto",
      year: 2024,
      award: "3rd in the Shadow Party 2024 Sticker competition",
      description: "Released 29 June 2024.",
    },
    {
      filename: "other/227e.342096.jpg",
      category: "other",
      title: "Souvenirs Shadow Party 2022 by Callisto / Flush",
      year: 2024,
      award: "16th in the Revision 2024 Animated GIF competition",
      description: "Released 31 March 2024.",
    },
    {
      filename:
        "photo/312518226_10228185642768590_4918581913671770871_n-1024x652.jpg",
      category: "photo",
      title: "Flowers",
      award: "Flower photography",
    },
    {
      filename: "photo/tettigonia-viridissima.jpg",
      category: "photo",
      title: "Tettigonia Viridissima",
      year: 2022,
      award: "5th in the Inércia Demoparty 2022 Photo competition",
      description:
        "by Callisto / Flush ^ Vital-Motion!\n\nReleased 5 November 2022.\n\nhttps://demozoo.org/graphics/314984/",
    },
    {
      category: "gaming",
      youtubeId: "HLdNMPZUMl4",
      videoUrl: "https://youtu.be/HLdNMPZUMl4",
      title: "GPO - pouss pouss fabrication",
    },
    {
      filename:
        "photo/183407402_10225214914982252_8102507980517360390_n-1024x768.jpg",
      category: "photo",
      title: "Photo",
      year: 2021,
    },
    {
      filename:
        "photo/183672347_10225215575758771_3763955342084286418_n-1024x690.jpg",
      category: "photo",
      title: "Photo",
      year: 2021,
    },
    {
      filename: "other/9513.363339.jpg",
      category: "other",
      title: "Thanks All",
      year: 2025,
      award: "6th in the Shadow Party 2025 Oldschool Graphics competition",
      description:
        "by Callisto / Flush\n\nReleased 5 July 2025.\n\nAmiga OCS/ECS.",
    },
    {
      category: "other",
      youtubeId: "MNNEgh-VEaA",
      videoUrl: "https://www.youtube.com/watch?v=MNNEgh-VEaA",
      title: "Shadow Party 2025 Invitation by Flush",
      year: 2025,
      award: "4th in the 68k Inside 2025 Demo competition",
      description:
        "Invitation for Shadow Party 2025\n\nReleased 24 May 2025.\n\nAtari ST/E.",
    },
    {
      category: "other",
      youtubeId: "RLnD5NiZ8FE",
      videoUrl: "https://www.youtube.com/watch?v=RLnD5NiZ8FE",
      title: "Slip Slip by Flush",
      year: 2025,
      award: "6th in the Rsync 2025 Oldskool Demo competition",
      description:
        "Released 10 January 2025.\n\nNintendo Game Boy Advance (GBA).",
    },
    {
      category: "animation",
      youtubeId: "ARsYTLJvYzQ",
      videoUrl: "https://www.youtube.com/watch?v=ARsYTLJvYzQ",
      title: "SHADOW PARTY INVITATION 2025 by Callisto",
      year: 2025,
      award: "9th in the Revision 2025 Animation/Video competition",
      description:
        "Invitation for Shadow Party 2025\n\nReleased 19 April 2025.",
    },
    {
      category: "animation",
      youtubeId: "p6qi_bfKb2s",
      videoUrl: "https://youtu.be/p6qi_bfKb2s",
      title: "Invitation SHADOW PARTY 25",
      year: 2025,
    },
    {
      category: "animation",
      youtubeId: "HU_Z_d-PB7k",
      videoUrl: "https://www.youtube.com/watch?v=HU_Z_d-PB7k&t=1207",
      title:
        "Invitation - 29-30 June 2024 - Givry En Argonne (France) by Flush",
      year: 2024,
      award: "13th in the Revision 2024 Animation / Video competition",
      description:
        "Invitation for Shadow Party 2024\n\nReleased 30 March 2024.",
    },
    {
      category: "animation",
      youtubeId: "GnuswI8YeAM",
      videoUrl: "https://youtu.be/GnuswI8YeAM",
      title: "Slide Shadow Party",
    },
    {
      category: "animation",
      youtubeId: "_R6Goi-AO6A",
      videoUrl: "https://youtu.be/_R6Goi-AO6A",
      title: "Callisto (syn[RJ]) - Invitation Shadow-party 2021",
      year: 2021,
    },
    {
      category: "animation",
      youtubeId: "W6ybnfktkRM",
      videoUrl: "https://www.youtube.com/watch?v=W6ybnfktkRM",
      title:
        "Shadow Party Invitation 2022 (Alkama, Aubépine, Callisto, CoyHot, p0ke)",
      year: 2022,
      description:
        "Invitation for Shadow Party 2022.\n\nReleased 8 May 2022.\n\nhttps://demozoo.org/productions/308487/",
    },
    {
      category: "animation",
      youtubeId: "epusxPh_dS8",
      videoUrl: "https://youtu.be/epusxPh_dS8",
      title: "Shadow Party 2022 - Breaking News",
      year: 2022,
    },
    {
      category: "animation",
      youtubeId: "vHEVS7NptKc",
      videoUrl: "https://youtu.be/vHEVS7NptKc",
      title: "Invitation Shadow Party 2022",
      year: 2022,
    },
    {
      category: "animation",
      youtubeId: "UOlYOQ3_j6I",
      videoUrl: "https://www.youtube.com/watch?v=UOlYOQ3_j6I",
      title: "Lady Glagla by Flush",
      year: 2023,
      award:
        "2nd in the Silly Venture 2k23 WE Atari ST/STE Demo competition",
      description: "Released 9 December 2023.\n\nAtari ST/E.",
    },
    {
      category: "animation",
      youtubeId: "2nKO3UTdiPQ",
      videoUrl: "https://youtu.be/2nKO3UTdiPQ",
      title: "Cyberpin by Callisto",
      year: 2023,
      award: "9th in the Revision 2023 Animation/Video competition",
      description: "Released 8 April 2023.\n\nWindows.",
    },
    {
      category: "animation",
      youtubeId: "NJlUdcykhdw",
      videoUrl: "https://youtu.be/NJlUdcykhdw",
      title: "CYBERPIN - TV pinball / on the top screen",
      year: 2023,
      description: "Released 8 April 2023.\n\nWindows.",
    },
    {
      category: "animation",
      youtubeId: "0zU_85iDf9g",
      videoUrl: "https://youtu.be/0zU_85iDf9g",
      title: "Primitives and FM by New C-Rex",
      year: 2023,
      award:
        "6th in the SESSIONS in C4 LAN 2023 SPRING Wild competition",
      description: "Released 29 April 2023.",
    },
    {
      category: "animation",
      youtubeId: "_XIO12_g-So",
      videoUrl: "https://youtu.be/_XIO12_g-So",
      title: "Explosion 2023",
      year: 2023,
    },
    {
      category: "animation",
      youtubeId: "c-NTft-ujUY",
      videoUrl: "https://youtu.be/c-NTft-ujUY",
      title: "Lycée Agricole de Somme Suippe - portes ouvertes",
    },
    {
      category: "animation",
      youtubeId: "Z54V_SABn1U",
      videoUrl: "https://youtu.be/Z54V_SABn1U",
      title: "RBBS — We Have Accidentally Your Whole Audience",
      year: 2015,
      award:
        "16th place — Revision 2015 PC Demo — Royal Belgian Beer Squadron",
      description:
        "[DEMOSCENE] [PC DEMO] Windows — Group: Royal Belgian Beer Squadron — Released 5 April 2015 — 16th in the Revision 2015 PC Demo competition.\n\nCallisto - \"Text (Translation)\"",
    },
    {
      "filename": "acrylique/3-508x494-1.jpg",
      "category": "acrylique",
      "title": "plaque pour mon papa",
      "year": 2021,
      "description": "Série commémorative — acrylique."
    },
    {
      "filename": "acrylique/2-1.jpg",
      "category": "acrylique",
      "title": "Fuite bleu et rose",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/2-508x427-1.jpg",
      "category": "acrylique",
      "title": "sous les étoiles de l'arbre",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/09.19-508x518-1.jpg",
      "category": "acrylique",
      "title": "Love Fleur de 2019",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/484016.1153284291.1.o24494341.jpg",
      "category": "acrylique",
      "title": "La girafe et son petit",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/484017.325007515.1.o1678965315.jpg",
      "category": "acrylique",
      "title": "Le loup",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/484020.1992883738.1.o2118704691.jpg",
      "category": "acrylique",
      "title": "le petit chat se ballade",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/488894.1841485046.1.o1475312202.jpg",
      "category": "acrylique",
      "title": "La plage",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/489645.1217804915.1.o1251498251.jpg",
      "category": "acrylique",
      "title": "coucher de soleil",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/492052.180022828.1.o831404474.jpg",
      "category": "acrylique",
      "title": "The first city",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/538030.20213600.1.o1324333696.jpg",
      "category": "acrylique",
      "title": "Coeur d'orchidée M",
      "year": 2021,
      "description": "Série acrylique"
    },
    {
      "filename": "acrylique/15390826_633081763543121_7934280355348809027_n-768x757-1.jpg",
      "category": "acrylique",
      "title": "bulle de neige",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/19095290_723789734472323_308791567686722242_o-2-1000x985-1.jpg",
      "category": "acrylique",
      "title": "La balançoire d'amour",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/43604374_989553927895901_3236040201478340608_n-1000x646-1.png",
      "category": "acrylique",
      "title": "The elephant d'or",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/59687580_1116098235241469_934782928846585856_n-1000x1003-1.jpg",
      "category": "acrylique",
      "title": "Tahiti plage",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/Abstrait1-600x511-1.jpg",
      "category": "acrylique",
      "title": "Abstrait",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/Capture-2-508x511-1.jpg",
      "category": "acrylique",
      "title": "Fleur en courbes",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/eric-768x511-1.jpg",
      "category": "acrylique",
      "title": "Nicky et Laura with love",
      "year": 2021,
      "description": "Portrait acrylique"
    },
    {
      "filename": "acrylique/fred-charton-13336097-544626092388689-198714441282019086-n-768x576-1.jpg",
      "category": "acrylique",
      "title": "L'aigle s'envole",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/fred-charton-img-20190508-160321.jpg",
      "category": "acrylique",
      "title": "A la facon d'un grand artiste",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/fred-charton-img-20190511-165808.jpg",
      "category": "acrylique",
      "title": "coucher de soleil au bord des rochers",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/fred-charton-neige-768x591-1.jpg",
      "category": "acrylique",
      "title": "La neige au sommet de la montagne",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "acrylique/roger.jpg",
      "category": "acrylique",
      "title": "roger pour ma coupine",
      "year": 2021,
      "description": "Acrylique"
    },
    {
      "filename": "aquarelle/Latortue.jpg",
      "category": "aquarelle",
      "title": "La tortue",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/Le_cheval_blanc.jpg",
      "category": "aquarelle",
      "title": "Le cheval blanc",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/Promenade.jpg",
      "category": "aquarelle",
      "title": "Promenade",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/cannard.jpg",
      "category": "aquarelle",
      "title": "Cannard",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/coquelicot.jpg",
      "category": "aquarelle",
      "title": "Coquelicot",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/cygne.jpg",
      "category": "aquarelle",
      "title": "Cygne",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/demolion.jpg",
      "category": "aquarelle",
      "title": "Le lion",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/facecat.jpg",
      "category": "aquarelle",
      "title": "Face de chat",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/fleuroseauborddeleau.jpg",
      "category": "aquarelle",
      "title": "Fleur rose au bord de l'eau",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/heron.jpg",
      "category": "aquarelle",
      "title": "Héron",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/lepetit pont .jpg",
      "category": "aquarelle",
      "title": "Le petit pont",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/levillage.jpg",
      "category": "aquarelle",
      "title": "Le village",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/ouvaton.jpg",
      "category": "aquarelle",
      "title": "Où va-t-on ?",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/plage et city .jpg",
      "category": "aquarelle",
      "title": "Plage et city",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/thecat.jpg",
      "category": "aquarelle",
      "title": "The cat",
      "description": "Aquarelle"
    },
    {
      "filename": "aquarelle/voyage.jpg",
      "category": "aquarelle",
      "title": "Voyage",
      "description": "Aquarelle"
    },
    {
      "filename": "pastel-sec/Choucky.png",
      "category": "pastel-sec",
      "title": "Choucky",
      "description": "Pastel sec"
    },
    {
      "filename": "pastel-sec/Lestbernarde_son_regard.jpg",
      "category": "pastel-sec",
      "title": "Le Saint-Bernard et son regard",
      "description": "Pastel sec"
    },
    {
      "filename": "pastel-sec/fred-charton-carla-fini.jpg",
      "category": "pastel-sec",
      "title": "Carla",
      "description": "Pastel sec"
    },
    {
      "filename": "pastel-sec/fred-charton-guerriere.jpg",
      "category": "pastel-sec",
      "title": "La guerrière Callisto",
      "description": "Pastel sec"
    },
    {
      "filename": "pastel-sec/fred-charton-tigre.jpg",
      "category": "pastel-sec",
      "title": "Tigre",
      "description": "Pastel sec"
    },
    {
      "filename": "pastel-sec/l'abeille.jpg",
      "category": "pastel-sec",
      "title": "L'abeille",
      "description": "Pastel sec"
    },
    {
      "filename": "pastel-sec/lagirafeetsongirafon.jpg",
      "category": "pastel-sec",
      "title": "La girafe et son girafon",
      "description": "Pastel sec"
    },
    {
      "filename": "pastel-sec/le chat.png",
      "category": "pastel-sec",
      "title": "Le chat",
      "description": "Pastel sec"
    },
    {
      "filename": "pastel-sec/lecabanon.jpg",
      "category": "pastel-sec",
      "title": "Le cabanon",
      "description": "Pastel sec"
    },
    {
      "filename": "pastel-sec/lechien.jpg",
      "category": "pastel-sec",
      "title": "Le chien",
      "description": "Pastel sec"
    },
    {
      "filename": "pastel-sec/les petites cabannes.jpg",
      "category": "pastel-sec",
      "title": "Les petites cabannes",
      "description": "Pastel sec"
    },
    {
      "filename": "pastel-sec/regard.jpg",
      "category": "pastel-sec",
      "title": "Regard",
      "description": "Pastel sec"
    },
    {
      "filename": "pastel-sec/rochideeetpriere.jpg",
      "category": "pastel-sec",
      "title": "Roche, idée et prière",
      "description": "Pastel sec"
    },
    {
      "filename": "pastel-sec/yang.jpg",
      "category": "pastel-sec",
      "title": "Yang",
      "description": "Pastel sec"
    },
    {
      filename: "logo/logo-cllisto.png",
      category: "logo",
      title: "Logo Callisto",
      isLogo: true,
    },
  ],
};

// Catégories chargées depuis le JSON (id -> label), utilisé pour les libellés et la lightbox
let portfolioCategoryNames = {};

function getCategoryNamesFromData(data) {
  const map = {};
  if (data.categories && Array.isArray(data.categories)) {
    data.categories.forEach((c) => {
      map[c.id] = c.label || c.id;
    });
  }
  if (Object.keys(map).length === 0) {
    Object.assign(map, {
      graphics: "Graphics",
      paintover: "Paintover",
      IA: "IA Art",
      photo: "Photos",
      gaming: "Gaming Artwork",
      logo: "Logo (masqué du portfolio)",
      "pastel-sec": "Pastel sec",
      acrylique: "Acrylique",
      aquarelle: "Aquarelle",
      animation: "Animation",
      other: "Others",
    });
  }
  return map;
}

/** Extrait l’id vidéo YouTube (11 caractères) depuis une URL ou un id brut. */
function extractYoutubeId(urlOrId) {
  if (!urlOrId) return null;
  const s = String(urlOrId).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

function getYoutubeThumbnailUrl(youtubeId) {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

/** Libellé par défaut pour un id de catégorie (ex: "pastel-sec" -> "Pastel sec"). */
function humanizeCategoryId(id) {
  if (!id) return "Other";
  if (id === "IA") return "IA Art";
  const str = id.replace(/-/g, " ").replace(/_/g, " ");
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Vignette + catégorie pour une entrée portfolio (même règle que la grille).
 * Retourne null si l’entrée n’affiche aucune vignette (pas d’image dans la galerie).
 */
function getPortfolioThumbInfo(image) {
  if (!image || image.category === "logo") return null;
  if (image.hidden === true) return null;
  const yid = image.youtubeId || extractYoutubeId(image.videoUrl);
  const thumbFromFile = image.filename ? assetImagePath(image.filename) : "";
  const thumbExternal = image.thumbnailUrl || "";
  const thumbSrc =
    thumbExternal ||
    thumbFromFile ||
    (yid ? getYoutubeThumbnailUrl(yid) : "");
  if (!thumbSrc) return null;
  const category =
    image.category ||
    (image.filename && image.filename.includes("/")
      ? image.filename.split("/")[0]
      : "other");
  return { thumbSrc, yid: yid || null, category };
}

/**
 * Filtres : uniquement les catégories qui ont au moins une œuvre visible (vignette).
 * Les catégories vides du JSON ne s’affichent pas.
 * Chaque entrée inclut `count` : nombre d’œuvres dans la catégorie.
 */
function getCategoriesFromImages(data) {
  const labelMap = getCategoryNamesFromData(data);
  const counts = new Map();
  (data.images || []).forEach((img) => {
    const info = getPortfolioThumbInfo(img);
    if (!info) return;
    const id = info.category;
    counts.set(id, (counts.get(id) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([id, count]) => ({
      id,
      label: labelMap[id] || humanizeCategoryId(id),
      count,
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
    );
}

let portfolioFiltersRebuildRaf = null;

/**
 * Après suppression d’une vignette (fichier manquant), recalcule les filtres
 * pour ne garder que les catégories encore représentées dans le DOM.
 * Regroupe les appels si plusieurs images échouent dans la même frame.
 */
function rebuildPortfolioFiltersFromDom() {
  if (portfolioFiltersRebuildRaf) cancelAnimationFrame(portfolioFiltersRebuildRaf);
  portfolioFiltersRebuildRaf = requestAnimationFrame(() => {
    portfolioFiltersRebuildRaf = null;
    const grid = document.getElementById("portfolioGrid");
    if (!grid) return;
    const items = grid.querySelectorAll(".portfolio-item");
    const counts = new Map();
    items.forEach((item) => {
      const id = item.getAttribute("data-category");
      if (!id) return;
      counts.set(id, (counts.get(id) || 0) + 1);
    });
    const list = Array.from(counts.entries())
      .map(([id, count]) => ({
        id,
        label: portfolioCategoryNames[id] || humanizeCategoryId(id),
        count,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
      );
    buildPortfolioFilterButtons(list);
    initPortfolioFilters();
    attachLightboxEvents();
  });
}

function buildPortfolioFilterButtons(categories) {
  const container = document.getElementById("portfolioFilters");
  if (!container) return;
  /* Tableau vide = aucune catégorie avec œuvres (ne pas retomber sur la liste par défaut). */
  const list = Array.isArray(categories)
    ? categories
    : [
        { id: "graphics", label: "Graphics" },
        { id: "paintover", label: "Paintover" },
        { id: "IA", label: "IA Art" },
        { id: "photo", label: "Photos" },
        { id: "gaming", label: "Gaming Artwork" },
        { id: "pastel-sec", label: "Pastel sec" },
        { id: "acrylique", label: "Acrylique" },
        { id: "aquarelle", label: "Aquarelle" },
        { id: "animation", label: "Animation" },
        { id: "other", label: "Others" },
      ];
  container.innerHTML = "";
  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "filter-btn active";
  allBtn.setAttribute("data-filter", "all");
  allBtn.setAttribute("role", "tab");
  allBtn.setAttribute("aria-selected", "true");
  const totalCount =
    list.length && list.every((c) => typeof c.count === "number")
      ? list.reduce((sum, c) => sum + c.count, 0)
      : null;
  allBtn.textContent =
    totalCount != null && totalCount > 0 ? `All (${totalCount})` : "All";
  container.appendChild(allBtn);
  list.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-btn";
    btn.setAttribute("data-filter", cat.id);
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.textContent =
      typeof cat.count === "number" ? `${cat.label} (${cat.count})` : cat.label;
    container.appendChild(btn);
  });
}

// ============================================
// PORTFOLIO LOAD (Simulated fetch)
// ============================================
async function loadPortfolioImages() {
  try {
    let data = portfolioData;
    /* En file://, ne pas fetch (CORS) — données embarquées dans portfolioData */
    if (!isFileProtocol()) {
      try {
        const res = await fetch(
          "assets/images/portfolio_images.json?t=" + Date.now(),
          { cache: "no-store" },
        );
        if (res.ok) {
          const json = await res.json();
          if (json && json.images) data = json;
        }
      } catch (_) {
        /* garde portfolioData en secours */
      }
    }
    const portfolioGrid = document.getElementById("portfolioGrid");

    if (!portfolioGrid) return;

    portfolioCategoryNames = getCategoryNamesFromData(data);
    const categoriesFromImages = getCategoriesFromImages(data);
    buildPortfolioFilterButtons(categoriesFromImages);

    const allImages = data.images || [];

    // Créer les éléments portfolio
    allImages.forEach((image) => {
      const info = getPortfolioThumbInfo(image);
      if (!info) return;
      const { thumbSrc, yid, category } = info;
      const item = document.createElement("div");
      item.className = "portfolio-item glass-card";
      if (yid) item.classList.add("portfolio-item--video");
      item.setAttribute("data-category", category);
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
      item.setAttribute("data-image-data", JSON.stringify(image));

      const imageDiv = document.createElement("div");
      imageDiv.className = "portfolio-image";

      const img = document.createElement("img");
      img.src = thumbSrc;
      img.alt = image.title || image.filename || (yid ? "Vidéo YouTube" : "");
      img.loading = "lazy";
      img.decoding = "async";
      img.onerror = function () {
        this.onerror = null;
        const card = this.closest(".portfolio-item");
        if (card && card.parentNode) {
          card.remove();
          rebuildPortfolioFiltersFromDom();
        }
      };

      const overlay = document.createElement("div");
      overlay.className = "portfolio-overlay";

      const title = document.createElement("h3");
      title.className = "portfolio-title";
      title.textContent = image.title || "Artwork";

      const categoryEl = document.createElement("p");
      categoryEl.className = "portfolio-category";
      categoryEl.textContent =
        portfolioCategoryNames[category] || humanizeCategoryId(category);

      overlay.appendChild(title);

      // Ajouter l'année si présente
      if (image.year) {
        const yearSpan = document.createElement("span");
        yearSpan.className = "portfolio-year";
        yearSpan.textContent = image.year;
        overlay.appendChild(yearSpan);
      }

      overlay.appendChild(categoryEl);

      // Ajouter le badge de récompense si présent
      if (image.award) {
        const badge = document.createElement("span");
        badge.className = "portfolio-badge award";
        badge.textContent = image.award;
        overlay.appendChild(badge);
      }

      imageDiv.appendChild(img);
      imageDiv.appendChild(overlay);
      item.appendChild(imageDiv);
      portfolioGrid.appendChild(item);
    });

    // Réinitialiser les filtres après le chargement
    initPortfolioFilters();

    // Attacher les événements lightbox
    attachLightboxEvents();

    // Hero : reconstruire avec les mêmes données que la grille (cohérence)
    await buildHeroSlidesFromPortfolio(data);
    initHeroSlide();
  } catch (error) {
    console.error("Erreur lors du chargement des images:", error);
  }
}

// ============================================
// PORTFOLIO FILTERS
// ============================================
function initPortfolioFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const portfolioGrid = document.getElementById("portfolioGrid");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const portfolioItems = portfolioGrid
        ? portfolioGrid.querySelectorAll(".portfolio-item")
        : document.querySelectorAll(".portfolio-item");
      const filter = (
        button.getAttribute("data-filter") || "all"
      ).toLowerCase();

      // Activer uniquement le bouton cliqué (tri par catégorie)
      filterButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");

      // Afficher les items de la catégorie choisie, masquer les autres
      portfolioItems.forEach((item) => {
        const cat = (item.getAttribute("data-category") || "").toLowerCase();
        if (filter === "all" || cat === filter) {
          item.style.display = "";
          item.style.opacity = "1";
          item.style.transform = "scale(1)";
        } else {
          item.style.opacity = "0";
          item.style.transform = "scale(0.8)";
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });

  // Initialize transition styles
  const portfolioItems = document.querySelectorAll(".portfolio-item");
  portfolioItems.forEach((item) => {
    item.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  });
}

// ============================================
// LIGHTBOX MODAL
// ============================================
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxVideo = document.getElementById("lightbox-video");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxDescription = document.getElementById("lightbox-description");
const lightboxKicker = document.getElementById("lightbox-kicker");
const lightboxClose = document.querySelector(".lightbox-close");

function openLightbox(item) {
  const img = item.querySelector("img");

  // Récupérer les données JSON stockées dans l'élément
  const imageDataStr = item.getAttribute("data-image-data");
  let imageData = null;

  if (imageDataStr) {
    try {
      imageData = JSON.parse(imageDataStr);
    } catch (e) {
      console.error("Erreur parsing image data:", e);
    }
  }

  // Fallback sur les éléments DOM si pas de données JSON
  const title =
    imageData?.title ||
    item.querySelector(".portfolio-title")?.textContent ||
    "";
  const category =
    imageData?.category ||
    item.querySelector(".portfolio-category")?.textContent ||
    "";
  const badge =
    imageData?.award ||
    item.querySelector(".portfolio-badge")?.textContent ||
    "";

  const yid = imageData?.youtubeId || extractYoutubeId(imageData?.videoUrl);
  const showYoutubeEmbed = Boolean(yid);

  if (showYoutubeEmbed && lightboxVideo) {
    if (lightboxImage) lightboxImage.style.display = "none";
    lightboxVideo.classList.add("lightbox-video--visible");
    lightboxVideo.src = `https://www.youtube-nocookie.com/embed/${yid}?rel=0`;
  } else {
    if (lightboxVideo) {
      lightboxVideo.classList.remove("lightbox-video--visible");
      lightboxVideo.src = "";
    }
    if (lightboxImage) {
      lightboxImage.style.display = "";
      const src =
        imageData?.thumbnailUrl ||
        (imageData?.filename
          ? assetImagePath(imageData.filename)
          : img?.src || "");
      lightboxImage.src = src;
      lightboxImage.alt = imageData?.title || img?.alt || title;
      lightboxImage.onerror = function () {
        this.onerror = null;
        this.src =
          "data:image/svg+xml," +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
          );
        this.alt = (this.alt || "") + " (image non disponible)";
      };
    }
  }

  if (lightboxTitle) {
    lightboxTitle.textContent = title;
  }

  const categoryText = portfolioCategoryNames[category] || category;
  if (lightboxKicker) {
    lightboxKicker.textContent = categoryText || "";
    lightboxKicker.hidden = !categoryText;
  }

  if (lightboxDescription) {
    const year = imageData?.year;
    const parts = [];
    if (year) parts.push(String(year));
    if (badge) parts.push(badge);
    let line = parts.join(" • ");
    if (imageData?.description) {
      line = line ? `${line}\n\n${imageData.description}` : imageData.description;
    }
    lightboxDescription.textContent = line;
  }

  if (lightbox) {
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lightboxClose?.focus();
  }
}

function closeLightbox() {
  if (lightboxVideo) {
    lightboxVideo.src = "";
    lightboxVideo.classList.remove("lightbox-video--visible");
  }
  if (lightboxImage) lightboxImage.style.display = "";
  if (lightbox) {
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
}

// Fonction pour attacher les événements lightbox aux items portfolio
function attachLightboxEvents() {
  const portfolioItems = document.querySelectorAll(".portfolio-item");

  portfolioItems.forEach((item) => {
    // Retirer les anciens listeners s'ils existent
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);

    newItem.addEventListener("click", () => {
      openLightbox(newItem);
    });

    // Support clavier
    newItem.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(newItem);
      }
    });
  });
}

// Fermer lightbox
if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

// Fermer avec Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox?.getAttribute("aria-hidden") === "false") {
    closeLightbox();
  }
});

// Fermer en cliquant sur le fond
if (lightbox) {
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
}

// ============================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Sections et cartes — animation d’apparition au scroll.
// Exclure #portfolio et les vignettes (.portfolio-item) : sinon opacity:0 reste
// appliqué (section masquée ou vignettes chargées après l’observer) et la galerie
// semble « invisible ».
document
  .querySelectorAll(".section:not(#portfolio), .glass-card:not(.portfolio-item)")
  .forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
let lastScroll = 0;
const nav = document.querySelector(".nav");

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 100) {
    nav?.style.setProperty("background", "rgba(26, 26, 26, 0.95)");
    nav?.style.setProperty("backdrop-filter", "blur(20px)");
  } else {
    nav?.style.setProperty("background", "rgba(26, 26, 26, 0.8)");
    nav?.style.setProperty("backdrop-filter", "blur(10px)");
  }

  lastScroll = currentScroll;
});

// ============================================
// HERO SCROLL BUTTON
// ============================================
const heroScroll = document.querySelector(".hero-scroll");
if (heroScroll) {
  heroScroll.addEventListener("click", () => {
    const aboutSection = document.querySelector("#about");
    if (aboutSection) {
      const offsetTop = aboutSection.offsetTop - 60;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  });
}

// ============================================
// HERO SLIDE — images aléatoires du portfolio
// ============================================
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pré-vérifie qu’une URL d’image charge (évite diapos hero vides / cassées). */
function verifyImageLoads(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    const probe = new Image();
    probe.onload = () => resolve(true);
    probe.onerror = () => resolve(false);
    probe.src = url;
  });
}

let heroCarouselIntervalId = null;

async function buildHeroSlidesFromPortfolio(data) {
  const container = document.getElementById("heroSlides");
  if (!container || !data || !data.images) return;
  const images = data.images.filter((img) => getPortfolioThumbInfo(img));
  if (!images.length) return;
  const shuffled = shuffleArray(images);
  const want = Math.min(5, shuffled.length);
  const valid = [];
  for (const img of shuffled) {
    if (valid.length >= want) break;
    const yHero = img.youtubeId || extractYoutubeId(img.videoUrl);
    const url = yHero
      ? getYoutubeThumbnailUrl(yHero)
      : img.thumbnailUrl ||
        (img.filename ? assetImagePath(img.filename) : "");
    if (!url) continue;
    if (await verifyImageLoads(url)) valid.push(img);
  }
  container.innerHTML = "";
  valid.forEach((img, i) => {
    const slide = document.createElement("div");
    slide.className = "hero-slide" + (i === 0 ? " active" : "");
    slide.setAttribute("data-slide", String(i));
    const caption =
      [img.title, img.award, img.year].filter(Boolean).join(" — ") ||
      img.title ||
      img.filename;
    const heroImg = document.createElement("img");
    const yHero = img.youtubeId || extractYoutubeId(img.videoUrl);
    heroImg.src = yHero
      ? getYoutubeThumbnailUrl(yHero)
      : img.thumbnailUrl ||
        (img.filename ? assetImagePath(img.filename) : "");
    heroImg.alt = (img.title || img.filename || "").replace(/"/g, "");
    heroImg.className = "hero-image-3d";
    heroImg.onerror = function () {
      this.onerror = null;
      this.closest(".hero-slide")?.remove();
      initHeroSlide();
    };
    const capDiv = document.createElement("div");
    capDiv.className = "hero-image-caption";
    capDiv.textContent = caption;
    slide.appendChild(heroImg);
    slide.appendChild(capDiv);
    container.appendChild(slide);
  });
}

function initHeroSlide() {
  const wrapper = document.querySelector(".hero-slide-wrapper");
  if (!wrapper) return;

  if (heroCarouselIntervalId) {
    clearInterval(heroCarouselIntervalId);
    heroCarouselIntervalId = null;
  }

  const prevBtn = wrapper.querySelector(".hero-slide-prev");
  const nextBtn = wrapper.querySelector(".hero-slide-next");
  if (prevBtn) {
    const p = prevBtn.cloneNode(true);
    prevBtn.replaceWith(p);
  }
  if (nextBtn) {
    const n = nextBtn.cloneNode(true);
    nextBtn.replaceWith(n);
  }
  const freshPrev = wrapper.querySelector(".hero-slide-prev");
  const freshNext = wrapper.querySelector(".hero-slide-next");
  const slides = wrapper.querySelectorAll(".hero-slide");
  const dotsContainer = wrapper.querySelector(".hero-slide-dots");
  if (!slides.length || !dotsContainer) return;

  let current = 0;
  const total = slides.length;

  function goToSlide(i) {
    current = (i + total) % total;
    slides.forEach((s, k) => s.classList.toggle("active", k === current));
    dotsContainer
      .querySelectorAll(".hero-slide-dot")
      .forEach((d, k) => d.classList.toggle("active", k === current));
  }

  dotsContainer.innerHTML = "";
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-slide-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Image " + (i + 1));
    dot.addEventListener("click", () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }

  if (freshPrev) freshPrev.addEventListener("click", () => goToSlide(current - 1));
  if (freshNext) freshNext.addEventListener("click", () => goToSlide(current + 1));

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!prefersReducedMotion) {
    heroCarouselIntervalId = setInterval(() => goToSlide(current + 1), 5000);
  }
}

// ============================================
// LAZY LOADING IMAGES (si pas déjà géré par le navigateur)
// ============================================
if ("loading" in HTMLImageElement.prototype) {
  // Le navigateur supporte le lazy loading natif
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach((img) => {
    img.src = img.src;
  });
} else {
  // Fallback pour les navigateurs plus anciens
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.remove("lazy");
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll("img.lazy").forEach((img) => {
    imageObserver.observe(img);
  });
}

// ============================================
// ACCESSIBILITY - Skip Link
// ============================================
// Ajouter un skip link si nécessaire
const skipLink = document.createElement("a");
skipLink.href = "#main-content";
skipLink.className = "skip-link";
skipLink.textContent = "Skip to main content";
document.body.insertBefore(skipLink, document.body.firstChild);

// Ajouter un id au main content si nécessaire
const mainContent =
  document.querySelector("main") || document.querySelector("#about");
if (mainContent && !mainContent.id) {
  mainContent.id = "main-content";
}

// ============================================
// PERFORMANCE - Debounce pour scroll
// ============================================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimiser les événements scroll
const optimizedScrollHandler = debounce(() => {
  // Code de scroll optimisé ici
}, 10);

// ============================================
// INITIALISATION
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
  // Hero : images aléatoires du portfolio (puis init du carrousel)
  await buildHeroSlidesFromPortfolio(portfolioData);
  initHeroSlide();

  // Vérifier la préférence de réduction de mouvement
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    document.documentElement.style.setProperty("--transition-fast", "0s");
    document.documentElement.style.setProperty("--transition-base", "0s");
    document.documentElement.style.setProperty("--transition-slow", "0s");
  }

  // Timeline "Journey" (neon) reveal on scroll
  initJourneyTimeline();

  // Initialiser les particules du background
  initParticles();

  // Initialiser l'effet parallaxe
  initParallax();

  // Charger les images du portfolio depuis le JSON
  loadPortfolioImages();

  // Charger les textes éditables (About / Contact) depuis content.json si présent
  loadContentJson();

  console.log("Portfolio Callisto Arts - Initialisé avec background animé");
});

// ============================================
// CONTENT.JSON (textes About / Contact éditables)
// ============================================
async function loadContentJson() {
  if (isFileProtocol()) return;
  try {
    const res = await fetch("content.json");
    if (!res.ok) return;
    const data = await res.json();
    if (!data) return;
    const aboutIntro = document.getElementById("about-intro");
    if (aboutIntro && data.about && data.about.intro) {
      aboutIntro.innerHTML = data.about.intro.replace(/\n/g, "<br>");
    }
    const contactCompany = document.getElementById("contact-company");
    if (contactCompany && data.contact && data.contact.company) {
      contactCompany.innerHTML =
        "<strong>" + escapeHtmlContent(data.contact.company) + "</strong>";
    }
    const contactAddress = document.getElementById("contact-address");
    if (contactAddress && data.contact && data.contact.address) {
      contactAddress.textContent = data.contact.address;
    }
  } catch (_) {
    /* pas de content.json = garde le HTML par défaut */
  }
}

function escapeHtmlContent(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

// ============================================
// JOURNEY TIMELINE (Reveal on scroll)
// ============================================
function initJourneyTimeline() {
  const items = document.querySelectorAll(".journey-tl-item");
  if (!items.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const journeyObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );

  items.forEach((el) => journeyObserver.observe(el));
}

// ============================================
// MODE NUIT ATELIER (nuit-atelier.html)
// Toggle, overlays (vignette, candle-light, grain, stars), curseur bougie
// ============================================
(function atelierInit() {
  const candleLight = document.getElementById("candle-light");
  const starsCanvas = document.getElementById("stars-overlay");
  const atelierCursor = document.getElementById("atelier-cursor");
  const toggleBtn = document.getElementById("atelier-toggle-btn");
  const banner = document.getElementById("atelier-banner");
  if (!candleLight || !atelierCursor) return;

  let isNight = false;
  let flameT = 0;
  const trailPts = [];
  const PX = 3;
  const FLAME = [
    "...FF...",
    "..FFFF..",
    ".FFFFFF.",
    ".FWWFF..",
    "FFWWWFF.",
    ".FFFFFF.",
    "..FFFF..",
    "...CC...",
    "...CC...",
    "..CCCC..",
    "...CC...",
    "........",
  ];

  // Candle light suit la souris (--lx, --ly en %)
  document.addEventListener("mousemove", function (e) {
    const lx = ((e.clientX / window.innerWidth) * 100).toFixed(1);
    const ly = ((e.clientY / window.innerHeight) * 100).toFixed(1);
    candleLight.style.setProperty("--lx", lx + "%");
    candleLight.style.setProperty("--ly", ly + "%");
  });

  // Curseur atelier : position souris + trail pour le canvas atelier
  let mx = -100,
    my = -100;
  document.addEventListener("mousemove", function (e) {
    mx = e.clientX;
    my = e.clientY;
    trailPts.push({ x: mx, y: my, life: 1 });
    if (trailPts.length > 20) trailPts.shift();
  });

  function drawAtelierCursor() {
    if (!atelierCursor) return;
    const ctx = atelierCursor.getContext("2d");
    const W = (atelierCursor.width = window.innerWidth);
    const H = (atelierCursor.height = window.innerHeight);
    ctx.clearRect(0, 0, W, H);
    if (!document.body.classList.contains("night")) {
      requestAnimationFrame(drawAtelierCursor);
      return;
    }
    // Trail fumée
    trailPts.forEach(function (p, i) {
      const a = (i / trailPts.length) * 0.15;
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(255,157,58,1)";
      ctx.fillRect(p.x - 1, p.y - 1, 3, 3);
    });
    ctx.globalAlpha = 1;
    // Halo bougie
    const halo = ctx.createRadialGradient(mx, my, 0, mx, my, 40);
    halo.addColorStop(0, "rgba(255,157,58,0.25)");
    halo.addColorStop(0.5, "rgba(255,157,58,0.08)");
    halo.addColorStop(1, "transparent");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(mx, my, 40, 0, Math.PI * 2);
    ctx.fill();
    // Flamme pixel
    const wobble = Math.sin(flameT * 0.3) * 1.5;
    const offsetX = mx - 4 * PX + wobble;
    const offsetY = my - 10 * PX;
    FLAME.forEach(function (row, gy) {
      Array.prototype.forEach.call(row, function (c, gx) {
        if (c === "F") {
          const flicker =
            0.7 + Math.sin(flameT * 0.5 + gx * 0.8 + gy * 0.3) * 0.3;
          ctx.fillStyle =
            "rgba(255," +
            Math.floor(100 + flicker * 100) +
            ",30," +
            flicker +
            ")";
          ctx.fillRect(
            Math.round(offsetX + gx * PX),
            Math.round(offsetY + gy * PX),
            PX,
            PX,
          );
        } else if (c === "W") {
          ctx.fillStyle =
            "rgba(255,240,200," + (0.8 + Math.sin(flameT * 0.7) * 0.2) + ")";
          ctx.fillRect(
            Math.round(offsetX + gx * PX),
            Math.round(offsetY + gy * PX),
            PX,
            PX,
          );
        } else if (c === "C") {
          ctx.fillStyle = "rgba(220,180,140,0.9)";
          ctx.fillRect(
            Math.round(offsetX + gx * PX),
            Math.round(offsetY + gy * PX),
            PX,
            PX,
          );
        }
      });
    });
    flameT++;
    requestAnimationFrame(drawAtelierCursor);
  }

  let starsData = [];
  function initStars() {
    if (!starsCanvas) return;
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
    starsData = Array.from({ length: 120 }, function () {
      return {
        x: Math.random() * starsCanvas.width,
        y: Math.random() * starsCanvas.height,
        r: Math.random() * 1.5 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
      };
    });
  }
  initStars();
  window.addEventListener("resize", initStars);

  function drawStars() {
    if (!starsCanvas || !starsData.length) {
      requestAnimationFrame(drawStars);
      return;
    }
    const ctx = starsCanvas.getContext("2d");
    ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    if (!document.body.classList.contains("night")) {
      requestAnimationFrame(drawStars);
      return;
    }
    const t = Date.now() / 1000;
    starsData.forEach(function (s) {
      const a = 0.3 + 0.4 * Math.sin(t * s.speed + s.phase);
      ctx.fillStyle = "rgba(255,235,200," + a + ")";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  }
  drawStars();

  let bannerTimeout;
  window.toggleNightAtelier = function () {
    isNight = !isNight;
    document.body.classList.toggle("night", isNight);
    if (toggleBtn) {
      toggleBtn.classList.toggle("on", isNight);
      toggleBtn.querySelector(".toggle-icon").textContent = isNight
        ? "☀️"
        : "🕯️";
      toggleBtn.setAttribute("aria-pressed", isNight);
    }
    if (banner) {
      if (isNight) {
        banner.classList.add("vis");
        clearTimeout(bannerTimeout);
        bannerTimeout = setTimeout(function () {
          banner.classList.remove("vis");
        }, 3000);
      } else {
        banner.classList.remove("vis");
      }
    }
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    atelierCursor.style.display = "none";
  } else {
    drawAtelierCursor();
  }
})();
