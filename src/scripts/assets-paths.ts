/** Renamed files: old JSON key -> current filename on disk */
const LEGACY_IMAGE_FILENAMES: Record<string, string> = {
  "aquarelle/ouvaton?.jpg": "aquarelle/ouvaton.jpg",
};

/**
 * True when the page is opened as file:// (fetch() blocked by CORS).
 */
export function isFileProtocol(): boolean {
  return window.location.protocol === "file:";
}

function normalizeImageFilename(filename?: string): string[] {
  if (!filename) return [];
  let normalized = String(filename).replace(/\\/g, "/").replace(/^\/+/, "");
  if (LEGACY_IMAGE_FILENAMES[normalized]) {
    normalized = LEGACY_IMAGE_FILENAMES[normalized];
  }
  return normalized.split("/").filter(Boolean);
}

/**
 * Portfolio image path: encode each segment (encodeURI does not encode `?` or `#`).
 */
export function assetImagePath(filename?: string): string {
  const segments = normalizeImageFilename(filename);
  if (!segments.length) return "";
  return "/assets/images/" + segments.map(encodeURIComponent).join("/");
}

/**
 * Grid thumbnail: /assets/images/thumbs/.../basename-thumb.webp
 */
export function assetImageThumbPath(filename?: string): string {
  const segments = normalizeImageFilename(filename);
  if (!segments.length) return "";
  const last = segments[segments.length - 1];
  const dot = last.lastIndexOf(".");
  if (dot <= 0) return "";
  const base = last.slice(0, dot);
  segments[segments.length - 1] = `${base}-thumb.webp`;
  return "/assets/images/thumbs/" + segments.map(encodeURIComponent).join("/");
}

/**
 * Full-size WebP: /assets/images/webp/.../basename.webp
 */
export function assetImageWebpFullPath(filename?: string): string {
  const segments = normalizeImageFilename(filename);
  if (!segments.length) return "";
  const last = segments[segments.length - 1];
  const dot = last.lastIndexOf(".");
  if (dot <= 0) return "";
  const base = last.slice(0, dot);
  segments[segments.length - 1] = `${base}.webp`;
  return "/assets/images/webp/" + segments.map(encodeURIComponent).join("/");
}

/** Extract YouTube video id (11 chars) from a URL or raw id. */
export function extractYoutubeId(urlOrId?: string | null): string | null {
  if (!urlOrId) return null;
  const s = String(urlOrId).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

export function getYoutubeThumbnailUrl(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

/**
 * Third-party HTTPS images: anonymous CORS and minimal referrer.
 * Call before assigning `img.src`.
 */
export function applyThirdPartyImageRequestMode(
  img: HTMLImageElement | null,
  url: string,
): void {
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
  } catch {
    /* invalid URL */
  }
}
