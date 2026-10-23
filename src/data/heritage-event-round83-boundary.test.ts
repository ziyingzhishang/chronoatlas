import { describe, expect, it } from 'vitest';
import { events } from './events';
import { heritageAssets } from './heritage';
import { heritageDetails } from './heritage-details';
import { buildHeritageDetailCoverageReport } from './heritage-detail-coverage';
import { sourceNotes } from './sources';

const reviewBoundaryHeritageIds = [
  'big-wild-goose-pagoda',
  'qinglong-temple-site',
  'xian-beilin',
  'xiao-yan-ta',
] as const;

describe('round eighty-third heritage/event boundary audit', () => {
  it('keeps four shared review-boundary details and closes Ximing on dedicated endpoints', () => {
    const report = buildHeritageDetailCoverageReport();
    const eventIds = new Set(events.map((event) => event.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    expect(heritageAssets).toHaveLength(120);
    expect(report.needsReviewHeritageIds).toEqual([...reviewBoundaryHeritageIds]);
    expect(report.uncoveredHeritageIds).toEqual([]);
    expect(report.sourceCompleteHeritageIds).toHaveLength(120);
    expect(eventIds.has('xuanzang-translations')).toBe(false);

    for (const heritageId of reviewBoundaryHeritageIds) {
      const detail = heritageDetails.find((item) => item.heritageId === heritageId);
      const item = report.items.find((coverageItem) => coverageItem.heritageId === heritageId);

      expect(detail, heritageId).toBeDefined();
      expect(detail?.associatedEvents, heritageId).toEqual(['tang-founded', 'xuanzang-translations']);
      expect(detail?.associatedPeople, heritageId).not.toContain('missing-person');
      expect(detail?.associatedPolities, heritageId).not.toContain('missing-polity');
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), heritageId).toBe(true);
      expect(detail?.constructionHistory.every((phase) => (
        phase.sourceIds.length > 0
        && phase.sourceIds.every((sourceId) => sourceIds.has(sourceId))
      )), heritageId).toBe(true);
      expect(item?.status, heritageId).toBe('needs-review');
      expect(item?.unresolvedReferenceIds, heritageId).toEqual({
        people: [],
        polities: [],
        events: ['xuanzang-translations'],
        place: [],
        sources: [],
      });
      expect(item?.reviewNotes, heritageId).toEqual([
        '关联事件端点未收录：xuanzang-translations；暂不新增或推断事件端点。',
      ]);
    }

    const ximing = heritageDetails.find((item) => item.heritageId === 'ximing-temple-site');
    const ximingCoverage = report.items.find((item) => item.heritageId === 'ximing-temple-site');
    expect(ximing?.associatedEvents).toEqual(['ximing-temple-built', 'xuanzang-at-ximing-658', 'tang-founded']);
    expect(ximingCoverage?.status).toBe('complete');
    expect(ximingCoverage?.unresolvedReferenceIds).toEqual({ people: [], polities: [], events: [], place: [], sources: [] });
  });

  it('does not treat a person, polity, or existing Tang event as a substitute event endpoint', () => {
    const report = buildHeritageDetailCoverageReport();
    const eventIds = new Set(events.map((event) => event.id));

    for (const heritageId of reviewBoundaryHeritageIds) {
      const item = report.items.find((coverageItem) => coverageItem.heritageId === heritageId);

      expect(item?.unresolvedReferenceIds.events, heritageId).toEqual(['xuanzang-translations']);
      expect(eventIds.has('tang-founded')).toBe(true);
      expect(eventIds.has('xuanzang-translations')).toBe(false);
      expect(item?.status, heritageId).not.toBe('complete');
    }
  });
});
