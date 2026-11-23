/**
 * Bencho-inspired subtle synthesized Web Audio interface micro-sounds.
 * Zero external audio assets required; gracefully no-ops when muted or in SSR/tests.
 */

export type UiSoundKind = 'click' | 'switch' | 'pop' | 'success' | 'subtle';

export interface UiSoundSpec {
  frequencies: number[];
  durationMs: number;
  gain: number;
  type: OscillatorType;
}

export const UI_SOUND_STORAGE_KEY = 'tc_ui_sound_enabled';

export const UI_SOUND_SPECS: Record<UiSoundKind, UiSoundSpec> = {
  click: {
    frequencies: [520, 680],
    durationMs: 42,
    gain: 0.032,
    type: 'sine',
  },
  switch: {
    frequencies: [440, 587],
    durationMs: 55,
    gain: 0.03,
    type: 'triangle',
  },
  pop: {
    frequencies: [380, 640],
    durationMs: 65,
    gain: 0.035,
    type: 'sine',
  },
  success: {
    frequencies: [523.25, 659.25, 783.99],
    durationMs: 120,
    gain: 0.038,
    type: 'sine',
  },
  subtle: {
    frequencies: [600],
    durationMs: 28,
    gain: 0.018,
    type: 'sine',
  },
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

let cachedEnabled: boolean | null = null;
let sharedAudioContext: AudioContext | null = null;
const listeners = new Set<(enabled: boolean) => void>();

function resolveStorage(override?: StorageLike | null): StorageLike | null {
  if (override !== undefined) return override;
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return window.localStorage;
  }
  return null;
}

export function isUiSoundEnabled(storage?: StorageLike | null): boolean {
  if (storage !== undefined) {
    try {
      const raw = storage?.getItem(UI_SOUND_STORAGE_KEY);
      return raw === null || raw === undefined ? true : raw === 'true';
    } catch {
      return true;
    }
  }
  if (cachedEnabled !== null) return cachedEnabled;
  const store = resolveStorage();
  try {
    const raw = store?.getItem(UI_SOUND_STORAGE_KEY);
    cachedEnabled = raw === null || raw === undefined ? true : raw === 'true';
  } catch {
    cachedEnabled = true;
  }
  return cachedEnabled;
}

export function setUiSoundEnabled(enabled: boolean, storage?: StorageLike | null): boolean {
  if (storage === undefined) {
    cachedEnabled = enabled;
  }
  const store = resolveStorage(storage);
  try {
    store?.setItem(UI_SOUND_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore storage quota or private browsing errors
  }
  if (storage === undefined) {
    listeners.forEach((fn) => fn(enabled));
  }
  return enabled;
}

export function toggleUiSoundEnabled(storage?: StorageLike | null): boolean {
  const next = !isUiSoundEnabled(storage);
  return setUiSoundEnabled(next, storage);
}

export function subscribeUiSoundPreference(listener: (enabled: boolean) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getUiSoundSpec(kind: UiSoundKind): UiSoundSpec {
  return UI_SOUND_SPECS[kind];
}

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioContext) {
    sharedAudioContext = new AudioCtx();
  }
  if (sharedAudioContext.state === 'suspended') {
    void sharedAudioContext.resume().catch(() => {
      // Autoplay policies may keep context suspended until gesture
    });
  }
  return sharedAudioContext;
}

/**
 * Play a crisp, low-volume tactile UI micro-sound via Web Audio API.
 * Returns true if scheduled, false if muted or unavailable.
 */
export function playUiSound(kind: UiSoundKind = 'click'): boolean {
  if (!isUiSoundEnabled()) return false;
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }
  const ctx = getOrCreateAudioContext();
  if (!ctx) return false;

  try {
    const spec = UI_SOUND_SPECS[kind];
    const now = ctx.currentTime;
    const stepSec = spec.durationMs / 1000 / Math.max(1, spec.frequencies.length);

    spec.frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startAt = now + idx * (stepSec * 0.72);
      const endAt = startAt + Math.max(0.032, stepSec * 1.15);

      osc.type = spec.type;
      osc.frequency.setValueAtTime(freq, startAt);
      if (spec.frequencies.length === 1) {
        osc.frequency.exponentialRampToValueAtTime(freq * 1.12, endAt);
      }

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(spec.gain, startAt + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(endAt + 0.01);
    });
    return true;
  } catch {
    return false;
  }
}
