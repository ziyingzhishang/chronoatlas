import { expect, test } from 'vitest';
import { getHistoricalState } from '../domain/history-state';
import { isDefiniteBoundary } from '../domain/boundary-evidence';
import audit from '../../internal/audits/coverage-audit.json';

test('Xia is represented by a D cultural-core point, not a national border', () => {
  const state = getHistoricalState(-1800);
  const xia = state.boundaries.find(boundary => boundary.polityId === 'xia_early');

  expect(xia).toMatchObject({
    geometry: {type:'Point'},
    evidence: {evidenceLevel:'D', derivation:'cultural-core'},
  });
  expect(state.boundaries.filter(isDefiniteBoundary)).toHaveLength(0);
});

test('coverage audit distinguishes visual D records from definite boundaries', () => {
  for (const polityId of ['xia_early', 'gengshi']) {
    expect(audit.find(item => item.id === polityId)).toMatchObject({
      visualRecords: expect.any(Number),
      definiteBoundaryRecords: 0,
      nonBoundaryRepresentations: expect.arrayContaining([expect.any(String)]),
    });
    expect(audit.find(item => item.id === polityId)!.visualRecords).toBeGreaterThan(0);
  }
});

test('Gengshi uses dated control centers without a closed polygon', () => {
  const year23 = getHistoricalState(23).boundaries.find(boundary => boundary.polityId === 'gengshi');
  const year24 = getHistoricalState(24).boundaries.find(boundary => boundary.polityId === 'gengshi');

  expect(year23).toMatchObject({geometry:{type:'MultiPoint'}, evidence:{evidenceLevel:'D', derivation:'control-centers'}});
  expect(year24).toMatchObject({geometry:{type:'MultiPoint'}, evidence:{evidenceLevel:'D', derivation:'control-centers'}});
  expect((year23?.geometry as GeoJSON.MultiPoint).coordinates).not.toEqual((year24?.geometry as GeoJSON.MultiPoint).coordinates);
  expect([year23, year24].filter((boundary): boundary is NonNullable<typeof boundary> => !!boundary).every(boundary => !isDefiniteBoundary(boundary))).toBe(true);
});
