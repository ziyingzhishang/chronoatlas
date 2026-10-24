import { expect, test } from 'vitest';
import world900 from '../../public/data/world/900.json';
import { getHistoricalState } from '../domain/history-state';
import { getTimelineYears } from '../domain/timeline';
import { sourceById } from './sources';
import { boundaryCatalog } from './boundaries';
import { polities } from './polities';
import { validateBoundaryEvidence } from '../domain/boundary-evidence';

test('a cross-transition Jin alias cannot return as a second world polity after Later Tang begins',()=>{
  expect(world900.records.some(b=>b.sourceName==='Former Jin')).toBe(false);
});

test('every supported year resolves without an exception', () => {
  for (const year of getTimelineYears()) {
    expect(() => getHistoricalState(year)).not.toThrow();
  }
});

test('every active polity and boundary refers to a known source', () => {
  for (const year of getTimelineYears()) {
    const state = getHistoricalState(year);
    for (const item of [...state.activePolities, ...state.boundaries]) {
      expect(item.sourceIds.length).toBeGreaterThan(0);
      for (const id of item.sourceIds) expect(sourceById[id]).toBeDefined();
    }
    for (const polity of state.activePolities) {
      expect(state.boundaries.some(b => b.polityId === polity.id) || state.coverage.missingPolityIds.includes(polity.id)).toBe(true);
    }
    for (const boundary of state.boundaries) {
      expect(state.activePolities.some(p => p.id === boundary.polityId)).toBe(true);
      expect(boundary.snapshotYear).toBe(boundary.validFrom);
      if (!boundary.temporalKind) expect(boundary.validTo).toBe(boundary.validFrom);
      if (boundary.presentation!=='maximum') {
        expect(boundary.validFrom).toBeLessThanOrEqual(year);
        expect(boundary.validTo).toBeGreaterThanOrEqual(year);
      } else expect(boundary.areaKm2).toBeGreaterThan(0);
    }
  }
});

test('territorial records use valid WGS84 geometry appropriate to their evidence level', () => {
  for (const b of boundaryCatalog) {
    const polity = polities.find(p => p.id === b.polityId)!;
    expect(b.snapshotYear).toBeGreaterThanOrEqual(polity.startYear);
    expect(b.snapshotYear).toBeLessThanOrEqual(polity.endYear);
    if (b.evidence.evidenceLevel === 'D' && (b.geometry.type === 'Point' || b.geometry.type === 'MultiPoint')) {
      const coordinates = b.geometry.type === 'Point' ? [b.geometry.coordinates] : b.geometry.coordinates;
      expect(coordinates).toHaveLength(b.vertexCount);
      for (const [lon, lat] of coordinates) {
        expect(Math.abs(lon)).toBeLessThanOrEqual(180);
        expect(Math.abs(lat)).toBeLessThanOrEqual(90);
      }
      continue;
    }
    expect(['Polygon', 'MultiPolygon']).toContain(b.geometry.type);
    const geometry = b.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    let count = 0;
    for (const polygon of polygons) for (const ring of polygon) {
      expect(ring[0]).toEqual(ring.at(-1));
      expect(ring.length).toBeGreaterThanOrEqual(4);
      for (const [lon, lat] of ring) {
        expect(Math.abs(lon)).toBeLessThanOrEqual(180);
        expect(Math.abs(lat)).toBeLessThanOrEqual(90);
        count++;
      }
    }
    expect(count).toBe(b.vertexCount);
  }
}, 30000);

test('every imported boundary carries valid, cited evidence metadata', () => {
  for (const boundary of boundaryCatalog) {
    expect(boundary.evidence).toBeDefined();
    expect(validateBoundaryEvidence(boundary)).toEqual([]);
  }
});

test('representative years expose the core historical transitions', () => {
  expect(getHistoricalState(-403).activePolities.map((item) => item.name)).toContain('韩');
  expect(getHistoricalState(220).activePolities.map((item) => item.name)).toContain('魏');
  expect(getHistoricalState(589).activePolities.map((item) => item.name)).toContain('隋');
  expect(getHistoricalState(907).activePolities.map((item) => item.name)).toContain('后梁');
});
