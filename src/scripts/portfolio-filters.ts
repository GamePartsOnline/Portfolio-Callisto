import { getPortfolioFilterAllWord, getStoredLang } from "./i18n";
import {
  DEFAULT_PORTFOLIO_FILTER,
  getCategoryNamesFromData,
  getGroupAllWord,
  getGroupLabel,
  getPortfolioCategoryNames,
  getPortfolioData,
  getPortfolioFilterGroupById,
  humanizeCategoryId,
  PORTFOLIO_FILTER_GROUPS,
  setPortfolioCategoryNames,
  type CategorySummary,
} from "./portfolio-data";

let portfolioFiltersDelegated = false;

export function applyPortfolioFilter(
  filterRaw: string,
  opts?: { instant?: boolean },
): void {
  const instant = opts && opts.instant === true;
  const filter = (filterRaw || "all").toLowerCase();
  const groupMatch = filter.startsWith("group:")
    ? getPortfolioFilterGroupById(filter.slice(6))
    : null;
  const portfolioGrid = document.getElementById("portfolioGrid");
  const portfolioItems = portfolioGrid
    ? portfolioGrid.querySelectorAll<HTMLElement>(".portfolio-item")
    : document.querySelectorAll<HTMLElement>(".portfolio-item");

  portfolioItems.forEach((item) => {
    const cat = (item.getAttribute("data-category") || "").toLowerCase();
    const show =
      filter === "all" ||
      (groupMatch ? groupMatch.cats.includes(cat) : cat === filter);
    if (instant) {
      item.style.display = show ? "" : "none";
      item.style.opacity = "1";
      item.style.transform = "scale(1)";
      return;
    }
    if (show) {
      item.style.display = "";
      item.style.opacity = "1";
      item.style.transform = "scale(1)";
    } else {
      item.style.opacity = "0";
      item.style.transform = "scale(0.8)";
      window.setTimeout(() => {
        item.style.display = "none";
      }, 300);
    }
  });
}

export function closeAllFilterSubmenus(exceptGroup?: Element | null): void {
  const container = document.getElementById("portfolioFilters");
  if (!container) return;
  container.querySelectorAll(".filter-group.open").forEach((grp) => {
    if (exceptGroup && grp === exceptGroup) return;
    grp.classList.remove("open");
    const grpBtn = grp.querySelector(".filter-group-btn");
    if (grpBtn) grpBtn.setAttribute("aria-expanded", "false");
  });
}

export function updateFilterGroupLabels(): void {
  const container = document.getElementById("portfolioFilters");
  if (!container) return;
  const lang = getStoredLang();
  container.querySelectorAll(".filter-group").forEach((grp) => {
    const groupId = grp.getAttribute("data-group-id");
    const group = getPortfolioFilterGroupById(groupId);
    const grpBtn = grp.querySelector(".filter-group-btn");
    if (!group || !grpBtn) return;
    const baseLabel = getGroupLabel(group, lang);
    const activeSub = grp.querySelector(".filter-submenu-item.active[data-filter]");
    const labelSpan = grpBtn.querySelector(".filter-group-btn__label");
    if (!labelSpan) return;
    const groupAllBtn = grp.querySelector(".filter-submenu-item[data-group-all]");
    const totalMatch = groupAllBtn?.textContent?.match(/\((\d+)\)\s*$/);
    const groupTotalText = totalMatch ? ` (${totalMatch[1]})` : "";
    if (activeSub && !activeSub.hasAttribute("data-group-all")) {
      const subClean = (activeSub.textContent || "").replace(/\s*\(\d+\)\s*$/, "");
      labelSpan.textContent = `${baseLabel} · ${subClean}`;
    } else {
      labelSpan.textContent = `${baseLabel}${groupTotalText}`;
    }
  });
}

