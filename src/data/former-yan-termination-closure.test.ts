import { describe, expect, test } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';

describe('Former Yan termination closure', () => {
  test('records the 370 Former Qin conquest of Ye as the termination event', () => {
    const event = events.find((item) => item.id === 'former-yan-ended-370');
    const detail = eventDetails.find((item) => item.eventId === 'former-yan-ended-370');

    expect(event).toMatchObject({ year: 370, placeId: 'ye', datePrecision: 'year' });
    expect(detail).toMatchObject({ eventId: 'former-yan-ended-370', polityIds: ['former_yan', 'former_qin'], locationIds: ['ye'] });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'murong-wei' }),
      expect.objectContaining({ personId: 'fu-jian' }),
    ]));
  });

  test('keeps the Ye capital phase and multi-polity heritage layer continuous', () => {
    const polity = getPolityDetail('former_yan');
    const heritage = heritageAssets.find((item) => item.id === 'ye-city-site');
    const detail = getHeritageDetail('ye-city-site');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'ye', validFrom: 351, validTo: 370 }),
    ]));
    expect(polity?.eventIds).toContain('former-yan-ended-370');
    expect(heritage).toMatchObject({ placeId: 'ye' });
    expect(detail?.associatedEvents).toContain('former-yan-ended-370');
  });

  test('exposes the last ruler and conquering ruler relationship', () => {
    expect(people.find((person) => person.id === 'murong-wei')).toMatchObject({ polityIds: ['former_yan'] });
    expect(getPersonDetail('murong-wei')?.keyEvents).toContain('former-yan-ended-370');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-murong-wei-ruled-former-yan' }),
      expect.objectContaining({ id: 'claim-murong-wei-participated-former-yan-ended-370' }),
      expect.objectContaining({ id: 'claim-murong-wei-enemy-fu-jian-termination-370' }),
    ]));
  });
});
