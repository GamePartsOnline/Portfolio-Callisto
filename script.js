/**
 * True when the page is opened as file:// (double-clicking index.html).
 * In that case fetch() to local files is blocked by the browser (CORS).
 */
function isFileProtocol() {
  return window.location.protocol === "file:";
}

/** Renamed files: old JSON key → current filename on disk */
const LEGACY_IMAGE_FILENAMES = {
  "aquarelle/ouvaton?.jpg": "aquarelle/ouvaton.jpg",
};

/**
 * Portfolio image path: encode each segment (encodeURI does not encode `?`
 * or `#` in filenames).
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

/**
 * Grid thumbnail (generated): assets/images/thumbs/.../basename-thumb.webp
 * Run: python3 scripts/generate_image_derivatives.py
 */
function assetImageThumbPath(filename) {
  if (!filename) return "";
  let normalized = String(filename).replace(/\\/g, "/").replace(/^\/+/, "");
  if (LEGACY_IMAGE_FILENAMES[normalized]) {
    normalized = LEGACY_IMAGE_FILENAMES[normalized];
  }
  const segments = normalized.split("/").filter(Boolean);
  if (!segments.length) return "";
  const last = segments[segments.length - 1];
  const dot = last.lastIndexOf(".");
  if (dot <= 0) return "";
  const base = last.slice(0, dot);
  segments[segments.length - 1] = `${base}-thumb.webp`;
  return "assets/images/thumbs/" + segments.map(encodeURIComponent).join("/");
}

/**
 * Full-size WebP (generated): assets/images/webp/.../basename.webp
 */
function assetImageWebpFullPath(filename) {
  if (!filename) return "";
  let normalized = String(filename).replace(/\\/g, "/").replace(/^\/+/, "");
  if (LEGACY_IMAGE_FILENAMES[normalized]) {
    normalized = LEGACY_IMAGE_FILENAMES[normalized];
  }
  const segments = normalized.split("/").filter(Boolean);
  if (!segments.length) return "";
  const last = segments[segments.length - 1];
  const dot = last.lastIndexOf(".");
  if (dot <= 0) return "";
  const base = last.slice(0, dot);
  segments[segments.length - 1] = `${base}.webp`;
  return "assets/images/webp/" + segments.map(encodeURIComponent).join("/");
}

// ============================================
// ANIMATED BACKGROUND PARTICLES
// ============================================
function initParticles() {
  const particlesContainer = document.getElementById("bgParticles");
  if (!particlesContainer) return;
  particlesContainer.innerHTML = "";
  if (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches) return;

  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const w = window.innerWidth;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const lowCpu =
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency <= 4;
  const lowMem =
    typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
  const lowPowerMode = coarsePointer || w < 1024 || lowCpu || lowMem;

  if (prefersReducedMotion || lowPowerMode) {
    // Only a few static particles (fewer on phone — less DOM / paint)
    const staticParticles = w < 480 ? 2 : w < 1024 ? 3 : 8;
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

  // Fewer particles + single rAF loop (avoids 40–80 parallel GPU timers)
  // Phone (<480px): 4 · tablet / large phone (<768px): 6 · desktop: 16
  const particleCount = w < 480 ? 3 : w < 768 ? 5 : 12;
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

  // Reset on resize (debounced)
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
// PARALLAX ON SCROLL (subtle)
// ============================================
function initParallax() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const lowCpu =
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency <= 4;
  const lowMem =
    typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
  if (prefersReducedMotion || coarsePointer || window.innerWidth < 1024 || lowCpu || lowMem)
    return;

  const orbs = document.querySelectorAll(".orb");
  const mesh = document.querySelector(".bg-mesh");

  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.1; // Very subtle parallax factor

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
 * aria-hidden on #navMenu: never set it while a descendant has focus
 * (otherwise browser warnings + AT users excluded). Move focus first.
 * On desktop, do not hide the menu from screen readers.
 */
function syncNavMenuAriaHidden() {
  if (!navToggle || !navMenu) return;
  if (navDesktopMq.matches) {
    navMenu.removeAttribute("aria-hidden");
    navMenu.removeAttribute("inert");
    return;
  }
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navMenu.setAttribute("aria-hidden", expanded ? "false" : "true");
  /* Exclut les liens du tab order quand le menu est replié (évite aria-hidden + focusables) */
  if (expanded) {
    navMenu.removeAttribute("inert");
  } else {
    navMenu.setAttribute("inert", "");
  }
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

  // Close menu when a link is clicked (mobile only, when open)
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navToggle.getAttribute("aria-expanded") !== "true") return;
      navToggle.focus();
      navToggle.setAttribute("aria-expanded", "false");
      syncNavMenuAriaHidden();
    });
  });

  // Close menu with Escape — focus before aria-hidden
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
      const navOffset = 60;
      const top =
        target.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });
      /* Skip link + keyboard: move focus to main landmark after scroll */
      if (target.id === "main-content") {
        const focusMain = () => {
          try {
            target.focus({ preventScroll: true });
          } catch (_) {
            target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
          }
        };
        window.setTimeout(focusMain, 450);
      }
    }
  });
});

// ============================================
// PORTFOLIO AUTO-LOAD FROM JSON
// ============================================
// ============================================
// PORTFOLIO DATA — categories embarquées ; images chargées depuis
// assets/images/portfolio_images.json (HTTP) pour réduire parse/compile JS.
// file:// : pas de fetch → images vides (ouvrir via serveur local pour prévisualiser).
// ============================================
let portfolioData = {
  categories: [
    { id: "graphics", label: "Graphics" },
    { id: "branding", label: "Logos & Branding" },
    { id: "paintover", label: "Paintover" },
    { id: "IA", label: "IA Art" },
    { id: "photo", label: "Photos" },
    { id: "gaming", label: "Gaming Artwork" },
    { id: "pastel-sec", label: "Dry pastel" },
    { id: "acrylique", label: "Acrylic" },
    { id: "aquarelle", label: "Watercolor" },
    { id: "animation", label: "Animation" },
    { id: "inktober", label: "Inktober" },
    { id: "vectorisation", label: "Vector Art" },
    { id: "web", label: "Websites" },
    { id: "other", label: "Others" },
    { id: "logo", label: "Logo (hidden from portfolio)" },
  ],
  images: [],
};

// Categories from JSON (id -> label), used for filter labels and the lightbox
let portfolioCategoryNames = {};

function getCategoryNamesFromData(data) {
  const frLabels = {
    graphics: "Graphismes",
    branding: "Logos & Identité",
    paintover: "Paintover",
    IA: "Art IA",
    photo: "Photos",
    gaming: "Jeux & Arcade",
    "pastel-sec": "Pastel sec",
    acrylique: "Acrylique",
    aquarelle: "Aquarelle",
    animation: "Animation",
    inktober: "Inktober",
    vectorisation: "Vectorisation",
    web: "Sites web",
    other: "Autres",
    logo: "Logo",
  };
  const lang = typeof getStoredLang === "function" ? getStoredLang() : "fr";
  const map = {};
  if (data.categories && Array.isArray(data.categories)) {
    data.categories.forEach((c) => {
      map[c.id] =
        lang === "fr" && frLabels[c.id] ? frLabels[c.id] : c.label || c.id;
    });
  }
  if (Object.keys(map).length === 0) {
    Object.assign(map, {
      graphics: "Graphics",
      paintover: "Paintover",
      IA: "IA Art",
      photo: "Photos",
      gaming: "Gaming Artwork",
      logo: "Logo (hidden from portfolio)",
      "pastel-sec": "Dry pastel",
      acrylique: "Acrylic",
      aquarelle: "Watercolor",
      animation: "Animation",
      other: "Others",
    });
  }
  return map;
}

