import { expect, test } from 'vitest';
import { getHistoricalState } from '../domain/history-state';
import { buildLocalMapData } from '../map/history-map';
import annualAudit from '../../docs/audits/topics/three-kingdoms-formation-220-223.json';
import { boundaryCatalog } from './boundaries';
import { events } from './events';
import { eventDetails } from './event-details';

test('holds the Eastern Han interval outline only during the 220 abdication year', () => {
  const source = boundaryCatalog.find(boundary => boundary.id === 'clio-1325-han_eastern-215');
  const auditRow = annualAudit.years.find(item => item.polityId === 'wei_three' && item.year === 220);
  const before = getHistoricalState(219);
  const transition = getHistoricalState(220);

  expect(auditRow?.territoryBoundary).toBeNull();
  expect(source?.geometry.type).toBe('MultiPolygon');
  expect(source?.geometryReviewHolds).toEqual(expect.arrayContaining([
    expect.objectContaining({ conflictId: 'conflict:han-wei-transition:220', years: [220] }),
  ]));
  expect(before.boundaries.some(boundary => boundary.id === source?.id)).toBe(true);
  expect(transition.boundaries.some(boundary => boundary.id === source?.id)).toBe(false);
  expect(transition.boundaries.some(boundary => boundary.polityId === 'wei_three'
    && boundary.geometry.type !== 'Point' && boundary.geometry.type !== 'MultiPoint')).toBe(false);
  expect(source?.geometry).toMatchObject({ type: 'MultiPolygon' });
});

test('shows Liu Bei dying at Yong’an in 223 as a regional event point, without adding a Shu border', () => {
  const eventId = 'liu-bei-dies-at-yongan-223';
  const row = annualAudit.years.find(item => item.polityId === 'shu_three' && item.year === 223);
  const state = getHistoricalState(223);

  expect(row).toMatchObject({
    mapExpression: 'capital-and-event-points',
    centerPlaceId: 'chengdu',
    mapEventIds: [eventId],
    territoryBoundary: null,
  });
  expect(row?.sourceIds).toContain('liu-bei-death-and-yongan-palace-location');
  expect(events.find(event => event.id === eventId)).toMatchObject({
    year: 223,
    placeId: 'yongan-palace-region',
    coordinates: [109.543523, 31.045319],
    locationPrecision: 'approximate',
    sourceIds: expect.arrayContaining([
      'liu-bei-death-and-yongan-palace-location',
      'baotaiping-site-amap-reference',
    ]),
  });
  expect(eventDetails.find(detail => detail.eventId === eventId)).toMatchObject({
    polityIds: ['shu_three'],
    locationIds: ['yongan-palace-region'],
  });

  const mapData = buildLocalMapData(state);
  expect(mapData.events.features).toContainEqual(expect.objectContaining({
    geometry: { type: 'Point', coordinates: [109.543523, 31.045319] },
    properties: expect.objectContaining({ entityId: eventId }),
  }));
  expect(buildLocalMapData(getHistoricalState(222)).events.features.some(feature =>
    feature.properties?.entityId === eventId)).toBe(false);
  expect(mapData.boundaries.features.some(feature => feature.properties?.polityId === 'shu_three'
    && feature.geometry.type !== 'Point' && feature.geometry.type !== 'MultiPoint')).toBe(false);
});
