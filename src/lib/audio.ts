/**
 * Tactile Audio Engine (Web Audio API)
 * Synthesizes short analog mechanical clicks without external audio files.
 * Protected with lazy singleton, user gesture resume and debouncing.
 */

let audioCtx: AudioContext | null = null;
let lastClickTime = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Play a short subtle mechanical click (switch toggle / relay)
 */
export function playMechanicalClick(frequency: number = 220, duration: number = 0.02) {
  const now = performance.now();
  if (now - lastClickTime < 40) return; // Debounce 40ms
  lastClickTime = now;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Silent fallback
  }
}

/**
 * Trigger subtle haptic vibration on mobile devices
 */
export function triggerHaptic(durationMs: number = 10) {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      navigator.vibrate(durationMs);
    } catch {
      // Ignore vibration errors
    }
  }
}
