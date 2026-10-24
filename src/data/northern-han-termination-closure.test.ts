import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPersonDetail } from './person-details';
import { people } from './people';
import { getPolityDetail } from './polity-details';

describe('Northern Han termination closure', () => {
  it('separates the 979 Northern Han termination from the later local reception process', () => {
    const event = events.find((item) => item.id === 'northern-han-ended-979');
    const detail = eventDetails.find((item) => item.eventId === 'northern-han-ended-979');
    const review = eventTimeReview.find((item) => item.eventId === 'northern-han-ended-979');

    expect(event).toMatchObject({
      id: 'northern-han-ended-979',
      year: 979,
      placeId: 'taiyuan',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'northern-han-ended-979',
      polityIds: expect.arrayContaining(['northern_han', 'song_northern']),
      locationIds: expect.arrayContaining(['taiyuan']),
      relatedEventIds: expect.arrayContaining(['northern-han-founded']),
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'liu-jiyuan' }),
      expect.objectContaining({ personId: 'taizong-song' }),
    ]));
    expect(detail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '太原城破与刘继元出降', startYear: 979, endYear: 979 }),
      expect.objectContaining({ label: '地方接收与行政重组', startYear: 979, endYear: 979 }),
    ]));
    expect(review).toMatchObject({ status: 'confirmed', expectedPrecision: 'year', timelineStrategy: 'year-marker' });
  });

  it('connects Taiyuan and the Jinyang heritage layer across polity termination', () => {
    const polity = getPolityDetail('northern_han');
    const heritage = heritageAssets.find((item) => item.id === 'jinyang-ancient-city-site');
    const heritageDetail = getHeritageDetail('jinyang-ancient-city-site');

    expect(polity).toMatchObject({
      eventIds: expect.arrayContaining(['northern-han-founded', 'northern-han-ended-979']),
      heritageIds: expect.arrayContaining(['jinyang-ancient-city-site']),
      capitalPhases: expect.arrayContaining([
        expect.objectContaining({ placeId: 'taiyuan', validFrom: 951, validTo: 979 }),
      ]),
    });
    expect(heritage).toMatchObject({ placeId: 'taiyuan', constructionFrom: 550 });
    expect(heritageDetail).toMatchObject({
      associatedEvents: expect.arrayContaining(['northern-han-founded', 'northern-han-ended-979']),
      associatedPeople: expect.arrayContaining(['liu-min', 'liu-jiyuan', 'taizong-song']),
      associatedPolities: expect.arrayContaining(['northern_han', 'song_northern']),
    });
  });

  it('exposes Liu Jiyuan and the late Northern Han relationship graph', () => {
    expect(people.find((item) => item.id === 'liu-jiyuan')).toMatchObject({
      name: '刘继元',
      polityIds: ['northern_han'],
    });
    expect(getPersonDetail('liu-jiyuan')).toMatchObject({
      personId: 'liu-jiyuan',
      keyEvents: expect.arrayContaining(['northern-han-ended-979']),
    });
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-liu-jiyuan-ruled-northern-han', predicate: 'ruled', objectId: 'northern_han' }),
      expect.objectContaining({ id: 'claim-liu-jiyuan-participated-northern-han-ended-979', predicate: 'participated-in', objectId: 'northern-han-ended-979' }),
      expect.objectContaining({ id: 'claim-liu-jiyuan-enemy-taizong-song-termination-979', predicate: 'enemy-of', objectId: 'taizong-song' }),
    ]));
  });
});