export function buildPortfolioFilterButtons(categories?: CategorySummary[]): void {
  const container = document.getElementById("portfolioFilters");
  if (!container) return;
  const list: CategorySummary[] = Array.isArray(categories)
    ? categories
    : [
        { id: "graphics", label: "Graphics", count: 0 },
        { id: "paintover", label: "Paintover", count: 0 },
        { id: "IA", label: "IA Art", count: 0 },
        { id: "photo", label: "Photos", count: 0 },
        { id: "gaming", label: "Gaming Artwork", count: 0 },
        { id: "pastel-sec", label: "Dry pastel", count: 0 },
        { id: "acrylique", label: "Acrylic", count: 0 },
        { id: "aquarelle", label: "Watercolor", count: 0 },
        { id: "animation", label: "Animation", count: 0 },
        { id: "other", label: "Others", count: 0 },
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
    totalCount != null && totalCount > 0 ? `${allWord} (${totalCount})` : allWord;
  container.appendChild(allBtn);

  const byId = new Map<string, CategorySummary>();
  list.forEach((cat) => byId.set(cat.id.toLowerCase(), cat));
  const usedIds = new Set<string>();
  const lang = getStoredLang();

  PORTFOLIO_FILTER_GROUPS.forEach((group) => {
    const groupCats = group.cats
      .map((cid) => byId.get(cid.toLowerCase()))
      .filter((x): x is CategorySummary => Boolean(x));
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
        typeof cat.count === "number" ? `${cat.label} (${cat.count})` : cat.label;
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

export function initPortfolioFilters(): void {
  const container = document.getElementById("portfolioFilters");
  const portfolioGrid = document.getElementById("portfolioGrid");
  if (!container) return;

  if (!portfolioFiltersDelegated) {
    portfolioFiltersDelegated = true;
    container.addEventListener("click", (e) => {
      const target = e.target as Element | null;
      if (!target) return;
      const groupToggle = target.closest(".filter-group-btn");
      if (groupToggle && container.contains(groupToggle)) {
        const groupEl = groupToggle.closest(".filter-group");
        const willOpen = Boolean(groupEl && !groupEl.classList.contains("open"));
        closeAllFilterSubmenus(groupEl);
        if (groupEl) {
          groupEl.classList.toggle("open", willOpen);
          groupToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
        }
        return;
      }

      const button = target.closest(".filter-btn[data-filter]");
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
      if (!container.contains(e.target as Node)) {
        closeAllFilterSubmenus();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllFilterSubmenus();
    });
  }

  const portfolioItems = portfolioGrid
    ? portfolioGrid.querySelectorAll<HTMLElement>(".portfolio-item")
    : document.querySelectorAll<HTMLElement>(".portfolio-item");
  portfolioItems.forEach((item) => {
    item.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  });
}

export function refreshPortfolioFilterLabels(): void {
  const allBtn = document.querySelector('#portfolioFilters [data-filter="all"]');
  const allWord = getPortfolioFilterAllWord();
  if (allBtn) {
    const m = allBtn.textContent?.match(/\((\d+)\)\s*$/);
    allBtn.textContent = m ? `${allWord} (${m[1]})` : allWord;
  }

  const names = getCategoryNamesFromData(getPortfolioData());
  setPortfolioCategoryNames(names);
  const lang = getStoredLang();

  document.querySelectorAll("#portfolioFilters [data-filter]").forEach((btn) => {
    const cat = btn.getAttribute("data-filter");
    if (!cat || cat === "all") return;
    if (cat.startsWith("group:")) {
      const word = getGroupAllWord(lang);
      const m = btn.textContent?.match(/\((\d+)\)\s*$/);
      btn.textContent = m ? `${word} (${m[1]})` : word;
      return;
    }
    const label = names[cat] || humanizeCategoryId(cat);
    const m = btn.textContent?.match(/\((\d+)\)\s*$/);
    btn.textContent = m ? `${label} (${m[1]})` : label;
  });

  updateFilterGroupLabels();
  const curNames = getPortfolioCategoryNames();
  document.querySelectorAll(".portfolio-item").forEach((item) => {
    const cat = item.getAttribute("data-category");
    if (!cat) return;
    const label = curNames[cat] || humanizeCategoryId(cat);
    const pill = item.querySelector(".portfolio-medium-pill");
    if (pill) pill.textContent = label;
    const catEl = item.querySelector(".portfolio-category");
    if (catEl) catEl.textContent = label;
  });
}
