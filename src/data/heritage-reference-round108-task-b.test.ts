import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { getEventDetail } from './event-details';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { getPolityDetail } from './polity-details';
import { polities } from './polities';
import { sourceById } from './sources';

describe('round 108 task B Sui-Tang heritage reference', () => {
  it('closes the Tang Xiaoyan Pagoda heritage link with single-polity endpoints', () => {
    const asset = heritageAssets.find((item) => item.id === 'xiao-yan-ta');
    const heritage = getHeritageDetail('xiao-yan-ta');
    const tang = polities.find((item) => item.id === 'tang');
    const tangDetail = getPolityDetail('tang');
    const changanTerms = capitalHistory.filter((term) => term.polityId === 'tang' && term.placeId === 'changan');
    const original = heritage?.constructionHistory.find((phase) => phase.type === 'original');

    expect(asset).toMatchObject({
      id: 'xiao-yan-ta',
      placeId: 'changan',
      constructionFrom: 707,
      modernStatus: 'extant',
    });
    expect(asset?.sourceIds).toEqual(expect.arrayContaining(['modern-geography-reference', 'xiao-yan-ta-official-digital']));
    expect(heritage).toMatchObject({
      heritageId: 'xiao-yan-ta',
      associatedPolities: ['tang'],
      associatedEvents: ['tang-founded', 'xuanzang-translations'],
    });
    expect(heritage?.modernLocation).toContain('西安市');
    expect(original).toMatchObject({ from: 707, to: 710 });
    expect(original?.sourceIds).toEqual(expect.arrayContaining(['zizhi-tongjian', 'modern-geography-reference']));
    expect(heritage?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    expect(tang).toBeDefined();
    expect(tangDetail?.heritageIds).toContain('xiao-yan-ta');
    expect(tangDetail?.heritageIds).not.toContain('taiji-palace-site');
    expect(changanTerms).toEqual([
      expect.objectContaining({ polityId: 'tang', placeId: 'changan', validFrom: 618, validTo: 907 }),
    ]);
    expect(changanTerms.some((term) => (term.validFrom ?? Infinity) <= 707 && 707 <= (term.validTo ?? -Infinity))).toBe(true);
  });

  it('does not mistake the unresolved Xuanzang endpoint for a new heritage fact', () => {
    const event = events.find((item) => item.id === 'xuanzang-translations');
    const detail = getEventDetail('xuanzang-translations');

    expect(event).toBeUndefined();
    expect(detail).toBeUndefined();
    expect(getHeritageDetail('xiao-yan-ta')?.associatedEvents).toContain('xuanzang-translations');
  });
});
