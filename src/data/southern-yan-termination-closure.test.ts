import { describe, expect, test } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';

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

  test('keeps Guanggu and its modern Qingzhou heritage continuous after termination', () => {
    const polity = getPolityDetail('southern_yan');
    const heritage = heritageAssets.find((item) => item.id === 'southern-yan-guanggu-city-site');
    const detail = getHeritageDetail('southern-yan-guanggu-city-site');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'guanggu', validFrom: 398, validTo: 410 }),
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
