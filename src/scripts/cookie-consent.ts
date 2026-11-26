const STORAGE_KEY = "callisto_cookie_consent_v1";

function getBanner(): HTMLElement | null {
  return document.getElementById("cookie-banner");
}

function hideBanner(banner: HTMLElement | null): void {
  if (!banner) return;
  const active = document.activeElement as HTMLElement | null;
  if (active && banner.contains(active)) {
    if (typeof active.blur === "function") active.blur();
    const safeFocusTarget = document.querySelector<HTMLElement>("[data-cookie-open]");
    if (safeFocusTarget && typeof safeFocusTarget.focus === "function") {
      safeFocusTarget.focus({ preventScroll: true });
    }
  }
  banner.hidden = true;
  banner.setAttribute("aria-hidden", "true");
  banner.setAttribute("inert", "");
}

function showBanner(banner: HTMLElement | null): void {
  if (!banner) return;
  banner.hidden = false;
  banner.setAttribute("aria-hidden", "false");
  banner.removeAttribute("inert");
}

function saveConsent(value: "all" | "essential"): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
  hideBanner(getBanner());
  try {
    window.dispatchEvent(
      new CustomEvent("callisto:cookie-consent", { detail: { value } }),
    );
  } catch {
    /* ignore */
  }
}

export function initCookieConsent(): void {
  const banner = getBanner();
  if (!banner) return;

  document.querySelectorAll("[data-cookie-open]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      showBanner(banner);
    });
  });

  document.getElementById("cookie-accept-all")?.addEventListener("click", () => {
    saveConsent("all");
  });
  document
    .getElementById("cookie-reject-nonessential")
    ?.addEventListener("click", () => {
      saveConsent("essential");
    });

  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }

  if (stored === "all" || stored === "essential") {
    hideBanner(banner);
  } else {
    showBanner(banner);
  }
}
