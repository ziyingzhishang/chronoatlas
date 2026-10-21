import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { heritageAssets } from './heritage';
import { heritageDetails } from './heritage-details';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

const targetPolityIds = [
  'han_warring',
  'wei_warring',
  'chu_warring',
  'yan_warring',
  'qi_warring',
  'southern_yan',
  'shu_three',
  'western_liang',
] as const;

const plannedHeritageIds = [
  'han-xinzheng-city-site',
  'wei-anyi-city-site',
  'chu-ying-city-site',
  'yan-ji-city-site',
  'qi-linzi-city-site',
  'southern-yan-guanggu-city-site',
  'shu-han-chengdu-city-site',
  'dunhuang-western-liang-city-site',
] as const;

const newHeritagePolityLinks: Record<string, string[]> = {
  'han-xinzheng-city-site': ['han_warring'],
  'wei-anyi-city-site': ['wei_warring'],
  'chu-ying-city-site': ['chu_warring'],
  'yan-ji-city-site': ['yan_warring'],
  'qi-linzi-city-site': ['qi_warring'],
  'southern-yan-guanggu-city-site': ['southern_yan'],
  'shu-han-chengdu-city-site': ['shu_three'],
  'dunhuang-western-liang-city-site': ['western_liang'],
};

describe('heritage coverage thirteenth batch', () => {
  it('selects eight currently unassociated polities from reliable capital-site candidates', () => {
    const report = auditKnowledgeCoverage();
    const priorDetails = heritageDetails.filter((detail) => !plannedHeritageIds.includes(detail.heritageId as (typeof plannedHeritageIds)[number]));
    expect(targetPolityIds).toHaveLength(8);
    targetPolityIds.forEach((polityId) => {
      expect(priorDetails.some((detail) => detail.associatedPolities.includes(polityId)), polityId).toBe(false);
    });
    targetPolityIds.forEach((polityId) => {
      expect(report.byPolity[polityId]).toBeDefined();
      expect(report.byPolity[polityId].gaps.some((gap) => gap.dimension === 'relationship' && gap.kind === 'relationship-missing')).toBe(false);
    });
    expect(new Set(plannedHeritageIds).size).toBe(plannedHeritageIds.length);
    plannedHeritageIds.forEach((heritageId) => {
      const asset = heritageAssets.find((item) => item.id === heritageId);
      expect(asset).toBeDefined();
      expect(places.some((place) => place.id === asset?.placeId)).toBe(true);
    });
  });

  it('provides complete, source-backed detail and phase classification for every new node', () => {
    plannedHeritageIds.forEach((heritageId) => {
      const asset = heritageAssets.find((item) => item.id === heritageId);
      const detail = heritageDetails.find((item) => item.heritageId === heritageId);
      expect(asset?.placeId).toBeTruthy();
      expect(asset?.description).toBeTruthy();
      expect(asset?.sourceIds.length).toBeGreaterThan(0);
      expect(asset?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
      expect(detail).toBeDefined();
      expect(detail?.modernLocation).toBeTruthy();
      expect(detail?.historicalAssociations.length).toBeGreaterThan(0);
      expect(detail?.survivingFeatures.length).toBeGreaterThan(0);
      expect(detail?.presentDayValue).toBeTruthy();
      expect(detail?.uncertaintyNote).toBeTruthy();
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
      expect(detail?.associatedPolities).toEqual(expect.arrayContaining(newHeritagePolityLinks[heritageId]));
      expect(detail?.associatedPolities.every((polityId) => polities.some((polity) => polity.id === polityId))).toBe(true);
      const phaseTypes = new Set(detail?.constructionHistory.map((phase) => phase.type));
      expect(phaseTypes.has('site') || phaseTypes.has('original')).toBe(true);
      expect(phaseTypes.has('reconstruction') || phaseTypes.has('restoration')).toBe(true);
    });
  });
});
