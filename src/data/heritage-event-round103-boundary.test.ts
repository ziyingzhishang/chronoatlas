import { describe, expect, it } from 'vitest';
import { events } from './events';
import { heritageDetails } from './heritage-details';
import { buildHeritageDetailCoverageReport } from './heritage-detail-coverage';
import { sourceNotes } from './sources';

const round103ReviewHeritageIds = [
  'big-wild-goose-pagoda',
  'qinglong-temple-site',
  'xian-beilin',
  'xiao-yan-ta',
  'ximing-temple-site',
] as const;

describe('round one hundred three heritage event boundary audit', () => {
  it('keeps the five Xuanzang-related details complete apart from the explicit event endpoint boundary', () => {
    const report = buildHeritageDetailCoverageReport();
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const eventIds = new Set(events.map((event) => event.id));

    expect(eventIds.has('xuanzang-translations')).toBe(false);
    expect(report.needsReviewHeritageIds).toEqual([...round103ReviewHeritageIds]);
    expect(report.uncoveredHeritageIds).toEqual([]);

    for (const heritageId of round103ReviewHeritageIds) {
      const detail = heritageDetails.find((item) => item.heritageId === heritageId);
      const item = report.items.find((coverageItem) => coverageItem.heritageId === heritageId);

      expect(detail, heritageId).toBeDefined();
      expect(detail?.modernLocation, heritageId).toBeTruthy();
      expect(detail?.historicalAssociations.length, heritageId).toBeGreaterThanOrEqual(2);
      expect(detail?.constructionHistory.length, heritageId).toBeGreaterThanOrEqual(3);
      expect(detail?.survivingFeatures.length, heritageId).toBeGreaterThanOrEqual(3);
      expect(detail?.presentDayValue.length, heritageId).toBeGreaterThan(8);
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), heritageId).toBe(true);
      expect(detail?.constructionHistory.every((phase) => (
        phase.sourceIds.length > 0
        && phase.sourceIds.every((sourceId) => sourceIds.has(sourceId))
      )), heritageId).toBe(true);
      if (heritageId === 'ximing-temple-site') {
        expect(detail?.associatedEvents, heritageId).toEqual(['ximing-temple-built', 'xuanzang-at-ximing-658', 'tang-founded', 'xuanzang-translations']);
      } else {
        expect(detail?.associatedEvents, heritageId).toEqual(['tang-founded', 'xuanzang-translations']);
      }
      expect(item?.status, heritageId).toBe('needs-review');
      expect(item?.missingFields, heritageId).toEqual([]);
      expect(item?.unresolvedReferenceIds, heritageId).toEqual({
        people: [],
        polities: [],
        events: ['xuanzang-translations'],
        place: [],
        sources: [],
      });
    }
  });

  it('records why a new shared event node is not safe to fabricate in this round', () => {
    const xuanzang = heritageDetails.find((detail) => detail.heritageId === 'big-wild-goose-pagoda');

    expect(xuanzang?.uncertaintyNote).toContain('历代修缮');
    expect(xuanzang?.associatedEvents).toContain('xuanzang-translations');
    expect(events.some((event) => event.id === 'xuanzang-translations')).toBe(false);
    // The current catalog has only broad/secondary support for a multi-year activity;
    // it does not establish one defensible event start, end, place set, and phase chain.
    expect(sourceNotes.find((source) => source.id === 'xian-local-chronicle-big-wild-goose')?.scope)
      .toContain('玄奘');
  });
});
