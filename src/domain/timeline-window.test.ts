import { expect, test } from 'vitest';
import { makeTicks, fitWindow, yearToIndex } from './timeline';

test('places BCE and CE ticks on the same no-year-zero scale', () => {
  const ticks = makeTicks([-5, 5], 10);
  expect(ticks.map(t => t.year)).not.toContain(0);
  expect(ticks.find(t => t.year === -1)?.position).toBeCloseTo(4 / 9 * 100);
  expect(ticks.find(t => t.year === 1)?.position).toBeCloseTo(5 / 9 * 100);
});

test('clamps the zoom window at both edges without losing its span', () => {
  expect(fitWindow(yearToIndex(-8000), 10)).toEqual([-8000, -7990]);
  expect(fitWindow(yearToIndex(2026), 10)).toEqual([2016, 2026]);
});
