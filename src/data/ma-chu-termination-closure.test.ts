import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { eventTimeReview } from './event-time-review';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

describe('Ma Chu termination closure', () => {
  it('records the 951 Changsha termination and Southern Tang succession', () => {
    const event = events.find((item) => item.id === 'ma-chu-ended-951');
    const detail = eventDetails.find((item) => item.eventId === 'ma-chu-ended-951');
    const review = eventTimeReview.find((item) => item.eventId === 'ma-chu-ended-951');

    expect(event).toMatchObject({
      id: 'ma-chu-ended-951',
      year: 951,
      placeId: 'changsha',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'ma-chu-ended-951',
      polityIds: expect.arrayContaining(['chu_ten', 'southern_tang']),
      locationIds: ['changsha'],
      relatedEventIds: expect.arrayContaining(['ma-chu-founded', 'southern-tang-conquers-chu']),
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'ma-xichong' }),
      expect.objectContaining({ personId: 'li-jing' }),
      expect.objectContaining({ personId: 'ma-xie' }),
    ]));
    expect(review).toMatchObject({
      eventId: 'ma-chu-ended-951',
      status: 'confirmed',
      expectedPrecision: 'year',
      timelineStrategy: 'year-marker',
    });
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
  });

  it('connects Changsha capital history and the Ma Chu city-site heritage succession', () => {
    const polity = getPolityDetail('chu_ten');
    const heritage = heritageAssets.find((item) => item.id === 'ma-chu-tan-zhou-city-site');
    const detail = getHeritageDetail('ma-chu-tan-zhou-city-site');

    expect(polity).toMatchObject({
      principalFigureIds: expect.arrayContaining(['ma-yin', 'ma-xichong', 'ma-xie']),
      eventIds: expect.arrayContaining(['ma-chu-founded', 'ma-chu-ended-951']),
      heritageIds: expect.arrayContaining(['ma-chu-tan-zhou-city-site']),
      capitalPhases: expect.arrayContaining([
        expect.objectContaining({ placeId: 'changsha', validFrom: 907, validTo: 951 }),
      ]),
    });
    expect(heritage).toMatchObject({ placeId: 'changsha', constructionFrom: 907, constructionTo: 951 });
    expect(detail).toMatchObject({
      associatedEvents: expect.arrayContaining(['ma-chu-founded', 'ma-chu-ended-951']),
      associatedPeople: expect.arrayContaining(['ma-yin', 'ma-xichong', 'ma-xie', 'li-jing']),
      associatedPolities: expect.arrayContaining(['chu_ten', 'southern_tang']),
    });
  });

  it('exposes last-ruler, succession, kinship, and opposition relationships', () => {
    expect(people.find((person) => person.id === 'ma-xichong')).toMatchObject({
      polityIds: ['chu_ten'],
      roles: expect.arrayContaining(['末代统治者']),
    });
    expect(getPersonDetail('ma-xichong')).toMatchObject({
      personId: 'ma-xichong',
      keyEvents: expect.arrayContaining(['ma-chu-ended-951']),
    });
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-ma-xichong-ruled-chu' }),
      expect.objectContaining({ id: 'claim-ma-xichong-participated-ma-chu-ended-951' }),
      expect.objectContaining({ id: 'claim-ma-xichong-submitted-to-li-jing-termination-951' }),
      expect.objectContaining({ id: 'claim-ma-xichong-sibling-ma-xie' }),
      expect.objectContaining({ id: 'claim-ma-xichong-sibling-ma-xiguang' }),
      expect.objectContaining({ id: 'claim-ma-xie-enemy-li-jing-termination-951' }),
    ]));
  });
});
