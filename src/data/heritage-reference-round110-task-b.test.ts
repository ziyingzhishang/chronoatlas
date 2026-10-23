import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';
import { polities } from './polities';
import { sourceById } from './sources';

const round110Candidates = [
  'taiji-palace-site',
  'hanguang-gate-site',
  'mingde-gate-site',
  'dingding-gate-site',
  'qianling',
  'ximing-temple-site',
  'huaqing-palace',
] as const;

describe('round 110 task B Sui-Tang capital heritage reference', () => {
  it('closes only the Tang Chang’an Huaqing Palace heritage link', () => {
    const asset = heritageAssets.find((item) => item.id === 'huaqing-palace');
    const detail = getHeritageDetail('huaqing-palace');
    const original = detail?.constructionHistory.find((phase) => phase.type === 'original');
    const tang = polities.find((item) => item.id === 'tang');
    const tangDetail = getPolityDetail('tang');
    const capital = capitalHistory.find((term) => (
      term.polityId === 'tang' && term.placeId === 'changan'
    ));

    expect(asset).toMatchObject({
      id: 'huaqing-palace',
      placeId: 'changan',
      constructionFrom: 618,
      modernStatus: 'extant',
    });
    expect(asset?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    expect(detail).toMatchObject({
      heritageId: 'huaqing-palace',
      associatedPolities: ['tang'],
      modernLocation: expect.stringContaining('临潼'),
    });
    expect(original).toMatchObject({ from: 618, to: 907 });
    expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    expect(tang).toBeDefined();
    expect(tangDetail?.heritageIds).toContain('huaqing-palace');
    expect(capital).toMatchObject({ polityId: 'tang', placeId: 'changan', validFrom: 618, validTo: 907 });
    expect(618).toBeGreaterThanOrEqual(capital?.validFrom ?? Number.POSITIVE_INFINITY);
    expect(618).toBeLessThanOrEqual(capital?.validTo ?? Number.NEGATIVE_INFINITY);
  });

  it('keeps the other six candidates outside a forced single-polity closure', () => {
    const tangDetail = getPolityDetail('tang');
    const suiDetail = getPolityDetail('sui');

    expect(round110Candidates.filter((id) => (
      suiDetail?.heritageIds.includes(id) || tangDetail?.heritageIds.includes(id)
    ))).toEqual(['huaqing-palace']);
    expect(getHeritageDetail('taiji-palace-site')?.associatedPolities).toEqual(['sui', 'tang']);
    expect(getHeritageDetail('qianling')?.associatedPolities).toEqual(['tang', 'wu_zhou']);
    expect(getHeritageDetail('shangyang-palace-site')?.associatedPolities).toEqual(['tang', 'wu_zhou']);
    expect(getHeritageDetail('ximing-temple-site')?.uncertaintyNote).toContain('译经事件端点');
  });
});
