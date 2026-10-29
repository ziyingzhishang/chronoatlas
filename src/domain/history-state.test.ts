import { expect, test } from 'vitest';
import { getHistoricalState } from './history-state';
import type { BoundaryState, CapitalTerm, HistoricalEvent, Place, Polity } from './types';

test('uses the injected release data rather than compile-time catalogs', () => {
  const polity = { id: 'release-a', name: '版本 A', type: 'dynasty', startYear: 1, endYear: 10, color: '#000', description: '', sourceIds: [] } satisfies Polity;
  const boundary = {
    id: 'boundary-a', polityId: polity.id, validFrom: 1, validTo: 10, snapshotYear: 1,
    sourceName: 'fixture', sourceUrl: 'https://example.test', vertexCount: 1,
    geometry: { type: 'Point', coordinates: [100, 30] }, controlType: 'direct', confidence: 'high', sourceIds: [],
    temporalKind: 'interval', evidence: { evidenceLevel: 'A', derivation: 'direct-source', reviewStatus: 'source-checked', citations: [], uncertaintyNote: '' },
  } satisfies BoundaryState;
  const source = {
    polities: [polity], boundaries: [boundary], places: [] as Place[], events: [] as HistoricalEvent[], capitalTerms: [] as CapitalTerm[],
    modernSovereignty: [],
  };

  const state = getHistoricalState(source, 5);
  const alternate = getHistoricalState({
    ...source,
    polities: [{ ...polity, id: 'release-b', name: '版本 B' }],
    boundaries: [{ ...boundary, id: 'boundary-b', polityId: 'release-b' }],
  }, 5);

  expect(state.activePolities.map((item) => item.id)).toEqual(['release-a']);
  expect(state.boundaries.map((item) => item.id)).toEqual(['boundary-a']);
  expect(alternate.activePolities.map((item) => item.id)).toEqual(['release-b']);
  expect(alternate.boundaries.map((item) => item.id)).toEqual(['boundary-b']);
});

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
