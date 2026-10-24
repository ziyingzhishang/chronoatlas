import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { getEventDetail } from './event-details';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

const overlaps = (from: number, to: number, year: number | undefined) => (
  year !== undefined && from <= year && year <= to
);

type BoundaryCategory =
  | 'shared-transition-event'
  | 'cross-polity-heritage'
  | 'heritage-event-not-polity-chain'
  | 'layered-capital-heritage'
  | 'location-approximate'
  | 'cross-stage-city-layer'
  | 'foundation-stage-boundary'
  | 'duplicate-event-node';

type Candidate = {
  polityId: string;
  placeId: string;
  eventId?: string;
  heritageId?: string;
};

const key = (candidate: Candidate) => (
  `${candidate.polityId}|${candidate.placeId}|${candidate.eventId ?? ''}|${candidate.heritageId ?? ''}`
);

const categories: Record<string, BoundaryCategory> = {
  'qin|xianyang|chu-han-contention|': 'shared-transition-event',
  'han_western|changan||changle-palace-site': 'cross-polity-heritage',
  'han_eastern|luoyang||white-horse-temple': 'cross-polity-heritage',
  'han_eastern|luoyang|white-horse-temple-founded|': 'heritage-event-not-polity-chain',
  'sui|changan||taiji-palace-site': 'layered-capital-heritage',
  'sui|changan||hanguang-gate-site': 'layered-capital-heritage',
  'sui|changan||mingde-gate-site': 'layered-capital-heritage',
  'tang|changan||qianling': 'cross-polity-heritage',
  'tang|changan||ximing-temple-site': 'location-approximate',
  'tang|luoyang|court-moves-luoyang|': 'shared-transition-event',
  'liang_later|kaifeng|five-dynasties|': 'shared-transition-event',
  'zhou_later|kaifeng|later-han-ended-951|': 'shared-transition-event',
  'zhou_later|kaifeng||kaifeng-northern-song-city-site': 'cross-stage-city-layer',
  'zhou_eastern|luoyang|zhou-eastward|': 'foundation-stage-boundary',
  'later_liang|guzang||guzang-baita-temple-site': 'cross-polity-heritage',
  'song_northern|kaifeng|song-founded|': 'duplicate-event-node',
  'northern_yan|longcheng|later-yan-ended-407|': 'shared-transition-event',
  'liang_southern|jiankang|southern-qi-ended-502|': 'shared-transition-event',
};

function discoverResiduals(): Candidate[] {
  const rows: Candidate[] = [];

  for (const capital of capitalHistory) {
    const detail = getPolityDetail(capital.polityId);
    if (!detail) continue;

    for (const event of events) {
      const eventDetail = getEventDetail(event.id);
      if (event.placeId !== capital.placeId || !eventDetail || !overlaps(capital.validFrom, capital.validTo, event.year)) continue;
      if (eventDetail.polityIds.includes(capital.polityId) && !detail.eventIds.includes(event.id)) {
        rows.push({ polityId: capital.polityId, placeId: capital.placeId, eventId: event.id });
      }
    }

    for (const asset of heritageAssets) {
      const heritageDetail = getHeritageDetail(asset.id);
      if (asset.placeId !== capital.placeId || asset.constructionFrom === undefined
        || !overlaps(capital.validFrom, capital.validTo, asset.constructionFrom)) continue;
      if (heritageDetail?.associatedPolities.includes(capital.polityId)
        && !detail.heritageIds.includes(asset.id)) {
        rows.push({ polityId: capital.polityId, placeId: capital.placeId, heritageId: asset.id });
      }
    }
  }

  return rows;
}

