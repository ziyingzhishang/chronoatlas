export function playMechanicalTick(context: AudioContext | null): void {
  if (!context) return;
  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime;
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(880, start);
    oscillator.frequency.exponentialRampToValueAtTime(510, start + .035);
    gain.gain.setValueAtTime(.035, start);
    gain.gain.exponentialRampToValueAtTime(.0001, start + .055);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + .06);
  } catch {
    // Audio is an optional enhancement; a failed or unavailable context never blocks navigation.
  }
}
