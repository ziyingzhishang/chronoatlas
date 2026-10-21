import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { polities } from './polities';
import { places } from './places';
import { sourceById } from './sources';

const tenthBatch = [
  { polityId: 'qin_state', id: 'xianyang-qin-state-palace-site', placeId: 'xianyang', eventIds: ['qin-state-founded-eighth-batch'] },
  { polityId: 'cheng_han', id: 'cheng-han-chengdu-site', placeId: 'chengdu', eventIds: ['cheng-han-founded'] },
  { polityId: 'later_yan', id: 'later-yan-ye-city-site', placeId: 'ye', eventIds: ['later-yan-founded'] },
  { polityId: 'tang_later', id: 'later-tang-luoyang-city-site', placeId: 'luoyang', eventIds: ['tang-later-founded'] },
  { polityId: 'zhou_eastern', id: 'eastern-zhou-luoyang-city-site', placeId: 'luoyang', eventIds: ['eastern-zhou-founded-eighth-batch'] },
  { polityId: 'later_shu', id: 'later-shu-chengdu-city-site', placeId: 'chengdu', eventIds: ['later-shu-founded'] },
  { polityId: 'southern_tang', id: 'southern-tang-jiankang-city-site', placeId: 'jiankang', eventIds: ['southern-tang-founded'] },
  { polityId: 'wu_ten', id: 'yang-wu-yangzhou-city-site', placeId: 'yangzhou', eventIds: ['yang-wu-founded'] },
] as const;

describe('heritage coverage tenth batch', () => {
  it('keeps the eight audit-selected polities linked in the live audit', () => {
    const report = auditKnowledgeCoverage();
    const targetPolityIds = tenthBatch.map((target) => target.polityId);

    expect(targetPolityIds).toHaveLength(8);
    expect(new Set(targetPolityIds).size).toBe(8);
    for (const polityId of targetPolityIds) {
      const polity = report.byPolity[polityId];
      expect(polity, polityId).toBeDefined();
      expect(polity?.entityKeys.some((key) => key === `heritage:${tenthBatch.find((target) => target.polityId === polityId)?.id}`), polityId).toBe(true);
    }
  });

  it('adds one sourced, time-aware and modern-locatable heritage node per selected polity', () => {
    const ids = new Set(heritageAssets.map((asset) => asset.id));
    const placeIds = new Set(places.map((place) => place.id));
    const polityIds = new Set(polities.map((polity) => polity.id));

    for (const target of tenthBatch) {
      const asset = heritageAssets.find((item) => item.id === target.id);
      const detail = getHeritageDetail(target.id);
      expect(ids.has(target.id), target.id).toBe(true);
      expect(asset?.placeId, target.id).toBe(target.placeId);
      expect(placeIds.has(asset?.placeId ?? ''), target.id).toBe(true);
      expect(Number.isFinite(asset?.constructionFrom), target.id).toBe(true);
      expect(detail, target.id).toBeDefined();
      expect(detail?.modernLocation, target.id).toBeTruthy();
      expect(detail?.historicalAssociations.length, target.id).toBeGreaterThan(0);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original'), target.id).toBe(true);
      expect(detail?.constructionHistory.some((phase) => ['site', 'reconstruction', 'restoration'].includes(phase.type)), target.id).toBe(true);
      expect(detail?.associatedPolities, target.id).toEqual(expect.arrayContaining([target.polityId]));
      expect(detail?.associatedPolities.every((id) => polityIds.has(id)), target.id).toBe(true);
      expect(detail?.associatedEvents, target.id).toEqual(expect.arrayContaining([...target.eventIds]));
      expect(detail?.survivingFeatures.length, target.id).toBeGreaterThan(0);
      expect(detail?.presentDayValue, target.id).toBeTruthy();
      expect(detail?.sourceIds.length, target.id).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), target.id).toBe(true);
      expect(detail?.uncertaintyNote, target.id).toBeTruthy();
    }
  });
});
