import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { heritageDetails } from './heritage-details';
import { heritageAssets } from './heritage';
import { personDetails } from './person-details';
import { people } from './people';
import { places } from './places';
import { polityDetails } from './polity-details';

describe('Southern Song termination closure', () => {
  it('separates the 1279 polity termination from the Linan city perspective', () => {
    const event = events.find((item) => item.id === 'southern-song-ended-1279');
    const detail = eventDetails.find((item) => item.eventId === 'southern-song-ended-1279');
    const review = eventTimeReview.find((item) => item.eventId === 'southern-song-ended-1279');

    expect(event).toMatchObject({ year: 1279, placeId: 'yamen', datePrecision: 'approximate' });
    expect(detail?.polityIds).toEqual(expect.arrayContaining(['song_south', 'yuan']));
    expect(detail?.locationIds).toContain('yamen');
    expect(detail?.participants.map((item) => item.personId)).toEqual(expect.arrayContaining(['zhao-bing', 'lu-xiufu', 'kublai', 'bayan']));
    expect(review).toMatchObject({ status: 'approximate', expectedPrecision: 'approximate', timelineStrategy: 'approximate-marker' });
  });

  it('connects the final battle place and heritage to present-day geography', () => {
    const place = places.find((item) => item.id === 'yamen');
    const asset = heritageAssets.find((item) => item.id === 'yamen-song-yuan-battle-site');
    const heritage = heritageDetails.find((item) => item.heritageId === 'yamen-song-yuan-battle-site');

    expect(place).toMatchObject({ historicalName: '崖门', modernName: '江门市', mappingStatus: 'approximate' });
    expect(asset).toMatchObject({ placeId: 'yamen', constructionFrom: 1279 });
    expect(heritage?.associatedPeople).toEqual(expect.arrayContaining(['zhao-bing', 'lu-xiufu']));
    expect(heritage?.associatedEvents).toContain('southern-song-ended-1279');
  });

  it('adds the final ruler and the Song-Yuan conflict edges without rewriting earlier Southern Song phases', () => {
    const polity = polityDetails.find((item) => item.polityId === 'song_south');

    expect(people.find((item) => item.id === 'zhao-bing')).toBeDefined();
    expect(people.find((item) => item.id === 'lu-xiufu')).toBeDefined();
    expect(personDetails.find((item) => item.personId === 'zhao-bing')?.keyEvents).toContain('southern-song-ended-1279');
    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'linan', validFrom: 1127, validTo: 1279 }),
    ]));
    expect(polity?.eventIds).toContain('southern-song-ended-1279');
    expect(polity?.heritageIds).toContain('linan-southern-song-imperial-city-site');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'zhao-bing', predicate: 'ruled', objectId: 'song_south' }),
      expect.objectContaining({ subjectId: 'zhao-bing', predicate: 'participated-in', objectId: 'southern-song-ended-1279' }),
      expect.objectContaining({ subjectId: 'zhao-bing', predicate: 'enemy-of', objectId: 'kublai' }),
      expect.objectContaining({ subjectId: 'lu-xiufu', predicate: 'served', objectId: 'zhao-bing' }),
    ]));
  });
});
