import { describe, expect, it } from 'vitest';
import { events } from './events';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { people } from './people';
import { polities } from './polities';
import { places } from './places';
import { sourceById } from './sources';

const fifthBatch = [
  { id: 'xiongnu-longcheng-candidate', placeId: 'xiongnu_core', polityIds: ['xiongnu'], personIds: ['modu-chanyu'], eventIds: ['xiongnu-founded'] },
  { id: 'orkhon-turkic-inscriptions', placeId: 'uhtuken', polityIds: ['turkic'], personIds: [], eventIds: ['turkic-founded'] },
  { id: 'northern-yuan-khan-court-landscape', placeId: 'beiyuan_core', polityIds: ['northern_yuan'], personIds: ['esen-taishi', 'tuotuobuhua'], eventIds: ['northern-yuan-founded'] },
  { id: 'nanming-yingtian-imperial-city', placeId: 'yingtian', polityIds: ['ming_southern'], personIds: ['zhu-yousong', 'shi-kefa'], eventIds: ['southern-ming-founded'] },
  { id: 'jiankang-taicheng-site', placeId: 'jiankang', polityIds: ['jin_eastern', 'song_southern', 'qi_southern', 'liang_southern', 'chen_southern'], personIds: ['sima-rui', 'liu-yu'], eventIds: ['eastern-jin'] },
  { id: 'ye-tongque-platform-site', placeId: 'ye', polityIds: ['wei_eastern', 'qi_northern'], personIds: ['gao-huan', 'gao-yang'], eventIds: ['eastern-wei-founded'] },
  { id: 'guzang-baita-temple-site', placeId: 'guzang', polityIds: ['former_liang', 'northern_liang', 'later_liang'], personIds: [], eventIds: ['former-liang-founded'] },
  { id: 'tongwan-south-gate-site', placeId: 'zhitong', polityIds: ['xia'], personIds: ['heliAN-bobo'], eventIds: ['xia-sixteen-states-founded-eighth-batch'] },
  { id: 'tuyuhun-fuqisi-city-candidate', placeId: 'tuyuhun_core', polityIds: ['tuyuhun'], personIds: [], eventIds: ['tuyuhun-founded'] },
  { id: 'western-qin-yuanchuan-city-candidate', placeId: 'jincheng', polityIds: ['western_qin'], personIds: [], eventIds: ['western-qin-founded'] },
] as const;

describe('heritage coverage fifth batch', () => {
  it('adds ten distinct heritage assets for audited polity and capital gaps', () => {
    const ids = new Set(heritageAssets.map((asset) => asset.id));

    expect(new Set(fifthBatch.map(({ id }) => id)).size).toBe(10);
    expect(fifthBatch.every(({ id }) => ids.has(id))).toBe(true);
    expect(ids.size).toBe(heritageAssets.length);
  });

  it('provides auditable details, links, time, modern location, sources, and uncertainty', () => {
    const polityIds = new Set(polities.map((polity) => polity.id));
    const personIds = new Set(people.map((person) => person.id));
    const eventIds = new Set(events.map((event) => event.id));
    const placeIds = new Set(places.map((place) => place.id));

    for (const target of fifthBatch) {
      const asset = heritageAssets.find((item) => item.id === target.id);
      const detail = getHeritageDetail(target.id);

      expect(asset).toBeDefined();
      expect(placeIds.has(asset?.placeId ?? '')).toBe(true);
      expect(asset?.placeId).toBe(target.placeId);
      expect(Number.isFinite(asset?.constructionFrom)).toBe(true);
      expect(detail).toBeDefined();
      expect(detail?.modernLocation).toBeTruthy();
      expect(detail?.historicalAssociations.length).toBeGreaterThan(0);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
      expect(detail?.constructionHistory.some((phase) => ['site', 'reconstruction', 'restoration'].includes(phase.type))).toBe(true);
      expect(detail?.associatedPolities).toEqual(expect.arrayContaining([...target.polityIds]));
      expect(detail?.associatedPolities.every((id) => polityIds.has(id))).toBe(true);
      expect(detail?.associatedPeople).toEqual(expect.arrayContaining([...target.personIds]));
      expect(detail?.associatedPeople.every((id) => personIds.has(id))).toBe(true);
      expect(detail?.associatedEvents).toEqual(expect.arrayContaining([...target.eventIds]));
      expect(detail?.associatedEvents.every((id) => eventIds.has(id))).toBe(true);
      expect(detail?.survivingFeatures.length).toBeGreaterThan(0);
      expect(detail?.presentDayValue).toBeTruthy();
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
      expect(detail?.uncertaintyNote).toBeTruthy();
    }
  });

  it('keeps mobile or disputed political centres explicitly uncertain', () => {
    for (const id of ['xiongnu-longcheng-candidate', 'northern-yuan-khan-court-landscape', 'tuyuhun-fuqisi-city-candidate', 'western-qin-yuanchuan-city-candidate']) {
      const asset = heritageAssets.find((item) => item.id === id);
      expect(asset?.modernStatus).toBe('uncertain');
      expect(getHeritageDetail(id)?.uncertaintyNote).toMatch(/候选|争议|不确定|移动|阶段性/);
    }
  });
});
