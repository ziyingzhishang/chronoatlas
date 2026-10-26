import { expect, test } from 'vitest';
import type { Polity } from '../domain/types';
import { formatPresentDistance, primaryPolityName, yearsFromPresent } from './map-status';

test.each([
  [800, 2026, { relation: 'past', years: 1226 }],
  [-221, 2026, { relation: 'past', years: 2246 }],
  [2026, 2026, { relation: 'present', years: 0 }],
  [2027, 2026, { relation: 'future', years: 1 }],
] as const)('calculates historical year %s relative to %s without a year zero', (year, present, expected) => {
  expect(yearsFromPresent(year, present)).toEqual(expected);
});

test('formats reader-facing distance labels in Chinese and English', () => {
  expect(formatPresentDistance({ relation: 'past', years: 1226 }, 'zh-CN')).toBe('距今1226年');
  expect(formatPresentDistance({ relation: 'past', years: 1226 }, 'en')).toBe('1,226 years ago');
  expect(formatPresentDistance({ relation: 'present', years: 0 }, 'zh-CN')).toBe('今年');
  expect(formatPresentDistance({ relation: 'future', years: 1 }, 'zh-CN')).toBe('距今尚有1年');
});

test('selects the first Chinese polity and never substitutes a world polity id', () => {
  const base = {
    type: 'regime', startYear: 618, endYear: 907, color: '#000', description: '', sourceIds: [],
  } satisfies Omit<Polity, 'id' | 'name'>;
  const polities: Polity[] = [
    { ...base, id: 'world-test', name: 'Rome', region: 'world' },
    { ...base, id: 'tang', name: '唐' },
  ];

  expect(primaryPolityName(polities)).toBe('唐');
  expect(primaryPolityName([{ ...base, id: 'world-test', name: 'Rome', region: 'world' }])).toBeUndefined();
});

test('rejects nonexistent year zero instead of silently changing its meaning', () => {
  expect(() => yearsFromPresent(0, 2026)).toThrow(/zero|0年/i);
});
