import { describe, expect, test } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { getHistoricalState } from '../domain/history-state';
import { buildMapData } from '../map/history-map';

describe('Southern Yan termination closure', () => {
  test('records the 410 Guanggu conquest as the termination event', () => {
    const event = events.find((item) => item.id === 'southern-yan-ended-410');
    const detail = eventDetails.find((item) => item.eventId === 'southern-yan-ended-410');

    expect(event).toMatchObject({ year: 410, placeId: 'guanggu', datePrecision: 'year' });
    expect(detail).toMatchObject({
      eventId: 'southern-yan-ended-410',
      polityIds: ['southern_yan'],
      locationIds: ['guanggu'],
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'murong-chao' }),
      expect.objectContaining({ personId: 'liu-yu' }),
    ]));
  });

  test('renders the 410 Guanggu termination marker beside the Western Liang center without adding borders', () => {
    const map = buildMapData(getHistoricalState(410));

    expect(map.events.features).toContainEqual(expect.objectContaining({
      geometry: { type: 'Point', coordinates: [118.48, 36.70] },
      properties: expect.objectContaining({ entityId: 'southern-yan-ended-410', name: '南燕政权终止' }),
    }));
    expect(map.boundaries.features).toContainEqual(expect.objectContaining({
      geometry: { type: 'Point', coordinates: [118.48, 36.70] },
      properties: expect.objectContaining({ polityId: 'southern_yan', derivation: 'control-centers' }),
    }));
    expect(map.boundaries.features).toContainEqual(expect.objectContaining({
      geometry: { type: 'Point', coordinates: [98.49, 39.74] },
      properties: expect.objectContaining({ polityId: 'western_liang', derivation: 'control-centers' }),
    }));
    expect(map.boundaries.features.filter((feature) =>
      ['southern_yan', 'western_liang'].includes(String(feature.properties?.polityId))
      && feature.geometry.type !== 'Point')).toHaveLength(0);
  });

  test('keeps Guanggu and its modern Qingzhou heritage continuous after termination', () => {
    const polity = getPolityDetail('southern_yan');
    const heritage = heritageAssets.find((item) => item.id === 'southern-yan-guanggu-city-site');
    const detail = getHeritageDetail('southern-yan-guanggu-city-site');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'huatai', validFrom: 398, validTo: 398 }),
      expect.objectContaining({ placeId: 'guanggu', validFrom: 400, validTo: 410 }),
    ]));
    expect(polity?.eventIds).toContain('southern-yan-ended-410');
    expect(polity?.heritageIds).toContain('southern-yan-guanggu-city-site');
    expect(heritage).toMatchObject({ placeId: 'guanggu' });
    expect(detail?.associatedEvents).toContain('southern-yan-ended-410');
  });

  test('exposes Murong Chao and Liu Yu as the terminal conflict relationship', () => {
    expect(people.find((person) => person.id === 'murong-chao')).toMatchObject({ polityIds: ['southern_yan'] });
    expect(getPersonDetail('murong-chao')?.keyEvents).toContain('southern-yan-ended-410');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-murong-chao-participated-southern-yan-ended-410' }),
      expect.objectContaining({ id: 'claim-murong-chao-enemy-liu-yu-termination-410' }),
    ]));
  });
});
