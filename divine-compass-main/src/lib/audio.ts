export type SoundMode = "bell" | "sohum" | "om";

class AudioEngine {
  private context: AudioContext | null = null;
  private isEnabled: boolean = true;
  private mode: SoundMode = "sohum";
  private vol: number = 0.75;
  private masterGain: GainNode | null = null;
  private activeOscs: Array<OscillatorNode | AudioBufferSourceNode> = [];

  // Om chant MP3 — routed through AudioContext for volume control
  private omEl: HTMLAudioElement | null = null;
  private omSource: MediaElementAudioSourceNode | null = null;
  private omGain: GainNode | null = null;

  public init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.setValueAtTime(this.vol, this.context.currentTime);
      this.masterGain.connect(this.context.destination);

      // Wire Om chant through the audio graph
      this.omEl = new Audio("/sounds/om-chant.mp3");
      this.omEl.loop = true;
      this.omEl.crossOrigin = "anonymous";
      this.omSource = this.context.createMediaElementSource(this.omEl);
      this.omGain  = this.context.createGain();
      this.omGain.gain.setValueAtTime(0, this.context.currentTime);
      this.omSource.connect(this.omGain);
      this.omGain.connect(this.masterGain);
    }
    if (this.context.state === "suspended") this.context.resume();
  }

  public setEnabled(enabled: boolean) { this.isEnabled = enabled; }
  public setMode(mode: SoundMode) { this.mode = mode; }
  public setVolume(v: number) {
    this.vol = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.context) {
      this.masterGain.gain.setValueAtTime(this.vol, this.context.currentTime);
    }
  }
  public getEnabled() { return this.isEnabled; }

  /** Stop synthesised oscillators only — Om MP3 handled separately */
  private stopSynth() {
    this.activeOscs.forEach(n => { try { n.stop(0); } catch {} });
    this.activeOscs = [];
  }

  /** Full stop: oscillators + fade-out and pause the Om MP3 */
  public stop() {
    this.stopSynth();
    if (this.omGain && this.context) {
      const t = this.context.currentTime;
      this.omGain.gain.cancelScheduledValues(t);
      this.omGain.gain.setValueAtTime(this.omGain.gain.value, t);
      this.omGain.gain.linearRampToValueAtTime(0, t + 0.18);
    }
    if (this.omEl) {
      setTimeout(() => { this.omEl!.pause(); this.omEl!.currentTime = 0; }, 220);
    }
  }

  private get out(): AudioNode {
    return this.masterGain ?? (this.context!.destination);
  }

  public playSound(action: "INHALE" | "EXHALE" | "HOLD" | "START", durationSecs = 4) {
    if (!this.isEnabled) return;
    this.init();
    if (!this.context) return;

    const act = action === "START" ? "INHALE" : action;

    // ── Om Chant mode: restart MP3 from beginning on every phase ─────────
    if (this.mode === "om") {
      this.stopOmAudio();   // cut current playback
      this.startOmAudio();  // restart from 0
      return;
    }

    // ── Other modes: stop everything cleanly between phases ───────────────
    this.stop();

    if (this.mode === "bell") { this.playBowl(); return; }
    if (this.mode === "sohum") {
      if (act === "INHALE") this.playSo(durationSecs);
      else if (act === "EXHALE") this.playHum(durationSecs);
      else this.playHoldHum(durationSecs);
    }
  }

  /** Cut Om MP3 immediately (for phase transitions) */
  private stopOmAudio() {
    if (!this.omEl || !this.omGain || !this.context) return;
    this.omGain.gain.cancelScheduledValues(this.context.currentTime);
    this.omGain.gain.setValueAtTime(0, this.context.currentTime);
    this.omEl.pause();
  }

  /** Restart Om MP3 from the very beginning with a quick fade-in */
  private startOmAudio() {
    if (!this.omEl || !this.omGain || !this.context) return;
    const t = this.context.currentTime;
    this.omEl.currentTime = 0;
    this.omEl.play().catch(() => {});
    this.omGain.gain.cancelScheduledValues(t);
    this.omGain.gain.setValueAtTime(0, t);
    this.omGain.gain.linearRampToValueAtTime(0.82, t + 0.25); // quick fade-in
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  /** Attach a slow sine vibrato to osc.frequency (starts after attack) */
  private vib(osc: OscillatorNode, startAt: number, stopAt: number, rate = 5.2, depth = 3) {
    const ctx = this.context!;
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(rate, startAt);
    lg.gain.setValueAtTime(0, startAt);
    lg.gain.linearRampToValueAtTime(depth, startAt + 0.6);
    lfo.connect(lg);
    lg.connect(osc.frequency);
    lfo.start(startAt);
    lfo.stop(stopAt + 0.05);
    this.activeOscs.push(lfo);
  }

  /** Build a sawtooth formant voice at the given fundamental */
  private voiceLayer(
    fund: number,
    detuneCents: number,
    formantFreqs: [number, number],   // [F1, F2]
    formantQ: number,
    startAt: number,
    stopAt: number
  ): GainNode {
    const ctx = this.context!;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(fund * Math.pow(2, detuneCents / 1200), startAt);
    this.vib(osc, startAt + 0.45, stopAt, 5.0 + detuneCents * 0.01, 2.8);

    const f1 = ctx.createBiquadFilter();
    f1.type = "bandpass";
    f1.frequency.setValueAtTime(formantFreqs[0], startAt);
    f1.Q.setValueAtTime(formantQ, startAt);

    const f2 = ctx.createBiquadFilter();
    f2.type = "bandpass";
    f2.frequency.setValueAtTime(formantFreqs[1], startAt);
    f2.Q.setValueAtTime(formantQ * 0.8, startAt);

    const mix = ctx.createGain();
    mix.gain.setValueAtTime(0.5, startAt);

    osc.connect(f1); f1.connect(mix);
    osc.connect(f2); f2.connect(mix);

    osc.start(startAt);
    osc.stop(stopAt + 0.05);
    this.activeOscs.push(osc);
    return mix;
  }

  // ── Crystal Singing Bowl ─────────────────────────────────────────────────
  private playBowl() {
    const ctx = this.context!;
    const t = ctx.currentTime;
    // Inharmonic partials — actual bowl ratios: 1 : 2.76 : 5.40
    const base = 432;
    const partials: [number, number, number][] = [
      [base,            0.40, 7.0],
      [base * 2.76,     0.22, 5.5],
      [base * 5.40,     0.10, 4.0],
      [base * 1.50,     0.08, 4.5], // quint shimmer
    ];
    partials.forEach(([f, v, decay]) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type  = "sine";
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 0.9992, t + decay);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      osc.connect(g); g.connect(this.out);
      osc.start(t); osc.stop(t + decay + 0.1);
      this.activeOscs.push(osc);
    });
  }

  // ── "So" — Inhale (S consonant + "oh" vowel, rising) ────────────────────
  private playSo(dur: number) {
    const ctx = this.context!;
    const t   = ctx.currentTime;
    const d   = Math.max(dur, 2.0);

    // "S" — brief crisp sibilant
    const nb = this.noiseBuffer(0.22);
    if (nb) {
      const ns = ctx.createBufferSource();
      ns.buffer = nb;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.setValueAtTime(4800, t);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0, t);
      ng.gain.linearRampToValueAtTime(0.09, t + 0.02);
      ng.gain.linearRampToValueAtTime(0, t + 0.20);
      ns.connect(hp); hp.connect(ng); ng.connect(this.out);
      ns.start(t); ns.stop(t + 0.24);
      this.activeOscs.push(ns);
    }

    // "oh" vowel — F0 = 264 Hz (C4, 432 tuning), slight upward drift
    // F1 ≈ 500 Hz, F2 ≈ 900 Hz  (rounded back vowel)
    const fund = 264;
    const ts   = t + 0.08; // vowel starts after sibilant

    // F0 rises slightly on inhale
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = osc2.type = "sawtooth";
    osc1.frequency.setValueAtTime(fund,         ts);
    osc1.frequency.linearRampToValueAtTime(fund * 1.016, ts + d * 0.75);
    osc2.frequency.setValueAtTime(fund * 1.005, ts);
    osc2.frequency.linearRampToValueAtTime(fund * 1.021, ts + d * 0.75);

    const f1 = ctx.createBiquadFilter();
    f1.type  = "bandpass";
    f1.frequency.setValueAtTime(700, ts);
    f1.frequency.linearRampToValueAtTime(500, ts + d * 0.5); // "o" vowel
    f1.Q.setValueAtTime(5, ts);

    const f2 = ctx.createBiquadFilter();
    f2.type  = "bandpass";
    f2.frequency.setValueAtTime(1100, ts);
    f2.frequency.linearRampToValueAtTime(900, ts + d * 0.5);
    f2.Q.setValueAtTime(4, ts);

    const gF1 = ctx.createGain(); gF1.gain.setValueAtTime(0.24, ts);
    const gF2 = ctx.createGain(); gF2.gain.setValueAtTime(0.12, ts);
    const env  = ctx.createGain();
    env.gain.setValueAtTime(0, ts);
    env.gain.linearRampToValueAtTime(1, ts + 0.38);
    env.gain.setValueAtTime(1, ts + d - 0.5);
    env.gain.linearRampToValueAtTime(0, ts + d);

    [osc1, osc2].forEach(o => {
      o.connect(f1); o.connect(f2);
      o.start(ts); o.stop(ts + d + 0.05);
      this.activeOscs.push(o);
    });
    this.vib(osc1, ts + 0.5, ts + d, 5.1, 2.5);
    this.vib(osc2, ts + 0.5, ts + d, 5.4, 2.5);

    f1.connect(gF1); gF1.connect(env);
    f2.connect(gF2); gF2.connect(env);
    env.connect(this.out);
  }

  // ── "Hum" — Exhale (voiced nasal, descending) ───────────────────────────
  private playHum(dur: number) {
    const ctx = this.context!;
    const t   = ctx.currentTime;
    const d   = Math.max(dur, 2.0);

    // F0 = 220 Hz (A3, warm), gentle downward drift on exhale
    const fund = 220;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = osc2.type = "sawtooth";
    osc1.frequency.setValueAtTime(fund,         t);
    osc1.frequency.linearRampToValueAtTime(fund * 0.986, t + d * 0.82);
    osc2.frequency.setValueAtTime(fund * 1.004, t);
    osc2.frequency.linearRampToValueAtTime(fund * 0.990, t + d * 0.82);

    // "u/m" vowel → nasal: F1 drops from 400→250, F2 rises slightly
    const f1 = ctx.createBiquadFilter();
    f1.type  = "bandpass";
    f1.frequency.setValueAtTime(480, t);
    f1.frequency.linearRampToValueAtTime(260, t + d * 0.55);
    f1.Q.setValueAtTime(5.5, t);

    const f2 = ctx.createBiquadFilter();
    f2.type  = "bandpass";
    f2.frequency.setValueAtTime(800, t);
    f2.frequency.linearRampToValueAtTime(1050, t + d * 0.6);
    f2.Q.setValueAtTime(3.5, t);

    const gF1 = ctx.createGain(); gF1.gain.setValueAtTime(0.28, t);
    const gF2 = ctx.createGain(); gF2.gain.setValueAtTime(0.10, t);
    const env  = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(1, t + 0.28);
    env.gain.setValueAtTime(1, t + d - 0.55);
    env.gain.linearRampToValueAtTime(0, t + d);

    [osc1, osc2].forEach(o => {
      o.connect(f1); o.connect(f2);
      o.start(t); o.stop(t + d + 0.05);
      this.activeOscs.push(o);
    });
    this.vib(osc1, t + 0.32, t + d, 4.8, 2.2);
    this.vib(osc2, t + 0.32, t + d, 5.1, 2.2);

    f1.connect(gF1); gF1.connect(env);
    f2.connect(gF2); gF2.connect(env);
    env.connect(this.out);
  }

  // ── Hold — very soft 741 Hz tone (mental clarity) ────────────────────────
  private playHoldHum(dur: number) {
    const ctx = this.context!;
    const t   = ctx.currentTime;
    const d   = Math.max(dur, 1.0);
    const osc = ctx.createOscillator();
    osc.type  = "sine";
    osc.frequency.setValueAtTime(741, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.04, t + 0.3);
    g.gain.setValueAtTime(0.04, t + d - 0.4);
    g.gain.linearRampToValueAtTime(0, t + d);
    osc.connect(g); g.connect(this.out);
    osc.start(t); osc.stop(t + d + 0.05);
    this.activeOscs.push(osc);
  }

  // ── Om — AUM sweep A→U→M on deep drone (216 Hz) ─────────────────────────
  private playOm(dur: number) {
    const ctx  = this.context!;
    const t    = ctx.currentTime;
    const d    = Math.max(dur, 2.5);
    const fund = 216; // Low A (432 Hz tuning, one octave below 432)

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = osc2.type = "sawtooth";
    osc1.frequency.setValueAtTime(fund,         t);
    osc2.frequency.setValueAtTime(fund * 1.004, t);

    // AUM formant sweep
    // A (aah): F1=750, F2=1100
    // U (ooh): F1=300, F2=800
    // M (mmm): F1=250, F2=1000  (nasal close)
    const f1 = ctx.createBiquadFilter();
    f1.type  = "bandpass";
    f1.frequency.setValueAtTime(750, t);
    f1.frequency.linearRampToValueAtTime(450, t + d * 0.28);
    f1.frequency.linearRampToValueAtTime(290, t + d * 0.58);
    f1.frequency.linearRampToValueAtTime(255, t + d * 0.80);
    f1.Q.setValueAtTime(5.5, t);

    const f2 = ctx.createBiquadFilter();
    f2.type  = "bandpass";
    f2.frequency.setValueAtTime(1100, t);
    f2.frequency.linearRampToValueAtTime(800,  t + d * 0.30);
    f2.frequency.linearRampToValueAtTime(600,  t + d * 0.60);
    f2.frequency.linearRampToValueAtTime(1000, t + d * 0.82);
    f2.Q.setValueAtTime(4.0, t);

    const gF1 = ctx.createGain(); gF1.gain.setValueAtTime(0.26, t);
    const gF2 = ctx.createGain(); gF2.gain.setValueAtTime(0.11, t);
    const env  = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(1, t + 0.42);
    env.gain.setValueAtTime(1, t + d - 0.55);
    env.gain.linearRampToValueAtTime(0, t + d);

    [osc1, osc2].forEach(o => {
      o.connect(f1); o.connect(f2);
      o.start(t); o.stop(t + d + 0.05);
      this.activeOscs.push(o);
    });
    this.vib(osc1, t + 0.55, t + d, 4.7, 2.2);
    this.vib(osc2, t + 0.55, t + d, 5.0, 2.2);

    f1.connect(gF1); gF1.connect(env);
    f2.connect(gF2); gF2.connect(env);
    env.connect(this.out);
  }

  private noiseBuffer(secs: number) {
    if (!this.context) return null;
    const len = Math.floor(this.context.sampleRate * secs);
    const buf = this.context.createBuffer(1, len, this.context.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.35;
    return buf;
  }
}

export const meditationAudio = new AudioEngine();
