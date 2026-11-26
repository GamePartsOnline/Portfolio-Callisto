const STORAGE_VOL_KEY = "callisto_music_vol";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function initMusicPlayers(): void {
  document.querySelectorAll<HTMLElement>("[data-music-player]").forEach((root) => {
    if (root.dataset.mpBound === "true") return;
    root.dataset.mpBound = "true";

    const audio = root.querySelector<HTMLAudioElement>("[data-mp-audio]");
    const playBtn = root.querySelector<HTMLButtonElement>("[data-mp-play]");
    const seekInput = root.querySelector<HTMLInputElement>("[data-mp-seek]");
    const volInput = root.querySelector<HTMLInputElement>("[data-mp-vol]");
    const muteBtn = root.querySelector<HTMLButtonElement>("[data-mp-mute]");
    const curEl = root.querySelector<HTMLElement>("[data-mp-current]");
    const durEl = root.querySelector<HTMLElement>("[data-mp-duration]");
    const hintEl = root.querySelector<HTMLElement>("[data-mp-hint]");

    if (!audio || !playBtn || !seekInput || !volInput || !muteBtn) return;

    const iconPlay = playBtn.querySelector<HTMLElement>(".mp-icon-play");
    const iconPause = playBtn.querySelector<HTMLElement>(".mp-icon-pause");
    const iconVol = muteBtn.querySelector<HTMLElement>(".mp-icon-vol");
    const iconMuted = muteBtn.querySelector<HTMLElement>(".mp-icon-muted");

    let lastNonZeroVol = Number.parseFloat(volInput.value);
    if (!Number.isFinite(lastNonZeroVol) || lastNonZeroVol <= 0) {
      lastNonZeroVol = 0.45;
    }

    const showHint = (msg: string) => {
      if (!hintEl) return;
      hintEl.textContent = msg;
      hintEl.hidden = false;
    };

    const clearHint = () => {
      if (!hintEl) return;
      hintEl.hidden = true;
      hintEl.textContent = "";
    };

    const syncVolumeUI = (vol: number) => {
      const clamped = Math.min(1, Math.max(0, vol));
      const pct = Math.round(clamped * 100);
      audio.volume = clamped;
      audio.muted = clamped === 0;
      volInput.value = String(clamped);
      volInput.setAttribute("aria-valuetext", `${pct}%`);
      root.style.setProperty("--mp-vol-pct", `${pct}%`);

      const isMuted = clamped === 0;
      muteBtn.setAttribute("aria-pressed", String(isMuted));
      const muteLabel = isMuted
        ? root.dataset.labelUnmute || "Unmute"
        : root.dataset.labelMute || "Mute";
      muteBtn.setAttribute("aria-label", muteLabel);
      muteBtn.title = muteLabel;
      if (iconVol) iconVol.toggleAttribute("hidden", isMuted);
      if (iconMuted) iconMuted.toggleAttribute("hidden", !isMuted);
    };

    const syncPlayUI = () => {
      const playing = !audio.paused;
      playBtn.setAttribute("aria-pressed", String(playing));
      playBtn.setAttribute(
        "aria-label",
        playing
          ? root.dataset.labelPause || "Pause"
          : root.dataset.labelPlay || "Play",
      );
      if (iconPlay) iconPlay.toggleAttribute("hidden", playing);
      if (iconPause) iconPause.toggleAttribute("hidden", !playing);
    };

    const syncProgressUI = () => {
      const dur = audio.duration;
      if (!Number.isFinite(dur) || dur <= 0) return;
      const pct = Math.min(100, Math.max(0, (audio.currentTime / dur) * 100));
      seekInput.value = String(pct);
      root.style.setProperty("--mp-seek-pct", `${pct}%`);
      const curText = formatTime(audio.currentTime);
      const durText = formatTime(dur);
      if (curEl) curEl.textContent = curText;
      if (durEl) durEl.textContent = durText;
      seekInput.setAttribute("aria-valuetext", `${curText} / ${durText}`);
    };

    try {
      const saved = localStorage.getItem(STORAGE_VOL_KEY);
      if (saved !== null) {
        const parsed = Number.parseFloat(saved);
        if (Number.isFinite(parsed)) {
          if (parsed > 0) lastNonZeroVol = parsed;
          syncVolumeUI(parsed);
        }
      } else {
        syncVolumeUI(Number.parseFloat(volInput.value));
      }
    } catch {
      syncVolumeUI(Number.parseFloat(volInput.value));
    }

    playBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      clearHint();
      if (audio.paused) {
        try {
          await audio.play();
          syncPlayUI();
        } catch {
          showHint(root.dataset.errPlay || "Playback failed.");
        }
      } else {
        audio.pause();
        syncPlayUI();
      }
    });

    seekInput.addEventListener("input", () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const pct = Number.parseFloat(seekInput.value);
      audio.currentTime = (pct / 100) * audio.duration;
      syncProgressUI();
    });

    volInput.addEventListener("input", () => {
      const v = Number.parseFloat(volInput.value);
      if (Number.isFinite(v)) {
        if (v > 0) lastNonZeroVol = v;
        syncVolumeUI(v);
        try {
          localStorage.setItem(STORAGE_VOL_KEY, String(v));
        } catch {
          /* ignore */
        }
      }
    });

    muteBtn.addEventListener("click", () => {
      const nextVol = audio.volume === 0 || audio.muted ? lastNonZeroVol : 0;
      syncVolumeUI(nextVol);
      try {
        localStorage.setItem(STORAGE_VOL_KEY, String(nextVol));
      } catch {
        /* ignore */
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      seekInput.disabled = false;
      syncProgressUI();
    });
    audio.addEventListener("timeupdate", syncProgressUI);
    audio.addEventListener("play", syncPlayUI);
    audio.addEventListener("pause", syncPlayUI);
    audio.addEventListener("canplay", clearHint);
    audio.addEventListener("error", () => {
      seekInput.disabled = true;
      showHint(
        audio.error?.code === 4
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
