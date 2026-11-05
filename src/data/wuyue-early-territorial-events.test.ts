import { describe, expect, it } from 'vitest';

import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';
import wuyueEarlyAudit from '../../docs/audits/topics/wuyue-formation-and-contested-huzhou-907-910.json';
import { getHistoricalState } from '../domain/history-state';
import { buildLocalMapData } from '../map/history-map';

describe('Wuyue 907-910 Huzhou event mapping', () => {
  it.each([
    [909, 'wuyue-huzhou-revolt-909'],
    [910, 'wuyue-restores-huzhou-910'],
  ] as const)('renders %s Huzhou event as a point in the matching year', (year, eventId) => {
    const event = events.find(item => item.id === eventId);
    const detail = eventDetails.find(item => item.eventId === eventId);
    const features = buildLocalMapData(getHistoricalState(year)).events.features;

    expect(event).toMatchObject({
      year,
      placeId: 'huzhou',
      coordinates: [120.09931, 30.86496],
      locationPrecision: 'approximate',
      sourceIds: expect.arrayContaining(['zizhi-tongjian-wuyue-907-910', 'chgis-huzhou-758-1225']),
    });
    expect(detail).toMatchObject({ locationIds: ['huzhou'] });
    expect(features).toContainEqual(expect.objectContaining({
      geometry: { type: 'Point', coordinates: [120.09931, 30.86496] },
      properties: expect.objectContaining({ entityId: eventId }),
    }));
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
    expect(buildLocalMapData(getHistoricalState(year - 1)).events.features)
      .not.toContainEqual(expect.objectContaining({ properties: expect.objectContaining({ entityId: eventId }) }));
  });

  it('aligns the annual audit with both Huzhou events without adding a boundary polygon', () => {
    const auditByYear = new Map(wuyueEarlyAudit.years.map(row => [row.year, row]));

    expect(auditByYear.get(909)).toMatchObject({
      mapExpression: 'capital-and-event-points',
      mapEventIds: expect.arrayContaining(['wuyue-relieves-suzhou-909', 'wuyue-huzhou-revolt-909']),
    });
    expect(auditByYear.get(910)).toMatchObject({
      mapExpression: 'capital-and-event-points',
      mapEventIds: ['wuyue-restores-huzhou-910'],
    });
    for (const year of [907, 908, 909, 910]) {
      expect(buildLocalMapData(getHistoricalState(year)).boundaries.features.some(feature => (
        feature.properties?.polityId === 'wuyue' && feature.geometry.type.endsWith('Polygon')
      ))).toBe(false);
    }
  });
});