/** Extract YouTube video id (11 chars) from a URL or raw id. */
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

/**
 * Images HTTPS tierces (YouTube, Demozoo…) : requête sans cookies d’identification
 * et referrer minimal — limite les alertes Chrome DevTools (Issues → Cookie) sur ces hôtes.
 * À appeler **avant** `img.src = …`.
 */
function applyThirdPartyImageRequestMode(img, url) {
  if (!img || !url || typeof url !== "string") return;
  if (!/^https?:\/\//i.test(url)) return;
  try {
    const host = new URL(url).hostname;
    if (
      /(^|\.)youtube\.com$/i.test(host) ||
      /(^|\.)ytimg\.com$/i.test(host) ||
      /(^|\.)demozoo\.org$/i.test(host) ||
      /(^|\.)googleusercontent\.com$/i.test(host)
    ) {
      img.crossOrigin = "anonymous";
      img.referrerPolicy = "no-referrer";
    }
  } catch (_) {
    /* URL invalide */
  }
}

/** Default label for a category id (e.g. "pastel-sec" -> "Dry pastel"). */
function humanizeCategoryId(id) {
  if (!id) return "Other";
  if (id === "IA") return "IA Art";
  const str = id.replace(/-/g, " ").replace(/_/g, " ");
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Descriptive alt for portfolio thumbnails, hero, lightbox (WCAG 1.1.1).
 * @param {object} image — portfolio entry
 * @param {string} categoryId — resolved category id
 * @param {Record<string,string>} [labelMap] — id → label (defaults to portfolioCategoryNames)
 */
function buildArtworkAltText(image, categoryId, labelMap) {
  const map = labelMap || portfolioCategoryNames || {};
  const catKey = categoryId || image?.category || "";
  const catLabel = map[catKey] || humanizeCategoryId(catKey);
  const title = (image?.title || "").trim();
  const fileHint = image?.filename
    ? image.filename
        .replace(/^.*\//, "")
        .replace(/\.[^.]+$/, "")
        .replace(/[._-]+/g, " ")
        .trim()
    : "";
  const head = title || fileHint;
  const y = image?.year;
  const yid = image?.youtubeId || extractYoutubeId(image?.videoUrl);
  const parts = [];
  if (head) parts.push(head);
  if (catLabel) parts.push(catLabel);
  if (y != null && y !== "") parts.push(String(y));
  let out = parts.join(" — ");
  if (yid) {
    out = out ? `${out} — YouTube` : "YouTube video — portfolio";
  }
  if (!out.trim()) out = "Portfolio artwork";
  return out.replace(/"/g, "'");
}

/**
 * Thumbnail + category for a portfolio entry (same rules as the grid).
 * Returns null if the entry has no thumbnail (no image in the gallery).
 */
function getPortfolioThumbInfo(image) {
  if (!image || image.category === "logo") return null;
  if (image.hidden === true) return null;
  const yid = image.youtubeId || extractYoutubeId(image.videoUrl);
  const thumbGrid = image.filename ? assetImageThumbPath(image.filename) : "";
  const thumbFromFile = image.filename ? assetImagePath(image.filename) : "";
  const thumbExternal = image.thumbnailUrl || "";
  /* Prefer lightweight WebP thumbnail in grid, fall back to original file if needed. */
  const thumbSrc =
    thumbExternal ||
    thumbGrid ||
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
 * Filters: only categories with at least one visible work (thumbnail).
 * Empty categories from JSON are not shown.
 * Each entry includes `count`: number of works in the category.
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

/** Catégorie affichée au chargement (réduit le nombre d’images chargées vs « All »). */
const DEFAULT_PORTFOLIO_FILTER = "all";

const PORTFOLIO_FILTER_GROUPS = [
  {
    id: "fine-arts",
    fr: "Beaux-arts",
    en: "Fine Arts",
    cats: ["acrylique", "aquarelle", "pastel-sec"],
  },
  {
    id: "digital",
    fr: "Numérique & IA",
    en: "Digital & AI",
    cats: ["graphics", "paintover", "animation", "ia", "inktober", "vectorisation", "web"],
  },
  {
    id: "identity-arcade",
    fr: "Identité & Arcade",
    en: "Branding & Arcade",
    cats: ["branding", "gaming"],
  },
  {
    id: "photo-other",
    fr: "Photos & Autres",
    en: "Photos & Others",
    cats: ["photo", "other"],
  },
];

function getPortfolioFilterGroupById(groupId) {
  return PORTFOLIO_FILTER_GROUPS.find((g) => g.id === groupId) || null;
}

/**
 * Affiche uniquement les vignettes de la catégorie choisie (« all » = tout, « group:<id> » = groupe).
 * @param {string} filterRaw — id catégorie, « group:<id> » ou « all » (insensible à la casse)
 * @param {{ instant?: boolean }} [opts] — sans animation (chargement initial / lots)
 */
function applyPortfolioFilter(filterRaw, opts) {
  const instant = opts && opts.instant === true;
  const filter = (filterRaw || "all").toLowerCase();
  const groupMatch = filter.startsWith("group:")
    ? getPortfolioFilterGroupById(filter.slice(6))
    : null;
  const portfolioGrid = document.getElementById("portfolioGrid");
  const portfolioItems = portfolioGrid
    ? portfolioGrid.querySelectorAll(".portfolio-item")
    : document.querySelectorAll(".portfolio-item");

  portfolioItems.forEach((item) => {
    const cat = (item.getAttribute("data-category") || "").toLowerCase();
    const show =
      filter === "all" ||
      (groupMatch ? groupMatch.cats.includes(cat) : cat === filter);
    if (instant) {
      if (show) {
        item.style.display = "";
        item.style.opacity = "1";
        item.style.transform = "scale(1)";
      } else {
        item.style.display = "none";
        item.style.opacity = "1";
        item.style.transform = "scale(1)";
      }
      return;
    }
    if (show) {
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
}

/**
 * After removing a thumbnail (missing file), rebuild filters to keep only
 * categories still present in the DOM.
 * Batches calls when several images fail in the same frame.
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
    const active = document.querySelector(
      "#portfolioFilters .filter-btn.active",
    );
    const f = (active?.getAttribute("data-filter") || "all").toLowerCase();
    applyPortfolioFilter(f, { instant: true });
    initPortfolioFilters();
    attachLightboxEvents();
  });
}

function getGroupLabel(group, lang) {
  const l = lang || (typeof getStoredLang === "function" ? getStoredLang() : "fr");
  return l === "en" ? group.en : group.fr;
}

function getGroupAllWord(lang) {
  const l = lang || (typeof getStoredLang === "function" ? getStoredLang() : "fr");
  return l === "en" ? "All in category" : "Tout voir";
}

function buildPortfolioFilterButtons(categories) {
  const container = document.getElementById("portfolioFilters");
  if (!container) return;
  const list = Array.isArray(categories)
    ? categories
    : [
        { id: "graphics", label: "Graphics" },
        { id: "paintover", label: "Paintover" },
        { id: "IA", label: "IA Art" },
        { id: "photo", label: "Photos" },
        { id: "gaming", label: "Gaming Artwork" },
        { id: "pastel-sec", label: "Dry pastel" },
        { id: "acrylique", label: "Acrylic" },
        { id: "aquarelle", label: "Watercolor" },
        { id: "animation", label: "Animation" },
        { id: "other", label: "Others" },
      ];
  container.innerHTML = "";
  const urlFilter = (
    new URLSearchParams(window.location.search).get("filter") || ""
  ).trim();
  const activeFilter = urlFilter || DEFAULT_PORTFOLIO_FILTER;
  const activeFilterLower = activeFilter.toLowerCase();

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  const isAllActive = activeFilterLower === "all";
  allBtn.className = isAllActive ? "filter-btn active" : "filter-btn";
  allBtn.setAttribute("data-filter", "all");
  allBtn.setAttribute("role", "tab");
  allBtn.setAttribute("aria-selected", isAllActive ? "true" : "false");
  const totalCount =
    list.length && list.every((c) => typeof c.count === "number")
      ? list.reduce((sum, c) => sum + c.count, 0)
      : null;
  const allWord = getPortfolioFilterAllWord();
  allBtn.textContent =
    totalCount != null && totalCount > 0
      ? `${allWord} (${totalCount})`
      : allWord;
  container.appendChild(allBtn);

  const byId = new Map();
  list.forEach((cat) => {
    byId.set(cat.id.toLowerCase(), cat);
  });
  const usedIds = new Set();
  const lang = typeof getStoredLang === "function" ? getStoredLang() : "fr";

  PORTFOLIO_FILTER_GROUPS.forEach((group) => {
    const groupCats = group.cats
      .map((cid) => byId.get(cid.toLowerCase()))
      .filter(Boolean);
    if (!groupCats.length) return;
    groupCats.forEach((c) => usedIds.add(c.id.toLowerCase()));

    const groupTotal = groupCats.reduce(
      (sum, c) => sum + (typeof c.count === "number" ? c.count : 0),
      0,
    );
    const activeSubCat = groupCats.find(
      (c) => c.id.toLowerCase() === activeFilterLower,
    );
    const isGroupSelfActive = activeFilterLower === `group:${group.id}`;
    const isGroupActive = Boolean(activeSubCat || isGroupSelfActive);

    const wrap = document.createElement("div");
    wrap.className = "filter-group";
    wrap.setAttribute("data-group-id", group.id);

    const groupBtn = document.createElement("button");
    groupBtn.type = "button";
    groupBtn.className = isGroupActive
      ? "filter-btn filter-group-btn active"
      : "filter-btn filter-group-btn";
    groupBtn.setAttribute("aria-expanded", "false");
    groupBtn.setAttribute("aria-haspopup", "true");
    const baseGroupLabel = getGroupLabel(group, lang);
    groupBtn.setAttribute("data-group-base-label", baseGroupLabel);
    groupBtn.innerHTML = activeSubCat
      ? `<span class="filter-group-btn__label">${baseGroupLabel} · ${activeSubCat.label}</span><span class="filter-group-btn__caret" aria-hidden="true">▾</span>`
      : `<span class="filter-group-btn__label">${baseGroupLabel} (${groupTotal})</span><span class="filter-group-btn__caret" aria-hidden="true">▾</span>`;

    const submenu = document.createElement("div");
    submenu.className = "filter-submenu";
    submenu.setAttribute("role", "menu");

    const groupAllItem = document.createElement("button");
    groupAllItem.type = "button";
    groupAllItem.className = isGroupSelfActive
      ? "filter-btn filter-submenu-item active"
      : "filter-btn filter-submenu-item";
    groupAllItem.setAttribute("data-filter", `group:${group.id}`);
    groupAllItem.setAttribute("data-group-all", group.id);
    groupAllItem.setAttribute("role", "menuitem");
    groupAllItem.textContent =
      groupTotal > 0
        ? `${getGroupAllWord(lang)} (${groupTotal})`
        : getGroupAllWord(lang);
    submenu.appendChild(groupAllItem);

    groupCats.forEach((cat) => {
      const subBtn = document.createElement("button");
      subBtn.type = "button";
      const isSubActive = cat.id.toLowerCase() === activeFilterLower;
      subBtn.className = isSubActive
        ? "filter-btn filter-submenu-item active"
        : "filter-btn filter-submenu-item";
      subBtn.setAttribute("data-filter", cat.id);
      subBtn.setAttribute("role", "menuitem");
      subBtn.textContent =
        typeof cat.count === "number"
          ? `${cat.label} (${cat.count})`
          : cat.label;
      submenu.appendChild(subBtn);
    });

    wrap.appendChild(groupBtn);
    wrap.appendChild(submenu);
    container.appendChild(wrap);
  });

  list.forEach((cat) => {
    if (usedIds.has(cat.id.toLowerCase())) return;
    const btn = document.createElement("button");
    btn.type = "button";
    const isActive = cat.id.toLowerCase() === activeFilterLower;
    btn.className = isActive ? "filter-btn active" : "filter-btn";
    btn.setAttribute("data-filter", cat.id);
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
    btn.textContent =
      typeof cat.count === "number" ? `${cat.label} (${cat.count})` : cat.label;
    container.appendChild(btn);
  });
}

// ============================================
// PORTFOLIO JSON (HTTP) — une seule source après loadPortfolioJsonOnce()
// ============================================
const PORTFOLIO_JSON_URL = "assets/images/portfolio_images.json?v=11";

async function loadPortfolioJsonOnce() {
  if (isFileProtocol()) return;
  try {
    const res = await fetch(PORTFOLIO_JSON_URL);
    if (!res.ok) return;
    const json = await res.json();
    if (json && Array.isArray(json.images)) {
      portfolioData = json;
    }
  } catch (_) {
    /* garde categories + images [] */
  }
}

// ============================================
// PORTFOLIO GRID (utilise portfolioData déjà chargé)
// ============================================
async function loadPortfolioImages() {
  try {
    const data = portfolioData;
    const portfolioGrid = document.getElementById("portfolioGrid");

    if (!portfolioGrid) return;

    portfolioCategoryNames = getCategoryNamesFromData(data);
    const categoriesFromImages = getCategoriesFromImages(data);
    buildPortfolioFilterButtons(categoriesFromImages);

    const allImages = data.images || [];
    const categoryLabelMap = getCategoryNamesFromData(data);

    const toBuild = [];
    allImages.forEach((image) => {
      const info = getPortfolioThumbInfo(image);
      if (!info) return;
      toBuild.push({ image, info });
    });

    function createPortfolioItem(image, info, itemIndex) {
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
      applyThirdPartyImageRequestMode(img, thumbSrc);
      img.src = thumbSrc;
      img.alt = buildArtworkAltText(image, category, categoryLabelMap);
      /* Audit : pas de lazy sur les ~3 premières vignettes (souvent visibles au 1er écran selon viewport) */
      if (typeof itemIndex === "number" && itemIndex < 3) {
        img.loading = "eager";
        img.decoding = itemIndex === 0 ? "sync" : "async";
        if (itemIndex === 0) img.fetchPriority = "high";
      } else {
        img.loading = "lazy";
        img.decoding = "async";
      }
      img.sizes =
        "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw";
      img.setAttribute("width", "400");
      img.setAttribute("height", "400");

      function onImgFinalError() {
        this.onerror = null;
        const card = this.closest(".portfolio-item");
        if (card && card.parentNode) {
          card.remove();
          rebuildPortfolioFiltersFromDom();
        }
      }

      img.onerror = function () {
        this.onerror = null;
        if (image.filename) {
          const full = assetImagePath(image.filename);
          if (full && this.src !== full) {
            this.src = full;
            this.onerror = onImgFinalError;
            return;
          }
        }
        onImgFinalError.call(this);
      };

      imageDiv.appendChild(img);

      const mediumPill = document.createElement("span");
      mediumPill.className = "portfolio-medium-pill";
      mediumPill.textContent =
        portfolioCategoryNames[category] || humanizeCategoryId(category);
      imageDiv.appendChild(mediumPill);

      if (image.year) {
        const yearPill = document.createElement("span");
        yearPill.className = "portfolio-year-pill";
        yearPill.textContent = String(image.year);
        imageDiv.appendChild(yearPill);
      }

      if (Array.isArray(image.gallery) && image.gallery.length > 1) {
        const countPill = document.createElement("span");
        countPill.className = "portfolio-gallery-count";
        countPill.textContent = `${image.gallery.length} photos`;
        imageDiv.appendChild(countPill);
      }

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

      if (image.year) {
        const yearSpan = document.createElement("span");
        yearSpan.className = "portfolio-year";
        yearSpan.textContent = image.year;
        overlay.appendChild(yearSpan);
      }

      overlay.appendChild(categoryEl);

      if (image.award) {
        const badge = document.createElement("span");
        badge.className = "portfolio-badge award";
        badge.textContent = image.award;
        overlay.appendChild(badge);
      }

      imageDiv.appendChild(overlay);
      item.appendChild(imageDiv);
      return item;
    }

    /* Lots de cartes + rAF → évite un seul long task (main thread / Lighthouse) */
    const BATCH = 10;
    let bi = 0;
    const urlFilter = (
      new URLSearchParams(window.location.search).get("filter") || ""
    ).trim();
    const defaultFilterBtn = document.querySelector(
      "#portfolioFilters .filter-btn.active[data-filter]",
    );
    const defaultFilter = (
      urlFilter ||
      defaultFilterBtn?.getAttribute("data-filter") ||
      "all"
    ).toLowerCase();

    function appendPortfolioBatch() {
      const end = Math.min(bi + BATCH, toBuild.length);
      for (; bi < end; bi++) {
        const { image, info } = toBuild[bi];
        portfolioGrid.appendChild(createPortfolioItem(image, info, bi));
      }
      /* Masquer tout de suite hors catégorie → moins d’images lazy-loadées qu’avec « All » */
      applyPortfolioFilter(defaultFilter, { instant: true });
      if (bi < toBuild.length) {
        requestAnimationFrame(appendPortfolioBatch);
        return;
      }
      initPortfolioFilters();
      attachLightboxEvents();
      const openQ = new URLSearchParams(window.location.search).get("open");
      if (openQ) {
        const needle = openQ.trim().toLowerCase();
        const match = Array.from(document.querySelectorAll(".portfolio-item")).find((el) => {
          const t = (el.querySelector(".portfolio-title")?.textContent || "").toLowerCase();
          return t.includes(needle);
        });
        if (match) openLightbox(match);
      }
    }

    appendPortfolioBatch();

    /*
     * Ne pas reconstruire le hero ici : déjà fait au DOMContentLoaded (LCP).
     * Grille et hero partagent le même portfolioData (JSON HTTP, une fois).
     */
  } catch (error) {
    console.error("Error loading portfolio images:", error);
  }
}

// ============================================
// PORTFOLIO FILTERS
// ============================================
let portfolioFiltersDelegated = false;

function closeAllFilterSubmenus(exceptGroup) {
  const container = document.getElementById("portfolioFilters");
  if (!container) return;
  container.querySelectorAll(".filter-group.open").forEach((grp) => {
    if (exceptGroup && grp === exceptGroup) return;
    grp.classList.remove("open");
    const grpBtn = grp.querySelector(".filter-group-btn");
    if (grpBtn) grpBtn.setAttribute("aria-expanded", "false");
  });
}

function updateFilterGroupLabels() {
  const container = document.getElementById("portfolioFilters");
  if (!container) return;
  const lang = typeof getStoredLang === "function" ? getStoredLang() : "fr";
  container.querySelectorAll(".filter-group").forEach((grp) => {
    const groupId = grp.getAttribute("data-group-id");
    const group = getPortfolioFilterGroupById(groupId);
    const grpBtn = grp.querySelector(".filter-group-btn");
    if (!group || !grpBtn) return;
    const baseLabel = getGroupLabel(group, lang);
    const activeSub = grp.querySelector(
      ".filter-submenu-item.active[data-filter]",
    );
    const labelSpan = grpBtn.querySelector(".filter-group-btn__label");
    if (!labelSpan) return;
    const groupAllBtn = grp.querySelector(".filter-submenu-item[data-group-all]");
    const totalMatch = groupAllBtn?.textContent.match(/\((\d+)\)\s*$/);
    const groupTotalText = totalMatch ? ` (${totalMatch[1]})` : "";
    if (activeSub && !activeSub.hasAttribute("data-group-all")) {
      const subClean = activeSub.textContent.replace(/\s*\(\d+\)\s*$/, "");
      labelSpan.textContent = `${baseLabel} · ${subClean}`;
    } else {
      labelSpan.textContent = `${baseLabel}${groupTotalText}`;
    }
  });
}

function initPortfolioFilters() {
  const container = document.getElementById("portfolioFilters");
  const portfolioGrid = document.getElementById("portfolioGrid");
  if (!container) return;

  if (!portfolioFiltersDelegated) {
    portfolioFiltersDelegated = true;
    container.addEventListener("click", (e) => {
      const groupToggle = e.target.closest(".filter-group-btn");
      if (groupToggle && container.contains(groupToggle)) {
        const groupEl = groupToggle.closest(".filter-group");
        const willOpen = groupEl && !groupEl.classList.contains("open");
        closeAllFilterSubmenus(groupEl);
        if (groupEl) {
          groupEl.classList.toggle("open", willOpen);
          groupToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
        }
        return;
      }

      const button = e.target.closest(".filter-btn[data-filter]");
      if (!button || !container.contains(button)) return;
      container.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");

      const parentGroup = button.closest(".filter-group");
      if (parentGroup) {
        const parentBtn = parentGroup.querySelector(".filter-group-btn");
        if (parentBtn) parentBtn.classList.add("active");
      }
      closeAllFilterSubmenus();
      updateFilterGroupLabels();

      const filter = (button.getAttribute("data-filter") || "all").toLowerCase();
      applyPortfolioFilter(filter, { instant: false });
    });

    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        closeAllFilterSubmenus();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllFilterSubmenus();
    });
  }

  const portfolioItems = portfolioGrid
    ? portfolioGrid.querySelectorAll(".portfolio-item")
    : document.querySelectorAll(".portfolio-item");
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
const lightboxVideoNative = document.getElementById("lightbox-video-native");
/** Jamais src="" sur l’iframe : en file:// le navigateur peut charger la page courante → erreur sécurité */
const LIGHTBOX_IFRAME_BLANK = "about:blank";
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxDescription = document.getElementById("lightbox-description");
const lightboxKicker = document.getElementById("lightbox-kicker");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxStage = document.getElementById("lightbox-stage");
const lightboxZoomInBtn = document.getElementById("lightbox-zoom-in");
const lightboxZoomOutBtn = document.getElementById("lightbox-zoom-out");
const lightboxZoomResetBtn = document.getElementById("lightbox-zoom-reset");
const lightboxPrevBtn = document.getElementById("lightbox-prev");
const lightboxNextBtn = document.getElementById("lightbox-next");
const lightboxGalleryStrip = document.getElementById("lightbox-gallery-strip");

let lbZoom = 1;
let lbPanX = 0;
let lbPanY = 0;
let lbDragging = false;
let lbDragged = false;
let lbStartX = 0;
let lbStartY = 0;
let lbCurrentItem = null;
let lbGalleryFiles = [];
let lbGalleryIndex = 0;

function applyLightboxTransform() {
  if (!lightboxImage) return;
  if (lbZoom <= 1) {
    lbZoom = 1;
    lbPanX = 0;
    lbPanY = 0;
    lightboxImage.classList.remove("is-zoomed");
  } else {
    lightboxImage.classList.add("is-zoomed");
  }
  lightboxImage.style.transform = `translate3d(${lbPanX}px, ${lbPanY}px, 0) scale(${lbZoom})`;
  if (lightboxZoomResetBtn) {
    lightboxZoomResetBtn.textContent = `${Math.round(lbZoom * 100)}%`;
  }
}

function resetLightboxZoom() {
  lbZoom = 1;
  lbPanX = 0;
  lbPanY = 0;
  lbDragging = false;
  lbDragged = false;
  lightboxImage?.classList.remove("is-dragging", "is-zoomed");
  applyLightboxTransform();
}

function setLightboxZoom(nextZoom) {
  lbZoom = Math.min(4, Math.max(1, Number(nextZoom.toFixed(2))));
  applyLightboxTransform();
}

function showLightboxGalleryIndex(idx) {
  if (!lbGalleryFiles.length || !lightboxImage) return;
  lbGalleryIndex = (idx + lbGalleryFiles.length) % lbGalleryFiles.length;
  const fn = lbGalleryFiles[lbGalleryIndex];
  resetLightboxZoom();
  const webp = assetImageWebpFullPath(fn);
  const orig = assetImagePath(fn);
  lightboxImage.src = webp || orig;
  lightboxImage.onerror = function () {
    this.onerror = null;
    if (orig && this.src !== orig) this.src = orig;
  };
  if (lightboxGalleryStrip) {
    lightboxGalleryStrip.querySelectorAll(".lightbox-gallery-thumb").forEach((btn, i) => {
      btn.classList.toggle("is-active", i === lbGalleryIndex);
    });
  }
}

function renderLightboxGalleryStrip(files, title) {
  if (!lightboxGalleryStrip) return;
  lightboxGalleryStrip.innerHTML = "";
  if (!Array.isArray(files) || files.length < 2) {
    lbGalleryFiles = [];
    lbGalleryIndex = 0;
    lightboxGalleryStrip.hidden = true;
    lightbox?.classList.remove("lightbox--has-gallery");
    return;
  }
  lbGalleryFiles = files.slice();
  lbGalleryIndex = 0;
  lightboxGalleryStrip.hidden = false;
  lightbox?.classList.add("lightbox--has-gallery");
  lbGalleryFiles.forEach((fn, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = i === 0 ? "lightbox-gallery-thumb is-active" : "lightbox-gallery-thumb";
    btn.setAttribute("aria-label", `${title || "Photo"} (${i + 1}/${lbGalleryFiles.length})`);
    const im = document.createElement("img");
    im.src = assetImageThumbPath(fn) || assetImagePath(fn);
    im.alt = "";
    im.loading = "lazy";
    btn.appendChild(im);
    btn.addEventListener("click", () => showLightboxGalleryIndex(i));
    lightboxGalleryStrip.appendChild(btn);
  });
}

function stepLightboxItem(delta) {
  if (lbGalleryFiles.length > 1) {
    showLightboxGalleryIndex(lbGalleryIndex + delta);
    return;
  }
  const visibleItems = Array.from(document.querySelectorAll(".portfolio-item")).filter(
    (el) => el.style.display !== "none" && !el.hidden,
  );
  if (visibleItems.length < 2) return;
  const idx = lbCurrentItem ? visibleItems.indexOf(lbCurrentItem) : -1;
  const nextIdx = idx === -1 ? 0 : (idx + delta + visibleItems.length) % visibleItems.length;
  openLightbox(visibleItems[nextIdx]);
}

function resetLightboxVideoNative() {
  if (!lightboxVideoNative) return;
  lightboxVideoNative.pause();
  lightboxVideoNative.removeAttribute("src");
  lightboxVideoNative.load();
  lightboxVideoNative.classList.remove("lightbox-video-native--visible");
}

/**
 * Image statique dans la lightbox (hors iframe / vidéo native).
 */
function fillLightboxStillImage(item, imageData, img, title) {
  if (!lightboxImage) return;
  lightboxImage.style.display = "";
  lightboxImage.removeAttribute("crossorigin");
  lightboxImage.referrerPolicy = "";
  const fn = imageData?.filename;
  const lightboxPlaceholderSvg =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
    );
  const catForAlt =
    (imageData && imageData.category) ||
    item.getAttribute("data-category") ||
    "";
  lightboxImage.alt = imageData
    ? buildArtworkAltText(imageData, catForAlt, portfolioCategoryNames)
    : img?.alt || title || "";
  if (fn) {
    const webp = assetImageWebpFullPath(fn);
    const orig = assetImagePath(fn);
    const firstSrc = webp || orig;
    applyThirdPartyImageRequestMode(lightboxImage, firstSrc);
    lightboxImage.src = firstSrc;
    lightboxImage.onerror = function () {
      this.onerror = null;
      if (orig && this.src !== orig) {
        this.src = orig;
        this.onerror = function () {
          this.onerror = null;
          this.src = lightboxPlaceholderSvg;
          this.alt = (this.alt || "") + " (image unavailable)";
        };
      } else {
        this.src = lightboxPlaceholderSvg;
        this.alt = (this.alt || "") + " (image unavailable)";
      }
    };
  } else {
    const src = imageData?.thumbnailUrl || img?.src || "";
    applyThirdPartyImageRequestMode(lightboxImage, src);
    lightboxImage.src = src;
    lightboxImage.onerror = function () {
      this.onerror = null;
      this.src = lightboxPlaceholderSvg;
      this.alt = (this.alt || "") + " (image unavailable)";
    };
  }
}

function openLightbox(item) {
  lbCurrentItem = item;
  resetLightboxZoom();
  lightbox?.classList.remove("lightbox--video");
  const img = item.querySelector("img");

  // Read JSON stored on the element
  const imageDataStr = item.getAttribute("data-image-data");
  let imageData = null;

  if (imageDataStr) {
    try {
      imageData = JSON.parse(imageDataStr);
    } catch (e) {
      console.error("Error parsing image data:", e);
    }
  }

  // Fallback to DOM if no JSON data
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
  let webmUrl = (imageData?.videoWebm || "").trim();
  if (!webmUrl && imageData?.localWebm === true && yid) {
    webmUrl = `assets/videos/webm/${yid}.webm`;
  }
  const tryNativeWebm = Boolean(webmUrl && lightboxVideoNative);

  resetLightboxVideoNative();

  if (tryNativeWebm) {
    lightbox?.classList.add("lightbox--video");
    if (lightboxImage) lightboxImage.style.display = "none";
    if (lightboxVideo) {
      lightboxVideo.classList.remove("lightbox-video--visible");
      lightboxVideo.src = LIGHTBOX_IFRAME_BLANK;
    }
    const v = lightboxVideoNative;
    v.setAttribute(
      "aria-label",
      title ? `${title} — demo video` : "Demoscene demo video",
    );
    v.setAttribute("title", title || "");

    const fallbackAfterWebmError = () => {
      v.removeEventListener("loadeddata", onWebmLoaded);
      resetLightboxVideoNative();
      if (yid && lightboxVideo) {
        lightboxVideo.classList.add("lightbox-video--visible");
        lightboxVideo.src = `https://www.youtube-nocookie.com/embed/${yid}?rel=0`;
      } else {
        fillLightboxStillImage(item, imageData, img, title);
      }
    };

    const onWebmLoaded = () => {
      v.removeEventListener("error", onWebmError);
      v.classList.add("lightbox-video-native--visible");
    };
    const onWebmError = () => {
      v.removeEventListener("loadeddata", onWebmLoaded);
      fallbackAfterWebmError();
    };
    v.addEventListener("loadeddata", onWebmLoaded, { once: true });
    v.addEventListener("error", onWebmError, { once: true });
    v.src = webmUrl;
    v.load();
  } else if (yid && lightboxVideo) {
    lightbox?.classList.add("lightbox--video");
    if (lightboxImage) lightboxImage.style.display = "none";
    lightboxVideo.classList.add("lightbox-video--visible");
    lightboxVideo.src = `https://www.youtube-nocookie.com/embed/${yid}?rel=0`;
  } else {
    if (lightboxVideo) {
      lightboxVideo.classList.remove("lightbox-video--visible");
      lightboxVideo.src = LIGHTBOX_IFRAME_BLANK;
    }
    fillLightboxStillImage(item, imageData, img, title);
  }
  renderLightboxGalleryStrip(imageData?.gallery, title);

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
    lightbox.removeAttribute("inert");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lightboxClose?.focus();
  }
}

function closeLightbox() {
  resetLightboxZoom();
  lbCurrentItem = null;
  renderLightboxGalleryStrip([], "");
  lightbox?.classList.remove("lightbox--video");
  resetLightboxVideoNative();
  if (lightboxVideo) {
    lightboxVideo.src = LIGHTBOX_IFRAME_BLANK;
    lightboxVideo.classList.remove("lightbox-video--visible");
  }
  if (lightboxImage) lightboxImage.style.display = "";
  if (lightbox) {
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.setAttribute("inert", "");
    document.body.style.overflow = "";
  }
}

// Attach lightbox events to portfolio items
function attachLightboxEvents() {
  const portfolioItems = document.querySelectorAll(".portfolio-item");

  portfolioItems.forEach((item) => {
    // Remove old listeners if any
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);

    newItem.addEventListener("click", () => {
      openLightbox(newItem);
    });

    // Keyboard support
    newItem.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(newItem);
      }
    });
  });
}

