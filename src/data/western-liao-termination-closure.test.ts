import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { personDetails } from './person-details';
import { polityDetails } from './polity-details';
import { claims } from './claims';

describe('western Liao termination closure', () => {
  it('records the 1218 termination as a separate, approximate event', () => {
    const event = events.find((candidate) => candidate.id === 'western-liao-ended-1218');
    const detail = eventDetails.find((candidate) => candidate.eventId === 'western-liao-ended-1218');

    expect(event).toMatchObject({ year: 1218, placeId: 'balasagun', datePrecision: 'approximate' });
    expect(detail).toMatchObject({
      polityIds: expect.arrayContaining(['western_liao', 'mongol']),
      locationIds: expect.arrayContaining(['balasagun']),
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'kuchlug' }),
      expect.objectContaining({ personId: 'temujin' }),
    ]));
  });

  it('connects Kuchlug, the polity timeline, and Balasagun heritage', () => {
    const polity = polityDetails.find((detail) => detail.polityId === 'western_liao');
    const kuchlug = personDetails.find((detail) => detail.personId === 'kuchlug');
    const heritage = getHeritageDetail('western-liao-balasagun-site');

    expect(polity?.principalFigureIds).toEqual(expect.arrayContaining(['kuchlug']));
    expect(polity?.eventIds).toEqual(expect.arrayContaining(['western-liao-ended-1218']));
    expect(kuchlug?.keyEvents).toContain('western-liao-ended-1218');
    expect(heritage?.associatedPeople).toEqual(expect.arrayContaining(['yelu-dashi', 'kuchlug']));
    expect(heritage?.associatedEvents).toEqual(expect.arrayContaining(['western-liao-founded', 'western-liao-ended-1218']));
  });

  it('adds governance and conflict edges for the late-period perspective', () => {
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-kuchlug-ruled-western-liao', subjectId: 'kuchlug', predicate: 'ruled' }),
      expect.objectContaining({ id: 'claim-kuchlug-participated-western-liao-ended-1218', objectId: 'western-liao-ended-1218' }),
      expect.objectContaining({ id: 'claim-kuchlug-enemy-temujin', predicate: 'enemy-of', objectId: 'temujin' }),
    ]));
  });
});
