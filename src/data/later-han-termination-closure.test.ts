import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

describe('Later Han termination closure', () => {
  it('records the 951 Guo Wei transition as the Later Han termination event', () => {
    const event = events.find((item) => item.id === 'later-han-ended-951');
    const detail = eventDetails.find((item) => item.eventId === 'later-han-ended-951');

    expect(event).toMatchObject({
      id: 'later-han-ended-951',
      year: 951,
      placeId: 'kaifeng',
      datePrecision: 'year',
    });
    expect(detail).toMatchObject({
      eventId: 'later-han-ended-951',
      polityIds: expect.arrayContaining(['han_later', 'zhou_later']),
      locationIds: ['kaifeng'],
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'liu-chengyou' }),
      expect.objectContaining({ personId: 'guo-wei' }),
    ]));
    expect(detail?.relatedEventIds).toEqual(expect.arrayContaining(['han-later-founded', 'zhou-later-founded']));
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
  });

  it('connects the last ruler and the shared Kaifeng city heritage layer', () => {
    const polity = getPolityDetail('han_later');
    const person = people.find((item) => item.id === 'liu-chengyou');
    const personDetail = getPersonDetail('liu-chengyou');
    const heritage = heritageAssets.find((item) => item.id === 'kaifeng-later-jin-han-city-layer');
    const heritageDetail = getHeritageDetail('kaifeng-later-jin-han-city-layer');

    expect(person).toMatchObject({
      polityIds: ['han_later'],
      roles: expect.arrayContaining(['末代君主']),
    });
    expect(personDetail).toMatchObject({
      personId: 'liu-chengyou',
      keyEvents: expect.arrayContaining(['later-han-ended-951']),
    });
    expect(polity).toMatchObject({
      principalFigureIds: expect.arrayContaining(['liu-zhiyuan', 'liu-chengyou']),
      eventIds: expect.arrayContaining(['later-han-ended-951']),
      heritageIds: expect.arrayContaining(['kaifeng-later-jin-han-city-layer']),
    });
    expect(heritage).toMatchObject({ placeId: 'kaifeng', constructionFrom: 936, constructionTo: 951 });
    expect(heritageDetail).toMatchObject({
      associatedEvents: expect.arrayContaining(['later-han-ended-951']),
      associatedPeople: expect.arrayContaining(['liu-zhiyuan', 'liu-chengyou', 'guo-wei']),
      associatedPolities: expect.arrayContaining(['han_later', 'zhou_later']),
    });
  });

  it('exposes the last-ruler governance and transition relationships', () => {
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-liu-chengyou-ruled-later-han' }),
      expect.objectContaining({ id: 'claim-liu-chengyou-participated-later-han-ended-951' }),
      expect.objectContaining({ id: 'claim-liu-chengyou-enemy-guo-wei-termination-951' }),
    ]));
  });
});
