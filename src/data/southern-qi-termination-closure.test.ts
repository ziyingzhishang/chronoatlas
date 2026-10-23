import { describe, expect, test } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

describe('Southern Qi termination closure', () => {
  test('records the 502 Jiankang succession as the Southern Qi termination event', () => {
    const event = events.find((item) => item.id === 'southern-qi-ended-502');
    const detail = eventDetails.find((item) => item.eventId === 'southern-qi-ended-502');

    expect(event).toMatchObject({ year: 502, placeId: 'jiankang', datePrecision: 'year' });
    expect(detail).toMatchObject({
      eventId: 'southern-qi-ended-502',
      polityIds: ['qi_southern', 'liang_southern'],
      locationIds: ['jiankang'],
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'xiao-baorong' }),
      expect.objectContaining({ personId: 'xiao-yan' }),
    ]));
    expect(detail?.relatedEventIds).toEqual(expect.arrayContaining(['southern-qi-founded', 'southern-liang-founded']));
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
  });

  test('keeps Jiankang heritage linked to Southern Qi termination without conflating Southern Liang', () => {
    const polity = getPolityDetail('qi_southern');
    const heritage = heritageAssets.find((item) => item.id === 'jiankang-six-dynasties-city-site');
    const detail = getHeritageDetail('jiankang-six-dynasties-city-site');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'jiankang', validFrom: 479, validTo: 502 }),
    ]));
    expect(polity?.eventIds).toContain('southern-qi-ended-502');
    expect(polity?.heritageIds).toContain('jiankang-six-dynasties-city-site');
    expect(heritage).toMatchObject({ placeId: 'jiankang', constructionFrom: 229, constructionTo: 589 });
    expect(detail?.associatedEvents).toContain('southern-qi-ended-502');
    expect(detail?.associatedPolities).toContain('qi_southern');
  });

  test('exposes Xiao Baorong as the last Southern Qi ruler and Xiao Yan as the transition figure', () => {
    expect(people.find((person) => person.id === 'xiao-baorong')).toMatchObject({ polityIds: ['qi_southern'] });
    expect(getPersonDetail('xiao-baorong')).toMatchObject({
      personId: 'xiao-baorong',
      keyEvents: expect.arrayContaining(['southern-qi-ended-502']),
    });
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-xiao-baorong-ruled-southern-qi' }),
      expect.objectContaining({ id: 'claim-xiao-baorong-participated-southern-qi-ended-502' }),
      expect.objectContaining({ id: 'claim-xiao-baorong-enemy-xiao-yan-termination-502' }),
    ]));
  });
});
