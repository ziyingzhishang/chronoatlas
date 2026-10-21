import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

const selectedPolityIds = [
  'former_zhao',
  'southern_liang',
  'jingnan',
  'dali',
  'goguryeo',
  'silla',
  'tibetan_empire',
  'nanzhao',
  'western_liao',
  'yuan',
] as const;

const twelfthBatch = [
  { polityId: 'former_zhao', id: 'former-zhao-xiangguo-city-site', placeId: 'xiangguo', eventIds: ['former-zhao-founded'] },
  { polityId: 'southern_liang', id: 'southern-liang-jiangling-city-site', placeId: 'jiangling', eventIds: ['southern-liang-founded'] },
  { polityId: 'jingnan', id: 'jingnan-jiangling-city-site', placeId: 'jiangling', eventIds: ['jingnan-founded'] },
  { polityId: 'dali', id: 'dali-city-site', placeId: 'dali_city', eventIds: ['dali-founded'] },
  { polityId: 'goguryeo', id: 'goguryeo-guonei-city-site', placeId: 'guonei', eventIds: ['goguryeo-founded'] },
  { polityId: 'silla', id: 'silla-gyeongju-capital-site', placeId: 'jincheng_silla', eventIds: ['silla-founded'] },
  { polityId: 'tibetan_empire', id: 'tibetan-lhasa-city-site', placeId: 'luosie', eventIds: ['tibetan-founded'] },
  { polityId: 'nanzhao', id: 'nanzhao-taihe-city-site', placeId: 'taihe', eventIds: ['nanzhao-founded'] },
  { polityId: 'western_liao', id: 'western-liao-balasagun-site', placeId: 'balasagun', eventIds: ['western-liao-founded'] },
  { polityId: 'yuan', id: 'yuan-shangdu-site', placeId: 'shangdu', eventIds: ['yuan-founded'] },
] as const;

describe('heritage coverage twelfth batch', () => {
  it('records ten audit-selected polity gaps', () => {
    const report = auditKnowledgeCoverage();
    const missing = selectedPolityIds.filter((polityId) => (
      !report.byPolity[polityId]?.entityKeys.some((key) => key.startsWith('heritage:'))
    ));
    const remainingUnlinkedPolities = Object.values(report.byPolity)
      .filter((polity) => !polity.entityKeys.some((key) => key.startsWith('heritage:')));

    expect(missing).toEqual([]);
    expect(twelfthBatch).toHaveLength(10);
    expect(remainingUnlinkedPolities).toHaveLength(19);
  });

  it('provides source-backed, time-aware details for every selected heritage node', () => {
    const report = auditKnowledgeCoverage();
    const ids = new Set(heritageAssets.map((asset) => asset.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const personIds = new Set(people.map((person) => person.id));
    const eventIds = new Set(events.map((event) => event.id));
    const placeIds = new Set(places.map((place) => place.id));

    for (const target of twelfthBatch) {
      const asset = heritageAssets.find((item) => item.id === target.id);
      const detail = getHeritageDetail(target.id);
      expect(ids.has(target.id), target.id).toBe(true);
      expect(asset?.placeId, target.id).toBe(target.placeId);
      expect(placeIds.has(asset?.placeId ?? ''), target.id).toBe(true);
      expect(Number.isFinite(asset?.constructionFrom), target.id).toBe(true);
      expect(detail, target.id).toBeDefined();
      expect(detail?.modernLocation, target.id).toBeTruthy();
      expect(detail?.historicalAssociations.length, target.id).toBeGreaterThanOrEqual(2);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original'), target.id).toBe(true);
      expect(detail?.constructionHistory.some((phase) => ['site', 'reconstruction', 'restoration'].includes(phase.type)), target.id).toBe(true);
      expect(detail?.associatedPolities, target.id).toEqual(expect.arrayContaining([target.polityId]));
      expect(detail?.associatedPolities.every((id) => polityIds.has(id)), target.id).toBe(true);
      expect(detail?.associatedEvents, target.id).toEqual(expect.arrayContaining([...target.eventIds]));
      expect(detail?.associatedEvents.every((id) => eventIds.has(id)), target.id).toBe(true);
      expect(detail?.associatedPeople.every((id) => personIds.has(id)), target.id).toBe(true);
      expect(detail?.survivingFeatures.length, target.id).toBeGreaterThan(0);
      expect(detail?.presentDayValue, target.id).toBeTruthy();
      expect(detail?.sourceIds.length, target.id).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), target.id).toBe(true);
      expect(detail?.uncertaintyNote, target.id).toBeTruthy();
      expect(report.byPolity[target.polityId]?.entityKeys).toContain(`heritage:${target.id}`);
    }
  });

  it('does not reuse an existing heritage identifier', () => {
    const ids = heritageAssets.map((asset) => asset.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(twelfthBatch.map((target) => target.id)).size).toBe(twelfthBatch.length);
  });
});
