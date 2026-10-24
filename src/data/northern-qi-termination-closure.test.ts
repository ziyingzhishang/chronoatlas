import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';

describe('Northern Qi termination closure', () => {
  it('records the 577 termination and Northern Zhou succession at Ye', () => {
    const event = events.find((item) => item.id === 'northern-qi-ended-577');
    const detail = eventDetails.find((item) => item.eventId === 'northern-qi-ended-577');
    const review = eventTimeReview.find((item) => item.eventId === 'northern-qi-ended-577');

    expect(event).toMatchObject({
      id: 'northern-qi-ended-577',
      year: 577,
      placeId: 'ye',
      datePrecision: 'year',
      category: '政权终结／战争',
    });
    expect(detail).toMatchObject({
      eventId: 'northern-qi-ended-577',
      polityIds: ['qi_northern', 'zhou_northern'],
      locationIds: expect.arrayContaining(['ye']),
    });
    expect(detail?.participants.map((participant) => participant.personId)).toEqual(
      expect.arrayContaining(['gao-heng', 'yuwen-yong']),
    );
    expect(review).toMatchObject({ status: 'confirmed', expectedPrecision: 'year', timelineStrategy: 'year-marker' });
  });

  it('keeps Ye capital and archaeological layers connected after Northern Qi ends', () => {
    const polity = getPolityDetail('qi_northern');
    const heritage = getHeritageDetail('ye-city-site');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'ye', validFrom: 550, validTo: 577, role: 'primary', status: 'formal' }),
    ]));
    expect(polity?.eventIds).toContain('northern-qi-ended-577');
    expect(polity?.heritageIds).toContain('ye-city-site');
    expect(heritage?.associatedEvents).toContain('northern-qi-ended-577');
    expect(heritage?.associatedPolities).toEqual(expect.arrayContaining(['qi_northern', 'zhou_northern']));
  });

  it('exposes the final ruler and Northern Zhou conquest relations', () => {
    expect(people.find((person) => person.id === 'gao-heng')).toMatchObject({
      polityIds: ['qi_northern'],
      roles: expect.arrayContaining(['末代君主']),
    });
    expect(getPersonDetail('gao-heng')?.keyEvents).toContain('northern-qi-ended-577');
    expect(getPersonDetail('yuwen-yong')?.keyEvents).toContain('northern-qi-ended-577');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'gao-heng', predicate: 'ruled', objectId: 'qi_northern' }),
      expect.objectContaining({ subjectId: 'gao-heng', predicate: 'participated-in', objectId: 'northern-qi-ended-577' }),
      expect.objectContaining({ subjectId: 'gao-heng', predicate: 'enemy-of', objectId: 'yuwen-yong' }),
      expect.objectContaining({ subjectId: 'yuwen-yong', predicate: 'participated-in', objectId: 'northern-qi-ended-577' }),
    ]));
  });
});
