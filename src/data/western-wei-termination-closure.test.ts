import { describe, expect, test } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { people } from './people';
import { places } from './places';

describe('Western Wei termination closure', () => {
  test('records the 557 Chang’an abdication as a separate Western Wei termination and Northern Zhou succession', () => {
    const event = events.find((item) => item.id === 'western-wei-ended-557');
    const detail = eventDetails.find((item) => item.eventId === 'western-wei-ended-557');

    expect(event).toMatchObject({
      year: 557,
      placeId: 'changan',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'western-wei-ended-557',
      polityIds: expect.arrayContaining(['wei_western', 'zhou_northern']),
      locationIds: ['changan'],
    });
    expect(detail?.participants.map((participant) => participant.personId)).toEqual(
      expect.arrayContaining(['yuan-kuo', 'yuwen-jue']),
    );
    expect(eventTimeReview.find((item) => item.eventId === 'western-wei-ended-557')).toMatchObject({
      status: 'confirmed',
      expectedPrecision: 'year',
    });
  });

  test('connects the Western Wei capital, its modern place, and layered Changan heritage', () => {
    const polity = getPolityDetail('wei_western');
    const changan = places.find((place) => place.id === 'changan');
    const heritage = getHeritageDetail('western-wei-changan-city-layer');

    expect(changan).toMatchObject({ modernName: '西安市', modernAdministrativeUnit: '陕西省' });
    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'changan', validFrom: 535, validTo: 557 }),
    ]));
    expect(polity?.eventIds).toContain('western-wei-ended-557');
    expect(polity?.heritageIds).toContain('western-wei-changan-city-layer');
    expect(heritage?.associatedEvents).toContain('western-wei-ended-557');
    expect(heritage?.associatedPolities).toEqual(expect.arrayContaining(['wei_western', 'zhou_northern']));
  });

  test('exposes the final Western Wei ruler and the Northern Zhou successor relationship', () => {
    expect(people.find((person) => person.id === 'yuan-kuo')).toMatchObject({
      polityIds: ['wei_western'],
    });
    expect(getPersonDetail('yuan-kuo')?.keyEvents).toContain('western-wei-ended-557');
    expect(getPersonDetail('yuwen-jue')?.keyEvents).toContain('western-wei-ended-557');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-yuan-kuo-ruled-western-wei', predicate: 'ruled', objectId: 'wei_western' }),
      expect.objectContaining({ id: 'claim-yuan-kuo-participated-western-wei-ended-557', predicate: 'participated-in', objectId: 'western-wei-ended-557' }),
      expect.objectContaining({ id: 'claim-yuwen-jue-succeeded-western-wei', predicate: 'succeeded', objectId: 'wei_western' }),
      expect.objectContaining({ id: 'claim-yuwen-jue-succeeded-yuan-kuo', predicate: 'succeeded', objectId: 'yuan-kuo' }),
      expect.objectContaining({ id: 'claim-yuan-kuo-submitted-to-yuwen-jue-557', predicate: 'submitted-to', objectId: 'yuwen-jue' }),
      expect.objectContaining({ id: 'claim-yuwen-jue-participated-western-wei-ended-557', predicate: 'participated-in', objectId: 'western-wei-ended-557' }),
    ]));
  });
});
