import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

const eleventhBatch = [
  { polityId: 'khitan', id: 'liao-shangjing-city-site', placeId: 'liao_shangjing', eventIds: ['liao-founded'] },
  { polityId: 'wuyue', id: 'wuyue-qian-king-mausoleum', placeId: 'hangzhou', eventIds: ['wuyue-founded'] },
  { polityId: 'min', id: 'min-wang-mausoleum', placeId: 'fuzhou', eventIds: ['min-founded'] },
  { polityId: 'southern_han', id: 'southern-han-king-mausoleum', placeId: 'guangzhou', eventIds: ['southern-han-founded'] },
  { polityId: 'chu_ten', id: 'ma-chu-tan-zhou-city-site', placeId: 'changsha', eventIds: ['ma-chu-founded'] },
  { polityId: 'western_xia', id: 'western-xia-imperial-tombs', placeId: 'xingqing', eventIds: ['western-xia-founded'] },
  { polityId: 'jin_jurchen', id: 'jin-huining-city-site', placeId: 'huining', eventIds: ['jurchen-jin-founded'] },
  { polityId: 'northern_yan', id: 'northern-yan-longcheng-tomb', placeId: 'longcheng', eventIds: ['northern-yan-founded'] },
] as const;

describe('heritage coverage eleventh batch', () => {
  it('links ten audit-selected polities to distinct new heritage nodes', () => {
    const report = auditKnowledgeCoverage();
    const ids = new Set(heritageAssets.map((asset) => asset.id));

    expect(new Set(eleventhBatch.map((target) => target.polityId)).size).toBe(8);
    expect(new Set(eleventhBatch.map((target) => target.id)).size).toBe(8);
    for (const target of eleventhBatch) {
      expect(ids.has(target.id), target.id).toBe(true);
      expect(report.byPolity[target.polityId]?.entityKeys).toContain(`heritage:${target.id}`);
    }
  });

  it('provides a source-backed, time-aware detail for every selected heritage node', () => {
    const polityIds = new Set(polities.map((polity) => polity.id));
    const personIds = new Set(people.map((person) => person.id));
    const eventIds = new Set(events.map((event) => event.id));
    const placeIds = new Set(places.map((place) => place.id));

    for (const target of eleventhBatch) {
      const asset = heritageAssets.find((item) => item.id === target.id);
      const detail = getHeritageDetail(target.id);
      expect(asset, target.id).toBeDefined();
      expect(placeIds.has(asset?.placeId ?? ''), target.id).toBe(true);
      expect(asset?.placeId, target.id).toBe(target.placeId);
      expect(Number.isFinite(asset?.constructionFrom), target.id).toBe(true);
      expect(detail, target.id).toBeDefined();
      expect(detail?.modernLocation, target.id).toBeTruthy();
      expect(detail?.historicalAssociations.length, target.id).toBeGreaterThan(0);
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
    }
  });

  it('keeps the selected heritage nodes historically specific rather than generic city duplicates', () => {
    for (const target of eleventhBatch) {
      const detail = getHeritageDetail(target.id);
      expect(detail?.historicalAssociations.length, target.id).toBeGreaterThanOrEqual(2);
      expect(detail?.constructionHistory.length, target.id).toBeGreaterThanOrEqual(2);
      expect(detail?.uncertaintyNote, target.id).not.toMatch(/泛化|仅作城市节点/);
    }
  });
});
