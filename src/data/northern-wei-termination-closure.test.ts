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

describe('Northern Wei termination closure', () => {
  test('records the 534 Luoyang collapse as a split-process termination', () => {
    const event = events.find((item) => item.id === 'northern-wei-ended-534');
    const detail = eventDetails.find((item) => item.eventId === 'northern-wei-ended-534');

    expect(event).toMatchObject({
      year: 534,
      placeId: 'luoyang',
      datePrecision: 'approximate',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'northern-wei-ended-534',
      polityIds: expect.arrayContaining(['wei_northern', 'wei_eastern', 'wei_western']),
      locationIds: expect.arrayContaining(['luoyang', 'ye', 'changan']),
    });
    expect(detail?.participants.map((participant) => participant.personId)).toEqual(
      expect.arrayContaining(['yuan-xiu', 'gao-huan', 'yu-wen-tai']),
    );
    expect(eventTimeReview.find((item) => item.eventId === 'northern-wei-ended-534')).toMatchObject({
      status: 'approximate',
      expectedPrecision: 'approximate',
    });
  });

  test('connects Northern Wei capitals, modern places, and layered heritage', () => {
    const polity = getPolityDetail('wei_northern');
    const luoyang = places.find((place) => place.id === 'luoyang');
    const heritage = getHeritageDetail('luoyang-han-wei-city-site');

    expect(luoyang).toMatchObject({ modernName: '洛阳市', modernAdministrativeUnit: '河南省' });
    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'luoyang', validFrom: 495, validTo: 534 }),
    ]));
    expect(polity?.eventIds).toContain('northern-wei-ended-534');
    expect(polity?.heritageIds).toContain('luoyang-han-wei-city-site');
    expect(heritage?.associatedEvents).toContain('northern-wei-ended-534');
    expect(heritage?.associatedPolities).toEqual(expect.arrayContaining(['wei_northern', 'wei_eastern', 'wei_western']));
  });

  test('exposes the final ruler and both successor relationship branches', () => {
    expect(people.find((person) => person.id === 'yuan-xiu')).toMatchObject({
      polityIds: ['wei_northern'],
    });
    expect(getPersonDetail('yuan-xiu')?.keyEvents).toContain('northern-wei-ended-534');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-yuan-xiu-ruled-northern-wei', predicate: 'ruled', objectId: 'wei_northern' }),
      expect.objectContaining({ id: 'claim-yuan-xiu-participated-northern-wei-ended-534', predicate: 'participated-in', objectId: 'northern-wei-ended-534' }),
      expect.objectContaining({ id: 'claim-yuan-xiu-enemy-gao-huan-northern-wei-termination-534', predicate: 'enemy-of', objectId: 'gao-huan' }),
      expect.objectContaining({ id: 'claim-yu-wen-tai-participated-northern-wei-ended-534', predicate: 'participated-in', objectId: 'northern-wei-ended-534' }),
    ]));
  });
});
