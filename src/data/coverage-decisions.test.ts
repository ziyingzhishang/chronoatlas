import { expect, test } from 'vitest';
import audit from '../../public/data/coverage-audit.json';
import { boundaryCatalog } from './boundaries';
import { coverageDecisions, decisionKey, gapKey } from './coverage-decisions';
import { getHistoricalState } from '../domain/history-state';
import frozenShortGapBatch from './frozen-short-gaps.json';
import frozenMediumGapBatch from './frozen-medium-gaps.json';

test('every audited coverage gap has exactly one explicit decision', () => {
  const gapKeys = audit.flatMap(polity => polity.missingRanges.map(([from, to]) =>
    gapKey(polity.id, from, to)));
  const decisionKeys = coverageDecisions.map(decisionKey);

  expect(new Set(decisionKeys).size).toBe(decisionKeys.length);
  expect(decisionKeys.sort()).toEqual(gapKeys.sort());
});

test('every maximum reference names one source record from the same polity', () => {
  for (const decision of coverageDecisions.filter(item => item.verdict === 'maximum-record')) {
    expect(decision.sourceBoundaryIds).toHaveLength(1);
    const source = boundaryCatalog.find(boundary => boundary.id === decision.sourceBoundaryIds[0]);
    expect(source?.polityId).toBe(decision.polityId);
    expect(decision.rationale.length).toBeGreaterThan(20);
  }
});

test('a reviewed Qin unification gap stays visibly unfilled', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-qin--221--219');
  expect(decision).toMatchObject({verdict: 'leave-unfilled', reviewStatus: 'reviewed', sourceBoundaryIds: []});
  expect(getHistoricalState(-221).boundaries.some(boundary => boundary.polityId === 'qin')).toBe(false);
});

test('all frozen short gaps have an individually reviewed non-automatic verdict', () => {
  expect(frozenShortGapBatch.count).toBe(65);
  const rationaleSet = new Set<string>();
  for (const gap of frozenShortGapBatch.rows) {
    const decision = coverageDecisions.find(item => decisionKey(item) ===
      gapKey(gap.polityId, gap.from, gap.to));
    expect(decision, gap.id).toBeDefined();
    expect(decision?.reviewStatus, gap.id).toBe('reviewed');
    expect(decision?.reviewedAt, gap.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(decision?.rationale.length, gap.id).toBeGreaterThan(30);
    expect(decision?.historicalTransitionCheck.length, gap.id).toBeGreaterThan(20);
    expect(decision?.citationIds.length, gap.id).toBeGreaterThan(0);
    rationaleSet.add(decision?.rationale ?? '');
  }
  expect(rationaleSet.size).toBe(frozenShortGapBatch.count);
});

test('the current continuation is the only reviewed short-gap geometry bridge', () => {
  const bridged = frozenShortGapBatch.rows.map(gap => coverageDecisions.find(item =>
    decisionKey(item) === gapKey(gap.polityId, gap.from, gap.to)))
    .filter(decision => decision?.verdict === 'nearest-same-polity');
  expect(bridged).toEqual([expect.objectContaining({
    id: 'gap-prc-2025-2026', sourceBoundaryIds: ['clio-13616-prc-2024'],
  })]);
});

test('all frozen medium gaps are reviewed without nearest-year bridging', () => {
  expect(frozenMediumGapBatch.count).toBe(18);
  for (const gap of frozenMediumGapBatch.rows) {
    const decision = coverageDecisions.find(item => decisionKey(item) ===
      gapKey(gap.polityId, gap.from, gap.to));
    expect(decision?.reviewStatus, gap.id).toBe('reviewed');
    expect(decision?.verdict, gap.id).not.toBe('nearest-same-polity');
    expect(decision?.historicalTransitionCheck.length, gap.id).toBeGreaterThan(30);
    expect(decision?.citationIds.length, gap.id).toBeGreaterThan(0);
  }
});

test('the Silla long-gap review records every year as explicitly unfilled', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-silla--57-377');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
    reviewedAt: '2026-10-21',
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'silla-encykorea', 'silla-samguksagi-db', 'silla-periodization',
  ]));
  expect(decision?.rationale).toContain('逐年');
});

test('the Turkic long-gap review records every year and publication restrictions', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-turkic-661-744');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
    reviewedAt: '2026-10-21',
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'turkic-history-db', 'turkic-orkhon-heritage', 'turkic-orkhon-collection',
  ]));
  expect(decision?.rationale).toContain('research-only');
});

test('the Western Zhou long-gap review separates direct control from feudal influence', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-zhou_western--1046--1001');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
    reviewedAt: '2026-10-21',
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'western-zhou-national-museum', 'western-zhou-epic', 'map-regulation',
  ]));
  expect(decision?.rationale).toContain('research-only');
});

test('the Yuan long-gap review separates nominal extent from direct control', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-yuan-1271-1293');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
    reviewedAt: '2026-10-21',
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'yuan-nationalities-history', 'yuan-li-bingzhong', 'yuan-goryeo-records', 'map-regulation',
  ]));
  expect(decision?.rationale).toContain('research-only');
});

test('the Northern Yuan long-gap review separates Mongol factions from direct control', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-northern_yuan-1440-1467');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
    reviewedAt: '2026-10-21',
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'northern-yuan-early-ming', 'northern-yuan-yesen', 'map-regulation',
  ]));
  expect(decision?.rationale).toContain('research-only');
});

test('the Southern Tang long-gap review separates nominal submission from direct control', () => {
  const decision = coverageDecisions.find(item => item.id === 'gap-southern_tang-937-959');
  expect(decision).toMatchObject({
    verdict: 'leave-unfilled',
    reviewStatus: 'reviewed',
    sourceBoundaryIds: [],
    reviewedAt: '2026-10-21',
  });
  expect(decision?.citationIds).toEqual(expect.arrayContaining([
    'southern-tang-nanjing', 'southern-tang-periods', 'southern-tang-local-administration', 'map-regulation',
  ]));
  expect(decision?.rationale).toContain('research-only');
});