function hasSemanticBoundary(candidate: Candidate, category: BoundaryCategory): boolean {
  if (candidate.eventId) {
    const event = events.find((item) => item.id === candidate.eventId);
    const detail = getEventDetail(candidate.eventId);
    if (!event || !detail) return false;

    if (category === 'shared-transition-event') return detail.polityIds.length > 1;
    if (category === 'foundation-stage-boundary') {
      return detail.polityIds.includes('zhou_western') && detail.polityIds.includes('zhou_eastern');
    }
    if (category === 'heritage-event-not-polity-chain') {
      const assetDetail = getHeritageDetail('white-horse-temple');
      return detail.polityIds.length === 1
        && detail.polityIds.includes('han_eastern')
        && (assetDetail?.associatedPolities.length ?? 0) > 1;
    }
    if (category === 'duplicate-event-node') {
      const canonical = events.find((item) => item.id === 'northern-song-founded');
      const canonicalDetail = canonical ? getEventDetail(canonical.id) : undefined;
      return candidate.eventId === 'song-founded'
        && canonical?.year === event.year
        && canonical.placeId === event.placeId
        && canonicalDetail?.polityIds.includes('song_northern') === true;
    }
    return false;
  }

  const asset = heritageAssets.find((item) => item.id === candidate.heritageId);
  const detail = candidate.heritageId ? getHeritageDetail(candidate.heritageId) : undefined;
  if (!asset || !detail) return false;

  if (category === 'cross-polity-heritage') return detail.associatedPolities.length > 1;
  if (category === 'layered-capital-heritage') {
    return detail.associatedPolities.includes('sui') && detail.associatedPolities.includes('tang');
  }
  if (category === 'location-approximate') {
    return asset.modernStatus === 'uncertain' && detail.modernLocation.includes('约址');
  }
  if (category === 'cross-stage-city-layer') {
    return asset.constructionFrom === 960
      && detail.associatedPolities.includes('zhou_later')
      && detail.associatedPolities.includes('song_northern');
  }
  return false;
}

describe('round 124 capital and city closure boundary', () => {
  it('keeps the exact post-round-123 residual set and verifies its source/time/place/polity endpoints', () => {
    const residual = discoverResiduals();

    expect(residual.map(key).sort()).toEqual(Object.keys(categories).sort());

    for (const candidate of residual) {
      const category = categories[key(candidate)];
      const capital = capitalHistory.find((record) => (
        record.polityId === candidate.polityId && record.placeId === candidate.placeId
      ));
      expect(capital, key(candidate)).toBeDefined();

      if (candidate.eventId) {
        const event = events.find((item) => item.id === candidate.eventId);
        const detail = getEventDetail(candidate.eventId);
        expect(event?.placeId, key(candidate)).toBe(candidate.placeId);
        expect(detail?.polityIds, key(candidate)).toContain(candidate.polityId);
        expect(event?.sourceIds.every((sourceId) => sourceById[sourceId]), key(candidate)).toBe(true);
        expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), key(candidate)).toBe(true);
        expect(event?.year === undefined || overlaps(capital!.validFrom, capital!.validTo, event.year), key(candidate)).toBe(true);
      }

      if (candidate.heritageId) {
        const asset = heritageAssets.find((item) => item.id === candidate.heritageId);
        const detail = getHeritageDetail(candidate.heritageId);
        expect(asset?.placeId, key(candidate)).toBe(candidate.placeId);
        expect(detail?.associatedPolities, key(candidate)).toContain(candidate.polityId);
        expect(asset?.sourceIds.every((sourceId) => sourceById[sourceId]), key(candidate)).toBe(true);
        expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), key(candidate)).toBe(true);
        expect(asset?.constructionFrom === undefined
          || overlaps(capital!.validFrom, capital!.validTo, asset.constructionFrom), key(candidate)).toBe(true);
      }

      expect(category, key(candidate)).toBeDefined();
      expect(hasSemanticBoundary(candidate, category), key(candidate)).toBe(true);
    }
  });

  it('finds no safe single-polity detail closure among the current residuals', () => {
    const safeCandidates = discoverResiduals().filter((candidate) => !hasSemanticBoundary(candidate, categories[key(candidate)]));

    expect(safeCandidates).toEqual([]);
  });
});