// Close lightbox
if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

// Close with Escape + Zoom / Prev-Next keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (lightbox?.getAttribute("aria-hidden") !== "false") return;
  if (e.key === "Escape") {
    closeLightbox();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    stepLightboxItem(-1);
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    stepLightboxItem(1);
  } else if (e.key === "+" || e.key === "=") {
    setLightboxZoom(lbZoom + 0.5);
  } else if (e.key === "-") {
    setLightboxZoom(lbZoom - 0.5);
  } else if (e.key === "0") {
    resetLightboxZoom();
  }
});

if (lightboxZoomInBtn) {
  lightboxZoomInBtn.addEventListener("click", () => setLightboxZoom(lbZoom + 0.5));
}
if (lightboxZoomOutBtn) {
  lightboxZoomOutBtn.addEventListener("click", () => setLightboxZoom(lbZoom - 0.5));
}
if (lightboxZoomResetBtn) {
  lightboxZoomResetBtn.addEventListener("click", resetLightboxZoom);
}
if (lightboxPrevBtn) {
  lightboxPrevBtn.addEventListener("click", () => stepLightboxItem(-1));
}
if (lightboxNextBtn) {
  lightboxNextBtn.addEventListener("click", () => stepLightboxItem(1));
}

if (lightboxImage && lightboxStage) {
  lightboxImage.addEventListener("click", () => {
    if (lbDragged) {
      lbDragged = false;
      return;
    }
    setLightboxZoom(lbZoom > 1 ? 1 : 2);
  });
  lightboxImage.addEventListener("dblclick", (e) => {
    e.preventDefault();
    resetLightboxZoom();
  });
  lightboxStage.addEventListener(
    "wheel",
    (e) => {
      if (lightbox?.classList.contains("lightbox--video")) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.35 : -0.35;
      setLightboxZoom(lbZoom + delta);
    },
    { passive: false },
  );
  lightboxImage.addEventListener("pointerdown", (e) => {
    if (lbZoom <= 1) return;
    lbDragging = true;
    lbDragged = false;
    lbStartX = e.clientX - lbPanX;
    lbStartY = e.clientY - lbPanY;
    lightboxImage.classList.add("is-dragging");
    lightboxImage.setPointerCapture(e.pointerId);
  });
  lightboxImage.addEventListener("pointermove", (e) => {
    if (!lbDragging) return;
    const dx = e.clientX - lbStartX;
    const dy = e.clientY - lbStartY;
    if (Math.abs(dx - lbPanX) > 3 || Math.abs(dy - lbPanY) > 3) {
      lbDragged = true;
    }
    lbPanX = dx;
    lbPanY = dy;
    applyLightboxTransform();
  });
  const endDrag = () => {
    lbDragging = false;
    lightboxImage.classList.remove("is-dragging");
  };
  lightboxImage.addEventListener("pointerup", endDrag);
  lightboxImage.addEventListener("pointercancel", endDrag);
}

