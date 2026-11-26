import {
  applyThirdPartyImageRequestMode,
  assetImagePath,
  assetImageThumbPath,
  assetImageWebpFullPath,
  extractYoutubeId,
} from "./assets-paths";
import {
  buildArtworkAltText,
  getPortfolioCategoryNames,
  type PortfolioImage,
} from "./portfolio-data";

const LIGHTBOX_IFRAME_BLANK = "about:blank";

let lbZoom = 1;
let lbPanX = 0;
let lbPanY = 0;
let lbDragging = false;
let lbDragged = false;
let lbStartX = 0;
let lbStartY = 0;
let lbCurrentItem: Element | null = null;
let lbGalleryFiles: string[] = [];
let lbGalleryIndex = 0;

function getEls() {
  return {
    lightbox: document.getElementById("lightbox"),
    lightboxImage: document.getElementById("lightbox-image") as HTMLImageElement | null,
    lightboxVideo: document.getElementById("lightbox-video") as HTMLIFrameElement | null,
    lightboxVideoNative: document.getElementById("lightbox-video-native") as HTMLVideoElement | null,
    lightboxTitle: document.getElementById("lightbox-title"),
    lightboxDescription: document.getElementById("lightbox-description"),
    lightboxKicker: document.getElementById("lightbox-kicker"),
    lightboxClose: document.querySelector<HTMLButtonElement>(".lightbox-close"),
    lightboxStage: document.getElementById("lightbox-stage"),
    lightboxZoomInBtn: document.getElementById("lightbox-zoom-in"),
    lightboxZoomOutBtn: document.getElementById("lightbox-zoom-out"),
    lightboxZoomResetBtn: document.getElementById("lightbox-zoom-reset"),
    lightboxPrevBtn: document.getElementById("lightbox-prev"),
    lightboxNextBtn: document.getElementById("lightbox-next"),
    lightboxGalleryStrip: document.getElementById("lightbox-gallery-strip"),
  };
}

