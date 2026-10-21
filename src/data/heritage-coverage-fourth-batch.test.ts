import { describe, expect, it } from 'vitest';
import { events } from './events';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { people } from './people';
import { polities } from './polities';
import { places } from './places';
import { sourceById } from './sources';

const fourthBatch = [
  { id: 'longmen-grottoes', placeId: 'luoyang', polityIds: ['wei_northern', 'wu_zhou', 'tang'], personIds: ['yuan-hong', 'wu-zhao'] },
  { id: 'yongning-temple-pagoda-site', placeId: 'luoyang', polityIds: ['wei_northern'], personIds: ['yuan-hong'] },
  { id: 'dingding-gate-site', placeId: 'luoyang', polityIds: ['sui', 'tang'], personIds: ['yang-jian'] },
  { id: 'mingtang-tiantang-site', placeId: 'luoyang', polityIds: ['wu_zhou'], personIds: ['wu-zhao'] },
  { id: 'yungang-grottoes', placeId: 'pingcheng', polityIds: ['wei_northern'], personIds: ['tuoba-tao'] },
  { id: 'zhao-wang-city-site', placeId: 'handan', polityIds: ['zhao_warring'], personIds: ['qin-shi-huang'] },
  { id: 'tongwan-city-site', placeId: 'zhitong', polityIds: ['xia'], personIds: ['heliAN-bobo'] },
  { id: 'guzang-ancient-city-site', placeId: 'guzang', polityIds: ['former_liang', 'northern_liang', 'later_liang'], personIds: ['fu-jian'] },
  { id: 'shangyang-palace-site', placeId: 'luoyang', polityIds: ['tang', 'wu_zhou'], personIds: ['wu-zhao'] },
  { id: 'jinci-ancestral-temple', placeId: 'taiyuan', polityIds: ['tang'], personIds: ['li-yuan', 'li-shimin'] },
] as const;

describe('heritage coverage fourth batch', () => {
  it('adds ten new, modern-locatable heritage assets without duplicating the catalog', () => {
    const existingIds = new Set(heritageAssets.map((asset) => asset.id));
    const assets = fourthBatch.map(({ id }) => heritageAssets.find((asset) => asset.id === id));

    expect(new Set(fourthBatch.map(({ id }) => id)).size).toBe(10);
    expect(existingIds.size).toBe(heritageAssets.length);
    expect(assets.every(Boolean)).toBe(true);
    expect(assets.every((asset) => asset?.modernStatus)).toBe(true);
    expect(new Set(assets.map((asset) => asset?.id)).size).toBe(10);
    expect(fourthBatch.every(({ id }) => existingIds.has(id))).toBe(true);
  });

  it('provides sourced details with explicit original-versus-site history and resolvable links', () => {
    const polityIds = new Set(polities.map((polity) => polity.id));
    const personIds = new Set(people.map((person) => person.id));
    const eventIds = new Set(events.map((event) => event.id));
    const placeIds = new Set(places.map((place) => place.id));

    for (const target of fourthBatch) {
      const asset = heritageAssets.find((item) => item.id === target.id);
      const detail = getHeritageDetail(target.id);

      expect(asset).toBeDefined();
      expect(placeIds.has(asset?.placeId ?? '')).toBe(true);
      expect(asset?.placeId).toBe(target.placeId);
      expect(detail).toBeDefined();
      expect(detail?.modernLocation).toBeTruthy();
      expect(detail?.historicalAssociations.length).toBeGreaterThan(0);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
      expect(detail?.constructionHistory.some((phase) => ['site', 'reconstruction', 'restoration'].includes(phase.type))).toBe(true);
      expect(detail?.associatedPolities).toEqual(expect.arrayContaining([...target.polityIds]));
      expect(detail?.associatedPolities.every((id) => polityIds.has(id))).toBe(true);
      expect(detail?.associatedPeople).toEqual(expect.arrayContaining([...target.personIds]));
      expect(detail?.associatedPeople.every((id) => personIds.has(id))).toBe(true);
      expect(detail?.associatedEvents.every((id) => eventIds.has(id))).toBe(true);
      expect(detail?.survivingFeatures.length).toBeGreaterThan(0);
      expect(detail?.presentDayValue).toBeTruthy();
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
      expect(detail?.uncertaintyNote).toBeTruthy();
    }
  });

  it('marks at least one fourth-batch asset as an archaeological site and one as extant', () => {
    const assets = fourthBatch.map(({ id }) => heritageAssets.find((asset) => asset.id === id));

    expect(assets.some((asset) => asset?.modernStatus === 'archaeological-site')).toBe(true);
    expect(assets.some((asset) => asset?.modernStatus === 'extant')).toBe(true);
  });
});
