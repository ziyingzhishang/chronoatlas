import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { getEventDetail } from './event-details';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

const overlaps = (from: number, to: number, year: number) => from <= year && year <= to;

const residual = [
  ['qin|xianyang|chu-han-contention|', 'shared-transition-event'],
  ['han_western|changan||changle-palace-site', 'cross-polity-heritage'],
  ['han_eastern|luoyang||white-horse-temple', 'cross-polity-heritage'],
  ['han_eastern|luoyang|white-horse-temple-founded|', 'heritage-event-not-polity-chain'],
  ['sui|changan||taiji-palace-site', 'layered-capital-heritage'],
  ['sui|changan||hanguang-gate-site', 'layered-capital-heritage'],
  ['sui|changan||mingde-gate-site', 'layered-capital-heritage'],
  ['tang|changan||qianling', 'cross-polity-heritage'],
  ['tang|changan||ximing-temple-site', 'location-approximate'],
  ['tang|luoyang|court-moves-luoyang|', 'shared-transition-event'],
  ['liang_later|kaifeng|five-dynasties|', 'shared-transition-event'],
  ['zhou_later|kaifeng|later-han-ended-951|', 'shared-transition-event'],
  ['zhou_later|kaifeng||kaifeng-northern-song-city-site', 'cross-stage-city-layer'],
  ['zhou_eastern|luoyang|zhou-eastward|', 'foundation-stage-boundary'],
  ['later_liang|guzang||guzang-baita-temple-site', 'cross-polity-heritage'],
  ['song_northern|kaifeng|song-founded|', 'duplicate-event-node'],
  ['northern_yan|longcheng|later-yan-ended-407|', 'shared-transition-event'],
  ['liang_southern|jiankang|southern-qi-ended-502|', 'shared-transition-event'],
] as const;

const key = (polityId: string, placeId: string, eventId = '', heritageId = '') => (
  `${polityId}|${placeId}|${eventId}|${heritageId}`
);

describe('round 123 capital and heritage boundary audit', () => {
  it('keeps the post-round-122 residual set exact and excludes the closed Dingding Gate link', () => {
    const actual = new Set<string>();

    for (const capital of capitalHistory) {
      const polity = getPolityDetail(capital.polityId);
      if (!polity) continue;

      for (const event of events) {
        const detail = getEventDetail(event.id);
        if (event.placeId !== capital.placeId || !detail || !overlaps(capital.validFrom, capital.validTo, event.year)) continue;
        if (detail.polityIds.includes(capital.polityId) && !polity.eventIds.includes(event.id)) {
          actual.add(key(capital.polityId, capital.placeId, event.id));
        }
      }

      for (const asset of heritageAssets) {
        const detail = getHeritageDetail(asset.id);
        if (asset.placeId !== capital.placeId || asset.constructionFrom === undefined || !overlaps(capital.validFrom, capital.validTo, asset.constructionFrom)) continue;
        if (detail?.associatedPolities.includes(capital.polityId) && !polity.heritageIds.includes(asset.id)) {
          actual.add(key(capital.polityId, capital.placeId, '', asset.id));
        }
      }
    }

    expect([...actual].sort()).toEqual(residual.map(([candidate]) => candidate).sort());
    expect(actual.has('sui|luoyang||dingding-gate-site')).toBe(false);
  });

  it('requires every residual row to retain a resolvable place, polity, time, and source boundary', () => {
    for (const [candidate, category] of residual) {
      const [polityId, placeId, eventId, heritageId] = candidate.split('|');
      const capital = capitalHistory.find((record) => record.polityId === polityId && record.placeId === placeId);
      expect(capital, candidate).toBeDefined();

      if (eventId) {
        const event = events.find((item) => item.id === eventId);
        const detail = getEventDetail(eventId);
        expect(event, candidate).toBeDefined();
        expect(detail?.polityIds, candidate).toContain(polityId);
        expect(event?.sourceIds.every((sourceId) => sourceById[sourceId]), candidate).toBe(true);
        expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), candidate).toBe(true);
        expect(event?.placeId, candidate).toBe(placeId);
        expect(event?.year === undefined || overlaps(capital!.validFrom, capital!.validTo, event.year), candidate).toBe(true);
      }

      if (heritageId) {
        const asset = heritageAssets.find((item) => item.id === heritageId);
        const detail = getHeritageDetail(heritageId);
        expect(asset, candidate).toBeDefined();
        expect(detail?.associatedPolities, candidate).toContain(polityId);
        expect(asset?.sourceIds.every((sourceId) => sourceById[sourceId]), candidate).toBe(true);
        expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), candidate).toBe(true);
        expect(asset?.placeId, candidate).toBe(placeId);
        expect(asset?.constructionFrom === undefined || overlaps(capital!.validFrom, capital!.validTo, asset.constructionFrom), candidate).toBe(true);
      }

      expect(category).toMatch(/^(shared-transition-event|cross-polity-heritage|heritage-event-not-polity-chain|layered-capital-heritage|location-approximate|cross-stage-city-layer|foundation-stage-boundary|duplicate-event-node)$/);
    }
  });
});
