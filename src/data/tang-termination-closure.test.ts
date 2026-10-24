import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

describe('Tang termination closure', () => {
  it('records the existing 907 Chang’an termination node with Later Liang succession context', () => {
    const event = events.find((item) => item.id === 'tang-changan-end');
    const detail = eventDetails.find((item) => item.eventId === 'tang-changan-end');
    expect(event).toMatchObject({ id: 'tang-changan-end', year: 907, placeId: 'changan', datePrecision: 'year', category: '政权终结／政权承接' });
    expect(detail).toMatchObject({ eventId: 'tang-changan-end', polityIds: ['tang', 'liang_later'], locationIds: expect.arrayContaining(['changan', 'kaifeng']), relatedEventIds: expect.arrayContaining(['court-moves-luoyang', 'later-liang-five-dynasties-founded']) });
    expect(detail?.participants).toEqual(expect.arrayContaining([expect.objectContaining({ personId: 'zhu-wen' })]));
    expect(eventTimeReview.find((item) => item.eventId === 'tang-changan-end')).toMatchObject({ status: 'confirmed', expectedPrecision: 'year', timelineStrategy: 'year-marker' });
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) expect(sourceById[sourceId], sourceId).toBeDefined();
  });

  it('connects Tang, the capital heritage, and the documented transition figure', () => {
    const polity = getPolityDetail('tang');
    const heritage = getHeritageDetail('tang-changan-city-site');
    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([expect.objectContaining({ placeId: 'changan', validFrom: 618, validTo: 907 })]));
    expect(polity?.eventIds).toContain('tang-changan-end');
    expect(polity?.heritageIds).toContain('tang-changan-city-site');
    expect(heritage?.associatedEvents).toContain('tang-changan-end');
    expect(heritage?.associatedPolities).toEqual(expect.arrayContaining(['sui', 'tang']));
    expect(people.find((person) => person.id === 'zhu-wen')).toMatchObject({ polityIds: ['liang_later'] });
    expect(getPersonDetail('zhu-wen')?.keyEvents).toContain('tang-changan-end');
    expect(claims).toEqual(expect.arrayContaining([expect.objectContaining({ subjectId: 'zhu-wen', predicate: 'participated-in', objectId: 'tang-changan-end' })]));
  });
});
