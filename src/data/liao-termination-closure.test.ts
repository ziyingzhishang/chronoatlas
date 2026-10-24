import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { getPersonDetail } from './person-details';
import { people } from './people';
import { getPolityDetail } from './polity-details';
import { places } from './places';

describe('辽终结闭环', () => {
  it('补齐1125年政权终止、末代人物与五京承接链', () => {
    const event = events.find((item) => item.id === 'liao-ended-1125');
    const detail = eventDetails.find((item) => item.eventId === 'liao-ended-1125');
    const review = eventTimeReview.find((item) => item.eventId === 'liao-ended-1125');
    const polity = getPolityDetail('khitan');
    const lastRuler = people.find((item) => item.id === 'yelu-yanxi');
    const capitalPlaces = ['liao_shangjing', 'liao_dongjing', 'liao_nanjing', 'liao_zhongjing', 'liao_xijing'];

    expect(event).toMatchObject({
      id: 'liao-ended-1125',
      year: 1125,
      placeId: 'liao_shangjing',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'liao-ended-1125',
      polityIds: ['khitan', 'jin_jurchen'],
      locationIds: expect.arrayContaining(['liao_shangjing', 'liao_dongjing', 'liao_zhongjing', 'liao_xijing']),
    });
    expect(review).toMatchObject({ eventId: 'liao-ended-1125', status: 'confirmed', expectedPrecision: 'year' });
    expect(lastRuler).toBeDefined();
    expect(getPersonDetail('yelu-yanxi')?.keyEvents).toContain('liao-ended-1125');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-yelu-yanxi-participated-liao-ended-1125', objectId: 'liao-ended-1125' }),
      expect.objectContaining({ id: 'claim-yelu-yanxi-enemy-wanyan-aguda-liao-termination-1125', objectId: 'wanyan-aguda' }),
    ]));
    expect(polity?.eventIds).toContain('liao-ended-1125');
    expect(polity?.principalFigureIds).toContain('yelu-yanxi');
    for (const placeId of capitalPlaces) {
      expect(places.some((place) => place.id === placeId), placeId).toBe(true);
    }
    for (const heritageId of polity?.heritageIds ?? []) {
      expect(getHeritageDetail(heritageId), heritageId).toBeDefined();
    }
    expect(getHeritageDetail('liao-shangjing-city-site')?.associatedEvents).toContain('liao-ended-1125');
    expect(getHeritageDetail('liao-xijing-city-site')?.associatedEvents).toContain('liao-ended-1125');
  });

  it('明确天祚帝与西辽形成不是同一事件', () => {
    const detail = eventDetails.find((item) => item.eventId === 'liao-ended-1125');
    expect(detail?.relatedEventIds).toEqual(expect.arrayContaining(['western-liao-founded']));
    expect(detail?.uncertaintyNote).toContain('西辽');
  });
});
