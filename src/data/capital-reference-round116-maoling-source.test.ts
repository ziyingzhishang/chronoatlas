import { describe, expect, it } from 'vitest';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { sourceById } from './sources';

describe('round 116 Maoling source closure', () => {
  it('anchors the 139 BCE construction start without inventing a Maoling event endpoint', () => {
    const asset = heritageAssets.find((item) => item.id === 'maoling');
    const detail = getHeritageDetail('maoling');

    expect(asset).toMatchObject({
      placeId: 'changan',
      constructionFrom: -139,
      sourceIds: expect.arrayContaining(['xian-local-chronicle-western-han-mausoleums']),
    });
    expect(detail?.constructionHistory[0]).toMatchObject({
      period: '前139年后营建',
      sourceIds: expect.arrayContaining(['xian-local-chronicle-western-han-mausoleums']),
    });
    expect(detail?.uncertaintyNote).toContain('不等于全部陵区建筑同年完成');
    expect(sourceById['xian-local-chronicle-western-han-mausoleums']?.scope).toContain('帝陵');
    expect(detail?.associatedEvents).toEqual(['han-imperial-accession']);
  });
});
