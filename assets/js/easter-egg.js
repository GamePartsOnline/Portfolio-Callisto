/**
 * Easter egg Demoscene — declenche en tapant "callisto" ou "demo" au clavier.
 */
(function () {
  var TRIGGERS = ["callisto", "demo"];
  var MAX_LEN = 8;
  var buffer = "";
  var activeOverlay = null;
  var styleInjected = false;

  function injectStyles() {
    if (styleInjected) return;
    styleInjected = true;
    var css = [
      ".demo-ee-overlay{position:fixed;inset:0;z-index:2147483647;background:#05060b;color:#e6fffb;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;font-family:'Share Tech Mono',ui-monospace,monospace;animation:demoEeFadeIn .35s ease}",
      "@keyframes demoEeFadeIn{from{opacity:0}to{opacity:1}}",
      ".demo-ee-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}",
      ".demo-ee-scanlines{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(to bottom,rgba(255,255,255,0) 0,rgba(255,255,255,0) 2px,rgba(0,0,0,.28) 3px)}",
      ".demo-ee-topbar{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid rgba(0,255,224,.28);background:linear-gradient(180deg,rgba(5,8,16,.9),rgba(5,8,16,.35))}",
      ".demo-ee-badge{font-size:.75rem;letter-spacing:.18em;text-transform:uppercase;color:#00ffe0}",
      ".demo-ee-close{appearance:none;background:rgba(0,255,224,.1);border:1px solid rgba(0,255,224,.45);color:#00ffe0;border-radius:8px;padding:.4rem .75rem;font:inherit;font-size:.78rem;cursor:pointer;letter-spacing:.1em}",
      ".demo-ee-close:hover,.demo-ee-close:focus-visible{background:rgba(0,255,224,.24);outline:2px solid #00ffe0;outline-offset:2px}",
      ".demo-ee-center{position:relative;z-index:2;margin:auto;text-align:center;padding:1.5rem;max-width:720px;background:rgba(5,8,16,.68);border:1px solid rgba(0,255,224,.32);border-radius:14px;box-shadow:0 0 40px rgba(0,255,224,.14)}",
      ".demo-ee-title{margin:0 0 .5rem;font-family:'Cinzel',serif;font-size:clamp(1.4rem,3.6vw,2.4rem);letter-spacing:.16em;color:#00ffe0;text-transform:uppercase}",
      ".demo-ee-sub{margin:0 0 .9rem;font-size:.85rem;letter-spacing:.12em;color:#f472b6;text-transform:uppercase}",
      ".demo-ee-msg{margin:0;font-size:.92rem;line-height:1.65;color:rgba(235,255,252,.9)}",
      ".demo-ee-copper{height:4px;width:100%;background:linear-gradient(90deg,#00ffe0,#38bdf8,#f472b6,#ff9d3a,#00ffe0);background-size:200% 100%;animation:demoEeCopper 3s linear infinite}",
      "@keyframes demoEeCopper{0%{background-position:0% 50%}100%{background-position:200% 50%}}",
      ".demo-ee-scroller-wrap{position:relative;z-index:2;border-top:1px solid rgba(0,255,224,.28);background:rgba(5,8,16,.9);padding:.75rem 0;overflow:hidden;white-space:nowrap}",
      ".demo-ee-scroller{display:inline-block;padding-left:100%;font-size:1rem;letter-spacing:.14em;color:#00ffe0;animation:demoEeScroll 22s linear infinite}",
      "@keyframes demoEeScroll{0%{transform:translateX(0)}100%{transform:translateX(-100%)}}",
      "@media(prefers-reduced-motion:reduce){.demo-ee-scroller{animation:none;padding-left:1rem;white-space:normal}.demo-ee-copper{animation:none}}"
    ].join("");
    var style = document.createElement("style");
    style.id = "demo-ee-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function openDemosceneOverlay() {
    if (activeOverlay) return;
    injectStyles();

    var overlay = document.createElement("div");
    overlay.className = "demo-ee-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Callisto Demoscene Mode");

    overlay.innerHTML =
      '<canvas class="demo-ee-canvas" aria-hidden="true"></canvas>' +
      '<div class="demo-ee-scanlines" aria-hidden="true"></div>' +
      '<div class="demo-ee-topbar">' +
      '  <span class="demo-ee-badge">CALLISTO.EXE // 68000 TRIBUTE // 60FPS</span>' +
      '  <button type="button" class="demo-ee-close" aria-label="Fermer">[ESC] QUITTER</button>' +
      "</div>" +
      '<div class="demo-ee-center">' +
      '  <h2 class="demo-ee-title">CALLISTO ARTS</h2>' +
      '  <p class="demo-ee-sub">FLUSH ^ VITAL-MOTION! ^ GPO ^ SYN[RJ]</p>' +
      '  <p class="demo-ee-msg">Bienvenue dans les coulisses demoscene. Des pixels Atari/Amiga aux rendus numériques actuels : <em>&laquo; My fun is DRAWING. ALWAYS. And forever. &raquo;</em></p>' +
      "</div>" +
      '<div>' +
      '  <div class="demo-ee-copper" aria-hidden="true"></div>' +
      '  <div class="demo-ee-scroller-wrap">' +
      '    <span class="demo-ee-scroller">*** GREETINGS TO ALL SCENERS &amp; CREATORS *** CALLISTO / FLUSH ^ VITAL-MOTION! *** 66+ PRODUCTIONS ON DEMOZOO *** KEEP DRAWING, KEEP CODING, KEEP CREATING ***</span>' +
      "  </div>" +
      "</div>";

    document.body.appendChild(overlay);
    activeOverlay = overlay;

    var canvas = overlay.querySelector(".demo-ee-canvas");
    var closeBtn = overlay.querySelector(".demo-ee-close");
    var ctx = canvas.getContext("2d");
    var rafId = 0;
    var stars = [];
    var STAR_COUNT = 160;
    var reducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function initStars() {
      stars = [];
      for (var i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: (Math.random() - 0.5) * 1600,
          y: (Math.random() - 0.5) * 1600,
          z: Math.random() * 1000 + 1,
          c: i % 5 === 0 ? "#f472b6" : i % 3 === 0 ? "#00ffe0" : "#ffffff",
        });
      }
    }

    function renderFrame() {
      var w = canvas.width;
      var h = canvas.height;
      var cx = w / 2;
      var cy = h / 2;
      ctx.fillStyle = "rgba(5, 6, 11, 0.38)";
      ctx.fillRect(0, 0, w, h);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        if (!reducedMotion) {
          s.z -= 6;
          if (s.z <= 1) {
            s.x = (Math.random() - 0.5) * 1600;
            s.y = (Math.random() - 0.5) * 1600;
            s.z = 1000;
          }
        }
        var k = 320 / s.z;
        var px = s.x * k + cx;
        var py = s.y * k + cy;
        if (px >= 0 && px < w && py >= 0 && py < h) {
          var size = Math.max(1, (1 - s.z / 1000) * 3.4);
          ctx.fillStyle = s.c;
          ctx.fillRect(px, py, size, size);
        }
      }
      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    }

    function close() {
      if (!activeOverlay) return;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("keydown", onEsc);
      overlay.remove();
      activeOverlay = null;
    }

    function onEsc(e) {
      if (e.key === "Escape") close();
    }

    resize();
    initStars();
    renderFrame();
    window.addEventListener("resize", resize);
    document.addEventListener("keydown", onEsc);
    closeBtn.addEventListener("click", close);
    closeBtn.focus();
  }

  document.addEventListener("keydown", function (e) {
    if (activeOverlay) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (
      t &&
      (t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        t.isContentEditable)
    ) {
      return;
    }
    if (!e.key || e.key.length !== 1) return;
    var ch = e.key.toLowerCase();
    if (ch < "a" || ch > "z") return;

    buffer = (buffer + ch).slice(-MAX_LEN);
    for (var i = 0; i < TRIGGERS.length; i++) {
      if (buffer.endsWith(TRIGGERS[i])) {
        buffer = "";
        openDemosceneOverlay();
        break;
      }
    }
  });
})();
