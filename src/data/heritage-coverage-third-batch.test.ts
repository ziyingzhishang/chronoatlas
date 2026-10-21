import { describe, expect, it } from 'vitest';
import { events } from './events';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { polities } from './polities';
import { places } from './places';
import { sourceById } from './sources';

const thirdBatch = [
  { id: 'luoyang-han-wei-city-site', placeId: 'luoyang', polityId: 'han_eastern' },
  { id: 'luoyang-sui-tang-city-site', placeId: 'luoyang', polityId: 'sui' },
  { id: 'white-horse-temple', placeId: 'luoyang', polityId: 'han_eastern' },
  { id: 'jiankang-six-dynasties-city-site', placeId: 'jiankang', polityId: 'jin_eastern' },
  { id: 'southern-dynasties-stone-carvings', placeId: 'jiankang', polityId: 'qi_southern' },
  { id: 'ye-city-site', placeId: 'ye', polityId: 'qi_northern' },
  { id: 'former-shu-yongling', placeId: 'chengdu', polityId: 'former_shu' },
  { id: 'jinyang-ancient-city-site', placeId: 'taiyuan', polityId: 'northern_han' },
  { id: 'kaifeng-northern-song-city-site', placeId: 'kaifeng', polityId: 'song_northern' },
  { id: 'linan-southern-song-imperial-city-site', placeId: 'linan', polityId: 'song_south' },
] as const;

describe('heritage coverage third batch', () => {
  it('adds ten locatable heritage assets across covered capitals', () => {
    const assets = thirdBatch.map(({ id }) => heritageAssets.find((asset) => asset.id === id));

    expect(assets.every(Boolean)).toBe(true);
    expect(new Set(assets.map((asset) => asset?.placeId)).size).toBe(7);
    expect(assets.filter((asset) => asset?.modernStatus === 'archaeological-site').length).toBeGreaterThanOrEqual(7);
  });

  it('gives each new asset a complete, sourced, uncertainty-aware historical detail', () => {
    for (const target of thirdBatch) {
      const asset = heritageAssets.find((item) => item.id === target.id);
      const detail = getHeritageDetail(target.id);

      expect(asset).toBeDefined();
      expect(asset?.placeId).toBe(target.placeId);
      expect(detail).toBeDefined();
      expect(detail?.modernLocation).toBeTruthy();
      expect(detail?.historicalAssociations.length).toBeGreaterThan(0);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
      expect(detail?.constructionHistory.some((phase) => ['site', 'reconstruction', 'restoration'].includes(phase.type))).toBe(true);
      expect(detail?.associatedPolities).toContain(target.polityId);
      expect(detail?.associatedPeople.length).toBeGreaterThan(0);
      expect(detail?.associatedEvents.length).toBeGreaterThan(0);
      expect(detail?.survivingFeatures.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
      expect(detail?.uncertaintyNote).toBeTruthy();
    }
  });

  it('keeps every relationship identifier resolvable for the third batch', () => {
    const politiesById = new Set(polities.map((polity) => polity.id));
    const eventsById = new Set(events.map((event) => event.id));
    const placeById = new Set(places.map((place) => place.id));

    for (const target of thirdBatch) {
      const asset = heritageAssets.find((item) => item.id === target.id);
      const detail = getHeritageDetail(target.id);

      expect(placeById.has(asset?.placeId ?? '')).toBe(true);
      expect(detail?.associatedPolities.every((id) => politiesById.has(id))).toBe(true);
      expect(detail?.associatedEvents.every((id) => eventsById.has(id))).toBe(true);
    }
  });
});
