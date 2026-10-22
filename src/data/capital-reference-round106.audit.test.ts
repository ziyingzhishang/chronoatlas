import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { getEventDetail } from './event-details';
import { getPolityDetail } from './polity-details';
import { polities } from './polities';
import { places } from './places';

const qinCapital = capitalHistory.find((term) => term.polityId === 'qin' && term.placeId === 'xianyang');
const qinEvent = events.find((event) => event.id === 'qin-xianyang-unification');
const qinEventDetail = getEventDetail('qin-xianyang-unification');

describe('round 106 capital reference audit', () => {
  it('closes the Qin Xianyang unification event reference with aligned endpoints', () => {
    const polity = polities.find((item) => item.id === 'qin');
    const place = places.find((item) => item.id === 'xianyang');
    const detail = getPolityDetail('qin');

    expect(qinCapital).toMatchObject({ polityId: 'qin', placeId: 'xianyang', validFrom: -221, validTo: -206 });
    expect(qinEvent).toMatchObject({ id: 'qin-xianyang-unification', year: -221, placeId: 'xianyang' });
    expect(qinEventDetail?.polityIds).toContain('qin');
    expect(qinEventDetail?.locationIds).toContain('xianyang');
    expect(qinEvent?.year).toBeGreaterThanOrEqual(qinCapital?.validFrom ?? Number.POSITIVE_INFINITY);
    expect(qinEvent?.year).toBeLessThanOrEqual(qinCapital?.validTo ?? Number.NEGATIVE_INFINITY);
    expect(polity?.id).toBe('qin');
    expect(place?.id).toBe('xianyang');
    expect(detail?.eventIds).toContain('qin-xianyang-unification');
  });
});
