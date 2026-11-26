interface StarPoint {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

export function initNightAtelier(): void {
  const starsCanvas = document.getElementById("stars-overlay") as HTMLCanvasElement | null;
  const toggleBtn = document.getElementById("atelier-toggle-btn");
  const banner = document.getElementById("atelier-banner");
  if (!starsCanvas) return;

  let isNight = false;
  let starsData: StarPoint[] = [];

  function initStars(): void {
    if (!starsCanvas) return;
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
    starsData = Array.from({ length: 120 }, () => ({
      x: Math.random() * starsCanvas.width,
      y: Math.random() * starsCanvas.height,
      r: Math.random() * 1.5 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    }));
  }

  initStars();
  window.addEventListener("resize", initStars);

  function drawStars(): void {
    if (!starsCanvas || !starsData.length) {
      requestAnimationFrame(drawStars);
      return;
    }
    const ctx = starsCanvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    if (!document.body.classList.contains("night")) {
      requestAnimationFrame(drawStars);
      return;
    }
    const t = Date.now() / 1000;
    starsData.forEach((s) => {
      const a = 0.3 + 0.4 * Math.sin(t * s.speed + s.phase);
      ctx.fillStyle = `rgba(255,235,200,${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  }
  drawStars();

  let bannerTimeout: number;
  window.toggleNightAtelier = function (): void {
    isNight = !isNight;
    document.body.classList.toggle("night", isNight);
    if (toggleBtn) {
      toggleBtn.classList.toggle("on", isNight);
      const icon = toggleBtn.querySelector(".toggle-icon");
      if (icon) icon.textContent = isNight ? "☀️" : "🕯️";
      toggleBtn.setAttribute("aria-pressed", String(isNight));
    }
    if (banner) {
      if (isNight) {
        banner.classList.add("vis");
        window.clearTimeout(bannerTimeout);
        bannerTimeout = window.setTimeout(() => {
          banner.classList.remove("vis");
        }, 3000);
      } else {
        banner.classList.remove("vis");
      }
    }
  };
}
