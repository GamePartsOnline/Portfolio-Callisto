/**
 * Lecteur musique de fond — extrait de index.html pour permettre defer sur script.js (moins de JS bloquant).
 */
(function () {
  var audio = document.getElementById("bg-music");
  var btn = document.getElementById("music-play-btn");
  var hint = document.getElementById("music-player-hint");
  var seek = document.getElementById("music-seek");
  var vol = document.getElementById("music-volume");
  var tCur = document.getElementById("music-time-current");
  var tDur = document.getElementById("music-time-duration");
  if (!audio) return;

  function fmt(t) {
    if (!isFinite(t) || t < 0) return "0:00";
    var m = Math.floor(t / 60);
    var s = Math.floor(t % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function setSeekGradient(pct) {
    if (!seek) return;
    var p = Math.max(0, Math.min(100, pct));
    var st = window.getComputedStyle(seek);
    var fill = (st.getPropertyValue("--music-bar-fill") || "#00ffe0").trim();
    var track = (
      st.getPropertyValue("--music-bar-track") || "rgba(255,255,255,0.12)"
    ).trim();
    seek.style.background =
      "linear-gradient(90deg, " +
      fill +
      " 0%, " +
      fill +
      " " +
      p +
      "%, " +
      track +
      " " +
      p +
      "%, " +
      track +
      " 100%)";
  }

  function setVolGradient(v) {
    if (!vol) return;
    var pct = Math.max(0, Math.min(100, v * 100));
    vol.style.background =
      "linear-gradient(90deg, rgba(244,114,182,0.75) 0%, rgba(244,114,182,0.75) " +
      pct +
      "%, rgba(255,255,255,0.1) " +
      pct +
      "%, rgba(255,255,255,0.1) 100%)";
  }

  function seekFromAudio() {
    if (!seek || !audio.duration || !isFinite(audio.duration)) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    seek.value = String(pct);
    setSeekGradient(pct);
    if (tCur) tCur.textContent = fmt(audio.currentTime);
  }

  function showHint(msg, isErr) {
    if (!hint) return;
    hint.textContent = msg;
    hint.hidden = false;
    hint.classList.toggle("music-player-hint--error", !!isErr);
  }
  function clearHint() {
    if (!hint) return;
    hint.hidden = true;
    hint.textContent = "";
  }

  if (window.location.protocol === "file:") {
    showHint(
      "Open the site over HTTP (not file://), e.g. python3 -m http.server 8765",
      true,
    );
  }

  if (vol) {
    audio.volume = parseFloat(vol.value) || 0.45;
  } else {
    audio.volume = 0.45;
  }

  function syncBtn() {
    if (!btn) return;
    var playing = !audio.paused;
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
    var playIc = btn.querySelector(".music-btn-play");
    var pauseIc = btn.querySelector(".music-btn-pause");
    if (playIc) playIc.hidden = playing;
    if (pauseIc) pauseIc.hidden = !playing;
  }

  if (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      clearHint();
      if (audio.paused) {
        var p = audio.play();
        if (p && typeof p.then === "function") {
          p.then(syncBtn).catch(function (err) {
            showHint(
              "Playback failed: " +
                (err && err.message
                  ? err.message
                  : "try again or check the MP3 file"),
              true,
            );
          });
        } else {
          syncBtn();
        }
      } else {
        audio.pause();
        syncBtn();
      }
    });
  }

  audio.addEventListener("loadedmetadata", function () {
    if (seek) seek.disabled = false;
    if (tDur) tDur.textContent = fmt(audio.duration);
    seekFromAudio();
  });

  audio.addEventListener("timeupdate", seekFromAudio);

  if (seek) {
    seek.addEventListener("input", function () {
      if (!audio.duration || !isFinite(audio.duration)) return;
      var pct = parseFloat(seek.value);
      audio.currentTime = (pct / 100) * audio.duration;
      setSeekGradient(pct);
      if (tCur) tCur.textContent = fmt(audio.currentTime);
    });
  }

  if (vol) {
    vol.addEventListener("input", function () {
      audio.volume = parseFloat(vol.value) || 0;
      setVolGradient(audio.volume);
    });
    setVolGradient(audio.volume);
  }

  audio.addEventListener("play", syncBtn);
  audio.addEventListener("pause", syncBtn);
  audio.addEventListener("error", function () {
    var er = audio.error;
    var msg = "Audio file missing or unreadable.";
    if (er && er.code === 4) msg = "Format not supported by this browser.";
    showHint(msg, true);
    if (seek) seek.disabled = true;
  });

  audio.addEventListener("canplay", function () {
    if (hint && hint.classList.contains("music-player-hint--error")) return;
    clearHint();
  });

  setSeekGradient(0);
})();
