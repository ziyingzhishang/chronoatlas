import { describe, expect, test } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';

describe('Dali termination closure', () => {
  test('records the 1253 termination as a regional conquest process', () => {
    const event = events.find((item) => item.id === 'dali-ended-1253');
    const detail = eventDetails.find((item) => item.eventId === 'dali-ended-1253');

    expect(event).toMatchObject({ year: 1253, placeId: 'dali_city', datePrecision: 'approximate' });
    expect(detail).toMatchObject({
      eventId: 'dali-ended-1253',
      polityIds: ['dali', 'mongol'],
      locationIds: expect.arrayContaining(['dali_city', 'yangjumei']),
    });
    expect(detail?.participants.map((participant) => participant.personId)).toEqual(
      expect.arrayContaining(['duan-xingzhi', 'mongke', 'kublai']),
    );
    expect(eventTimeReview.find((item) => item.eventId === 'dali-ended-1253')).toMatchObject({
      status: 'approximate',
      expectedPrecision: 'approximate',
    });
  });

  test('keeps Dali capital and city heritage continuous after polity termination', () => {
    const detail = getPolityDetail('dali');
    const heritage = heritageAssets.find((asset) => asset.id === 'dali-city-site');
    const heritageDetail = getHeritageDetail('dali-city-site');

    expect(detail?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'yangjumei', validFrom: 937, validTo: 1253 }),
    ]));
    expect(detail?.eventIds).toContain('dali-ended-1253');
    expect(detail?.heritageIds).toContain('dali-city-site');
    expect(heritage).toMatchObject({ placeId: 'dali_city', constructionTo: 1253 });
    expect(heritageDetail?.associatedEvents).toContain('dali-ended-1253');
  });

  test('exposes the final ruler and conquest relationships in the graph', () => {
    expect(people.find((person) => person.id === 'duan-xingzhi')).toMatchObject({
      polityIds: ['dali'],
    });
    expect(getPersonDetail('duan-xingzhi')?.keyEvents).toContain('dali-ended-1253');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-duan-xingzhi-ruled-dali', predicate: 'ruled', objectId: 'dali' }),
      expect.objectContaining({ id: 'claim-duan-xingzhi-participated-dali-ended-1253', predicate: 'participated-in', objectId: 'dali-ended-1253' }),
      expect.objectContaining({ id: 'claim-duan-xingzhi-enemy-mongke', predicate: 'enemy-of', objectId: 'mongke' }),
    ]));
  });
});
