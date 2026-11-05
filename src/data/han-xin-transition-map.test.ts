import { expect, test } from 'vitest';
import { getHistoricalState } from '../domain/history-state';
import { buildLocalMapData } from '../map/history-map';
import annualAudit from '../../docs/audits/topics/han-xin-transition-6-9.json';
import { events } from './events';
import { eventDetails } from './event-details';

test('shows Liu Chong attacking Wan in year 6 without drawing a Western Han border', () => {
  const eventId = 'liu-chong-attacks-wan-6';
  const row = annualAudit.years.find(item => item.year === 6);
  const state = getHistoricalState(6);

  expect(row).toMatchObject({
    mapExpression: 'capital-and-event-points',
    centerPlaceId: 'changan',
    mapEventIds: [eventId],
    territoryBoundary: null,
  });
  expect(row?.sourceIds).toEqual(expect.arrayContaining([
    'han-xin-transition-primary-sources',
    'modern-geography-reference',
  ]));
  expect(events.find(event => event.id === eventId)).toMatchObject({
    year: 6,
    placeId: 'wan-han-county',
    coordinates: [112.53547, 33.00168],
    locationPrecision: 'approximate',
    sourceIds: expect.arrayContaining(['han-xin-transition-primary-sources', 'wan-county-chgis-hvd-82610']),
  });
  expect(eventDetails.find(detail => detail.eventId === eventId)).toMatchObject({
    polityIds: ['han_western'],
    locationIds: ['wan-han-county'],
  });

  const mapData = buildLocalMapData(state);
  expect(mapData.events.features).toContainEqual(expect.objectContaining({
    geometry: { type: 'Point', coordinates: [112.53547, 33.00168] },
    properties: expect.objectContaining({ entityId: eventId }),
  }));
  expect(buildLocalMapData(getHistoricalState(5)).events.features.some(feature =>
    feature.properties?.entityId === eventId)).toBe(false);
  expect(mapData.boundaries.features.some(feature => feature.properties?.polityId === 'han_western'
    && feature.geometry.type !== 'Point' && feature.geometry.type !== 'MultiPoint')).toBe(false);
});
