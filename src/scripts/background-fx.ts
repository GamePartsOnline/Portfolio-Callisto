interface ParticleState {
  particle: HTMLDivElement;
  trajectoryType: "circular" | "sinusoidal";
  duration: number;
  radius: number;
  speed: number;
  startTime: number | null;
  angle: number;
}

export function initParticles(): void {
  const particlesContainer = document.getElementById("bgParticles");
  if (!particlesContainer) return;
  particlesContainer.innerHTML = "";
  if (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const w = window.innerWidth;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const lowCpu =
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency <= 4;
  const navWithMem = navigator as Navigator & { deviceMemory?: number };
  const lowMem =
    typeof navWithMem.deviceMemory === "number" && navWithMem.deviceMemory <= 4;
  const lowPowerMode = coarsePointer || w < 1024 || lowCpu || lowMem;

  if (prefersReducedMotion || lowPowerMode) {
    const staticParticles = w < 480 ? 2 : w < 1024 ? 3 : 8;
    for (let i = 0; i < staticParticles; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      const size = Math.random() * 3 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.opacity = String(Math.random() * 0.4 + 0.4);
      particlesContainer.appendChild(particle);
    }
    return;
  }

  const particleCount = w < 480 ? 3 : w < 768 ? 5 : 12;
  const particles: HTMLDivElement[] = [];
  const states: ParticleState[] = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    const size = Math.random() * 2.5 + 1.5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.opacity = String(Math.random() * 0.4 + 0.4);
    particlesContainer.appendChild(particle);
    particles.push(particle);

    particle.style.left = `${Math.random() * window.innerWidth}px`;
    particle.style.top = `${Math.random() * window.innerHeight}px`;

    states.push({
      particle,
      trajectoryType: Math.random() > 0.5 ? "circular" : "sinusoidal",
      duration: 15000 + Math.random() * 15000,
      radius: 50 + Math.random() * 100,
      speed: Math.random() * 0.02 + 0.01,
      startTime: null,
      angle: Math.random() * Math.PI * 2,
    });
  }

  function animateParticlesFrame(currentTime: number): void {
    states.forEach((s) => {
      const p = s.particle;
      if (!s.startTime) s.startTime = currentTime;
      let elapsed = (currentTime - s.startTime) / s.duration;
      if (elapsed >= 1) {
        s.startTime = currentTime;
        s.angle = Math.random() * Math.PI * 2;
        elapsed = 0;
      }

      let x: number;
      let y: number;
      if (s.trajectoryType === "circular") {
        s.angle += s.speed;
        x = Math.cos(s.angle) * s.radius;
        y = Math.sin(s.angle) * s.radius;
      } else {
        x = Math.sin(s.angle) * s.radius;
        y = Math.cos(s.angle * 2) * s.radius * 0.5;
        s.angle += s.speed;
      }

      const driftX = Math.sin(elapsed * Math.PI * 2) * 30;
      const driftY = Math.cos(elapsed * Math.PI * 2) * 20;
      p.style.transform = `translate(${x + driftX}px, ${y + driftY}px)`;

      const baseOpacity = p.dataset.baseOpacity
        ? parseFloat(p.dataset.baseOpacity)
        : 0.5;
      if (!p.dataset.baseOpacity) p.dataset.baseOpacity = String(baseOpacity);
      const opacityVariation = Math.sin(elapsed * Math.PI * 4) * 0.2;
      p.style.opacity = String(
        Math.max(0.3, Math.min(1.0, baseOpacity + opacityVariation)),
      );
    });
    requestAnimationFrame(animateParticlesFrame);
  }

  requestAnimationFrame(animateParticlesFrame);

  let resizeTimeout: number;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      particles.forEach((p) => p.remove());
      initParticles();
    }, 300);
  });
}

export function initParallax(): void {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const lowCpu =
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency <= 4;
  const navWithMem = navigator as Navigator & { deviceMemory?: number };
  const lowMem =
    typeof navWithMem.deviceMemory === "number" && navWithMem.deviceMemory <= 4;
  if (
    prefersReducedMotion ||
    coarsePointer ||
    window.innerWidth < 1024 ||
    lowCpu ||
    lowMem
  ) {
    return;
  }

  const orbs = document.querySelectorAll<HTMLElement>(".orb");
  const mesh = document.querySelector<HTMLElement>(".bg-mesh");
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const rate = window.pageYOffset * 0.1;
        orbs.forEach((orb, index) => {
          orb.style.transform = `translateY(${rate * (index + 1) * 0.05}px)`;
        });
        if (mesh) {
          mesh.style.transform = `translateY(${rate * 0.03}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

export function initScrollReveal(): void {
  const revealTargets = document.querySelectorAll<HTMLElement>(
    ".section:not(#portfolio):not(#journey), .glass-card:not(.portfolio-item)",
  );
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    revealTargets.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });
  } else {
    revealTargets.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }
}

export function initMobileSocialRailFade(): void {
  let timer: number | null = null;
  let raf = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (!window.matchMedia("(max-width: 768px)").matches) return;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        document.body.classList.add("is-scrolling-mobile");
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          document.body.classList.remove("is-scrolling-mobile");
        }, 240);
      });
    },
    { passive: true },
  );
}

export function initLazyImagesFallback(): void {
  if ("loading" in HTMLImageElement.prototype) return;
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || img.src;
          img.classList.remove("lazy");
          observer.unobserve(img);
        }
      });
    });
    document
      .querySelectorAll<HTMLImageElement>("img.lazy")
      .forEach((img) => imageObserver.observe(img));
  } else {
    document.querySelectorAll<HTMLImageElement>("img.lazy").forEach((img) => {
      img.src = img.dataset.src || img.src;
      img.classList.remove("lazy");
    });
  }
}
