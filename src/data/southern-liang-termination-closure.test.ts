import { describe, expect, test } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';

describe('Southern Liang termination closure', () => {
  test('records the 414 Western Qin conquest as the termination event', () => {
    const event = events.find((item) => item.id === 'southern-liang-ended-414');
    const detail = eventDetails.find((item) => item.eventId === 'southern-liang-ended-414');

    expect(event).toMatchObject({ year: 414, placeId: 'ledu', datePrecision: 'year' });
    expect(detail).toMatchObject({
      eventId: 'southern-liang-ended-414',
      polityIds: ['southern_liang', 'western_qin'],
      locationIds: ['ledu'],
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'tufa-rutan' }),
      expect.objectContaining({ personId: 'qifu-chipan' }),
    ]));
  });

  test('keeps the Ledu capital phase and modern candidate heritage continuous', () => {
    const polity = getPolityDetail('southern_liang');
    const heritage = heritageAssets.find((item) => item.id === 'southern-liang-ledu-city-site');
    const detail = getHeritageDetail('southern-liang-ledu-city-site');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'ledu', validFrom: 402, validTo: 414 }),
    ]));
    expect(polity?.eventIds).toContain('southern-liang-ended-414');
    expect(heritage).toMatchObject({ placeId: 'ledu' });
    expect(detail?.associatedEvents).toContain('southern-liang-ended-414');
  });

  test('exposes the last ruler and the Southern Liang–Western Qin conflict', () => {
    expect(people.find((person) => person.id === 'tufa-rutan')).toMatchObject({ polityIds: ['southern_liang'] });
    expect(getPersonDetail('tufa-rutan')?.keyEvents).toContain('southern-liang-ended-414');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-tufa-rutan-ruled-southern-liang' }),
      expect.objectContaining({ id: 'claim-tufa-rutan-participated-southern-liang-ended-414' }),
      expect.objectContaining({ id: 'claim-tufa-rutan-enemy-qifu-chipan' }),
    ]));
  });
});
