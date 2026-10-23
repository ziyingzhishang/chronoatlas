import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getEventDetail } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { getPolityDetail } from './polity-details';

describe('round 113 Changle Palace boundary', () => {
  it('keeps the palace site distinct from the general Han Changan construction event', () => {
    const heritage = getHeritageDetail('changle-palace-site');
    const capital = capitalHistory.find((term) => term.polityId === 'han_western' && term.placeId === 'changan');
    const polity = getPolityDetail('han_western');
    const cityConstruction = getEventDetail('han-changan-new-city');

    expect(heritage?.associatedPolities).toEqual(['han_western', 'xin']);
    expect(heritage?.associatedEvents).toContain('han-imperial-accession');
    expect(capital).toMatchObject({ validFrom: -200, placeId: 'changan', polityId: 'han_western' });
    expect(cityConstruction?.eventId).toBe('han-changan-new-city');
    expect(cityConstruction?.locationIds).toContain('changan');
    expect(cityConstruction?.polityIds).toEqual(['han_western']);
    expect(cityConstruction?.eventId).not.toBe('changle-palace-built');
    expect(polity?.heritageIds).not.toContain('changle-palace-site');
  });
});
