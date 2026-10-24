import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { personDetails } from './person-details';
import { polityDetails } from './polity-details';

describe('Later Zhao termination closure', () => {
  it('records the 351 termination at Xiangguo without duplicating existing events', () => {
    const event = events.find((item) => item.id === 'later-zhao-ended-351');
    const detail = eventDetails.find((item) => item.eventId === 'later-zhao-ended-351');

    expect(event).toMatchObject({ year: 351, placeId: 'xiangguo', datePrecision: 'year' });
    expect(detail).toMatchObject({
      eventId: 'later-zhao-ended-351',
      polityIds: ['later_zhao'],
      locationIds: expect.arrayContaining(['xiangguo', 'ye']),
      relatedEventIds: expect.arrayContaining(['later-zhao-founded', 'later-zhao-moves-ye', 'former-yan-founded']),
    });
    expect(events.filter((item) => item.id === 'later-zhao-ended-351')).toHaveLength(1);
    expect(eventTimeReview.some((entry) => entry.eventId === 'later-zhao-ended-351')).toBe(true);
  });

  it('closes the ruler, capital, and Ye heritage chain', () => {
    const polity = polityDetails.find((detail) => detail.polityId === 'later_zhao');
    const lastRuler = personDetails.find((detail) => detail.personId === 'shi-zhi');
    const heritage = getHeritageDetail('ye-city-site');

    expect(people.find((person) => person.id === 'shi-zhi')).toMatchObject({ polityIds: ['later_zhao'] });
    expect(polity?.principalFigureIds).toEqual(expect.arrayContaining(['shi-le', 'shi-hu', 'shi-zhi']));
    expect(polity?.eventIds).toContain('later-zhao-ended-351');
    expect(capitalHistory).toEqual(expect.arrayContaining([
      expect.objectContaining({ polityId: 'later_zhao', placeId: 'ye', validFrom: 335, validTo: 351 }),
    ]));
    expect(lastRuler?.keyEvents).toContain('later-zhao-ended-351');
    expect(heritageAssets.find((item) => item.id === 'ye-city-site')).toMatchObject({ placeId: 'ye' });
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-later-zhao-ye-heritage', subjectId: 'later_zhao', objectId: 'ye-city-site' }),
    ]));
    expect(heritage?.associatedPolities).toEqual(expect.arrayContaining(['later_zhao', 'former_yan']));
  });

  it('records the bounded Former Yan inheritance relation and termination participants', () => {
    const detail = eventDetails.find((item) => item.eventId === 'later-zhao-ended-351');

    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'shi-zhi' }),
    ]));
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'claim-former-yan-inherited-later-zhao-ye',
        subjectId: 'former_yan',
        predicate: 'inherited-city-space',
        objectId: 'later_zhao',
        validFrom: 351,
        validTo: 352,
      }),
      expect.objectContaining({
        id: 'claim-shi-zhi-participated-later-zhao-ended-351',
        subjectId: 'shi-zhi',
        predicate: 'participated-in',
        objectId: 'later-zhao-ended-351',
      }),
      expect.objectContaining({
        id: 'claim-shi-hu-parent-shi-zhi',
        subjectId: 'shi-hu',
        predicate: 'parent-of',
        objectId: 'shi-zhi',
      }),
    ]));
  });
});
