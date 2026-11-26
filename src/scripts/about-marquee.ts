export function initAboutToolsMarquee(): void {
  const list = document.querySelector<HTMLElement>(
    ".about-tools-marquee .about-tool-list",
  );
  if (!list || list.dataset.marqueeReady === "1") return;
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  list.dataset.marqueeReady = "1";
  Array.from(list.children).forEach((item) => {
    const clone = item.cloneNode(true) as Element;
    clone.setAttribute("aria-hidden", "true");
    list.appendChild(clone);
  });
}
