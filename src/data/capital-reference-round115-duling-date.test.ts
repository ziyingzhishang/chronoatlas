import { describe, expect, it } from 'vitest';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { sourceById } from './sources';

describe('round 115 Du Ling construction date correction', () => {
  it('separates Han Xuandi accession in 74 BCE from Du Ling construction in 65 BCE', () => {
    const asset = heritageAssets.find((item) => item.id === 'du-ling');
    const detail = getHeritageDetail('du-ling');

    expect(asset).toMatchObject({
      placeId: 'changan',
      constructionFrom: -65,
      sourceIds: expect.arrayContaining(['xian-local-chronicle-duling']),
    });
    expect(detail?.constructionHistory[0]).toMatchObject({
      period: '前65年后营建',
      sourceIds: expect.arrayContaining(['xian-local-chronicle-duling']),
    });
    expect(detail?.uncertaintyNote).toContain('前74年为汉宣帝即位年');
    expect(sourceById['xian-local-chronicle-duling']?.scope).toContain('杜陵');
  });
});
