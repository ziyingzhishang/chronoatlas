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

describe('Later Liang termination closure', () => {
  it('records the 923 Kaifeng termination and successor transition', () => {
    const event = events.find((item) => item.id === 'later-liang-ended-923');
    const detail = eventDetails.find((item) => item.eventId === 'later-liang-ended-923');

    expect(event).toMatchObject({ id: 'later-liang-ended-923', year: 923, placeId: 'kaifeng', datePrecision: 'year' });
    expect(detail).toMatchObject({
      eventId: 'later-liang-ended-923',
      polityIds: expect.arrayContaining(['liang_later', 'tang_later']),
      locationIds: ['kaifeng'],
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'zhu-youzhen' }),
      expect.objectContaining({ personId: 'li-cunxu' }),
    ]));
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
  });

  it('connects the last ruler, person relationships, and Kaifeng city layer', () => {
    const polity = getPolityDetail('liang_later');
    const heritage = heritageAssets.find((item) => item.id === 'later-liang-kaifeng-city-layer');
    const heritageDetail = getHeritageDetail('later-liang-kaifeng-city-layer');

    expect(people.find((person) => person.id === 'zhu-youzhen')).toMatchObject({
      polityIds: ['liang_later'],
      roles: expect.arrayContaining(['末代统治者']),
    });
    expect(getPersonDetail('zhu-youzhen')).toMatchObject({
      personId: 'zhu-youzhen',
      keyEvents: expect.arrayContaining(['later-liang-ended-923']),
    });
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-zhu-youzhen-ruled-later-liang' }),
      expect.objectContaining({ id: 'claim-zhu-youzhen-participated-later-liang-ended-923' }),
      expect.objectContaining({ id: 'claim-zhu-youzhen-enemy-li-cunxu-termination-923' }),
    ]));

    expect(polity).toMatchObject({
      principalFigureIds: expect.arrayContaining(['zhu-youzhen']),
      eventIds: expect.arrayContaining(['later-liang-ended-923']),
      heritageIds: expect.arrayContaining(['later-liang-kaifeng-city-layer']),
    });
    expect(heritage).toMatchObject({ placeId: 'kaifeng', constructionFrom: 907, constructionTo: 923 });
    expect(heritageDetail).toMatchObject({
      associatedEvents: expect.arrayContaining(['later-liang-ended-923']),
      associatedPeople: expect.arrayContaining(['zhu-wen', 'zhu-youzhen']),
      associatedPolities: expect.arrayContaining(['liang_later', 'tang_later']),
    });
  });
});
