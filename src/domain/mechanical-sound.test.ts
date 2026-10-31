import { expect, test, vi } from 'vitest';
import { playMechanicalTick } from './mechanical-sound';

test('plays one short mechanical tick through an enabled audio context', () => {
  const oscillator={type:'sine',frequency:{setValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()},connect:vi.fn(),start:vi.fn(),stop:vi.fn()};
  const gain={gain:{setValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()},connect:vi.fn()};
  const context={currentTime:2,destination:{},createOscillator:()=>oscillator,createGain:()=>gain} as unknown as AudioContext;
  playMechanicalTick(context);
  expect(oscillator.start).toHaveBeenCalledOnce();
  expect(oscillator.stop).toHaveBeenCalledOnce();
  expect(gain.gain.exponentialRampToValueAtTime).toHaveBeenCalled();
});

test('does nothing when the browser has no enabled audio context', () => {
  expect(() => playMechanicalTick(null)).not.toThrow();
});
