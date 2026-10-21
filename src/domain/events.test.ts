import { expect, test } from 'vitest';
import type { HistoricalEvent } from './types';
import * as api from './events';

const items: HistoricalEvent[] = [
  { id: 'range', year: 755, endYear: 763, title: '安史之乱', summary: '唐代战争', sourceIds: [], region: 'china', category: '战争／条约', background: '节度使掌兵', process: '攻入洛阳', impact: '中央权力减弱', mapNote: '不自动改变疆域' },
  { id: 'same-year', year: 755, title: '另一事件', summary: '文化', sourceIds: [], region: 'world', category: '制度／经济文化转折' },
  { id: 'ancient', year: -2, endYear: 2, title: '跨公元区间', summary: 'Augustus', sourceIds: [] },
];

test.each([
  [754, []], [755, ['range', 'same-year']], [760, ['range']], [763, ['range']], [764, []],
  [-2, ['ancient']], [-1, ['ancient']], [1, ['ancient']], [2, ['ancient']], [0, []],
])('eventsAtYear uses inclusive boundaries and no year zero: %s', (year, ids) => {
  expect(api.eventsAtYear?.(items, year)?.map((event: HistoricalEvent) => event.id)).toEqual(ids);
});

test.each([
  [755, 755], [760, 760], [763, 763], [754, 755], [764, 755],
])('eventYear retains a selected year inside a period: %s', (current, expected) => {
  expect(api.eventYear?.(items[0], current)).toBe(expected);
});

test('eventYear does not preserve nonexistent year zero for a cross-era event', () => {
  expect(api.eventYear?.(items[2], 0)).toBe(-2);
  expect(api.eventYear?.(items[2], 1)).toBe(1);
  expect(api.eventYear?.(items[1], 760)).toBe(755);
});

test.each(['安史', '唐代', '节度使', '洛阳', '中央权力', '疆域', '战争／条约'])('queryEvents searches user-facing content: %s', query => {
  expect(api.queryEvents?.(items, { query })?.map((event: HistoricalEvent) => event.id)).toEqual(['range']);
});

test('queryEvents combines region and category with text, trims whitespace and ignores letter case', () => {
  expect(api.queryEvents?.(items, { region: 'china', category: '战争／条约', query: '  洛阳  ' })?.map((event: HistoricalEvent) => event.id)).toEqual(['range']);
  expect(api.queryEvents?.(items, { region: 'world', query: '安史' })).toEqual([]);
  expect(api.queryEvents?.(items, { category: 'missing' })).toEqual([]);
  expect(api.queryEvents?.(items, { query: ' aUgUsTuS ' })?.map((event: HistoricalEvent) => event.id)).toEqual(['ancient']);
});

test('queryEvents accepts legacy records and empty filters without changing input order', () => {
  const original = [...items];
  expect(api.queryEvents?.(items, {})).toEqual(original);
  expect(api.queryEvents?.(items, { query: '   ', region: '', category: '' })).toEqual(original);
  expect(api.queryEvents?.([], {})).toEqual([]);
  expect(items).toEqual(original);
});
