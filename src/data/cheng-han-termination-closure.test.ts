import { describe, expect, test } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';

describe('Cheng Han termination closure', () => {
  test('records the 347 Eastern Jin conquest of Chengdu as the termination event', () => {
    const event = events.find((item) => item.id === 'cheng-han-ended-347');
    const detail = eventDetails.find((item) => item.eventId === 'cheng-han-ended-347');

    expect(event).toMatchObject({ year: 347, placeId: 'chengdu', datePrecision: 'year' });
    expect(detail).toMatchObject({ eventId: 'cheng-han-ended-347', polityIds: ['cheng_han', 'jin_eastern'], locationIds: ['chengdu'] });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'li-shi' }),
      expect.objectContaining({ personId: 'huan-wen' }),
    ]));
  });

  test('keeps Chengdu and its historical layer continuous after Cheng Han ends', () => {
    const polity = getPolityDetail('cheng_han');
    const heritage = heritageAssets.find((item) => item.id === 'cheng-han-chengdu-site');
    const detail = getHeritageDetail('cheng-han-chengdu-site');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'chengdu', validFrom: 304, validTo: 347 }),
    ]));
    expect(polity?.eventIds).toContain('cheng-han-ended-347');
    expect(heritage).toMatchObject({ placeId: 'chengdu' });
    expect(detail?.associatedEvents).toContain('cheng-han-ended-347');
  });

  test('exposes the last ruler and the Eastern Jin commander in the graph', () => {
    expect(people.find((person) => person.id === 'li-shi')).toMatchObject({ polityIds: ['cheng_han'] });
    expect(people.find((person) => person.id === 'huan-wen')).toMatchObject({ polityIds: ['jin_eastern'] });
    expect(getPersonDetail('li-shi')?.keyEvents).toContain('cheng-han-ended-347');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-li-shi-ruled-cheng-han' }),
      expect.objectContaining({ id: 'claim-li-shi-participated-cheng-han-ended-347' }),
      expect.objectContaining({ id: 'claim-li-shi-enemy-huan-wen-termination-347' }),
    ]));
  });
});
