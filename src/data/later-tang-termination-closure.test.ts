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

describe('Later Tang termination closure', () => {
  it('records the 936 Luoyang termination and Later Jin transition', () => {
    const event = events.find((item) => item.id === 'later-tang-ended-936');
    const detail = eventDetails.find((item) => item.eventId === 'later-tang-ended-936');

    expect(event).toMatchObject({
      id: 'later-tang-ended-936',
      year: 936,
      placeId: 'luoyang',
      datePrecision: 'year',
    });
    expect(detail).toMatchObject({
      eventId: 'later-tang-ended-936',
      polityIds: expect.arrayContaining(['tang_later', 'jin_later']),
      locationIds: ['luoyang'],
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'li-congke' }),
      expect.objectContaining({ personId: 'shi-jingtang' }),
    ]));
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
  });

  it('connects Li Congke, sourced relationships, and the Luoyang city layer', () => {
    const polity = getPolityDetail('tang_later');
    const person = people.find((item) => item.id === 'li-congke');
    const personDetail = getPersonDetail('li-congke');
    const heritage = heritageAssets.find((item) => item.id === 'later-tang-luoyang-city-site');
    const heritageDetail = getHeritageDetail('later-tang-luoyang-city-site');

    expect(person).toMatchObject({
      polityIds: ['tang_later'],
      roles: expect.arrayContaining(['末代统治者']),
    });
    expect(personDetail).toMatchObject({
      personId: 'li-congke',
      keyEvents: expect.arrayContaining(['later-tang-ended-936']),
    });
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-li-congke-ruled-later-tang' }),
      expect.objectContaining({ id: 'claim-li-congke-participated-later-tang-ended-936' }),
      expect.objectContaining({ id: 'claim-li-congke-enemy-shi-jingtang-termination-936' }),
    ]));

    expect(polity).toMatchObject({
      principalFigureIds: expect.arrayContaining(['li-congke']),
      eventIds: expect.arrayContaining(['later-tang-ended-936']),
      heritageIds: expect.arrayContaining(['later-tang-luoyang-city-site']),
    });
    expect(heritage).toMatchObject({ placeId: 'luoyang', constructionFrom: 923, constructionTo: 936 });
    expect(heritageDetail).toMatchObject({
      associatedEvents: expect.arrayContaining(['later-tang-ended-936']),
      associatedPeople: expect.arrayContaining(['li-cunxu', 'li-congke', 'shi-jingtang']),
      associatedPolities: expect.arrayContaining(['tang_later', 'jin_later']),
    });
  });
});
