// Web Audio API breathing sound system
// All sounds are synthesized — no external files required.

export type SoundType = "off" | "bell" | "bowl" | "chime" | "breath";

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return _ctx;
}

/** Call once after a user gesture to unlock audio on iOS/Chrome. */
export function initAudio(): void {
  const ctx = getCtx();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {/* ok */});
  }
}

// ── Low-level tone player ────────────────────────────────────────────────────
function playTone(
  frequency:  number,
  duration:   number,
  type:       OscillatorType = "sine",
  volume:     number        = 0.3,
  fadeIn:     number        = 0.08,
  fadeOut:    number        = 0.4,
): void {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = frequency;
    osc.type            = type;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + fadeIn);
    gain.gain.setValueAtTime(volume, now + Math.max(duration - fadeOut, fadeIn));
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  } catch {
    /* ignore audio errors */
  }
}

// Soft bell-like tone using a short decay
function playBell(frequency: number, volume: number): void {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type            = "sine";
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc.start(now);
    osc.stop(now + 1.3);
  } catch {
    /* ignore */
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Play a soft sound cue at the start of a breathing phase.
 * Called after user presses Start, safe to call on every phase change.
 */
export function playPhaseSound(
  action:    string,
  soundType: SoundType,
  volume:    number, // 0–1
): void {
  if (soundType === "off" || volume <= 0) return;

  const v = volume * 0.5; // overall volume scaling

  if (action === "INHALE" || action === "INHALE_L" || action === "INHALE_R") {
    // Rising gentle tone
    playTone(220, 0.5, "sine", v * 0.8, 0.05, 0.35);
  } else if (action === "EXHALE" || action === "EXHALE_L" || action === "EXHALE_R") {
    // Falling gentle tone
    playTone(176, 0.5, "sine", v * 0.7, 0.05, 0.35);
  } else if (action === "HOLD") {
    // Soft bell ping
    playBell(528, v * 0.5);
  } else {
    // REST — very subtle
    playTone(256, 0.3, "sine", v * 0.35, 0.06, 0.25);
  }
}

/** Play a two-tone chime when a full round completes. */
export function playRoundComplete(soundType: SoundType, volume: number): void {
  if (soundType === "off" || volume <= 0) return;
  const v = volume * 0.45;
  // Slight delay so it doesn't clash with next-phase sound
  setTimeout(() => {
    playBell(523, v);
    setTimeout(() => playBell(659, v * 0.8), 180);
  }, 80);
}

/** Play a three-tone rising chime when the full session completes. */
export function playSessionComplete(soundType: SoundType, volume: number): void {
  if (soundType === "off" || volume <= 0) return;
  const v = volume * 0.5;
  setTimeout(() => {
    playBell(523, v);
    setTimeout(() => playBell(659, v * 0.9), 220);
    setTimeout(() => playBell(784, v * 0.8), 480);
  }, 80);
}
