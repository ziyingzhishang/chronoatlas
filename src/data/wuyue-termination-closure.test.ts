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

describe('Wuyue termination closure', () => {
  test('records the 978 Hangzhou submission as the Wuyue termination event', () => {
    const event = events.find((item) => item.id === 'wuyue-ended-978');
    const detail = eventDetails.find((item) => item.eventId === 'wuyue-ended-978');

    expect(event).toMatchObject({ id: 'wuyue-ended-978', year: 978, placeId: 'hangzhou', datePrecision: 'year' });
    expect(detail).toMatchObject({
      eventId: 'wuyue-ended-978',
      polityIds: ['wuyue', 'song_northern'],
      locationIds: ['hangzhou'],
      relatedEventIds: expect.arrayContaining(['wuyue-founded']),
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'qian-chu' }),
      expect.objectContaining({ personId: 'taizong-song' }),
    ]));
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
  });

  test('keeps Hangzhou capital and Qian King heritage continuous across the Song transition', () => {
    const polity = getPolityDetail('wuyue');
    const heritage = heritageAssets.find((item) => item.id === 'wuyue-qian-king-mausoleum');
    const detail = getHeritageDetail('wuyue-qian-king-mausoleum');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'hangzhou', validFrom: 907, validTo: 978 }),
    ]));
    expect(polity?.eventIds).toEqual(expect.arrayContaining(['wuyue-founded', 'wuyue-ended-978']));
    expect(polity?.heritageIds).toContain('wuyue-qian-king-mausoleum');
    expect(heritage).toMatchObject({ placeId: 'hangzhou', constructionFrom: 932 });
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['wuyue-founded', 'wuyue-ended-978']));
    expect(detail?.associatedPolities).toEqual(expect.arrayContaining(['wuyue', 'song_northern']));
  });

  test('exposes Qian Chu as the final ruler and preserves the submission relationship graph', () => {
    expect(people.find((person) => person.id === 'qian-chu')).toMatchObject({ polityIds: ['wuyue'] });
    expect(getPersonDetail('qian-chu')).toMatchObject({
      personId: 'qian-chu',
      keyEvents: expect.arrayContaining(['wuyue-ended-978']),
    });
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-qian-chu-ruled-wuyue' }),
      expect.objectContaining({ id: 'claim-qian-chu-participated-wuyue-ended-978' }),
      expect.objectContaining({ id: 'claim-qian-chu-submitted-to-zhao-kuangyi-termination-978' }),
      expect.objectContaining({ id: 'claim-qian-chu-served-zhao-kuangyi-after-submission' }),
      expect.objectContaining({ id: 'claim-zhao-kuangyi-participated-wuyue-ended-978' }),
    ]));
  });
});
