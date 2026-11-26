import { initAboutToolsMarquee } from "./about-marquee";
import {
  initLazyImagesFallback,
  initMobileSocialRailFade,
  initParallax,
  initParticles,
  initScrollReveal,
} from "./background-fx";
import { loadContentJson } from "./content-loader";
import { initCookieConsent } from "./cookie-consent";
import { initDemosceneEasterEgg } from "./easter-egg";
import { buildHeroSlidesFromPortfolio, initHeroScrollButton, initHeroSlide } from "./hero-carousel";
import { initI18nApplyStoredLanguage, onI18nLanguageChange } from "./i18n";
import { initLightboxControls } from "./lightbox";
import { initMusicPlayers } from "./music-player";
import { initNavigation, initSmoothScroll } from "./nav-controller";
import { initNightAtelier } from "./night-atelier";
import { getPortfolioData, loadPortfolioJsonOnce } from "./portfolio-data";
import { refreshPortfolioFilterLabels } from "./portfolio-filters";
import { loadPortfolioImages } from "./portfolio-grid";

function scheduleIdle(fn: () => void, timeout: number, fallbackDelay: number): void {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(fn, { timeout });
  } else {
    globalThis.setTimeout(fn, fallbackDelay);
  }
}

export async function bootSite(): Promise<void> {
  onI18nLanguageChange(() => {
    refreshPortfolioFilterLabels();
  });

  initNavigation();
  initSmoothScroll();
  initScrollReveal();
  initMobileSocialRailFade();
  initHeroScrollButton();
  initLazyImagesFallback();
  initLightboxControls();
  initNightAtelier();
  initAboutToolsMarquee();
  initMusicPlayers();
  initCookieConsent();
  initDemosceneEasterEgg();

  await initI18nApplyStoredLanguage();

  const needsPortfolioData =
    Boolean(document.getElementById("heroSlides")) ||
    Boolean(document.getElementById("portfolioGrid"));

  if (needsPortfolioData) {
    await loadPortfolioJsonOnce();
    const data = getPortfolioData();
    buildHeroSlidesFromPortfolio(data);
    initHeroSlide();
    void loadPortfolioImages();
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.style.setProperty("--transition-fast", "0s");
    document.documentElement.style.setProperty("--transition-base", "0s");
    document.documentElement.style.setProperty("--transition-slow", "0s");
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document
        .querySelectorAll(".journey-tl-item")
        .forEach((el) => el.classList.add("is-visible"));
    });
  });

  scheduleIdle(
    () => {
      initParticles();
      initParallax();
    },
    1800,
    150,
  );

  if (document.getElementById("contact-company")) {
    scheduleIdle(() => void loadContentJson(), 3500, 250);
  }
}
