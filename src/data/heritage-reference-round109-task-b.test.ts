import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';
import { polities } from './polities';
import { sourceById } from './sources';

const remainingCandidates = [
  'taiji-palace-site',
  'hanguang-gate-site',
  'mingde-gate-site',
  'dingding-gate-site',
  'big-wild-goose-pagoda',
  'qianling',
  'ximing-temple-site',
  'shangyang-palace-site',
] as const;

describe('round 109 task B Sui-Tang heritage reference', () => {
  it('closes only the Tang Chang’an Big Wild Goose Pagoda heritage link', () => {
    const asset = heritageAssets.find((item) => item.id === 'big-wild-goose-pagoda');
    const detail = getHeritageDetail('big-wild-goose-pagoda');
    const original = detail?.constructionHistory.find((phase) => phase.type === 'original');
    const tang = polities.find((item) => item.id === 'tang');
    const tangDetail = getPolityDetail('tang');
    const capital = capitalHistory.find((term) => (
      term.polityId === 'tang' && term.placeId === 'changan'
    ));

    expect(asset).toMatchObject({
      id: 'big-wild-goose-pagoda',
      placeId: 'changan',
      constructionFrom: 652,
      modernStatus: 'extant',
    });
    expect(asset?.sourceIds).toEqual(expect.arrayContaining(['modern-geography-reference']));
    expect(detail).toMatchObject({
      heritageId: 'big-wild-goose-pagoda',
      modernLocation: expect.stringContaining('西安市'),
      associatedPolities: ['tang'],
      associatedEvents: ['tang-founded', 'xuanzang-translations'],
    });
    expect(original).toMatchObject({ from: 652 });
    expect(detail?.sourceIds.length).toBeGreaterThan(0);
    expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    expect(asset?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    expect(tang).toBeDefined();
    expect(tangDetail?.heritageIds).toContain('big-wild-goose-pagoda');
    expect(capital).toMatchObject({ polityId: 'tang', placeId: 'changan', validFrom: 618, validTo: 907 });
    expect(652).toBeGreaterThanOrEqual(capital?.validFrom ?? Number.POSITIVE_INFINITY);
    expect(652).toBeLessThanOrEqual(capital?.validTo ?? Number.NEGATIVE_INFINITY);
  });

  it('keeps every other round-109 candidate outside a single-polity Tang or Sui closure', () => {
    const unresolved = remainingCandidates.filter((heritageId) => heritageId !== 'big-wild-goose-pagoda');

    expect(unresolved).toEqual([
      'taiji-palace-site',
      'hanguang-gate-site',
      'mingde-gate-site',
      'dingding-gate-site',
      'qianling',
      'ximing-temple-site',
      'shangyang-palace-site',
    ]);
    expect(unresolved.every((heritageId) => {
      const detail = getHeritageDetail(heritageId);
      return detail && (
        detail.associatedPolities.length !== 1
        || detail.uncertaintyNote.includes('约址')
        || detail.uncertaintyNote.includes('叠合')
        || detail.uncertaintyNote.includes('译经事件端点')
      );
    })).toBe(true);
  });
});
