import { expect, test } from 'vitest';
import { getHistoricalState } from './history-state';

test('returns active polities and places for the selected year', () => {
  const state = getHistoricalState(-221);
  expect(state.year).toBe(-221);
  expect(state.activePolities.map((item) => item.id)).toContain('qin');
  expect(state.boundaries.find(b=>b.polityId==='qin')).toBeUndefined();
  expect(state.coverage.missingPolityIds).toContain('qin');
});

test('supports early and later Chinese history without inventing boundaries', () => {
  expect(getHistoricalState(-1500).activePolities.map(p => p.name)).toContain('商');
  expect(getHistoricalState(1100).activePolities.map(p => p.name)).toEqual(expect.arrayContaining(['北宋', '辽', '西夏']));
  expect(getHistoricalState(1500).activePolities.map(p => p.name)).toContain('明');
  expect(getHistoricalState(1900).activePolities.map(p => p.name)).toContain('清');
  expect(getHistoricalState(2026).activePolities.map(p => p.name)).toContain('中华人民共和国');
  expect(getHistoricalState(-8000).boundaries).toHaveLength(0);
  expect(getHistoricalState(1100).places.map(place => place.id)).toContain('kaifeng');
});

test('exposes the original interval rather than pretending annual precision', () => {
  const tang = getHistoricalState(799);
  expect(tang.boundaries.find(b => b.polityId === 'tang')).toMatchObject({sourceFrom:768,sourceTo:829,presentation:'interval'});
  expect(tang.coverage.snapshotYear).toBeUndefined();
  expect(getHistoricalState(800).boundaries.find(b=>b.polityId==='tang')?.temporalKind).toBe('interval');
  expect(getHistoricalState(960).boundaries.some(b => b.polityId === 'tang')).toBe(false);
});

test('does not leak a polity after its end year', () => {
  const state = getHistoricalState(221);
  expect(state.activePolities.map((item) => item.id)).not.toContain('qin');
});

test('handles the BCE/CE boundary without accepting year zero', () => {
  expect(() => getHistoricalState(0)).toThrow(RangeError);
  expect(getHistoricalState(1).displayLabel).toBe('公元1年');
});
