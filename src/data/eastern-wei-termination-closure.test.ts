import { describe, expect, test } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';

describe('Eastern Wei termination closure', () => {
  test('records the 550 abdication as a separate polity termination and Northern Qi succession event', () => {
    const event = events.find((item) => item.id === 'eastern-wei-ended-550');
    const detail = eventDetails.find((item) => item.eventId === 'eastern-wei-ended-550');

    expect(event).toMatchObject({
      year: 550,
      placeId: 'ye',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'eastern-wei-ended-550',
      polityIds: ['wei_eastern', 'qi_northern'],
      locationIds: ['ye'],
    });
    expect(detail?.participants.map((participant) => participant.personId)).toEqual(
      expect.arrayContaining(['yuan-shanjian', 'gao-yang']),
    );
    expect(eventTimeReview.find((item) => item.eventId === 'eastern-wei-ended-550')).toMatchObject({
      status: 'confirmed',
      expectedPrecision: 'year',
    });
  });

  test('keeps Ye as the Eastern Wei capital and layered heritage after the abdication', () => {
    const detail = getPolityDetail('wei_eastern');
    const heritageDetail = getHeritageDetail('ye-city-site');

    expect(detail?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'ye', validFrom: 534, validTo: 550 }),
    ]));
    expect(detail?.eventIds).toEqual(expect.arrayContaining(['eastern-wei-founded', 'eastern-wei-ended-550']));
    expect(detail?.heritageIds).toContain('ye-city-site');
    expect(heritageDetail?.associatedEvents).toContain('eastern-wei-ended-550');
    expect(heritageDetail?.associatedPolities).toEqual(expect.arrayContaining(['wei_eastern', 'qi_northern']));
  });

  test('exposes the final ruler and successor relationship in the graph', () => {
    expect(getPersonDetail('yuan-shanjian')?.keyEvents).toContain('eastern-wei-ended-550');
    expect(getPersonDetail('gao-yang')?.keyEvents).toContain('eastern-wei-ended-550');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-yuan-shanjian-participated-eastern-wei-ended-550', predicate: 'participated-in', objectId: 'eastern-wei-ended-550' }),
      expect.objectContaining({ id: 'claim-yuan-shanjian-enemy-gao-yang-eastern-wei-termination-550', predicate: 'enemy-of', objectId: 'gao-yang' }),
      expect.objectContaining({ id: 'claim-gao-yang-participated-eastern-wei-ended-550', predicate: 'participated-in', objectId: 'eastern-wei-ended-550' }),
    ]));
  });
});
