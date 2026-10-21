import { expect, test } from 'vitest';
import { sovereigntyNoticesFor } from './sovereignty';

test('activates the PRC Taiwan sovereignty notice from 1949', () => {
  expect(sovereigntyNoticesFor(1948, 'prc')).toEqual([]);
  expect(sovereigntyNoticesFor(1949, 'prc')).toMatchObject([{id:'taiwan-china', effectiveFrom:1949}]);
  expect(sovereigntyNoticesFor(2026, 'prc')).toHaveLength(1);
});

test('does not attach the modern sovereignty notice to historical polities', () => {
  expect(sovereigntyNoticesFor(800, 'tang')).toEqual([]);
  expect(sovereigntyNoticesFor(1949, 'republic')).toEqual([]);
});

test('cites both the legal statement and modern thematic-map rule', () => {
  const notice = sovereigntyNoticesFor(1949, 'prc')[0];
  expect(notice.citations.map(citation => citation.title)).toEqual([
    '《反分裂国家法》第二条',
    '《公开地图内容表示规范》',
  ]);
});
