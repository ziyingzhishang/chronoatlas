import { expect, test } from 'vitest';
import { clampPosition, layoutFor, presentationForPane, readPreference } from './layout';

test('short windows use compact controls even when landscape is wide', () => {
  expect(layoutFor(844, 390)).toEqual({ mobile: false, short: true });
  expect(layoutFor(390, 844)).toEqual({ mobile: true, short: false });
  expect(layoutFor(1440, 900)).toEqual({ mobile: false, short: false });
});
test('classifies the actual map pane across supported screen shapes', () => {
  expect(presentationForPane(900, 800)).toBe('wide');
  expect(presentationForPane(560, 800)).toBe('narrow');
  expect(presentationForPane(390, 844)).toBe('mobile');
  expect(presentationForPane(844, 390)).toBe('short');
});
test('floating controls stay inside the viewport and leave the attribution strip free', () => {
  expect(clampPosition({ x: 900, y: -50 }, { width: 800, height: 600 }, { width: 400, height: 200 })).toEqual({ x: 388, y: 64 });
  expect(clampPosition({ x: 900, y: 900 }, { width: 800, height: 600 }, { width: 400, height: 200 })).toEqual({ x: 388, y: 336 });
});
test('malformed or non-finite preferences recover to usable defaults', () => {
  expect(readPreference('{bad')).toEqual({ mode: 'docked', position: { x: 24, y: 80 } });
  expect(readPreference('{"mode":"floating","position":{"x":null,"y":5}}').mode).toBe('docked');
  expect(readPreference('{"mode":"floating","position":{"x":50,"y":80}}').position).toEqual({x:50,y:80});
});
