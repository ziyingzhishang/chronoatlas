import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

const jiankangCoverage = [
  { polityId: 'jin_eastern', heritageId: 'jiankang-taicheng-site', eventIds: ['eastern-jin', 'eastern-jin-ended-420'] },
  { polityId: 'song_southern', heritageId: 'southern-dynasties-stone-carvings', eventIds: ['liu-song-founded', 'liu-song-ended-479'] },
  { polityId: 'qi_southern', heritageId: 'southern-dynasties-stone-carvings', eventIds: ['southern-qi-founded', 'southern-qi-ended-502'] },
  { polityId: 'liang_southern', heritageId: 'jiankang-six-dynasties-city-site', eventIds: ['southern-liang-founded'] },
  { polityId: 'chen_southern', heritageId: 'southern-dynasties-stone-carvings', eventIds: ['southern-chen-founded', 'southern-chen-ended-589'] },
] as const;

describe('建康／南京城市遗产审计', () => {
  it('为东晋、刘宋、南齐、南梁、南陈建立地点、年代、来源、政权和事件追溯链', () => {
    const jiankang = places.find((place) => place.id === 'jiankang');

    expect(jiankang?.modernName).toBe('南京市');

    for (const target of jiankangCoverage) {
      const asset = heritageAssets.find((item) => item.id === target.heritageId);
      const detail = getHeritageDetail(target.heritageId);
      const polity = polities.find((item) => item.id === target.polityId);
      const capitalTerm = capitalHistory.find((term) => (
        term.polityId === target.polityId && term.placeId === 'jiankang'
      ));

      expect(asset, target.heritageId).toBeDefined();
      expect(asset?.placeId, target.heritageId).toBe('jiankang');
      expect(asset?.description, target.heritageId).toBeTruthy();
      expect(asset?.constructionFrom, target.heritageId).toBeDefined();
      expect(asset?.constructionTo, target.heritageId).toBeDefined();
      expect(asset?.sourceIds.every((sourceId) => sourceById[sourceId]), target.heritageId).toBe(true);

      expect(detail, target.heritageId).toBeDefined();
      expect(detail?.modernLocation, target.heritageId).toContain('南京');
      expect(detail?.historicalAssociations.length, target.heritageId).toBeGreaterThan(0);
      expect(detail?.constructionHistory.length, target.heritageId).toBeGreaterThanOrEqual(2);
      expect(detail?.constructionHistory.every((phase) => phase.sourceIds.every((sourceId) => sourceById[sourceId])), target.heritageId).toBe(true);
      expect(detail?.survivingFeatures.length, target.heritageId).toBeGreaterThan(0);
      expect(detail?.presentDayValue, target.heritageId).toBeTruthy();
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), target.heritageId).toBe(true);
      expect(detail?.associatedPolities, target.heritageId).toContain(target.polityId);
      expect(detail?.associatedEvents, target.heritageId).toEqual(expect.arrayContaining([...target.eventIds]));

      expect(polity, target.polityId).toBeDefined();
      expect(capitalTerm, target.polityId).toMatchObject({ placeId: 'jiankang' });
      expect(asset?.constructionFrom).toBeLessThanOrEqual(capitalTerm?.validTo ?? Number.NEGATIVE_INFINITY);
      expect(asset?.constructionTo).toBeGreaterThanOrEqual(capitalTerm?.validFrom ?? Number.POSITIVE_INFINITY);

      for (const eventId of target.eventIds) {
        const event = events.find((item) => item.id === eventId);
        expect(event, eventId).toBeDefined();
        expect(event?.placeId, eventId).toBe('jiankang');
        expect(event?.year, eventId).toBeGreaterThanOrEqual(asset?.constructionFrom ?? Number.POSITIVE_INFINITY);
        expect(event?.year, eventId).toBeLessThanOrEqual(asset?.constructionTo ?? Number.NEGATIVE_INFINITY);
      }
    }
  });

  it('只审计建康阶段的既有高置信节点，不把弱考据寺院或传说性宫殿扩为遗产对象', () => {
    const auditedIds: Set<string> = new Set(jiankangCoverage.map(({ heritageId }) => heritageId));
    const jiankangAssets = heritageAssets.filter((asset) => (
      asset.placeId === 'jiankang' && (asset.constructionTo ?? Number.POSITIVE_INFINITY) <= 589
    ));

    expect(auditedIds).toEqual(new Set([
      'jiankang-six-dynasties-city-site',
      'jiankang-taicheng-site',
      'southern-dynasties-stone-carvings',
    ]));
    expect(jiankangAssets.every((asset) => auditedIds.has(asset.id))).toBe(true);
  });
});
