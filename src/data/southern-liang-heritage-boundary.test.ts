import { describe, expect, it } from 'vitest';

import { heritageAssets } from './heritage';
import { heritageDetails } from './heritage-details';
import { polityDetails } from './polity-details';

describe('南凉遗产闭环边界', () => {
  it('links the polity to a cautious Ledu candidate heritage layer', () => {
    const asset = heritageAssets.find((item) => item.id === 'southern-liang-ledu-city-site');
    const detail = heritageDetails.find((item) => item.heritageId === 'southern-liang-ledu-city-site');
    const polity = polityDetails.find((item) => item.polityId === 'southern_liang');

    expect(asset?.placeId).toBe('ledu');
    expect(asset?.modernStatus).toBe('uncertain');
    expect(asset?.sourceIds).toEqual(expect.arrayContaining(['jinshu-vol126-tufa-wugu', 'mct-ledu-southern-liang']));
    expect(detail?.associatedPolities).toContain('southern_liang');
    expect(detail?.associatedEvents).toContain('southern-liang-founded');
    expect(detail?.uncertaintyNote).toMatch(/候选|待考古|不等同/);
    expect(polity?.heritageIds).toContain('southern-liang-ledu-city-site');
  });
});
