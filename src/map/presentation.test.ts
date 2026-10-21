import { expect, test } from 'vitest';
import { boundaryStatusLabel, evidenceStyle, satelliteColor } from './presentation';
import { getHistoricalState } from '../domain/history-state';

test('satellite colors preserve hue while lifting dark and muted territory colors', () => {
  expect(satelliteColor('#804020')).toBe('hsl(20, 75%, 58%)');
  expect(satelliteColor('#c79b4d')).toMatch(/^hsl\(/);
  expect(satelliteColor('invalid')).toBe('#a99572');
});

test.each(['relief', 'satellite'] as const)('%s keeps all evidence levels visually distinct', basemap => {
  const styles = (['A', 'B', 'C', 'D'] as const).map(level => evidenceStyle(level, basemap));
  expect(new Set(styles.map(style => JSON.stringify(style))).size).toBe(4);
  expect(styles[2].lineDasharray).toEqual([4, 3]);
  expect(styles[3].renderKind).not.toBe('territory');
});

test('labels a curated maximum by evidence rather than as a direct source', () => {
  const base = getHistoricalState(937).boundaries[0];
  const southernTang = {...base, polityId:'southern_tang', presentation:'maximum' as const, evidence:{...base.evidence, evidenceLevel:'C' as const, derivation:'maximum-record' as const}};
  expect(boundaryStatusLabel(southernTang)).toBe('使用最大参考');
});
