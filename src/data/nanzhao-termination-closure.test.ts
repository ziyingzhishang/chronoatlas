import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPersonDetail } from './person-details';
import { people } from './people';
import { getPolityDetail } from './polity-details';

describe('南诏终结闭环', () => {
  it('records the 902 transition from Nanzhao to Dachanghe without hiding source uncertainty', () => {
    const event = events.find((item) => item.id === 'nanzhao-ended-902');
    const detail = eventDetails.find((item) => item.eventId === 'nanzhao-ended-902');
    const review = eventTimeReview.find((item) => item.eventId === 'nanzhao-ended-902');

    expect(event).toMatchObject({
      id: 'nanzhao-ended-902',
      year: 902,
      placeId: 'yangjumei',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'nanzhao-ended-902',
      polityIds: ['nanzhao'],
      locationIds: expect.arrayContaining(['yangjumei', 'dali_city']),
    });
    expect(detail?.participants.map((participant) => participant.personId)).toEqual(
      expect.arrayContaining(['shun-huazhen', 'zheng-maisi']),
    );
    expect(detail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '蒙氏王室终局', startYear: 902, endYear: 902 }),
      expect.objectContaining({ label: '大长和承接', startYear: 902, endYear: 902 }),
    ]));
    expect(review).toMatchObject({ status: 'confirmed', expectedPrecision: 'year', timelineStrategy: 'year-marker' });
  });

  it('keeps the late Nanzhao capital and Yangjumei heritage connected after termination', () => {
    const polity = getPolityDetail('nanzhao');
    const heritage = heritageAssets.find((item) => item.id === 'nanzhao-yangjumei-city-site');
    const heritageDetail = getHeritageDetail('nanzhao-yangjumei-city-site');

    expect(polity).toMatchObject({
      eventIds: expect.arrayContaining(['nanzhao-founded', 'nanzhao-ended-902']),
      heritageIds: expect.arrayContaining(['nanzhao-taihe-city-site', 'nanzhao-yangjumei-city-site']),
      capitalPhases: expect.arrayContaining([
        expect.objectContaining({ placeId: 'yangjumei', validFrom: 779, validTo: 902 }),
      ]),
    });
    expect(heritage).toMatchObject({ placeId: 'yangjumei', constructionFrom: 779, constructionTo: 902 });
    expect(heritageDetail).toMatchObject({
      associatedEvents: expect.arrayContaining(['nanzhao-founded', 'nanzhao-ended-902']),
      associatedPeople: expect.arrayContaining(['yimouxun', 'quanfengyou', 'shun-huazhen', 'zheng-maisi']),
      associatedPolities: ['nanzhao'],
    });
  });

  it('exposes the final ruler and the takeover relationship graph', () => {
    expect(people.find((item) => item.id === 'shun-huazhen')).toMatchObject({
      name: '舜化贞',
      polityIds: ['nanzhao'],
      roles: expect.arrayContaining(['末代统治者']),
    });
    expect(getPersonDetail('shun-huazhen')?.keyEvents).toContain('nanzhao-ended-902');
    expect(people.find((item) => item.id === 'zheng-maisi')).toMatchObject({ polityIds: ['nanzhao'] });
    expect(getPersonDetail('zheng-maisi')?.keyEvents).toContain('nanzhao-ended-902');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-shun-huazhen-ruled-nanzhao', predicate: 'ruled', objectId: 'nanzhao' }),
      expect.objectContaining({ id: 'claim-shun-huazhen-participated-nanzhao-ended-902', predicate: 'participated-in', objectId: 'nanzhao-ended-902' }),
      expect.objectContaining({ id: 'claim-shun-huazhen-enemy-zheng-maisi-termination-902', predicate: 'enemy-of', objectId: 'zheng-maisi' }),
      expect.objectContaining({ id: 'claim-zheng-maisi-participated-nanzhao-ended-902', predicate: 'participated-in', objectId: 'nanzhao-ended-902' }),
    ]));
  });
});
