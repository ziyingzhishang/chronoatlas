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

describe('Later Jin termination closure', () => {
  it('records the 947 Kaifeng fall as the Later Jin termination event', () => {
    const event = events.find((item) => item.id === 'later-jin-ended-947');
    const detail = eventDetails.find((item) => item.eventId === 'later-jin-ended-947');

    expect(event).toMatchObject({
      id: 'later-jin-ended-947',
      year: 947,
      placeId: 'kaifeng',
      datePrecision: 'year',
    });
    expect(detail).toMatchObject({
      eventId: 'later-jin-ended-947',
      polityIds: expect.arrayContaining(['jin_later', 'khitan', 'han_later']),
      locationIds: ['kaifeng'],
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'shi-chonggui' }),
      expect.objectContaining({ personId: 'yelu-deguang' }),
    ]));
    expect(detail?.relatedEventIds).toEqual(expect.arrayContaining(['jin-later-founded', 'han-later-founded']));
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
  });

  it('connects the Later Jin last ruler and the Kaifeng city heritage layer', () => {
    const polity = getPolityDetail('jin_later');
    const person = people.find((item) => item.id === 'shi-chonggui');
    const personDetail = getPersonDetail('shi-chonggui');
    const heritage = heritageAssets.find((item) => item.id === 'kaifeng-later-jin-han-city-layer');
    const heritageDetail = getHeritageDetail('kaifeng-later-jin-han-city-layer');

    expect(person).toMatchObject({
      polityIds: ['jin_later'],
      roles: expect.arrayContaining(['末代君主']),
    });
    expect(personDetail).toMatchObject({
      personId: 'shi-chonggui',
      keyEvents: expect.arrayContaining(['later-jin-ended-947']),
    });
    expect(polity).toMatchObject({
      principalFigureIds: expect.arrayContaining(['shi-chonggui']),
      eventIds: expect.arrayContaining(['later-jin-ended-947']),
      heritageIds: expect.arrayContaining(['kaifeng-later-jin-han-city-layer']),
    });
    expect(heritage).toMatchObject({ placeId: 'kaifeng', constructionFrom: 936, constructionTo: 951 });
    expect(heritageDetail).toMatchObject({
      associatedEvents: expect.arrayContaining(['later-jin-ended-947']),
      associatedPeople: expect.arrayContaining(['shi-jingtang', 'shi-chonggui', 'yelu-deguang', 'liu-zhiyuan']),
      associatedPolities: expect.arrayContaining(['jin_later', 'han_later']),
    });
  });

  it('exposes the last-ruler governance and termination relationships', () => {
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-shi-chonggui-ruled-later-jin' }),
      expect.objectContaining({ id: 'claim-shi-chonggui-participated-later-jin-ended-947' }),
      expect.objectContaining({ id: 'claim-shi-chonggui-enemy-yelu-deguang-termination-947' }),
    ]));
  });
});
