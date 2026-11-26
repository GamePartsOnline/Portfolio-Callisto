import {
  applyThirdPartyImageRequestMode,
  assetImagePath,
  assetImageThumbPath,
  extractYoutubeId,
  getYoutubeThumbnailUrl,
} from "./assets-paths";
import {
  buildArtworkAltText,
  getCategoryNamesFromData,
  getPortfolioThumbInfo,
  type PortfolioData,
  type PortfolioImage,
} from "./portfolio-data";

let heroCarouselIntervalId: number | null = null;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function resolveHeroImageUrl(img: PortfolioImage): string {
  const yid = img.youtubeId || extractYoutubeId(img.videoUrl);
  if (yid) return getYoutubeThumbnailUrl(yid);
  if (img.thumbnailUrl) return img.thumbnailUrl;
  if (img.filename) {
    return assetImageThumbPath(img.filename) || assetImagePath(img.filename);
  }
  return "";
}

export function initHeroSlide(): void {
  const wrapper = document.querySelector(".hero-slide-wrapper");
  if (!wrapper) return;

  if (heroCarouselIntervalId) {
    window.clearInterval(heroCarouselIntervalId);
    heroCarouselIntervalId = null;
  }

  const prevBtn = wrapper.querySelector(".hero-slide-prev");
  const nextBtn = wrapper.querySelector(".hero-slide-next");
  if (prevBtn) prevBtn.replaceWith(prevBtn.cloneNode(true));
  if (nextBtn) nextBtn.replaceWith(nextBtn.cloneNode(true));

  const freshPrev = wrapper.querySelector(".hero-slide-prev");
  const freshNext = wrapper.querySelector(".hero-slide-next");
  const slides = wrapper.querySelectorAll(".hero-slide");
  const dotsContainer = wrapper.querySelector(".hero-slide-dots");
  if (!slides.length || !dotsContainer) return;

  let current = 0;
  const total = slides.length;

  function goToSlide(i: number): void {
    current = (i + total) % total;
    slides.forEach((s, k) => s.classList.toggle("active", k === current));
    dotsContainer!
      .querySelectorAll(".hero-slide-dot")
      .forEach((d, k) => d.classList.toggle("active", k === current));
  }

  dotsContainer.innerHTML = "";
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-slide-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Image ${i + 1}`);
    dot.addEventListener("click", () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }

  freshPrev?.addEventListener("click", () => goToSlide(current - 1));
  freshNext?.addEventListener("click", () => goToSlide(current + 1));

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!prefersReducedMotion) {
    heroCarouselIntervalId = window.setInterval(() => goToSlide(current + 1), 5000);
  }
}

export function buildHeroSlidesFromPortfolio(data: PortfolioData): void {
  const container = document.getElementById("heroSlides");
  if (!container || !data || !data.images) return;
  const heroLabelMap = getCategoryNamesFromData(data);
  const images = data.images.filter((img) => getPortfolioThumbInfo(img));
  if (!images.length) return;
  const shuffled = shuffleArray(images);
  const want = Math.min(5, shuffled.length);
  const valid: Array<{ img: PortfolioImage; url: string }> = [];
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
      img.filename ||
      "";
    const heroImg = document.createElement("img");
    applyThirdPartyImageRequestMode(heroImg, url);
    heroImg.src = url;
    heroImg.alt = buildArtworkAltText(img, img.category, heroLabelMap);
    heroImg.className = "hero-image-3d";
    heroImg.setAttribute("width", "500");
    heroImg.setAttribute("height", "300");

    if (i === 0) {
      heroImg.loading = "eager";
      heroImg.decoding = "sync";
      heroImg.fetchPriority = "high";
      if (url) {
        let pre = document.getElementById("hero-lcp-preload") as HTMLLinkElement | null;
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
    }

    heroImg.onerror = function () {
      heroImg.onerror = null;
      const yH = img.youtubeId || extractYoutubeId(img.videoUrl);
      if (!yH && img.filename && heroImg.src !== assetImagePath(img.filename)) {
        heroImg.src = assetImagePath(img.filename);
        return;
      }
      heroImg.closest(".hero-slide")?.remove();
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

export function initHeroScrollButton(): void {
  const heroScroll = document.querySelector(".hero-scroll");
  if (!heroScroll) return;
  heroScroll.addEventListener("click", () => {
    const aboutSection = document.querySelector<HTMLElement>("#about");
    if (aboutSection) {
      window.scrollTo({
        top: aboutSection.offsetTop - 60,
        behavior: "smooth",
      });
    }
  });
}