// Close when clicking the backdrop
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

// Sections and cards — fade-in on scroll.
// Exclude #portfolio and thumbnails (.portfolio-item): otherwise opacity:0 can
// stick (hidden section or thumbs loaded after the observer) and the gallery
// looks “invisible”.
const revealTargets = document.querySelectorAll(
  ".section:not(#portfolio):not(#journey), .glass-card:not(.portfolio-item)",
);
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  revealTargets.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
} else {
  // Fallback mobile/anciens navigateurs : jamais laisser les sections cachées.
  revealTargets.forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  });
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
const nav = document.querySelector(".nav");

/* rAF : évite lectures/écritures layout synchrones à chaque événement scroll (reflows) */
let navScrollRaf = 0;
window.addEventListener(
  "scroll",
  () => {
    if (!nav) return;
    if (navScrollRaf) return;
    navScrollRaf = requestAnimationFrame(() => {
      navScrollRaf = 0;
      nav.classList.toggle("nav--scrolled", window.pageYOffset > 100);
    });
  },
  { passive: true },
);
/* Restauration de scroll / ancre : aligner l’état nav sans attendre un scroll */
document.addEventListener("DOMContentLoaded", () => {
  nav?.classList.toggle("nav--scrolled", window.pageYOffset > 100);
});

// ============================================
// MOBILE SOCIAL RAIL — fade while scrolling
// ============================================
let socialRailScrollTimer = null;
let socialRailScrollRaf = 0;
window.addEventListener(
  "scroll",
  () => {
    if (!window.matchMedia("(max-width: 768px)").matches) return;
    if (socialRailScrollRaf) return;
    socialRailScrollRaf = requestAnimationFrame(() => {
      socialRailScrollRaf = 0;
      document.body.classList.add("is-scrolling-mobile");
      if (socialRailScrollTimer) clearTimeout(socialRailScrollTimer);
      socialRailScrollTimer = setTimeout(() => {
        document.body.classList.remove("is-scrolling-mobile");
      }, 240);
    });
  },
  { passive: true },
);

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
// HERO SLIDE — random images from portfolio
// ============================================
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * URL d’image pour le hero — synchrone (pas de probes réseau).
 * Miniature WebP d’abord (poids faible → meilleur LCP), repli via onerror sur l’image.
 */
