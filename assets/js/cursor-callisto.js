// ═══════════════════════════════════════════
//   PIXEL ART CURSOR — Callisto Arts (portfolio)
//   Trail néon + burst au clic, harmonisé au site
// ═══════════════════════════════════════════
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('cursor-canvas');
  if (!canvas) return;
  document.documentElement.classList.add('cursor-pixel');

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  let W, H, mx = -100, my = -100, isHover = false;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Couleurs harmonisées au site (rose + turquoise)
  const MODE = {
    main: '#00ffe0',
    trail: ['#00ffe0', '#00bfff', '#ffffff', '#00ff99', '#f472b6'],
    burst: ['#00ffe0', '#ff2df7', '#f472b6', '#ffffff', '#00ff99', '#ffd700']
  };

  const PX = 3;
  let trail = [];
  const TRAIL_LEN = 18;
  let bursts = [];

  function spawnBurst(x, y) {
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 2 + Math.random() * 5;
      const size = Math.random() < 0.5 ? PX : PX * 2;
      bursts.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.025 + Math.random() * 0.03,
        size,
        color: MODE.burst[Math.floor(Math.random() * MODE.burst.length)]
      });
    }
  }

  document.addEventListener('click', function (e) {
    spawnBurst(e.clientX, e.clientY);
  });

  document.addEventListener('mouseover', function (e) {
    isHover = !!(e.target.closest('a, button, [role="button"], .filter-btn, .portfolio-item'));
  });

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    trail.push({
      x: mx, y: my,
      life: 1,
      size: PX,
      color: MODE.trail[Math.floor(Math.random() * MODE.trail.length)]
    });
    if (trail.length > TRAIL_LEN) trail.shift();
  });

  function drawPixel(x, y, color, size) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), size, size);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    trail.forEach(function (p, i) {
      const alpha = (i / trail.length) * 0.8;
      ctx.globalAlpha = alpha;
      const s = PX * (0.4 + (i / trail.length) * 0.6);
      drawPixel(p.x - s / 2, p.y - s / 2, p.color, Math.round(s));
    });
    ctx.globalAlpha = 1;

    bursts = bursts.filter(function (b) { return b.life > 0; });
    bursts.forEach(function (b) {
      ctx.globalAlpha = b.life;
      drawPixel(b.x, b.y, b.color, b.size);
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.12;
      b.life -= b.decay;
    });
    ctx.globalAlpha = 1;

    if (isHover) {
      const halo = ctx.createRadialGradient(mx, my, 0, mx, my, PX * 5);
      halo.addColorStop(0, '#ffd700aa');
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(mx, my, PX * 5, 0, Math.PI * 2);
      ctx.fill();
      drawPixel(mx - 1, my - 1, '#ffffff', 3);
    } else {
      const halo = ctx.createRadialGradient(mx, my, 0, mx, my, PX * 5);
      halo.addColorStop(0, MODE.main + 'aa');
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(mx, my, PX * 5, 0, Math.PI * 2);
      ctx.fill();
      drawPixel(mx - 1, my - 1, '#ffffff', 3);
    }

    requestAnimationFrame(draw);
  }
  draw();
})();
