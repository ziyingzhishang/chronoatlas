import { describe, expect, it } from 'vitest';
import { buildHeritageDetailCoverageReport } from './heritage-detail-coverage';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { heritageAssets } from './heritage';
import { heritageDetails } from './heritage-details';
import { places } from './places';
import { polities } from './polities';
import { sourceNotes } from './sources';

const capitalPlaceIds = new Set(capitalHistory.map((record) => record.placeId));
const capitalHeritageAssets = heritageAssets.filter((asset) => capitalPlaceIds.has(asset.placeId));
const coverage = buildHeritageDetailCoverageReport();
const detailById = new Map(heritageDetails.map((detail) => [detail.heritageId, detail]));
const coverageById = new Map(coverage.items.map((item) => [item.heritageId, item]));
const knownPlaceIds = new Set(places.map((place) => place.id));
const knownPolityIds = new Set(polities.map((polity) => polity.id));
const knownEventIds = new Set(events.map((event) => event.id));
const knownSourceIds = new Set(sourceNotes.map((source) => source.id));

const reviewBoundary = new Set([
  'big-wild-goose-pagoda',
  'qinglong-temple-site',
  'xian-beilin',
  'xiao-yan-ta',
  'ximing-temple-site',
]);

describe('capital-associated heritage boundary audit', () => {
  it('locks the 106 capital-associated heritage details to complete field and endpoint coverage', () => {
    expect(capitalHeritageAssets).toHaveLength(106);

    for (const asset of capitalHeritageAssets) {
      const detail = detailById.get(asset.id);
      const item = coverageById.get(asset.id);

      expect(detail, asset.id).toBeDefined();
      expect(item, asset.id).toBeDefined();
      expect(knownPlaceIds.has(asset.placeId), asset.id).toBe(true);
      expect(detail?.modernLocation.trim(), asset.id).toBeTruthy();
      expect(detail?.historicalAssociations.length, asset.id).toBeGreaterThan(0);
      expect(detail?.constructionHistory.length, asset.id).toBeGreaterThan(0);
      expect(detail?.survivingFeatures.length, asset.id).toBeGreaterThan(0);
      expect(detail?.presentDayValue.trim(), asset.id).toBeTruthy();
      expect(detail?.uncertaintyNote.trim(), asset.id).toBeTruthy();
      expect(detail?.associatedPolities.length, asset.id).toBeGreaterThan(0);
      expect(detail?.associatedEvents.length, asset.id).toBeGreaterThan(0);

      expect(item?.missingFields, asset.id).toEqual([]);
      expect(item?.unresolvedReferenceIds.people, asset.id).toEqual([]);
      expect(item?.unresolvedReferenceIds.polities, asset.id).toEqual([]);
      expect(item?.unresolvedReferenceIds.place, asset.id).toEqual([]);
      expect(item?.unresolvedReferenceIds.sources, asset.id).toEqual([]);
      expect(detail?.associatedPolities.every((id) => knownPolityIds.has(id)), asset.id).toBe(true);
      expect(detail?.sourceIds.every((id) => knownSourceIds.has(id)), asset.id).toBe(true);
      expect(asset.sourceIds.every((id) => knownSourceIds.has(id)), asset.id).toBe(true);

      for (const phase of detail?.constructionHistory ?? []) {
        expect(phase.label.trim(), `${asset.id}:phase.label`).toBeTruthy();
        expect(phase.period.trim(), `${asset.id}:phase.period`).toBeTruthy();
        expect(phase.description.trim(), `${asset.id}:phase.description`).toBeTruthy();
        expect(phase.sourceIds.length, `${asset.id}:phase.sourceIds`).toBeGreaterThan(0);
        expect(phase.sourceIds.every((id) => knownSourceIds.has(id)), `${asset.id}:phase.sourceIds`).toBe(true);
      }

      const unresolvedEvents = item?.unresolvedReferenceIds.events ?? [];
      expect(unresolvedEvents.every((id) => !knownEventIds.has(id)), asset.id).toBe(true);
      expect(unresolvedEvents.length === 0 || reviewBoundary.has(asset.id), asset.id).toBe(true);
      expect(item?.status, asset.id).toBe(reviewBoundary.has(asset.id) ? 'needs-review' : 'complete');
    }
  });

  it('keeps exactly the five unresolved Xuanzang event endpoints explicit', () => {
    expect(coverage.needsReviewHeritageIds).toEqual([...reviewBoundary].sort());
    expect(coverage.uncoveredHeritageIds).toEqual([]);
    expect(coverage.sourceCompleteHeritageIds).toHaveLength(heritageAssets.length);

    for (const heritageId of reviewBoundary) {
      const item = coverageById.get(heritageId);
      expect(item?.unresolvedReferenceIds.events, heritageId).toEqual(['xuanzang-translations']);
      expect(knownEventIds.has('xuanzang-translations')).toBe(false);
      expect(item?.reviewNotes, heritageId).toEqual([
        '关联事件端点未收录：xuanzang-translations；暂不新增或推断事件端点。',
      ]);
    }
  });
});