function resolveHeroImageUrl(img) {
  const yid = img.youtubeId || extractYoutubeId(img.videoUrl);
  if (yid) return getYoutubeThumbnailUrl(yid);
  if (img.thumbnailUrl) return img.thumbnailUrl;
  if (img.filename) {
    const t = assetImageThumbPath(img.filename);
    const f = assetImagePath(img.filename);
    return t || f;
  }
  return "";
}

let heroCarouselIntervalId = null;

function buildHeroSlidesFromPortfolio(data) {
  const container = document.getElementById("heroSlides");
  if (!container || !data || !data.images) return;
  const heroLabelMap = getCategoryNamesFromData(data);
  const images = data.images.filter((img) => getPortfolioThumbInfo(img));
  if (!images.length) return;
  const shuffled = shuffleArray(images);
  const want = Math.min(5, shuffled.length);
  const valid = [];
  for (let i = 0; i < shuffled.length && valid.length < want; i++) {
    const img = shuffled[i];
    const url = resolveHeroImageUrl(img);
    if (url) valid.push({ img, url });
  }
  container.innerHTML = "";
  valid.forEach(({ img, url }, i) => {
    const slide = document.createElement("div");
    slide.className = "hero-slide" + (i === 0 ? " active" : "");
    slide.setAttribute("data-slide", String(i));
    const caption =
      [img.title, img.award, img.year].filter(Boolean).join(" — ") ||
      img.title ||
      img.filename;
    const heroImg = document.createElement("img");
    applyThirdPartyImageRequestMode(heroImg, url);
    heroImg.src = url;
    heroImg.alt = buildArtworkAltText(img, img.category, heroLabelMap);
    heroImg.className = "hero-image-3d";
    /* LCP : premier slide — pas de lazy, décodage prioritaire, preload <link> dans <head> */
    if (i === 0) {
      heroImg.loading = "eager";
      heroImg.decoding = "sync";
      heroImg.fetchPriority = "high";
      heroImg.setAttribute("width", "500");
      heroImg.setAttribute("height", "300");
      if (url) {
        let pre = document.getElementById("hero-lcp-preload");
        if (!pre) {
          pre = document.createElement("link");
          pre.id = "hero-lcp-preload";
          pre.rel = "preload";
          pre.as = "image";
          pre.setAttribute("fetchpriority", "high");
          document.head.appendChild(pre);
        }
        pre.href = url;
      }
    } else {
      heroImg.decoding = "async";
      heroImg.loading = "lazy";
      heroImg.fetchPriority = "low";
      heroImg.setAttribute("width", "500");
      heroImg.setAttribute("height", "300");
    }
    heroImg.onerror = function () {
      this.onerror = null;
      const yH = img.youtubeId || extractYoutubeId(img.videoUrl);
      if (!yH && img.filename && this.src !== assetImagePath(img.filename)) {
        this.src = assetImagePath(img.filename);
        return;
      }
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
// LAZY LOADING IMAGES (if not already handled by the browser)
// ============================================
if ("loading" in HTMLImageElement.prototype) {
  // Browser supports native lazy loading
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach((img) => {
    img.src = img.src;
  });
} else if ("IntersectionObserver" in window) {
  // Fallback for older browsers
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
} else {
  // Last-resort fallback: load images directly.
  document.querySelectorAll("img.lazy").forEach((img) => {
    img.src = img.dataset.src || img.src;
    img.classList.remove("lazy");
  });
}

// ============================================
// PERFORMANCE - Scroll debounce
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

// Optimized scroll events
const optimizedScrollHandler = debounce(() => {
  // Optimized scroll handling
}, 10);

// ============================================
// I18N — hybrid: French in HTML; i18n.json supplies English (loadLanguage / localStorage)
// ============================================
const I18N_STORAGE_KEY = "callisto-lang";
const I18N_JSON_URL = "i18n.json?v=6";

let i18nBundle = null;
const i18nFrSnapshots = new WeakMap();

function getI18nLeaf(bundle, path) {
  if (!bundle || !path || typeof path !== "string") return null;
  const parts = path.split(".");
  let o = bundle;
  for (let i = 0; i < parts.length; i++) {
    o = o && o[parts[i]];
  }
  if (o && typeof o === "object" && ("en" in o || "fr" in o)) return o;
  return null;
}

function getStoredLang() {
  try {
    const s = localStorage.getItem(I18N_STORAGE_KEY);
    if (s === "en" || s === "fr") return s;
  } catch (_) {}
  return "fr";
}

function getPortfolioFilterAllWord() {
  const lang = getStoredLang();
  const leaf = i18nBundle && getI18nLeaf(i18nBundle, "portfolio.filterAll");
  if (leaf) {
    return lang === "en" ? leaf.en || "All" : leaf.fr || "Tous";
  }
  return lang === "en" ? "All" : "Tous";
}

function initI18nSnapshots() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    i18nFrSnapshots.set(el, el.innerHTML);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const cur = el.getAttribute("aria-label");
    if (cur) el.dataset.i18nAriaFr = cur;
  });
}

function updateDocumentTitleFromI18n(lang) {
  if (!i18nBundle) return;
  if (document.getElementById("heroSlides")) {
    const leaf = getI18nLeaf(i18nBundle, "meta.documentTitle");
    if (leaf && typeof leaf[lang] === "string" && leaf[lang]) {
      document.title = leaf[lang];
    }
    return;
  }
  if (
    document.body.classList.contains("legal-page-body") &&
    !document.body.classList.contains("build-log-body") &&
    !document.body.classList.contains("services-page-body")
  ) {
    const leaf = getI18nLeaf(i18nBundle, "meta.legalDocumentTitle");
    if (leaf && typeof leaf[lang] === "string" && leaf[lang]) {
      document.title = leaf[lang];
    }
    return;
  }
  if (document.body.classList.contains("build-log-body")) {
    const leaf = getI18nLeaf(i18nBundle, "meta.buildLogDocumentTitle");
    if (leaf && typeof leaf[lang] === "string" && leaf[lang]) {
      document.title = leaf[lang];
    }
  }
}

function refreshPortfolioFilterAllLabel() {
  const allBtn = document.querySelector('#portfolioFilters [data-filter="all"]');
  if (allBtn && i18nBundle) {
    const lang = getStoredLang();
    const leaf = getI18nLeaf(i18nBundle, "portfolio.filterAll");
    const allWord =
      lang === "en" ? leaf?.en || "All" : leaf?.fr || "Tous";
    const m = allBtn.textContent.match(/\((\d+)\)\s*$/);
    allBtn.textContent = m ? `${allWord} (${m[1]})` : allWord;
  }
  if (typeof portfolioData !== "undefined") {
    portfolioCategoryNames = getCategoryNamesFromData(portfolioData);
    const lang = getStoredLang();
    document.querySelectorAll('#portfolioFilters [data-filter]').forEach((btn) => {
      const cat = btn.getAttribute("data-filter");
      if (!cat || cat === "all") return;
      if (cat.startsWith("group:")) {
        const word = getGroupAllWord(lang);
        const m = btn.textContent.match(/\((\d+)\)\s*$/);
        btn.textContent = m ? `${word} (${m[1]})` : word;
        return;
      }
      const label = portfolioCategoryNames[cat] || humanizeCategoryId(cat);
      const m = btn.textContent.match(/\((\d+)\)\s*$/);
      btn.textContent = m ? `${label} (${m[1]})` : label;
    });
    updateFilterGroupLabels();
    document.querySelectorAll(".portfolio-item").forEach((item) => {
      const cat = item.getAttribute("data-category");
      if (!cat) return;
      const label = portfolioCategoryNames[cat] || humanizeCategoryId(cat);
      const pill = item.querySelector(".portfolio-medium-pill");
      if (pill) pill.textContent = label;
      const catEl = item.querySelector(".portfolio-category");
      if (catEl) catEl.textContent = label;
    });
  }
}

function syncLangSwitchUi(lang) {
  document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
    const L = btn.getAttribute("data-lang");
    const active = L === lang;
    btn.setAttribute("aria-pressed", active ? "true" : "false");
    btn.classList.toggle("is-active", active);
  });
}

