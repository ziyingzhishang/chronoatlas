import { expect, test } from 'vitest';
import { clampPanelHeight, clampPosition, layoutFor, readPreference } from './layout';

test('short windows use compact controls even when landscape is wide', () => {
  expect(layoutFor(844, 390)).toEqual({ mobile: false, short: true });
  expect(layoutFor(390, 844)).toEqual({ mobile: true, short: false });
  expect(layoutFor(1440, 900)).toEqual({ mobile: false, short: false });
});
test('floating controls stay inside the viewport and leave the attribution strip free', () => {
  expect(clampPosition({ x: 900, y: -50 }, { width: 800, height: 600 }, { width: 400, height: 200 })).toEqual({ x: 388, y: 64 });
  expect(clampPosition({ x: 900, y: 900 }, { width: 800, height: 600 }, { width: 400, height: 200 })).toEqual({ x: 388, y: 340 });
});
test('floating controls can be positioned 60px above the containing pane bottom', () => {
  expect(clampPosition({ x: 24, y: 1000 }, { width: 1004, height: 932 }, { width: 760, height: 220 }).y).toBe(652);
});
test('malformed or non-finite preferences recover to usable defaults', () => {
  expect(readPreference('{bad')).toEqual({ mode: 'docked', position: { x: 24, y: 80 } });
  expect(readPreference('{"mode":"floating","position":{"x":null,"y":5}}').mode).toBe('docked');
  expect(readPreference('{"mode":"floating","position":{"x":50,"y":80}}').position).toEqual({x:50,y:80});
});
test('panel height is capped by natural content and by thirty percent of a small viewport', () => {
  expect(clampPanelHeight(900, 720, 900, false)).toBe(720);
  expect(clampPanelHeight(900, 720, 800, true)).toBe(240);
});
test('panel height can continuously reach the single-row control bar', () => {
  expect(clampPanelHeight(51, 720, 900, false)).toBe(51);
});
