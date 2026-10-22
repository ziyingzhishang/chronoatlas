import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';
import { places } from './places';
import { polities } from './polities';

const candidateIds = [
  'hanyangling',
  'changle-palace-site',
  'maoling',
  'du-ling',
  'white-horse-temple',
  'yongning-temple-pagoda-site',
] as const;

const overlaps = (from: number | undefined, to: number | undefined, year: number | undefined) => (
  year !== undefined && (from === undefined || from <= year) && (to === undefined || year <= to)
);

describe('round 108 Han-Wei capital heritage audit', () => {
  it('closes only the Western Han Yangling reference', () => {
    const asset = heritageAssets.find((item) => item.id === 'hanyangling');
    const detail = getHeritageDetail('hanyangling');
    const polity = polities.find((item) => item.id === 'han_western');
    const polityDetail = getPolityDetail('han_western');
    const place = places.find((item) => item.id === asset?.placeId);
    const capital = capitalHistory.find((term) => (
      term.polityId === 'han_western' && term.placeId === asset?.placeId
    ));

    expect(asset).toMatchObject({ id: 'hanyangling', placeId: 'changan', constructionFrom: -157 });
    expect(detail?.associatedPolities).toEqual(['han_western']);
    expect(detail?.sourceIds.length).toBeGreaterThan(0);
    expect(asset?.sourceIds.every((sourceId) => detail?.sourceIds.includes(sourceId))).toBe(true);
    expect(place?.id).toBe('changan');
    expect(overlaps(capital?.validFrom, capital?.validTo, asset?.constructionFrom)).toBe(true);
    expect(polity?.id).toBe('han_western');
    expect(polityDetail?.capitalPhases.some((phase) => (
      phase.placeId === asset?.placeId && overlaps(phase.validFrom, phase.validTo, asset?.constructionFrom)
    ))).toBe(true);
    expect(polityDetail?.heritageIds).toContain('hanyangling');
  });

  it('classifies the other five candidates without silently extending the chain', () => {
    const rows = candidateIds.map((heritageId) => {
      const asset = heritageAssets.find((item) => item.id === heritageId)!;
      const detail = getHeritageDetail(heritageId)!;
      const singlePolity = detail.associatedPolities.length === 1;
      const alignedCapital = capitalHistory.some((capital) => (
        detail.associatedPolities.includes(capital.polityId)
        && capital.placeId === asset.placeId
        && overlaps(capital.validFrom, capital.validTo, asset.constructionFrom)
      ));
      const sourcesComplete = asset.sourceIds.length > 0
        && asset.sourceIds.every((sourceId) => detail.sourceIds.includes(sourceId));

      return {
        heritageId,
        classification: heritageId === 'hanyangling'
          ? 'closed'
          : singlePolity && alignedCapital && sourcesComplete
            ? 'single-polity-heritage-deferred-by-round-limit'
            : 'cross-polity-heritage',
      };
    });

    expect(rows).toEqual([
      { heritageId: 'hanyangling', classification: 'closed' },
      { heritageId: 'changle-palace-site', classification: 'cross-polity-heritage' },
      { heritageId: 'maoling', classification: 'single-polity-heritage-deferred-by-round-limit' },
      { heritageId: 'du-ling', classification: 'single-polity-heritage-deferred-by-round-limit' },
      { heritageId: 'white-horse-temple', classification: 'cross-polity-heritage' },
      { heritageId: 'yongning-temple-pagoda-site', classification: 'single-polity-heritage-deferred-by-round-limit' },
    ]);
    expect(rows.filter((row) => row.classification === 'closed')).toHaveLength(1);
  });
});
