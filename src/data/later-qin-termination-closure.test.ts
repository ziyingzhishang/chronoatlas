import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { changanEvents } from './changan-study';
import { getPersonDetail } from './person-details';
import { polityDetails } from './polity-details';
import { heritageDetails } from './heritage-details';

describe('Later Qin termination closure', () => {
  it('records the 417 Changan termination from the polity perspective', () => {
    const event = changanEvents.find((item) => item.id === 'later-qin-falls-changan');
    const detail = eventDetails.find((item) => item.eventId === 'later-qin-falls-changan');
    const polity = polityDetails.find((item) => item.polityId === 'later_qin');

    expect(event).toMatchObject({ id: 'later-qin-falls-changan', year: 417, placeId: 'changan' });
    expect(detail?.participants.map((item) => item.personId)).toEqual(expect.arrayContaining(['yao-hong', 'liu-yu']));
    expect(polity?.eventIds).toContain('later-qin-falls-changan');
    expect(polity?.principalFigureIds).toContain('yao-hong');
  });

  it('connects Yao Hong and Changan heritage continuity', () => {
    expect(getPersonDetail('yao-hong')?.keyEvents).toContain('later-qin-falls-changan');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-yao-hong-ruled-later-qin' }),
      expect.objectContaining({ id: 'claim-yao-hong-participated-later-qin-falls-changan' }),
      expect.objectContaining({ id: 'claim-yao-hong-enemy-liu-yu-termination-417' }),
    ]));

    const heritage = heritageDetails.find((item) => item.heritageId === 'later-qin-changan-city-layer');
    expect(heritage?.associatedEvents).toEqual(expect.arrayContaining(['later-qin-falls-changan']));
    expect(heritage?.associatedPeople).toContain('yao-hong');
    expect(heritage?.associatedPolities).toEqual(expect.arrayContaining(['later_qin', 'jin_eastern']));
  });
});
