import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

describe('Later Zhou termination closure', () => {
  it('separates the 960 Chenqiao transition from the Northern Song establishment node', () => {
    const event = events.find((item) => item.id === 'later-zhou-ended-960');
    const detail = eventDetails.find((item) => item.eventId === 'later-zhou-ended-960');

    expect(event).toMatchObject({
      id: 'later-zhou-ended-960',
      year: 960,
      placeId: 'kaifeng',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'later-zhou-ended-960',
      polityIds: expect.arrayContaining(['zhou_later', 'song_northern']),
      locationIds: ['kaifeng'],
      relatedEventIds: expect.arrayContaining(['zhou-later-founded', 'northern-song-founded']),
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'chai-zongxun' }),
      expect.objectContaining({ personId: 'zhao-kuangyin' }),
    ]));
    expect(detail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '陈桥拥立', startYear: 960, endYear: 960 }),
      expect.objectContaining({ label: '回师受禅与后周终止', startYear: 960, endYear: 960 }),
    ]));
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
  });

  it('keeps the Guo Wei–Chai Rong–Zhao Kuangyin succession and service graph sourced', () => {
    expect(people.find((item) => item.id === 'chai-rong')).toMatchObject({
      aliases: expect.arrayContaining(['郭荣', '周世宗']),
      polityIds: ['zhou_later'],
    });
    expect(getPersonDetail('chai-rong')).toMatchObject({
      personId: 'chai-rong',
      keyEvents: expect.arrayContaining(['zhou-later-founded']),
    });
    expect(getPersonDetail('chai-zongxun')).toMatchObject({
      personId: 'chai-zongxun',
      keyEvents: expect.arrayContaining(['later-zhou-ended-960']),
    });
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-chai-rong-child-guo-wei', predicate: 'child-of' }),
      expect.objectContaining({ id: 'claim-zhao-kuangyin-served-chai-rong', predicate: 'served' }),
      expect.objectContaining({ id: 'claim-chai-zongxun-ruled-later-zhou', predicate: 'ruled' }),
      expect.objectContaining({ id: 'claim-chai-zongxun-participated-later-zhou-ended-960', predicate: 'participated-in' }),
      expect.objectContaining({ id: 'claim-zhao-kuangyin-participated-later-zhou-ended-960', predicate: 'participated-in' }),
    ]));
    expect(claims.find((claim) => claim.id === 'claim-zhao-kuangyin-served-guo-wei')).toBeDefined();
  });

  it('connects the Later Zhou capital phase to a present-day Kaifeng heritage layer', () => {
    const polity = getPolityDetail('zhou_later');
    const heritage = heritageAssets.find((item) => item.id === 'kaifeng-later-zhou-city-layer');
    const heritageDetail = getHeritageDetail('kaifeng-later-zhou-city-layer');

    expect(polity).toMatchObject({
      principalFigureIds: expect.arrayContaining(['guo-wei', 'chai-rong']),
      eventIds: expect.arrayContaining(['zhou-later-founded', 'later-zhou-ended-960']),
      heritageIds: expect.arrayContaining(['kaifeng-later-zhou-city-layer']),
      capitalPhases: expect.arrayContaining([
        expect.objectContaining({ placeId: 'kaifeng', validFrom: 951, validTo: 960 }),
      ]),
    });
    expect(heritage).toMatchObject({
      id: 'kaifeng-later-zhou-city-layer',
      placeId: 'kaifeng',
      constructionFrom: 951,
      constructionTo: 960,
    });
    expect(heritageDetail).toMatchObject({
      associatedEvents: expect.arrayContaining(['zhou-later-founded', 'later-zhou-ended-960']),
      associatedPeople: expect.arrayContaining(['guo-wei', 'chai-rong', 'chai-zongxun', 'zhao-kuangyin']),
      associatedPolities: expect.arrayContaining(['zhou_later', 'song_northern']),
    });
  });
});
