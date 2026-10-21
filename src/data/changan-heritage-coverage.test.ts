import { describe, expect, it } from 'vitest';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';

describe('Chang’an heritage asset coverage', () => {
  it('contains at least 20 complete heritage assets with matching details', () => {
    const changanAssets = heritageAssets.filter((asset) => asset.placeId === 'changan');

    expect(changanAssets.length).toBeGreaterThanOrEqual(20);
    expect(changanAssets.every((asset) => {
      const detail = getHeritageDetail(asset.id);

      return Boolean(
        asset.placeId
        && asset.type
        && asset.constructionFrom !== undefined
        && asset.modernStatus
        && asset.description
        && asset.sourceIds.length > 0
        && detail
        && detail.constructionHistory.length > 0
        && detail.historicalAssociations.length > 0
        && detail.survivingFeatures.length > 0
        && detail.presentDayValue
        && detail.uncertaintyNote
        && detail.sourceIds.length > 0,
      );
    })).toBe(true);
  });
});
