import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';

const overlaps = (from: number | undefined, to: number | undefined, rangeFrom: number | undefined, rangeTo: number | undefined) => (
  from !== undefined && rangeFrom !== undefined && (to === undefined || rangeTo === undefined || from <= rangeTo) && (rangeFrom <= (to ?? rangeFrom))
);

describe('round 108 capital chain task C', () => {
  it('links the Wunvshan early-capital heritage to Goguryeo only when its evidence chain is complete', () => {
    const capital = capitalHistory.find((term) => term.polityId === 'goguryeo' && term.placeId === 'wunvshan');
    const asset = heritageAssets.find((item) => item.id === 'wunvshan-goguryeo-early-capital-site');
    const detail = getHeritageDetail('wunvshan-goguryeo-early-capital-site');
    const polityDetail = getPolityDetail('goguryeo');

    expect(capital).toMatchObject({ polityId: 'goguryeo', placeId: 'wunvshan', validFrom: -37, validTo: 2 });
    expect(asset).toMatchObject({ id: 'wunvshan-goguryeo-early-capital-site', placeId: 'wunvshan', constructionFrom: -37, constructionTo: 2 });
    expect(detail?.associatedPolities).toContain('goguryeo');
    expect(detail?.sourceIds).toEqual(expect.arrayContaining(['zizhi-tongjian', 'china-chronology', 'capital-history-reference']));
    expect(detail?.constructionHistory.some((phase) => phase.from === -37 && phase.to === 2)).toBe(true);
    expect(asset?.sourceIds).toEqual(expect.arrayContaining(detail?.sourceIds ?? []));
    expect(overlaps(capital?.validFrom, capital?.validTo, asset?.constructionFrom, asset?.constructionTo)).toBe(true);
    expect(polityDetail?.heritageIds).toContain('wunvshan-goguryeo-early-capital-site');
  });
});
