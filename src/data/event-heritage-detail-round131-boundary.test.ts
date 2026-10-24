import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { buildHeritageDetailCoverageReport } from './heritage-detail-coverage';
import { getEventDetail } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { getPolityDetail } from './polity-details';

describe('round 131 event and heritage detail boundary audit', () => {
  it('confirms event narratives are complete while preserving review-only time boundaries', () => {
    const report = buildEventDetailCoverageReport();

    expect(report.unresolvedEventIds).toEqual([]);
    expect(report.statusCounts).toEqual({ covered: 171, 'needs-review': 50, unresolved: 0 });
    expect(report.coveredEventIds).toContain('song-founded');
    expect(getEventDetail('song-founded')).toMatchObject({
      polityIds: ['song_northern'],
      locationIds: ['kaifeng'],
      sourceIds: ['china-chronology', 'modern-geography-reference'],
    });
    expect(getPolityDetail('song_northern')?.eventIds).not.toContain('song-founded');
  });

  it('keeps the four unresolved heritage event endpoints explicit instead of inventing a shared event', () => {
    const report = buildHeritageDetailCoverageReport();
    const reviewIds = ['big-wild-goose-pagoda', 'qinglong-temple-site', 'xian-beilin', 'xiao-yan-ta'];

    expect(report.uncoveredHeritageIds).toEqual([]);
    expect(report.completeHeritageIds).toHaveLength(126);
    expect(report.needsReviewHeritageIds).toEqual(reviewIds);
    for (const heritageId of reviewIds) {
      const detail = getHeritageDetail(heritageId)!;
      const item = report.items.find((candidate) => candidate.heritageId === heritageId)!;
      expect(detail.associatedEvents).toContain('xuanzang-translations');
      expect(item.unresolvedReferenceIds.events).toEqual(['xuanzang-translations']);
      expect(item.status).toBe('needs-review');
    }
  });
});
