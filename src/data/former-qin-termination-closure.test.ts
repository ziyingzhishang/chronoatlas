import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getPersonDetail } from './person-details';
import { polityDetails } from './polity-details';
import { heritageDetails } from './heritage-details';

describe('Former Qin termination closure', () => {
  it('records the 394 Mawei termination event from the polity perspective', () => {
    const event = events.find((item) => item.id === 'former-qin-ended-394');
    const detail = eventDetails.find((item) => item.eventId === 'former-qin-ended-394');
    const polity = polityDetails.find((item) => item.polityId === 'former_qin');

    expect(event).toMatchObject({ id: 'former-qin-ended-394', year: 394, placeId: 'changan' });
    expect(detail?.participants.map((item) => item.personId)).toEqual(expect.arrayContaining(['fu-deng', 'yao-xing']));
    expect(detail?.polityIds).toEqual(expect.arrayContaining(['former_qin']));
    expect(polity?.eventIds).toContain('former-qin-ended-394');
    expect(polity?.principalFigureIds).toContain('fu-deng');
  });

  it('connects Fu Deng, Yao Xing, and the Changan heritage layer', () => {
    expect(getPersonDetail('fu-deng')?.keyEvents).toContain('former-qin-ended-394');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-fu-deng-ruled-former-qin' }),
      expect.objectContaining({ id: 'claim-fu-deng-participated-former-qin-ended-394' }),
      expect.objectContaining({ id: 'claim-fu-deng-enemy-yao-xing-termination-394' }),
    ]));

    const heritage = heritageDetails.find((item) => item.heritageId === 'former-qin-changan-city-layer');
    expect(heritage?.associatedEvents).toContain('former-qin-ended-394');
    expect(heritage?.associatedPeople).toContain('fu-deng');
    expect(heritage?.associatedPolities).toEqual(expect.arrayContaining(['former_qin', 'later_qin']));
  });
});
