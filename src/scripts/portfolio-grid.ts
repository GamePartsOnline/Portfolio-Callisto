import { applyThirdPartyImageRequestMode, assetImagePath } from "./assets-paths";
import { attachLightboxEvents, openLightbox } from "./lightbox";
import {
  buildArtworkAltText,
  getCategoriesFromImages,
  getCategoryNamesFromData,
  getPortfolioCategoryNames,
  getPortfolioData,
  getPortfolioThumbInfo,
  humanizeCategoryId,
  setPortfolioCategoryNames,
  type PortfolioImage,
} from "./portfolio-data";
import {
  applyPortfolioFilter,
  buildPortfolioFilterButtons,
  initPortfolioFilters,
} from "./portfolio-filters";

let portfolioFiltersRebuildRaf: number | null = null;

function rebuildPortfolioFiltersFromDom(): void {
  if (portfolioFiltersRebuildRaf) cancelAnimationFrame(portfolioFiltersRebuildRaf);
  portfolioFiltersRebuildRaf = requestAnimationFrame(() => {
    portfolioFiltersRebuildRaf = null;
    const grid = document.getElementById("portfolioGrid");
    if (!grid) return;
    const items = grid.querySelectorAll(".portfolio-item");
    const counts = new Map<string, number>();
    items.forEach((item) => {
      const id = item.getAttribute("data-category");
      if (!id) return;
      counts.set(id, (counts.get(id) || 0) + 1);
    });
    const names = getPortfolioCategoryNames();
    const list = Array.from(counts.entries())
      .map(([id, count]) => ({
        id,
        label: names[id] || humanizeCategoryId(id),
        count,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
      );
    buildPortfolioFilterButtons(list);
    const active = document.querySelector("#portfolioFilters .filter-btn.active");
    const f = (active?.getAttribute("data-filter") || "all").toLowerCase();
    applyPortfolioFilter(f, { instant: true });
    initPortfolioFilters();
    attachLightboxEvents();
  });
}

export async function loadPortfolioImages(): Promise<void> {
  try {
    const data = getPortfolioData();
    const portfolioGrid = document.getElementById("portfolioGrid");
    if (!portfolioGrid) return;

    const categoryLabelMap = getCategoryNamesFromData(data);
    setPortfolioCategoryNames(categoryLabelMap);
    const categoriesFromImages = getCategoriesFromImages(data);
    buildPortfolioFilterButtons(categoriesFromImages);

    const allImages = data.images || [];
    const toBuild: Array<{
      image: PortfolioImage;
      info: NonNullable<ReturnType<typeof getPortfolioThumbInfo>>;
    }> = [];
    allImages.forEach((image) => {
      const info = getPortfolioThumbInfo(image);
      if (!info) return;
      toBuild.push({ image, info });
    });

    function createPortfolioItem(
      image: PortfolioImage,
      info: NonNullable<ReturnType<typeof getPortfolioThumbInfo>>,
      itemIndex: number,
    ): HTMLElement {
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
      if (itemIndex < 3) {
        img.loading = "eager";
        img.decoding = itemIndex === 0 ? "sync" : "async";
        if (itemIndex === 0) img.fetchPriority = "high";
      } else {
        img.loading = "lazy";
        img.decoding = "async";
      }
      img.sizes = "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw";
      img.setAttribute("width", "400");
      img.setAttribute("height", "400");

      function onImgFinalError(this: HTMLImageElement) {
        this.onerror = null;
        const card = this.closest(".portfolio-item");
        if (card && card.parentNode) {
          card.remove();
          rebuildPortfolioFiltersFromDom();
        }
      }

      img.onerror = function () {
        img.onerror = null;
        if (image.filename) {
          const full = assetImagePath(image.filename);
          if (full && img.src !== full) {
            img.src = full;
            img.onerror = onImgFinalError;
            return;
          }
        }
        onImgFinalError.call(img);
      };

      imageDiv.appendChild(img);

      const mediumPill = document.createElement("span");
      mediumPill.className = "portfolio-medium-pill";
      mediumPill.textContent =
        getPortfolioCategoryNames()[category] || humanizeCategoryId(category);
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
        getPortfolioCategoryNames()[category] || humanizeCategoryId(category);

      overlay.appendChild(title);

      if (image.year) {
        const yearSpan = document.createElement("span");
        yearSpan.className = "portfolio-year";
        yearSpan.textContent = String(image.year);
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

    function appendPortfolioBatch(): void {
      const end = Math.min(bi + BATCH, toBuild.length);
      for (; bi < end; bi++) {
        const { image, info } = toBuild[bi];
        portfolioGrid!.appendChild(createPortfolioItem(image, info, bi));
      }
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
        const match = Array.from(document.querySelectorAll(".portfolio-item")).find(
          (el) => {
            const t = (el.querySelector(".portfolio-title")?.textContent || "").toLowerCase();
            return t.includes(needle);
          },
        );
        if (match) openLightbox(match);
      }
    }

    appendPortfolioBatch();
  } catch (error) {
    console.error("Error loading portfolio images:", error);
  }
}