function applyLightboxTransform(): void {
  const { lightboxImage, lightboxZoomResetBtn } = getEls();
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

function resetLightboxZoom(): void {
  const { lightboxImage } = getEls();
  lbZoom = 1;
  lbPanX = 0;
  lbPanY = 0;
  lbDragging = false;
  lbDragged = false;
  lightboxImage?.classList.remove("is-dragging", "is-zoomed");
  applyLightboxTransform();
}

function setLightboxZoom(nextZoom: number): void {
  lbZoom = Math.min(4, Math.max(1, Number(nextZoom.toFixed(2))));
  applyLightboxTransform();
}

function showLightboxGalleryIndex(idx: number): void {
  const { lightboxImage, lightboxGalleryStrip } = getEls();
  if (!lbGalleryFiles.length || !lightboxImage) return;
  lbGalleryIndex = (idx + lbGalleryFiles.length) % lbGalleryFiles.length;
  const fn = lbGalleryFiles[lbGalleryIndex];
  resetLightboxZoom();
  const webp = assetImageWebpFullPath(fn);
  const orig = assetImagePath(fn);
  lightboxImage.src = webp || orig;
  lightboxImage.onerror = function () {
    lightboxImage.onerror = null;
    if (orig && lightboxImage.src !== orig) lightboxImage.src = orig;
  };
  if (lightboxGalleryStrip) {
    lightboxGalleryStrip.querySelectorAll(".lightbox-gallery-thumb").forEach((btn, i) => {
      btn.classList.toggle("is-active", i === lbGalleryIndex);
    });
  }
}

function renderLightboxGalleryStrip(files?: string[], title?: string): void {
  const { lightbox, lightboxGalleryStrip } = getEls();
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

function resetLightboxVideoNative(): void {
  const { lightboxVideoNative } = getEls();
  if (!lightboxVideoNative) return;
  lightboxVideoNative.pause();
  lightboxVideoNative.removeAttribute("src");
  lightboxVideoNative.load();
  lightboxVideoNative.classList.remove("lightbox-video-native--visible");
}

function fillLightboxStillImage(
  item: Element,
  imageData: PortfolioImage | null,
  img: HTMLImageElement | null,
  title: string,
): void {
  const { lightboxImage } = getEls();
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
    (imageData && imageData.category) || item.getAttribute("data-category") || "";
  lightboxImage.alt = imageData
    ? buildArtworkAltText(imageData, catForAlt, getPortfolioCategoryNames())
    : img?.alt || title || "";
  if (fn) {
    const webp = assetImageWebpFullPath(fn);
    const orig = assetImagePath(fn);
    const firstSrc = webp || orig;
    applyThirdPartyImageRequestMode(lightboxImage, firstSrc);
    lightboxImage.src = firstSrc;
    lightboxImage.onerror = function () {
      lightboxImage.onerror = null;
      if (orig && lightboxImage.src !== orig) {
        lightboxImage.src = orig;
        lightboxImage.onerror = function () {
          lightboxImage.onerror = null;
          lightboxImage.src = lightboxPlaceholderSvg;
          lightboxImage.alt = (lightboxImage.alt || "") + " (image unavailable)";
        };
      } else {
        lightboxImage.src = lightboxPlaceholderSvg;
        lightboxImage.alt = (lightboxImage.alt || "") + " (image unavailable)";
      }
    };
  } else {
    const src = imageData?.thumbnailUrl || img?.src || "";
    applyThirdPartyImageRequestMode(lightboxImage, src);
    lightboxImage.src = src;
    lightboxImage.onerror = function () {
      lightboxImage.onerror = null;
      lightboxImage.src = lightboxPlaceholderSvg;
      lightboxImage.alt = (lightboxImage.alt || "") + " (image unavailable)";
    };
  }
}

export function openLightbox(item: Element): void {
  const {
    lightbox,
    lightboxImage,
    lightboxVideo,
    lightboxVideoNative,
    lightboxTitle,
    lightboxDescription,
    lightboxKicker,
    lightboxClose,
  } = getEls();

  lbCurrentItem = item;
  resetLightboxZoom();
  lightbox?.classList.remove("lightbox--video");
  const img = item.querySelector("img");

  const imageDataStr = item.getAttribute("data-image-data");
  let imageData: PortfolioImage | null = null;
  if (imageDataStr) {
    try {
      imageData = JSON.parse(imageDataStr) as PortfolioImage;
    } catch (e) {
      console.error("Error parsing image data:", e);
    }
  }

  const title =
    imageData?.title || item.querySelector(".portfolio-title")?.textContent || "";
  const category =
    imageData?.category || item.querySelector(".portfolio-category")?.textContent || "";
  const badge =
    imageData?.award || item.querySelector(".portfolio-badge")?.textContent || "";

  const yid = imageData?.youtubeId || extractYoutubeId(imageData?.videoUrl);
  let webmUrl = (imageData?.videoWebm || "").trim();
  if (!webmUrl && imageData?.localWebm === true && yid) {
    webmUrl = `/assets/videos/webm/${yid}.webm`;
  }
  const tryNativeWebm = Boolean(webmUrl && lightboxVideoNative);

  resetLightboxVideoNative();

  if (tryNativeWebm && lightboxVideoNative) {
    lightbox?.classList.add("lightbox--video");
    if (lightboxImage) lightboxImage.style.display = "none";
    if (lightboxVideo) {
      lightboxVideo.classList.remove("lightbox-video--visible");
      lightboxVideo.src = LIGHTBOX_IFRAME_BLANK;
    }
    const v = lightboxVideoNative;
    v.setAttribute("aria-label", title ? `${title} — demo video` : "Demoscene demo video");
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

  const categoryText = getPortfolioCategoryNames()[category] || category;
  if (lightboxKicker) {
    lightboxKicker.textContent = categoryText || "";
    lightboxKicker.hidden = !categoryText;
  }

  if (lightboxDescription) {
    const year = imageData?.year;
    const parts: string[] = [];
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

export function closeLightbox(): void {
  const { lightbox, lightboxImage, lightboxVideo } = getEls();
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

function stepLightboxItem(delta: number): void {
  if (lbGalleryFiles.length > 1) {
    showLightboxGalleryIndex(lbGalleryIndex + delta);
    return;
  }
  const visibleItems: Element[] = Array.from(
    document.querySelectorAll<HTMLElement>(".portfolio-item"),
  ).filter((el) => el.style.display !== "none" && !el.hidden);
  if (visibleItems.length < 2) return;
  const idx = lbCurrentItem ? visibleItems.indexOf(lbCurrentItem) : -1;
  const nextIdx =
    idx === -1 ? 0 : (idx + delta + visibleItems.length) % visibleItems.length;
  openLightbox(visibleItems[nextIdx]);
}

export function attachLightboxEvents(): void {
  document.querySelectorAll(".portfolio-item").forEach((item) => {
    const newItem = item.cloneNode(true) as HTMLElement;
    item.parentNode?.replaceChild(newItem, item);

    newItem.addEventListener("click", () => openLightbox(newItem));
    newItem.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(newItem);
      }
    });
  });
}

export function initLightboxControls(): void {
  const {
    lightbox,
    lightboxImage,
    lightboxClose,
    lightboxStage,
    lightboxZoomInBtn,
    lightboxZoomOutBtn,
    lightboxZoomResetBtn,
    lightboxPrevBtn,
    lightboxNextBtn,
  } = getEls();

  if (!lightbox) return;

  lightboxClose?.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (lightbox.getAttribute("aria-hidden") !== "false") return;
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

  lightboxZoomInBtn?.addEventListener("click", () => setLightboxZoom(lbZoom + 0.5));
  lightboxZoomOutBtn?.addEventListener("click", () => setLightboxZoom(lbZoom - 0.5));
  lightboxZoomResetBtn?.addEventListener("click", resetLightboxZoom);
  lightboxPrevBtn?.addEventListener("click", () => stepLightboxItem(-1));
  lightboxNextBtn?.addEventListener("click", () => stepLightboxItem(1));

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
        if (lightbox.classList.contains("lightbox--video")) return;
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

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
}
