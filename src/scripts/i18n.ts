import { isFileProtocol } from "./assets-paths";

export type LangCode = "fr" | "en";

interface I18nLeaf {
  fr?: string;
  en?: string;
}

const I18N_STORAGE_KEY = "callisto-lang";
const I18N_JSON_URL = "/i18n.json?v=6";

let i18nBundle: Record<string, unknown> | null = null;
const i18nFrSnapshots = new WeakMap<Element, string>();
const langChangeListeners = new Set<(lang: LangCode) => void>();

declare global {
  interface Window {
    loadLanguage?: (lang: string) => void;
    toggleNightAtelier?: () => void;
  }
}

export function onI18nLanguageChange(cb: (lang: LangCode) => void): void {
  langChangeListeners.add(cb);
}

export function getI18nLeaf(
  bundle: Record<string, unknown> | null,
  path: string,
): I18nLeaf | null {
  if (!bundle || !path || typeof path !== "string") return null;
  const parts = path.split(".");
  let o: unknown = bundle;
  for (let i = 0; i < parts.length; i++) {
    o = o && typeof o === "object" ? (o as Record<string, unknown>)[parts[i]] : undefined;
  }
  if (o && typeof o === "object" && ("en" in o || "fr" in o)) {
    return o as I18nLeaf;
  }
  return null;
}

export function getStoredLang(): LangCode {
  try {
    const s = localStorage.getItem(I18N_STORAGE_KEY);
    if (s === "en" || s === "fr") return s;
  } catch {
    /* storage blocked */
  }
  return "fr";
}

export function getPortfolioFilterAllWord(): string {
  const lang = getStoredLang();
  const leaf = getI18nLeaf(i18nBundle, "portfolio.filterAll");
  if (leaf) {
    return lang === "en" ? leaf.en || "All" : leaf.fr || "Tous";
  }
  return lang === "en" ? "All" : "Tous";
}

function initI18nSnapshots(): void {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    i18nFrSnapshots.set(el, el.innerHTML);
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-aria]").forEach((el) => {
    const cur = el.getAttribute("aria-label");
    if (cur) el.dataset.i18nAriaFr = cur;
  });
}

function updateDocumentTitleFromI18n(lang: LangCode): void {
  if (!i18nBundle) return;
  if (document.getElementById("heroSlides")) {
    const leaf = getI18nLeaf(i18nBundle, "meta.documentTitle");
    if (leaf && typeof leaf[lang] === "string" && leaf[lang]) {
      document.title = leaf[lang]!;
    }
    return;
  }
  if (
    document.body.classList.contains("legal-page-body") &&
    !document.body.classList.contains("build-log-body") &&
    !document.body.classList.contains("services-page-body") &&
    !document.body.classList.contains("portfolio-page-body")
  ) {
    const leaf = getI18nLeaf(i18nBundle, "meta.legalDocumentTitle");
    if (leaf && typeof leaf[lang] === "string" && leaf[lang]) {
      document.title = leaf[lang]!;
    }
    return;
  }
  if (document.body.classList.contains("build-log-body")) {
    const leaf = getI18nLeaf(i18nBundle, "meta.buildLogDocumentTitle");
    if (leaf && typeof leaf[lang] === "string" && leaf[lang]) {
      document.title = leaf[lang]!;
    }
  }
}

function syncLangSwitchUi(lang: LangCode): void {
  document.querySelectorAll<HTMLElement>(".lang-switch [data-lang]").forEach((btn) => {
    const l = btn.getAttribute("data-lang");
    const active = l === lang;
    btn.setAttribute("aria-pressed", active ? "true" : "false");
    btn.classList.toggle("is-active", active);
  });
}

function applyI18nLanguage(lang: LangCode): void {
  if (!i18nBundle || (lang !== "fr" && lang !== "en")) return;
  document.documentElement.lang = lang;

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

  document.querySelectorAll<HTMLElement>("[data-i18n-aria]").forEach((el) => {
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
  langChangeListeners.forEach((cb) => cb(lang));
  syncLangSwitchUi(lang);
}

function bindLangSwitch(): void {
  const root = document.querySelector(".lang-switch");
  if (!root) return;
  root.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (lang === "fr" || lang === "en") window.loadLanguage?.(lang);
    });
  });
  syncLangSwitchUi(getStoredLang());
}

window.loadLanguage = function loadLanguage(lang: string): void {
  if (lang !== "fr" && lang !== "en") return;
  try {
    localStorage.setItem(I18N_STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  if (!i18nBundle) {
    syncLangSwitchUi(getStoredLang());
    return;
  }
  applyI18nLanguage(lang);
};

export async function initI18nApplyStoredLanguage(): Promise<void> {
  initI18nSnapshots();
  const stored = getStoredLang();
  document.documentElement.lang = stored;
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
    i18nBundle = (await res.json()) as Record<string, unknown>;
  } catch {
    bindLangSwitch();
    return;
  }
  applyI18nLanguage(getStoredLang());
  bindLangSwitch();
}
