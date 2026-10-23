import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageDetails } from './heritage-details';
import { polityDetails } from './polity-details';

describe('南凉与南朝梁事件语义边界', () => {
  it('does not reuse the Southern Liang dynasty foundation node for the Southern Liang regime', () => {
    const southernLiangDynasty = eventDetails.find((detail) => detail.eventId === 'southern-liang-founded');
    const southernLiangRegime = events.find((event) => event.id === 'southern-liang-founded-397');
    const southernLiangRegimeDetail = eventDetails.find((detail) => detail.eventId === southernLiangRegime?.id);
    const polity = polityDetails.find((detail) => detail.polityId === 'southern_liang');
    const heritage = heritageDetails.find((detail) => detail.heritageId === 'southern-liang-ledu-city-site');
    const claim = claims.find((item) => item.id === 'claim-tufa-wugu-participated-southern-liang-founded-397');

    expect(southernLiangDynasty?.polityIds).toEqual(['liang_southern']);
    expect(southernLiangRegime).toMatchObject({
      year: 397,
      datePrecision: 'approximate',
      placeId: 'xiping',
      verification: 'partial',
    });
    expect(southernLiangRegimeDetail).toMatchObject({
      eventId: 'southern-liang-founded-397',
      polityIds: ['southern_liang'],
      locationIds: ['xiping'],
    });
    expect(southernLiangRegimeDetail?.participants).toEqual([
      expect.objectContaining({ personId: 'tufa-wugu', relationType: 'direct' }),
    ]);
    expect(polity?.eventIds).toContain('southern-liang-founded-397');
    expect(polity?.eventIds).not.toContain('southern-liang-founded');
    expect(heritage?.associatedEvents).toContain('southern-liang-founded-397');
    expect(claim).toMatchObject({
      subjectId: 'tufa-wugu',
      predicate: 'participated-in',
      objectId: 'southern-liang-founded-397',
      validFrom: 397,
      validTo: 397,
    });
  });
});
