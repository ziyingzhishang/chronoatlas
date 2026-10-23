import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { personDetails } from './person-details';
import { polityDetails } from './polity-details';

describe('western Xia termination closure', () => {
  it('records the 1227 termination as a separate approximate event', () => {
    const event = events.find((candidate) => candidate.id === 'western-xia-ended-1227');
    const detail = eventDetails.find((candidate) => candidate.eventId === 'western-xia-ended-1227');

    expect(event).toMatchObject({ year: 1227, placeId: 'xingqing', datePrecision: 'approximate' });
    expect(detail).toMatchObject({
      polityIds: expect.arrayContaining(['western_xia', 'mongol']),
      locationIds: expect.arrayContaining(['xingqing']),
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'li-xian-western-xia' }),
      expect.objectContaining({ personId: 'temujin' }),
    ]));
    expect(eventTimeReview.some((entry) => entry.eventId === 'western-xia-ended-1227')).toBe(true);
  });

  it('connects the last ruler, polity timeline, and imperial tomb heritage', () => {
    const polity = polityDetails.find((detail) => detail.polityId === 'western_xia');
    const lastRuler = personDetails.find((detail) => detail.personId === 'li-xian-western-xia');
    const heritage = getHeritageDetail('western-xia-imperial-tombs');

    expect(polity?.principalFigureIds).toEqual(expect.arrayContaining(['li-xian-western-xia']));
    expect(polity?.eventIds).toEqual(expect.arrayContaining(['western-xia-ended-1227']));
    expect(lastRuler?.keyEvents).toContain('western-xia-ended-1227');
    expect(heritage?.associatedPeople).toEqual(expect.arrayContaining(['li-yuanhao', 'li-xian-western-xia']));
    expect(heritage?.associatedEvents).toEqual(expect.arrayContaining(['western-xia-founded', 'western-xia-ended-1227']));
  });

  it('adds governance and conflict edges for the late-period perspective', () => {
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-li-xian-ruled-western-xia', subjectId: 'li-xian-western-xia', predicate: 'ruled' }),
      expect.objectContaining({ id: 'claim-li-xian-western-xia-ended-1227', objectId: 'western-xia-ended-1227' }),
      expect.objectContaining({ id: 'claim-li-xian-enemy-temujin', predicate: 'enemy-of', objectId: 'temujin' }),
    ]));
  });
});
