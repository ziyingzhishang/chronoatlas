import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { people } from './people';

describe('Western Jin termination closure', () => {
  it('keeps the 316 Chang’an fall distinct from the 317 Eastern Jin reconstruction', () => {
    const event = events.find((item) => item.id === 'western-jin-loses-changan');
    const detail = eventDetails.find((item) => item.eventId === 'western-jin-loses-changan');

    expect(event).toMatchObject({
      year: 316,
      placeId: 'changan',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'western-jin-loses-changan',
      polityIds: expect.arrayContaining(['jin_western', 'former_zhao']),
      locationIds: ['changan'],
    });
    expect(detail?.participants.map((participant) => participant.personId)).toEqual(
      expect.arrayContaining(['sima-ye', 'liu-yao']),
    );
    expect(eventTimeReview.find((item) => item.eventId === 'western-jin-loses-changan')).toMatchObject({
      status: 'confirmed',
      expectedPrecision: 'year',
    });
  });

  it('connects Western Jin late capital and Chang’an heritage layers', () => {
    const polity = getPolityDetail('jin_western');
    const heritage = getHeritageDetail('western-jin-changan-city-layer');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'changan', validFrom: 312, validTo: 316, status: 'actual' }),
    ]));
    expect(polity?.eventIds).toContain('western-jin-loses-changan');
    expect(polity?.heritageIds).toContain('western-jin-changan-city-layer');
    expect(heritage?.associatedEvents).toContain('western-jin-loses-changan');
    expect(heritage?.associatedPolities).toEqual(expect.arrayContaining(['jin_western', 'former_zhao']));
  });

  it('exposes the final Western Jin ruler and the Former Zhao succession edge', () => {
    expect(people.find((person) => person.id === 'sima-ye')).toMatchObject({
      polityIds: ['jin_western'],
      roles: expect.arrayContaining(['末代君主']),
    });
    expect(getPersonDetail('sima-ye')?.keyEvents).toContain('western-jin-loses-changan');
    expect(getPersonDetail('liu-yao')?.keyEvents).toContain('western-jin-loses-changan');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'sima-ye', predicate: 'participated-in', objectId: 'western-jin-loses-changan' }),
      expect.objectContaining({ subjectId: 'sima-ye', predicate: 'succeeded-by', objectId: 'sima-rui' }),
      expect.objectContaining({ subjectId: 'liu-yao', predicate: 'participated-in', objectId: 'western-jin-loses-changan' }),
    ]));
  });
});
