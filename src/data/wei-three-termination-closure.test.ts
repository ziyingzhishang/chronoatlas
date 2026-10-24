import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { people } from './people';

describe('Cao Wei termination closure', () => {
  it('records the 265 Luoyang abdication as Cao Wei termination and Western Jin succession', () => {
    const event = events.find((item) => item.id === 'wei-three-ended-265');
    const detail = eventDetails.find((item) => item.eventId === 'wei-three-ended-265');

    expect(event).toMatchObject({
      year: 265,
      placeId: 'luoyang',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'wei-three-ended-265',
      polityIds: ['wei_three', 'jin_western'],
      locationIds: ['luoyang'],
    });
    expect(detail?.participants.map((participant) => participant.personId)).toEqual(
      expect.arrayContaining(['cao-huan', 'sima-yan']),
    );
    expect(eventTimeReview.find((item) => item.eventId === 'wei-three-ended-265')).toMatchObject({
      status: 'confirmed',
      expectedPrecision: 'year',
    });
  });

  it('connects Luoyang heritage to the Cao Wei termination layer', () => {
    const polity = getPolityDetail('wei_three');
    const heritage = getHeritageDetail('luoyang-han-wei-city-site');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'luoyang', validFrom: 220, validTo: 265 }),
    ]));
    expect(polity?.eventIds).toContain('wei-three-ended-265');
    expect(polity?.heritageIds).toContain('luoyang-han-wei-city-site');
    expect(heritage?.associatedEvents).toContain('wei-three-ended-265');
    expect(heritage?.associatedPolities).toEqual(expect.arrayContaining(['wei_three', 'jin_western']));
  });

  it('exposes Cao Wei final ruler and Sima succession edges in the graph', () => {
    expect(people.find((person) => person.id === 'cao-huan')).toMatchObject({
      polityIds: ['wei_three'],
      roles: expect.arrayContaining(['末代君主']),
    });
    expect(getPersonDetail('cao-huan')?.keyEvents).toContain('wei-three-ended-265');
    expect(getPersonDetail('sima-yan')?.keyEvents).toContain('wei-three-ended-265');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'cao-huan', predicate: 'participated-in', objectId: 'wei-three-ended-265' }),
      expect.objectContaining({ subjectId: 'cao-huan', predicate: 'submitted-to', objectId: 'sima-yan' }),
      expect.objectContaining({ subjectId: 'sima-yan', predicate: 'succeeded', objectId: 'wei_three' }),
      expect.objectContaining({ subjectId: 'sima-yan', predicate: 'participated-in', objectId: 'wei-three-ended-265' }),
    ]));
  });
});
