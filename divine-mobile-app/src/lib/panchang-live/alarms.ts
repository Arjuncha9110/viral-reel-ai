export interface AlarmConfig {
  id: string;
  name: string;
  sanskritName: string;
  type: "sandhya" | "muhurta" | "inauspicious";
  enabled: boolean;
  offsetMinutes: number; // 0, 5, 10, 15
  description: string;
}

export const defaultAlarms: AlarmConfig[] = [
  {
    id: "pratah_sandhya",
    name: "Pratah Sandhya",
    sanskritName: "प्रातः संध्या",
    type: "sandhya",
    enabled: false,
    offsetMinutes: 5,
    description: "Sunrise junction window (dawn)."
  },
  {
    id: "madhyahna_sandhya",
    name: "Madhyahna Sandhya",
    sanskritName: "मध्याह्न संध्या",
    type: "sandhya",
    enabled: false,
    offsetMinutes: 5,
    description: "Solar noon junction window."
  },
  {
    id: "sayam_sandhya",
    name: "Sayam Sandhya",
    sanskritName: "सायं संध्या",
    type: "sandhya",
    enabled: false,
    offsetMinutes: 5,
    description: "Sunset junction window (twilight)."
  },
  {
    id: "brahma_muhurta",
    name: "Brahma Muhurta",
    sanskritName: "ब्रह्म मुहूर्त",
    type: "muhurta",
    enabled: false,
    offsetMinutes: 5,
    description: "Pre-dawn highly spiritual window."
  },
  {
    id: "abhijit_muhurta",
    name: "Abhijit Muhurta",
    sanskritName: "अभिजित मुहूर्त",
    type: "muhurta",
    enabled: false,
    offsetMinutes: 5,
    description: "Auspicious solar zenith window."
  },
  {
    id: "rahu_kaal",
    name: "Rahu Kaal Warning",
    sanskritName: "राहुकाल",
    type: "inauspicious",
    enabled: false,
    offsetMinutes: 10,
    description: "Alert before Rahu's inauspicious time band."
  }
];

const ALARMS_STORAGE_KEY = "divine_panchang_alarms";
const AUDIO_ENABLED_KEY = "divine_panchang_audio_enabled";

/**
 * Loads alarm settings from localStorage
 */
export const loadAlarmsFromStorage = (): AlarmConfig[] => {
  try {
    const saved = localStorage.getItem(ALARMS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Merge with default list in case new fields were added
        return defaultAlarms.map(def => {
          const found = parsed.find(p => p && p.id === def.id);
          return found ? { ...def, enabled: !!found.enabled, offsetMinutes: Number(found.offsetMinutes || 5) } : def;
        });
      }
    }
  } catch (error) {
    console.error("Failed to load alarms:", error);
  }
  return defaultAlarms;
};

/**
 * Saves alarm configurations to localStorage
 */
export const saveAlarmsToStorage = (alarms: AlarmConfig[]): void => {
  try {
    localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
  } catch (error) {
    console.error("Failed to save alarms:", error);
  }
};

/**
 * Loads master audio alert status
 */
export const loadAudioEnabled = (): boolean => {
  try {
    const saved = localStorage.getItem(AUDIO_ENABLED_KEY);
    return saved === "true"; // Defaults to false (OFF)
  } catch {
    return false;
  }
};

/**
 * Saves master audio alert status
 */
export const saveAudioEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(AUDIO_ENABLED_KEY, String(enabled));
  } catch (error) {
    console.error("Failed to save audio config:", error);
  }
};

/**
 * Synthesizes a premium, layered Tibetan singing bowl chime with organic vibrato LFO.
 * Employs fundamental 136.1 Hz (OM frequency) and rich high-frequency harmonics.
 * This runs fully offline via browser Web Audio API, requiring zero network assets.
 */
export const playTibetanBowlChime = (): void => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Master Gain control
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    // Smooth fade-in to prevent digital popping
    masterGain.gain.linearRampToValueAtTime(0.25, now + 0.08);
    // Smooth exponential decay over 5 seconds mimicking a rich metal resonance
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.0);
    masterGain.connect(ctx.destination);

    // Cosmic OM fundamental frequency (136.1 Hz)
    const fundFreq = 136.1;

    // Harmonically rich ratio structures modeling a traditional copper singing bowl
    const harmonics = [
      { ratio: 1.0, volume: 1.0, LFO: 5.5 },
      { ratio: 2.76, volume: 0.45, LFO: 6.2 },
      { ratio: 3.41, volume: 0.35, LFO: 4.8 },
      { ratio: 5.23, volume: 0.2, LFO: 7.1 },
      { ratio: 6.89, volume: 0.12, LFO: 5.9 }
    ];

    harmonics.forEach((h) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(fundFreq * h.ratio, now);

      // Low Frequency Oscillator (LFO) for warm, acoustic pulse vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = h.LFO;
      lfoGain.gain.value = 0.6 * h.ratio; // modulation strength proportional to ratio

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      lfo.start(now);
      lfo.stop(now + 5.0);

      gainNode.gain.setValueAtTime(h.volume, now);
      // Higher partials decay faster
      const harmonicDecay = 5.0 / Math.sqrt(h.ratio);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + harmonicDecay);

      osc.connect(gainNode);
      gainNode.connect(masterGain);

      osc.start(now);
      osc.stop(now + 5.0);
    });
  } catch (error) {
    console.warn("AudioContext failed or was blocked by browser policies:", error);
  }
};
