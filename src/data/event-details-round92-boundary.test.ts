import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';

const reviewBoundaryReasons = {
  'an-lushan-rebellion': 'multi-year-process',
  'changan-former-qin': 'formation-approximation',
  'changan-gengshi': 'participant-endpoint-review',
  'changan-han-capital': 'participant-endpoint-review',
  'changan-later-qin': 'participant-endpoint-review',
  'changan-xin-founded': 'participant-endpoint-review',
  'chu-han-contention': 'multi-year-process',
  'chu-warring-founded-eighth-batch': 'traditional-periodization',
  'dali-founded': 'formation-approximation',
  'daming-palace-built': 'construction-range',
  'eastern-zhou-founded-eighth-batch': 'formation-approximation',
  'former-liang-founded': 'formation-approximation',
  'goguryeo-founded': 'formation-approximation',
  'qi-warring-founded-eighth-batch': 'traditional-periodization',
  'qin-state-founded-eighth-batch': 'traditional-periodization',
  'shang-founded-eighth-batch': 'traditional-periodization',
  'silla-founded': 'formation-approximation',
  'southern-ming-founded': 'formation-approximation',
  'tang-changan-end': 'participant-endpoint-review',
  'tibetan-founded': 'formation-approximation',
  'tuyuhun-founded': 'formation-approximation',
  'western-liao-founded': 'formation-approximation',
  'western-zhou-founded-eighth-batch': 'traditional-periodization',
  'xia-early-founded-eighth-batch': 'traditional-periodization',
  'xiongnu-founded': 'formation-approximation',
  'xuanzang-at-ximing-658': 'multi-year-process',
  'shangyang-palace-built': 'construction-range',
  'yan-warring-founded-eighth-batch': 'traditional-periodization',
  'zhou-conquest': 'traditional-periodization',
} as const;

describe('event details ninety-second round boundary audit', () => {
  it('audits every needs-review event individually before any precision upgrade', () => {
    const report = buildEventDetailCoverageReport();
    const reviewItems = report.items.filter((item) => item.status === 'needs-review');
    const reviewIds = Object.keys(reviewBoundaryReasons).sort();

    expect(report.statusCounts).toEqual({ covered: 104, 'needs-review': 29, unresolved: 0 });
    expect(reviewItems.map((item) => item.eventId)).toEqual(reviewIds);

    reviewItems.forEach((item) => {
      expect(item.sourceComplete, item.eventId).toBe(true);
      expect(item.sourceIds.length, item.eventId).toBeGreaterThan(0);
      expect(item.unresolvedReferenceIds, item.eventId).toEqual({
        people: [], places: [], polities: [], relatedEvents: [], sources: [],
      });
      if (item.eventId === 'white-horse-temple-founded') {
        expect(item.needsReviewChecks, item.eventId).toEqual(['participants']);
        expect(item.timePrecisionStatus, item.eventId).toBe('confirmed');
        expect(item.timePrecision, item.eventId).toBe('year');
      } else if (item.timePrecisionStatus === 'needs-review') {
        expect(item.needsReviewChecks, item.eventId).toContain('timePrecision');
        expect(item.needsReviewChecks, item.eventId).toEqual(
          expect.arrayContaining(['timePrecision']),
        );
        expect(item.needsReviewChecks.every((check) => check === 'timePrecision' || check === 'uncertaintyNote' || check === 'participants'), item.eventId)
          .toBe(true);
        expect(['approximate', 'range'], item.eventId).toContain(item.timePrecision);
      } else {
        expect(item.timePrecisionStatus, item.eventId).toBe('confirmed');
        expect(item.needsReviewChecks, item.eventId).not.toContain('timePrecision');
      }
      expect(reviewBoundaryReasons[item.eventId as keyof typeof reviewBoundaryReasons], item.eventId)
        .toBeDefined();
    });
  });

  it('does not treat narrative enrichment as evidence for an exact year or a missing closure edge', () => {
    const report = buildEventDetailCoverageReport();
    const reviewItems = report.items.filter((item) => item.status === 'needs-review');

    expect(reviewItems.filter((item) => item.needsReviewChecks.includes('timePrecision'))
      .every((item) => item.timePrecisionStatus === 'needs-review')).toBe(true);
    expect(reviewItems.find((item) => item.eventId === 'white-horse-temple-founded')).toBeUndefined();
    expect(reviewItems.every((item) => item.missingChecks.length === 0)).toBe(true);
    expect(reviewItems.every((item) => item.unresolvedReferenceIds.people.length === 0)).toBe(true);
    expect(reviewItems.every((item) => item.unresolvedReferenceIds.places.length === 0)).toBe(true);
    expect(reviewItems.every((item) => item.unresolvedReferenceIds.polities.length === 0)).toBe(true);
    expect(reviewItems.every((item) => item.unresolvedReferenceIds.relatedEvents.length === 0)).toBe(true);
  });

  it('keeps participant gaps open when only a neighboring stage endpoint is available', () => {
    const report = buildEventDetailCoverageReport();
    const participantGapIds = report.items
      .filter((item) => item.status === 'needs-review' && item.needsReviewChecks.includes('participants'))
      .map((item) => item.eventId)
      .sort();

    expect(participantGapIds).toEqual([]);
    expect(report.items.find((item) => item.eventId === 'changan-han-capital')?.participantIds)
      .toEqual(['liu-bang', 'xiao-he']);
    expect(report.items.find((item) => item.eventId === 'changan-han-capital')?.timePrecisionStatus).toBe('confirmed');
    expect(report.items.filter((item) => item.needsReviewChecks.includes('timePrecision'))).toHaveLength(24);
  });
});
