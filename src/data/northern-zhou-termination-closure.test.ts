import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';

describe('Northern Zhou termination closure', () => {
  it('records the 581 abdication as a separate Northern Zhou termination and Sui succession event', () => {
    const event = events.find((item) => item.id === 'northern-zhou-ended-581');
    const detail = eventDetails.find((item) => item.eventId === 'northern-zhou-ended-581');
    const review = eventTimeReview.find((item) => item.eventId === 'northern-zhou-ended-581');

    expect(event).toMatchObject({
      id: 'northern-zhou-ended-581',
      year: 581,
      placeId: 'changan',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'northern-zhou-ended-581',
      polityIds: ['zhou_northern', 'sui'],
      locationIds: expect.arrayContaining(['changan']),
    });
    expect(detail?.participants.map((participant) => participant.personId)).toEqual(
      expect.arrayContaining(['yuwen-chan', 'yang-jian']),
    );
    expect(review).toMatchObject({ status: 'confirmed', expectedPrecision: 'year', timelineStrategy: 'year-marker' });
  });

  it('keeps Chang’an capital and archaeological layers connected after Northern Zhou ends', () => {
    const polity = getPolityDetail('zhou_northern');
    const heritage = getHeritageDetail('northern-zhou-changan-city-layer');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'changan', validFrom: 557, validTo: 581, role: 'primary', status: 'formal' }),
    ]));
    expect(polity?.eventIds).toContain('northern-zhou-ended-581');
    expect(polity?.heritageIds).toContain('northern-zhou-changan-city-layer');
    expect(heritage?.associatedEvents).toContain('northern-zhou-ended-581');
    expect(heritage?.associatedPolities).toEqual(expect.arrayContaining(['zhou_northern', 'sui']));
  });

  it('exposes the final ruler, successor and abdication relationships', () => {
    expect(people.find((person) => person.id === 'yuwen-chan')).toMatchObject({
      polityIds: ['zhou_northern'],
      roles: expect.arrayContaining(['皇帝', '末代君主']),
    });
    expect(getPersonDetail('yuwen-chan')?.keyEvents).toContain('northern-zhou-ended-581');
    expect(getPersonDetail('yang-jian')?.keyEvents).toContain('northern-zhou-ended-581');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'yuwen-chan', predicate: 'ruled', objectId: 'zhou_northern' }),
      expect.objectContaining({ subjectId: 'yuwen-chan', predicate: 'participated-in', objectId: 'northern-zhou-ended-581' }),
      expect.objectContaining({ subjectId: 'yuwen-chan', predicate: 'succeeded-by', objectId: 'yang-jian' }),
      expect.objectContaining({ subjectId: 'yang-jian', predicate: 'participated-in', objectId: 'northern-zhou-ended-581' }),
    ]));
  });
});