function applyI18nLanguage(lang) {
  if (!i18nBundle || (lang !== "fr" && lang !== "en")) return;
  document.documentElement.lang = lang === "fr" ? "fr" : "en";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const path = el.getAttribute("data-i18n");
    if (!path) return;
    if (lang === "fr") {
      const snap = i18nFrSnapshots.get(el);
      if (snap != null) el.innerHTML = snap;
      return;
    }
    const leaf = getI18nLeaf(i18nBundle, path);
    const html = leaf && typeof leaf.en === "string" ? leaf.en : "";
    if (html) el.innerHTML = html;
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const path = el.getAttribute("data-i18n-aria");
    if (!path) return;
    const leaf = getI18nLeaf(i18nBundle, path);
    if (!leaf) return;
    if (lang === "fr") {
      const fr = el.dataset.i18nAriaFr;
      if (fr) el.setAttribute("aria-label", fr);
    } else if (typeof leaf.en === "string" && leaf.en) {
      el.setAttribute("aria-label", leaf.en);
    }
  });

  updateDocumentTitleFromI18n(lang);
  refreshPortfolioFilterAllLabel();
  syncLangSwitchUi(lang);
}

function bindLangSwitch() {
  const root = document.querySelector(".lang-switch");
  if (!root) return;
  root.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (lang === "fr" || lang === "en") window.loadLanguage(lang);
    });
  });
  syncLangSwitchUi(getStoredLang());
}

