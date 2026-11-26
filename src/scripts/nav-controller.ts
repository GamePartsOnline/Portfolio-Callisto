export function initNavigation(): void {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navDesktopMq = window.matchMedia("(min-width: 768px)");

  function syncNavMenuAriaHidden(): void {
    if (!navToggle || !navMenu) return;
    if (navDesktopMq.matches) {
      navMenu.removeAttribute("aria-hidden");
      navMenu.removeAttribute("inert");
      return;
    }
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navMenu.setAttribute("aria-hidden", expanded ? "false" : "true");
    if (expanded) {
      navMenu.removeAttribute("inert");
    } else {
      navMenu.setAttribute("inert", "");
    }
  }

  function focusNavToggleIfNeeded(): void {
    if (
      navToggle &&
      navMenu &&
      document.activeElement &&
      navMenu.contains(document.activeElement)
    ) {
      navToggle.focus();
    }
  }

  if (navToggle && navMenu) {
    syncNavMenuAriaHidden();
    navDesktopMq.addEventListener("change", syncNavMenuAriaHidden);

    navToggle.addEventListener("click", () => {
      const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      if (isExpanded) focusNavToggleIfNeeded();
      navToggle.setAttribute("aria-expanded", String(!isExpanded));
      syncNavMenuAriaHidden();
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (navToggle.getAttribute("aria-expanded") !== "true") return;
        navToggle.focus();
        navToggle.setAttribute("aria-expanded", "false");
        syncNavMenuAriaHidden();
      });
    });

    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        navToggle.getAttribute("aria-expanded") === "true"
      ) {
        navToggle.focus();
        navToggle.setAttribute("aria-expanded", "false");
        syncNavMenuAriaHidden();
      }
    });
  }

  const nav = document.querySelector(".nav");
  let navScrollRaf = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (!nav || navScrollRaf) return;
      navScrollRaf = requestAnimationFrame(() => {
        navScrollRaf = 0;
        nav.classList.toggle("nav--scrolled", window.pageYOffset > 100);
      });
    },
    { passive: true },
  );
  nav?.classList.toggle("nav--scrolled", window.pageYOffset > 100);
}

export function initSmoothScroll(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      e.preventDefault();
      const target = document.querySelector<HTMLElement>(href);
      if (target) {
        const navOffset = 60;
        const top =
          target.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({
          top: Math.max(0, top),
          behavior: "smooth",
        });
        if (target.id === "main-content") {
          const focusMain = () => {
            try {
              target.focus({ preventScroll: true });
            } catch {
              target.setAttribute("tabindex", "-1");
              target.focus({ preventScroll: true });
            }
          };
          window.setTimeout(focusMain, 450);
        }
      }
    });
  });
}
