import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { getEventDetail } from './event-details';
import { getPolityDetail } from './polity-details';
import { places } from './places';
import { polities } from './polities';

describe('round 107 capital reference audit', () => {
  it('closes only the Eastern Han Luoyang capital-setting event', () => {
    const capital = capitalHistory.find((term) => term.polityId === 'han_eastern' && term.placeId === 'luoyang');
    const event = events.find((item) => item.id === 'eastern-han-moves-luoyang');
    const eventDetail = getEventDetail('eastern-han-moves-luoyang');
    const polity = polities.find((item) => item.id === 'han_eastern');
    const place = places.find((item) => item.id === 'luoyang');
    const detail = getPolityDetail('han_eastern');

    expect(capital).toMatchObject({ polityId: 'han_eastern', placeId: 'luoyang', validFrom: 25, validTo: 220 });
    expect(event).toMatchObject({ id: 'eastern-han-moves-luoyang', year: 25, placeId: 'luoyang' });
    expect(eventDetail?.polityIds).toContain('han_eastern');
    expect(eventDetail?.locationIds).toContain('luoyang');
    expect(event?.year).toBeGreaterThanOrEqual(capital?.validFrom ?? Number.POSITIVE_INFINITY);
    expect(event?.year).toBeLessThanOrEqual(capital?.validTo ?? Number.NEGATIVE_INFINITY);
    expect(polity?.capitalPlaceId).toBe('luoyang');
    expect(place?.id).toBe('luoyang');
    expect(detail?.eventIds).toContain('eastern-han-moves-luoyang');
  });
});