window.loadLanguage = function loadLanguage(lang) {
  if (lang !== "fr" && lang !== "en") return;
  try {
    localStorage.setItem(I18N_STORAGE_KEY, lang);
  } catch (_) {}
  if (!i18nBundle) {
    syncLangSwitchUi(getStoredLang());
    return;
  }
  applyI18nLanguage(lang);
};

async function initI18nApplyStoredLanguage() {
  initI18nSnapshots();
  /* Aligner <html lang> tout de suite (journal build-log : corps FR/EN via CSS). */
  const stored = getStoredLang();
  document.documentElement.lang = stored === "fr" ? "fr" : "en";
  if (isFileProtocol()) {
    bindLangSwitch();
    return;
  }
  try {
    const res = await fetch(I18N_JSON_URL);
    if (!res.ok) {
      bindLangSwitch();
      return;
    }
    i18nBundle = await res.json();
  } catch (_) {
    bindLangSwitch();
    return;
  }
  const lang = getStoredLang();
  /* Toujours appliquer la langue stockée (fr ou en) : sinon l’UI pouvait rester en anglais
   * alors que FR était choisi (snapshots / titre / aria non resynchronisés au chargement). */
  applyI18nLanguage(lang);
  bindLangSwitch();
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
  await initI18nApplyStoredLanguage();
  await loadPortfolioJsonOnce();
  /* Hero après JSON : même contenu que la grille ; preload <link as="fetch"> aide le cache */
  buildHeroSlidesFromPortfolio(portfolioData);
  initHeroSlide();

  // Respect reduced-motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    document.documentElement.style.setProperty("--transition-fast", "0s");
    document.documentElement.style.setProperty("--transition-base", "0s");
    document.documentElement.style.setProperty("--transition-slow", "0s");
  }

  /* Journey : après 1er paint (léger) — pas trop tard pour IntersectionObserver */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => initJourneyTimeline());
  });

  /* Particules + parallax : idle (gros coût CPU / long tasks) */
  function bootParticlesAndParallax() {
    initParticles();
    initParallax();
  }
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(bootParticlesAndParallax, { timeout: 1800 });
  } else {
    setTimeout(bootParticlesAndParallax, 150);
  }

  loadPortfolioImages();

  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(() => loadContentJson(), { timeout: 3500 });
  } else {
    setTimeout(() => loadContentJson(), 250);
  }

  console.log("Portfolio Callisto Arts — initialized with animated background");
});

