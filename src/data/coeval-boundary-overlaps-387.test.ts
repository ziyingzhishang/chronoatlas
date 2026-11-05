import { expect, test } from 'vitest';
import { boundaryCatalog } from './boundaries';
import { boundaryGeometryConflicts } from './boundary-conflicts';
import { getHistoricalState } from '../domain/history-state';
import { buildLocalMapData } from '../map/history-map';
import overlapAudit from '../../docs/audits/topics/coeval-boundary-overlaps-387.json';
import annualOverlapAudit from '../../docs/audits/topics/coeval-boundary-overlaps-387-393.json';

test('387 source outlines remain available because the corrected screen finds no interior overlap', () => {
  const state = getHistoricalState(387);
  const map = buildLocalMapData(state);

  expect(overlapAudit.year).toBe(387);
  expect(overlapAudit.overlapPairs).toEqual([]);
  expect(overlapAudit.heldBoundaryIds).toEqual([]);
  for (const id of [
    'clio-1542-western_qin-387', 'clio-1543-wei_northern-387', 'clio-1546-former_qin-387',
    'clio-1549-goguryeo-387', 'clio-1550-jin_eastern-387', 'clio-1551-tuyuhun-387',
    'clio-1552-later_liang-387', 'clio-1553-later_yan-387', 'clio-1555-later_qin-387',
  ]) {
    const source = boundaryCatalog.find(boundary => boundary.id === id);
    expect(source, `${id} remains intact in the source catalog`).toBeDefined();
    expect(state.boundaries.find(boundary => boundary.id === id)?.geometry).toEqual(source?.geometry);
    expect(map.boundaries.features.some(feature => feature.id === id), `${id} remains in map data in 387`).toBe(true);
  }

  expect(state.boundaries.some(boundary => boundary.id === 'clio-1529-silla-378')).toBe(true);
  expect(map.capitalPlaces.features).toContainEqual(expect.objectContaining({
    geometry: expect.objectContaining({ type: 'Point' }),
    properties: expect.objectContaining({ polityId: 'later_qin', placeId: 'changan' }),
  }));

  expect(getHistoricalState(388).boundaries.some(boundary => boundary.id === 'clio-1529-silla-378')).toBe(true);
});

test('holds every detected coeval overlap across 387–393 without changing source geometry', () => {
  expect(annualOverlapAudit.years.map(row => row.year)).toEqual([387, 388, 389, 390, 391, 392, 393]);
  expect(annualOverlapAudit.years.map(row => row.overlapPairs.length)).toEqual([0, 0, 0, 0, 0, 1, 1]);

  for (const row of annualOverlapAudit.years) {
    const state = getHistoricalState(row.year);
    const map = buildLocalMapData(state);
    for (const pair of row.overlapPairs) {
      pair.boundaryIds.forEach((boundaryId, index) => {
        const source = boundaryCatalog.find(boundary => boundary.id === boundaryId);
        expect(source, `${boundaryId} source geometry remains available`).toBeDefined();
        expect(source!.geometry).toBeDefined();
        expect(boundaryGeometryConflicts.some(conflict => conflict.boundaryId === boundaryId
          && conflict.status === 'requires-review' && conflict.years.includes(row.year)
          && conflict.polityIds.includes(pair.polityIds[1 - index])),
        `${boundaryId} is held against ${pair.polityIds[1 - index]} in ${row.year}`).toBe(true);
        expect(state.boundaries.some(boundary => boundary.id === boundaryId),
          `${boundaryId} is not in runtime for ${row.year}`).toBe(false);
        expect(map.boundaries.features.some(feature => feature.id === boundaryId),
          `${boundaryId} is not in map data for ${row.year}`).toBe(false);
      });
    }
  }
});
