import { describe, expect, test } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

describe('Later Shu termination closure', () => {
  test('records the 965 Chengdu surrender as the Later Shu termination event', () => {
    const event = events.find((item) => item.id === 'later-shu-ended-965');
    const detail = eventDetails.find((item) => item.eventId === 'later-shu-ended-965');

    expect(event).toMatchObject({ id: 'later-shu-ended-965', year: 965, placeId: 'chengdu', datePrecision: 'year' });
    expect(detail).toMatchObject({
      eventId: 'later-shu-ended-965',
      polityIds: ['later_shu', 'song_northern'],
      locationIds: ['chengdu'],
      relatedEventIds: expect.arrayContaining(['later-shu-founded']),
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'meng-chang' }),
      expect.objectContaining({ personId: 'zhao-kuangyin' }),
    ]));
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
  });

  test('keeps Chengdu heritage linked across the Later Shu and Northern Song transition', () => {
    const polity = getPolityDetail('later_shu');
    const heritage = heritageAssets.find((item) => item.id === 'later-shu-chengdu-city-site');
    const detail = getHeritageDetail('later-shu-chengdu-city-site');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'chengdu', validFrom: 934, validTo: 965 }),
    ]));
    expect(polity?.eventIds).toContain('later-shu-ended-965');
    expect(polity?.heritageIds).toContain('later-shu-chengdu-city-site');
    expect(heritage).toMatchObject({ placeId: 'chengdu', constructionFrom: 934, constructionTo: 965 });
    expect(detail?.associatedEvents).toContain('later-shu-ended-965');
    expect(detail?.associatedPolities).toEqual(expect.arrayContaining(['later_shu', 'song_northern']));
  });

  test('exposes Meng Chang as final ruler and Zhao Kuangyin as the transition figure', () => {
    expect(people.find((person) => person.id === 'meng-chang')).toMatchObject({ polityIds: ['later_shu'] });
    expect(getPersonDetail('meng-chang')).toMatchObject({
      personId: 'meng-chang',
      keyEvents: expect.arrayContaining(['later-shu-ended-965']),
    });
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-meng-chang-ruled-later-shu' }),
      expect.objectContaining({ id: 'claim-meng-chang-participated-later-shu-ended-965' }),
      expect.objectContaining({ id: 'claim-meng-chang-enemy-zhao-kuangyin-termination-965' }),
      expect.objectContaining({ id: 'claim-zhao-kuangyin-participated-later-shu-ended-965' }),
    ]));
  });
});
