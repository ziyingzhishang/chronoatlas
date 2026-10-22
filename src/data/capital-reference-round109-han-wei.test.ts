import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';
import { places } from './places';

const overlaps = (from: number | undefined, to: number | undefined, year: number | undefined) => (
  year !== undefined && (from === undefined || from <= year) && (to === undefined || year <= to)
);

describe('round 109 Han-Wei capital heritage audit', () => {
  it('closes the Northern Wei Yongning Temple pagoda site as a Luoyang capital heritage', () => {
    const asset = heritageAssets.find((item) => item.id === 'yongning-temple-pagoda-site');
    const detail = getHeritageDetail('yongning-temple-pagoda-site');
    const place = places.find((item) => item.id === asset?.placeId);
    const polityDetail = getPolityDetail('wei_northern');
    const luoyangCapital = capitalHistory.find((term) => (
      term.polityId === 'wei_northern' && term.placeId === asset?.placeId
    ));
    const luoyangPhase = polityDetail?.capitalPhases.find((phase) => (
      phase.placeId === asset?.placeId
      && overlaps(phase.validFrom, phase.validTo, asset?.constructionFrom)
    ));

    expect(asset).toMatchObject({
      id: 'yongning-temple-pagoda-site',
      placeId: 'luoyang',
      constructionFrom: 516,
    });
    expect(detail?.associatedPolities).toEqual(['wei_northern']);
    expect(detail?.sourceIds.length).toBeGreaterThan(0);
    expect(asset?.sourceIds.every((sourceId) => detail?.sourceIds.includes(sourceId))).toBe(true);
    expect(place?.id).toBe('luoyang');
    expect(overlaps(luoyangCapital?.validFrom, luoyangCapital?.validTo, asset?.constructionFrom)).toBe(true);
    expect(luoyangPhase).toMatchObject({ placeId: 'luoyang', validFrom: 495, validTo: 534 });
    expect(polityDetail?.heritageIds).toContain('yongning-temple-pagoda-site');
  });

  it('keeps the other four Han-Wei candidates outside a single-polity closure', () => {
    const candidates = ['changle-palace-site', 'maoling', 'du-ling', 'white-horse-temple'] as const;
    const classifications = candidates.map((heritageId) => {
      const asset = heritageAssets.find((item) => item.id === heritageId)!;
      const detail = getHeritageDetail(heritageId)!;
      const singlePolity = detail.associatedPolities.length === 1;
      const alignedCapital = capitalHistory.some((term) => (
        detail.associatedPolities.includes(term.polityId)
        && term.placeId === asset.placeId
        && overlaps(term.validFrom, term.validTo, asset.constructionFrom)
      ));
      return {
        heritageId,
        classification: singlePolity && alignedCapital
          ? 'aligned-but-not-closed'
          : 'cross-polity-or-boundary-review',
      };
    });

    expect(classifications).toEqual([
      { heritageId: 'changle-palace-site', classification: 'cross-polity-or-boundary-review' },
      { heritageId: 'maoling', classification: 'aligned-but-not-closed' },
      { heritageId: 'du-ling', classification: 'aligned-but-not-closed' },
      { heritageId: 'white-horse-temple', classification: 'cross-polity-or-boundary-review' },
    ]);
  });
});
