import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { getEventDetail } from './event-details';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { getPolityDetail } from './polity-details';
import { polities } from './polities';

const overlap = (from: number | undefined, to: number | undefined, year: number | undefined) => (
  year !== undefined && (from === undefined || from <= year)
) && (to === undefined || year <= to);

type Candidate = {
  polityId: string;
  placeId: string;
  eventId?: string;
  heritageId?: string;
};

const key = (candidate: Candidate) => (
  `${candidate.polityId}|${candidate.placeId}|${candidate.eventId ?? ''}|${candidate.heritageId ?? ''}`
);

const expectedCategories = {
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
} as const;

describe('round 114 residual capital reference categories', () => {
  it('keeps the residual set exact and classifies every row before any future closure', () => {
    const rows: Candidate[] = [];
    for (const capital of capitalHistory) {
      const polity = polities.find((item) => item.id === capital.polityId);
      const detail = getPolityDetail(capital.polityId);
      if (!polity || !detail) continue;

      for (const event of events) {
        const eventDetail = getEventDetail(event.id);
        if (event.placeId !== capital.placeId || !overlap(capital.validFrom, capital.validTo, event.year)) continue;
        if (!eventDetail?.polityIds.includes(capital.polityId) || detail.eventIds.includes(event.id)) continue;
        rows.push({ polityId: capital.polityId, placeId: capital.placeId, eventId: event.id });
      }

      for (const asset of heritageAssets) {
        const heritageDetail = getHeritageDetail(asset.id);
        if (asset.placeId !== capital.placeId || !overlap(capital.validFrom, capital.validTo, asset.constructionFrom)) continue;
        if (!heritageDetail?.associatedPolities.includes(capital.polityId) || detail.heritageIds.includes(asset.id)) continue;
        rows.push({ polityId: capital.polityId, placeId: capital.placeId, heritageId: asset.id });
      }
    }

    expect(Object.fromEntries(rows.map((row) => [key(row), true]))).toEqual(
      Object.fromEntries(Object.keys(expectedCategories).map((candidateKey) => [candidateKey, true])),
    );
    expect(Object.keys(expectedCategories)).toHaveLength(18);
  });

  it('requires future closures to preserve the category-specific boundary', () => {
    expect(expectedCategories['qin|xianyang|chu-han-contention|']).toBe('shared-transition-event');
    expect(expectedCategories['tang|luoyang|court-moves-luoyang|']).toBe('shared-transition-event');
    expect(expectedCategories['song_northern|kaifeng|song-founded|']).toBe('duplicate-event-node');
    expect(expectedCategories['zhou_later|kaifeng||kaifeng-northern-song-city-site']).toBe('cross-stage-city-layer');
  });
});
