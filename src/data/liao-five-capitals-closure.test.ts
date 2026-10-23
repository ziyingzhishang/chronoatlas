import { describe, expect, it } from 'vitest';
import { heritageAssets } from './heritage';
import { heritageDetails } from './heritage-details';
import { polityDetails } from './polity-details';

describe('辽五京遗产闭环', () => {
  it('为辽五京补齐遗产实体与详细介绍', () => {
    const khitan = polityDetails.find((detail) => detail.polityId === 'khitan');
    expect(khitan?.capitalPhases.map((capital) => capital.placeId)).toEqual([
      'liao_shangjing', 'liao_dongjing', 'liao_nanjing', 'liao_zhongjing', 'liao_xijing',
    ]);
    expect(khitan?.heritageIds).toEqual(expect.arrayContaining([
      'liao-shangjing-city-site', 'liao-dongjing-city-site', 'liao-nanjing-city-site',
      'liao-zhongjing-city-site', 'liao-xijing-city-site',
    ]));
    for (const heritageId of khitan?.heritageIds ?? []) {
      expect(heritageAssets.some((item) => item.id === heritageId), heritageId).toBe(true);
      expect(heritageDetails.some((detail) => detail.heritageId === heritageId), heritageId).toBe(true);
    }
  });
});
