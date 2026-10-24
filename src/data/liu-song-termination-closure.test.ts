import { describe, expect, test } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';

describe('Liu Song termination closure', () => {
  test('records the 479 abdication as a separate polity termination and Southern Qi succession event', () => {
    const event = events.find((item) => item.id === 'liu-song-ended-479');
    const detail = eventDetails.find((item) => item.eventId === 'liu-song-ended-479');

    expect(event).toMatchObject({
      year: 479,
      placeId: 'jiankang',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'liu-song-ended-479',
      polityIds: ['song_southern', 'qi_southern'],
      locationIds: ['jiankang'],
    });
    expect(detail?.participants.map((participant) => participant.personId)).toEqual(
      expect.arrayContaining(['liu-zhun', 'xiao-daocheng']),
    );
    expect(eventTimeReview.find((item) => item.eventId === 'liu-song-ended-479')).toMatchObject({
      status: 'confirmed',
      expectedPrecision: 'year',
    });
  });

  test('keeps Jiankang and layered Southern Dynasties heritage after the abdication', () => {
    const detail = getPolityDetail('song_southern');
    const heritageDetail = getHeritageDetail('jiankang-six-dynasties-city-site');
    const stoneCarvings = getHeritageDetail('southern-dynasties-stone-carvings');

    expect(detail?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'jiankang', validFrom: 420, validTo: 479 }),
    ]));
    expect(detail?.eventIds).toEqual(expect.arrayContaining(['liu-song-founded', 'liu-song-ended-479']));
    expect(detail?.heritageIds).toEqual(expect.arrayContaining(['jiankang-six-dynasties-city-site', 'southern-dynasties-stone-carvings']));
    expect(heritageDetail?.associatedEvents).toContain('liu-song-ended-479');
    expect(stoneCarvings?.associatedEvents).toContain('liu-song-ended-479');
    expect(heritageDetail?.associatedPolities).toEqual(expect.arrayContaining(['song_southern', 'qi_southern']));
  });

  test('exposes the final ruler and successor relationship in the graph', () => {
    expect(getPersonDetail('liu-zhun')?.keyEvents).toContain('liu-song-ended-479');
    expect(getPersonDetail('xiao-daocheng')?.keyEvents).toContain('liu-song-ended-479');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-liu-zhun-participated-liu-song-ended-479', predicate: 'participated-in', objectId: 'liu-song-ended-479' }),
      expect.objectContaining({ id: 'claim-liu-zhun-enemy-xiao-daocheng-liu-song-termination-479', predicate: 'enemy-of', objectId: 'xiao-daocheng' }),
      expect.objectContaining({ id: 'claim-xiao-daocheng-participated-liu-song-ended-479', predicate: 'participated-in', objectId: 'liu-song-ended-479' }),
    ]));
  });
});