// ============================================
// CONTENT.JSON (editable About / Contact copy)
// ============================================
async function loadContentJson() {
  if (isFileProtocol()) return;
  try {
    const res = await fetch("content.json");
    if (!res.ok) return;
    const data = await res.json();
    if (!data) return;
    const contactCompany = document.getElementById("contact-company");
    if (contactCompany && data.contact && data.contact.company) {
      contactCompany.innerHTML =
        "<strong>" + escapeHtmlContent(data.contact.company) + "</strong>";
    }
    const contactAddress = document.getElementById("contact-address");
    if (contactAddress && data.contact && data.contact.address) {
      contactAddress.innerHTML = escapeHtmlContent(data.contact.address).replace(
        /\n/g,
        "<br />",
      );
    }
    const contactEmail = document.getElementById("contact-email");
    if (contactEmail && data.contact && data.contact.email) {
      const em = escapeHtmlContent(data.contact.email);
      contactEmail.innerHTML =
        '<a href="mailto:' +
        escapeHtmlAttr(data.contact.email) +
        '">' +
        em +
        "</a>";
    }
    const contactPhone = document.getElementById("contact-phone");
    if (contactPhone && data.contact && data.contact.phone) {
      const tel =
        data.contact.phoneTel ||
        data.contact.phone.replace(/\s/g, "").replace(/^0/, "+33");
      const label = escapeHtmlContent(data.contact.phone);
      contactPhone.innerHTML =
        '<a href="tel:' + escapeHtmlAttr(tel) + '">' + label + "</a>";
    }
  } catch (_) {
    /* no content.json — keep default HTML */
  }
}

function escapeHtmlContent(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function escapeHtmlAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ============================================
// JOURNEY TIMELINE (Reveal on scroll)
// ============================================
function initJourneyTimeline() {
  const items = document.querySelectorAll(".journey-tl-item");
  if (!items.length) return;

  // Stabilite UX: timeline toujours visible (pas de reveal qui peut flicker).
  items.forEach((el) => el.classList.add("is-visible"));
}

// ============================================
// WORKSHOP NIGHT MODE (nuit-atelier.html)
// Toggle, overlays (vignette, candle-light, grain, stars)
// ============================================
(function atelierInit() {
  const starsCanvas = document.getElementById("stars-overlay");
  const toggleBtn = document.getElementById("atelier-toggle-btn");
  const banner = document.getElementById("atelier-banner");
  if (!starsCanvas) return;

  let isNight = false;

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
})();

(function initAboutToolsMarquee() {
  const list = document.querySelector(".about-tools-marquee .about-tool-list");
  if (!list || list.dataset.marqueeReady === "1") return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  list.dataset.marqueeReady = "1";
  const items = Array.from(list.children);
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    list.appendChild(clone);
  });
})();
