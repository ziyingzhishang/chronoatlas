import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { heritageAssets } from './heritage';
import { heritageDetails, getHeritageDetail } from './heritage-details';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

const kaifengCapitalCoverage = [
  { polityId: 'liang_later', heritageId: 'later-liang-kaifeng-city-layer' },
  { polityId: 'jin_later', heritageId: 'kaifeng-later-jin-han-city-layer' },
  { polityId: 'han_later', heritageId: 'kaifeng-later-jin-han-city-layer' },
  { polityId: 'zhou_later', heritageId: 'kaifeng-later-zhou-city-layer' },
  { polityId: 'song_northern', heritageId: 'kaifeng-northern-song-city-site' },
] as const;

describe('Kaifeng capital heritage learning chain', () => {
  it('audits summary, detail, date, place, source, polity, and event coverage for every target dynasty', () => {
    kaifengCapitalCoverage.forEach(({ polityId, heritageId }) => {
      const asset = heritageAssets.find((item) => item.id === heritageId);
      const detail = getHeritageDetail(heritageId);
      const polity = polities.find((item) => item.id === polityId);
      const capitalTerm = capitalHistory.find((term) => (
        term.polityId === polityId && term.placeId === 'kaifeng'
      ));

      expect(asset, heritageId).toBeDefined();
      expect(asset?.placeId).toBe('kaifeng');
      expect(asset?.description).toBeTruthy();
      expect(asset?.constructionFrom).toBeDefined();
      expect(asset?.constructionTo).toBeDefined();
      expect(asset?.sourceIds).toContain('capital-history-reference');
      expect(asset?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);

      expect(detail, heritageId).toBeDefined();
      expect(detail?.modernLocation).toContain('开封');
      expect(detail?.historicalAssociations.length).toBeGreaterThan(0);
      expect(detail?.constructionHistory.length).toBeGreaterThan(0);
      expect(detail?.survivingFeatures.length).toBeGreaterThan(0);
      expect(detail?.presentDayValue).toBeTruthy();
      expect(detail?.uncertaintyNote).toBeTruthy();
      expect(detail?.sourceIds).toContain('capital-history-reference');
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
      expect(detail?.associatedPolities).toContain(polityId);
      expect(polity?.capitalPlaceId).toBe('kaifeng');
      expect(capitalTerm).toMatchObject({ placeId: 'kaifeng' });

      const kaifengEvents = detail?.associatedEvents
        .map((eventId) => events.find((event) => event.id === eventId))
        .filter((event) => event?.placeId === 'kaifeng');
      expect(kaifengEvents?.length).toBeGreaterThan(0);
    });
  });

  it('keeps the audit scoped to the five Kaifeng capital heritage nodes', () => {
    expect(new Set(kaifengCapitalCoverage.map(({ heritageId }) => heritageId))).toEqual(
      new Set([
        'later-liang-kaifeng-city-layer',
        'kaifeng-later-jin-han-city-layer',
        'kaifeng-later-zhou-city-layer',
        'kaifeng-northern-song-city-site',
      ]),
    );
    expect(heritageDetails.filter((detail) => detail.modernLocation.includes('开封'))
      .every((detail) => detail.sourceIds.every((sourceId) => sourceById[sourceId]))).toBe(true);
    expect(places.some((place) => place.id === 'kaifeng')).toBe(true);
  });
});
