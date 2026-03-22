/**
 * Bandeau cookies (UE / ePrivacy) — préférence stockée en localStorage.
 * Clé versionnée pour pouvoir re-demander le consentement après changement majeur.
 */
(function () {
  const STORAGE_KEY = "callisto_cookie_consent_v1";

  function getBanner() {
    return document.getElementById("cookie-banner");
  }

  function hideBanner(banner) {
    if (!banner) return;
    banner.hidden = true;
    banner.setAttribute("aria-hidden", "true");
  }

  function showBanner(banner) {
    if (!banner) return;
    banner.hidden = false;
    banner.setAttribute("aria-hidden", "false");
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {
      /* file:// ou mode privé strict */
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
