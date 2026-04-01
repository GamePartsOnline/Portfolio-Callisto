/**
 * Cookie banner (EU / ePrivacy) — preference stored in localStorage.
 * Versioned key so consent can be re-requested after a major policy change.
 */
(function () {
  const STORAGE_KEY = "callisto_cookie_consent_v1";

  function getBanner() {
    return document.getElementById("cookie-banner");
  }

  function hideBanner(banner) {
    if (!banner) return;
    // A11y: never hide an ancestor while one of its descendants keeps focus.
    var active = document.activeElement;
    if (active && banner.contains(active)) {
      if (typeof active.blur === "function") active.blur();
      var safeFocusTarget = document.querySelector("[data-cookie-open]");
      if (safeFocusTarget && typeof safeFocusTarget.focus === "function") {
        safeFocusTarget.focus({ preventScroll: true });
      }
    }
    banner.hidden = true;
    banner.setAttribute("aria-hidden", "true");
    banner.setAttribute("inert", "");
  }

  function showBanner(banner) {
    if (!banner) return;
    banner.hidden = false;
    banner.setAttribute("aria-hidden", "false");
    banner.removeAttribute("inert");
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {
      /* file:// or strict private mode */
    }
    hideBanner(getBanner());
    try {
      window.dispatchEvent(
        new CustomEvent("callisto:cookie-consent", { detail: { value } }),
      );
    } catch (_) {}
  }

  function init() {
    const banner = getBanner();
    if (!banner) return;

    document.querySelectorAll("[data-cookie-open]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
        showBanner(banner);
      });
    });

    var accept = document.getElementById("cookie-accept-all");
    var reject = document.getElementById("cookie-reject-nonessential");
    if (accept) {
      accept.addEventListener("click", function () {
        saveConsent("all");
      });
    }
    if (reject) {
      reject.addEventListener("click", function () {
        saveConsent("essential");
      });
    }

    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      stored = null;
    }

    if (stored === "all" || stored === "essential") {
      hideBanner(banner);
    } else {
      showBanner(banner);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
