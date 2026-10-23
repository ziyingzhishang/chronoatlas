import { describe, expect, test } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';

describe('Former Zhao termination closure', () => {
  test('records the 329 fall at Chang’an as a separate termination event', () => {
    const event = events.find((item) => item.id === 'former-zhao-ended-329');
    const detail = eventDetails.find((item) => item.eventId === 'former-zhao-ended-329');

    expect(event).toMatchObject({ year: 329, placeId: 'changan', datePrecision: 'year' });
    expect(detail).toMatchObject({ eventId: 'former-zhao-ended-329', polityIds: ['former_zhao', 'later_zhao'], locationIds: ['changan'] });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'liu-yao' }),
      expect.objectContaining({ personId: 'shi-le' }),
    ]));
  });

  test('keeps the Chang’an capital phase and city heritage continuous after termination', () => {
    const polity = getPolityDetail('former_zhao');
    const heritage = heritageAssets.find((item) => item.id === 'former-zhao-changan-city-layer');
    const detail = getHeritageDetail('former-zhao-changan-city-layer');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'changan', validFrom: 304, validTo: 329 }),
    ]));
    expect(polity?.eventIds).toContain('former-zhao-ended-329');
    expect(heritage).toMatchObject({ placeId: 'changan' });
    expect(detail?.associatedEvents).toContain('former-zhao-ended-329');
  });

  test('exposes Liu Yao and Shi Le as the termination relationship pair', () => {
    expect(getPersonDetail('liu-yao')?.keyEvents).toContain('former-zhao-ended-329');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-liu-yao-participated-former-zhao-ended-329' }),
      expect.objectContaining({ id: 'claim-liu-yao-enemy-shi-le-termination-329' }),
    ]));
  });
});
