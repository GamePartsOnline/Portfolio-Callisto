/**
 * Lecteur musique de fond — portage vanilla JS de MusicPlayer.astro.
 */
(function () {
  var STORAGE_VOL_KEY = "callisto_music_vol";

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ":" + (secs < 10 ? "0" : "") + secs;
  }

  function initMusicPlayers() {
    document.querySelectorAll("[data-music-player]").forEach(function (root) {
      if (root.dataset.mpBound === "true") return;
      root.dataset.mpBound = "true";

      var audio = root.querySelector("[data-mp-audio]");
      var playBtn = root.querySelector("[data-mp-play]");
      var seekInput = root.querySelector("[data-mp-seek]");
      var volInput = root.querySelector("[data-mp-vol]");
      var muteBtn = root.querySelector("[data-mp-mute]");
      var curEl = root.querySelector("[data-mp-current]");
      var durEl = root.querySelector("[data-mp-duration]");
      var hintEl = root.querySelector("[data-mp-hint]");

      if (!audio || !playBtn || !seekInput || !volInput || !muteBtn) return;

      var iconPlay = playBtn.querySelector(".mp-icon-play");
      var iconPause = playBtn.querySelector(".mp-icon-pause");
      var iconVol = muteBtn.querySelector(".mp-icon-vol");
      var iconMuted = muteBtn.querySelector(".mp-icon-muted");

      var lastNonZeroVol = Number.parseFloat(volInput.value);
      if (!Number.isFinite(lastNonZeroVol) || lastNonZeroVol <= 0) {
        lastNonZeroVol = 0.45;
      }

      function showHint(msg) {
        if (!hintEl) return;
        hintEl.textContent = msg;
        hintEl.hidden = false;
      }

      function clearHint() {
        if (!hintEl) return;
        hintEl.hidden = true;
        hintEl.textContent = "";
      }

      function syncVolumeUI(vol) {
        var clamped = Math.min(1, Math.max(0, vol));
        var pct = Math.round(clamped * 100);
        audio.volume = clamped;
        audio.muted = clamped === 0;
        volInput.value = String(clamped);
        volInput.setAttribute("aria-valuetext", pct + "%");
        root.style.setProperty("--mp-vol-pct", pct + "%");

        var isMuted = clamped === 0;
        muteBtn.setAttribute("aria-pressed", String(isMuted));
        var muteLabel = isMuted
          ? root.dataset.labelUnmute || "Unmute"
          : root.dataset.labelMute || "Mute";
        muteBtn.setAttribute("aria-label", muteLabel);
        muteBtn.title = muteLabel;
        if (iconVol) iconVol.toggleAttribute("hidden", isMuted);
        if (iconMuted) iconMuted.toggleAttribute("hidden", !isMuted);
      }

      function syncPlayUI() {
        var playing = !audio.paused;
        playBtn.setAttribute("aria-pressed", String(playing));
        playBtn.setAttribute(
          "aria-label",
          playing
            ? root.dataset.labelPause || "Pause"
            : root.dataset.labelPlay || "Play",
        );
        if (iconPlay) iconPlay.toggleAttribute("hidden", playing);
        if (iconPause) iconPause.toggleAttribute("hidden", !playing);
      }

      function syncProgressUI() {
        var dur = audio.duration;
        if (!Number.isFinite(dur) || dur <= 0) return;
        var pct = Math.min(100, Math.max(0, (audio.currentTime / dur) * 100));
        seekInput.value = String(pct);
        root.style.setProperty("--mp-seek-pct", pct + "%");
        var curText = formatTime(audio.currentTime);
        var durText = formatTime(dur);
        if (curEl) curEl.textContent = curText;
        if (durEl) durEl.textContent = durText;
        seekInput.setAttribute("aria-valuetext", curText + " / " + durText);
      }

      try {
        var saved = localStorage.getItem(STORAGE_VOL_KEY);
        if (saved !== null) {
          var parsed = Number.parseFloat(saved);
          if (Number.isFinite(parsed)) {
            if (parsed > 0) lastNonZeroVol = parsed;
            syncVolumeUI(parsed);
          }
        } else {
          syncVolumeUI(Number.parseFloat(volInput.value));
        }
      } catch (_e) {
        syncVolumeUI(Number.parseFloat(volInput.value));
      }

      playBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        clearHint();
        if (audio.paused) {
          var p = audio.play();
          if (p && typeof p.then === "function") {
            p.then(syncPlayUI).catch(function () {
              showHint(root.dataset.errPlay || "Playback failed.");
            });
          } else {
            syncPlayUI();
          }
        } else {
          audio.pause();
          syncPlayUI();
        }
      });

      seekInput.addEventListener("input", function () {
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
        var pct = Number.parseFloat(seekInput.value);
        audio.currentTime = (pct / 100) * audio.duration;
        syncProgressUI();
      });

      volInput.addEventListener("input", function () {
        var v = Number.parseFloat(volInput.value);
        if (Number.isFinite(v)) {
          if (v > 0) lastNonZeroVol = v;
          syncVolumeUI(v);
          try {
            localStorage.setItem(STORAGE_VOL_KEY, String(v));
          } catch (_e) {
            /* ignore storage errors */
          }
        }
      });

      muteBtn.addEventListener("click", function () {
        var nextVol = audio.volume === 0 || audio.muted ? lastNonZeroVol : 0;
        syncVolumeUI(nextVol);
        try {
          localStorage.setItem(STORAGE_VOL_KEY, String(nextVol));
        } catch (_e) {
          /* ignore storage errors */
        }
      });

      audio.addEventListener("loadedmetadata", function () {
        seekInput.disabled = false;
        syncProgressUI();
      });
      audio.addEventListener("timeupdate", syncProgressUI);
      audio.addEventListener("play", syncPlayUI);
      audio.addEventListener("pause", syncPlayUI);
      audio.addEventListener("canplay", clearHint);
      audio.addEventListener("error", function () {
        seekInput.disabled = true;
        showHint(
          audio.error && audio.error.code === 4
            ? root.dataset.errFormat || "Unsupported audio format."
            : root.dataset.errMissing || "Audio file missing.",
        );
      });

      if (audio.readyState >= 1) {
        seekInput.disabled = false;
        syncProgressUI();
      }
    });
  }

  initMusicPlayers();
})();
