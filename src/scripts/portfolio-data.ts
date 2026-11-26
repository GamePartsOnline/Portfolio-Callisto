import {
  assetImagePath,
  assetImageThumbPath,
  extractYoutubeId,
  getYoutubeThumbnailUrl,
  isFileProtocol,
} from "./assets-paths";
import { getStoredLang, type LangCode } from "./i18n";

export interface PortfolioCategory {
  id: string;
  label?: string;
}

export interface PortfolioImage {
  filename?: string;
  category?: string;
  title?: string;
  year?: number | string;
  award?: string;
  description?: string;
  thumbnailUrl?: string;
  youtubeId?: string;
  videoUrl?: string;
  videoWebm?: string;
  localWebm?: boolean;
  hidden?: boolean;
  gallery?: string[];
}

export interface PortfolioData {
  categories: PortfolioCategory[];
  images: PortfolioImage[];
}

export interface FilterGroupDef {
  id: string;
  fr: string;
  en: string;
  cats: string[];
}

export interface CategorySummary {
  id: string;
  label: string;
  count: number;
}

export const DEFAULT_PORTFOLIO_FILTER = "all";
const PORTFOLIO_JSON_URL = "/assets/images/portfolio_images.json?v=13";

export const PORTFOLIO_FILTER_GROUPS: FilterGroupDef[] = [
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

let portfolioData: PortfolioData = {
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

let portfolioCategoryNames: Record<string, string> = {};

export function getPortfolioData(): PortfolioData {
  return portfolioData;
}

export function getPortfolioCategoryNames(): Record<string, string> {
  return portfolioCategoryNames;
}

export function setPortfolioCategoryNames(map: Record<string, string>): void {
  portfolioCategoryNames = map;
}

export function getCategoryNamesFromData(data: PortfolioData): Record<string, string> {
  const frLabels: Record<string, string> = {
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
  const lang = getStoredLang();
  const map: Record<string, string> = {};
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

export function humanizeCategoryId(id?: string): string {
  if (!id) return "Other";
  if (id === "IA") return "IA Art";
  const str = id.replace(/-/g, " ").replace(/_/g, " ");
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function buildArtworkAltText(
  image: PortfolioImage,
  categoryId?: string,
  labelMap?: Record<string, string>,
): string {
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
  const parts: string[] = [];
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

export function getPortfolioThumbInfo(image: PortfolioImage): {
  thumbSrc: string;
  yid: string | null;
  category: string;
} | null {
  if (!image || image.category === "logo") return null;
  if (image.hidden === true) return null;
  const yid = image.youtubeId || extractYoutubeId(image.videoUrl);
  const thumbGrid = image.filename ? assetImageThumbPath(image.filename) : "";
  const thumbFromFile = image.filename ? assetImagePath(image.filename) : "";
  const thumbExternal = image.thumbnailUrl || "";
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

export function getCategoriesFromImages(data: PortfolioData): CategorySummary[] {
  const labelMap = getCategoryNamesFromData(data);
  const counts = new Map<string, number>();
  (data.images || []).forEach((img) => {
    const info = getPortfolioThumbInfo(img);
    if (!info) return;
    counts.set(info.category, (counts.get(info.category) || 0) + 1);
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

export function getPortfolioFilterGroupById(
  groupId: string | null,
): FilterGroupDef | null {
  if (!groupId) return null;
  return PORTFOLIO_FILTER_GROUPS.find((g) => g.id === groupId) || null;
}

export function getGroupLabel(group: FilterGroupDef, lang?: LangCode): string {
  const l = lang || getStoredLang();
  return l === "en" ? group.en : group.fr;
}

export function getGroupAllWord(lang?: LangCode): string {
  const l = lang || getStoredLang();
  return l === "en" ? "All in category" : "Tout voir";
}

export async function loadPortfolioJsonOnce(): Promise<void> {
  if (isFileProtocol()) return;
  try {
    const res = await fetch(PORTFOLIO_JSON_URL);
    if (!res.ok) return;
    const json = (await res.json()) as PortfolioData;
    if (json && Array.isArray(json.images)) {
      portfolioData = json;
    }
  } catch {
    /* keep default categories + empty images */
  }
}
