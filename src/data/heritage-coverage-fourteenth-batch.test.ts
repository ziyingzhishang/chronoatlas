import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { events } from './events';
import { heritageAssets } from './heritage';
import { heritageDetails } from './heritage-details';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

const targets = [
  { polityId: 'wei_western', heritageId: 'western-wei-changan-city-layer', placeId: 'changan', eventIds: ['western-wei-founded'], personIds: ['yu-wen-tai'] },
  { polityId: 'zhou_northern', heritageId: 'northern-zhou-changan-city-layer', placeId: 'changan', eventIds: ['sui-founded'], personIds: ['yuwen-yong'] },
  { polityId: 'xia_early', heritageId: 'xia-erlitou-archaeological-reference', placeId: 'erlitou', eventIds: ['xia-early-founded-eighth-batch'], personIds: ['yu-the-great'] },
  { polityId: 'shang', heritageId: 'shang-erlitou-archaeological-reference', placeId: 'erlitou', eventIds: ['shang-founded-eighth-batch'], personIds: ['wu-ding'] },
  { polityId: 'zhou_western', heritageId: 'western-zhou-fenghao-reference', placeId: 'changan', eventIds: ['western-zhou-founded-eighth-batch'], personIds: ['zhou-wu', 'ji-chang'] },
] as const;

describe('heritage coverage fourteenth batch', () => {
  it('selects five previously unlinked polities and closes their heritage relationships', () => {
    const report = auditKnowledgeCoverage();
    for (const target of targets) {
      expect(report.byPolity[target.polityId]?.entityKeys).toContain(`heritage:${target.heritageId}`);
    }
  });

  it('provides a locatable, source-backed, phase-aware detail for each new node', () => {
    const assetIds = new Set(heritageAssets.map((asset) => asset.id));
    const placeIds = new Set(places.map((place) => place.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const personIds = new Set(people.map((person) => person.id));

    expect(new Set(targets.map((target) => target.heritageId)).size).toBe(targets.length);
    for (const target of targets) {
      const asset = heritageAssets.find((item) => item.id === target.heritageId);
      const detail = heritageDetails.find((item) => item.heritageId === target.heritageId);
      expect(assetIds.has(target.heritageId), target.heritageId).toBe(true);
      expect(asset?.placeId, target.heritageId).toBe(target.placeId);
      expect(placeIds.has(target.placeId), target.heritageId).toBe(true);
      expect(Number.isFinite(asset?.constructionFrom), target.heritageId).toBe(true);
      expect(asset?.description, target.heritageId).toBeTruthy();
      expect(asset?.sourceIds.every((sourceId) => sourceById[sourceId]), target.heritageId).toBe(true);
      expect(detail, target.heritageId).toBeDefined();
      expect(detail?.modernLocation, target.heritageId).toBeTruthy();
      expect(detail?.historicalAssociations.length, target.heritageId).toBeGreaterThanOrEqual(2);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original'), target.heritageId).toBe(true);
      expect(detail?.constructionHistory.some((phase) => ['site', 'reconstruction', 'restoration'].includes(phase.type)), target.heritageId).toBe(true);
      expect(detail?.associatedPolities, target.heritageId).toEqual(expect.arrayContaining([target.polityId]));
      expect(detail?.associatedPolities.every((id) => polityIds.has(id)), target.heritageId).toBe(true);
      expect(detail?.associatedEvents, target.heritageId).toEqual(expect.arrayContaining([...target.eventIds]));
      expect(detail?.associatedEvents.every((id) => eventIds.has(id)), target.heritageId).toBe(true);
      expect(detail?.associatedPeople, target.heritageId).toEqual(expect.arrayContaining([...target.personIds]));
      expect(detail?.associatedPeople.every((id) => personIds.has(id)), target.heritageId).toBe(true);
      expect(detail?.survivingFeatures.length, target.heritageId).toBeGreaterThan(0);
      expect(detail?.presentDayValue, target.heritageId).toBeTruthy();
      expect(detail?.sourceIds.length, target.heritageId).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), target.heritageId).toBe(true);
      expect(detail?.uncertaintyNote, target.heritageId).toBeTruthy();
    }
  });
});
