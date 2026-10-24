import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';

describe('Sui termination closure', () => {
  it('records the 618 abdication as a separate Sui termination and Tang succession event', () => {
    const event = events.find((item) => item.id === 'sui-ended-618');
    const detail = eventDetails.find((item) => item.eventId === 'sui-ended-618');
    const review = eventTimeReview.find((item) => item.eventId === 'sui-ended-618');

    expect(event).toMatchObject({
      id: 'sui-ended-618',
      year: 618,
      placeId: 'changan',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'sui-ended-618',
      polityIds: ['sui', 'tang'],
      locationIds: ['changan'],
      relatedEventIds: expect.arrayContaining(['tang-founded']),
    });
    expect(detail?.participants.map((participant) => participant.personId)).toEqual(
      expect.arrayContaining(['yang-you', 'li-yuan']),
    );
    expect(review).toMatchObject({ status: 'confirmed', expectedPrecision: 'year', timelineStrategy: 'year-marker' });
  });

  it('keeps Chang’an capital and layered heritage connected after Sui ends', () => {
    const polity = getPolityDetail('sui');
    const heritage = getHeritageDetail('tang-changan-city-site');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'luoyang', validFrom: 605, validTo: 618 }),
    ]));
    expect(polity?.eventIds).toContain('sui-ended-618');
    expect(polity?.heritageIds).toContain('tang-changan-city-site');
    expect(heritage?.associatedEvents).toContain('sui-ended-618');
    expect(heritage?.associatedPolities).toEqual(expect.arrayContaining(['sui', 'tang']));
  });

  it('exposes the final ruler, successor and termination relationships in the graph', () => {
    expect(people.find((person) => person.id === 'yang-you')).toMatchObject({
      polityIds: ['sui'],
      roles: expect.arrayContaining(['皇帝', '末代君主']),
    });
    expect(getPersonDetail('yang-you')?.keyEvents).toContain('sui-ended-618');
    expect(getPersonDetail('li-yuan')?.keyEvents).toContain('sui-ended-618');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'yang-you', predicate: 'ruled', objectId: 'sui' }),
      expect.objectContaining({ subjectId: 'yang-you', predicate: 'participated-in', objectId: 'sui-ended-618' }),
      expect.objectContaining({ subjectId: 'yang-you', predicate: 'succeeded-by', objectId: 'li-yuan' }),
      expect.objectContaining({ subjectId: 'li-yuan', predicate: 'participated-in', objectId: 'sui-ended-618' }),
    ]));
  });
});
