import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';

const reviewBoundaryReasons = {
  'an-lushan-rebellion': 'multi-year-process',
  'cheng-han-founded': 'formation-approximation',
  'chu-han-contention': 'multi-year-process',
  'chu-warring-founded-eighth-batch': 'traditional-periodization',
  'dali-founded': 'formation-approximation',
  'eastern-zhou-founded-eighth-batch': 'formation-approximation',
  'former-liang-founded': 'formation-approximation',
  'goguryeo-founded': 'formation-approximation',
  'qi-warring-founded-eighth-batch': 'traditional-periodization',
  'qin-state-founded-eighth-batch': 'traditional-periodization',
  'shang-founded-eighth-batch': 'traditional-periodization',
  'silla-founded': 'formation-approximation',
  'southern-ming-founded': 'formation-approximation',
  'tibetan-founded': 'formation-approximation',
  'tuyuhun-founded': 'formation-approximation',
  'western-liang-state-founded': 'formation-approximation',
  'western-liao-founded': 'formation-approximation',
  'western-zhou-founded-eighth-batch': 'traditional-periodization',
  'xia-early-founded-eighth-batch': 'traditional-periodization',
  'xiongnu-founded': 'formation-approximation',
  'yan-warring-founded-eighth-batch': 'traditional-periodization',
  'zhou-conquest': 'traditional-periodization',
} as const;

describe('event details ninety-second round boundary audit', () => {
  it('audits every needs-review event individually before any precision upgrade', () => {
    const report = buildEventDetailCoverageReport();
    const reviewItems = report.items.filter((item) => item.status === 'needs-review');
    const reviewIds = Object.keys(reviewBoundaryReasons).sort();

    expect(report.statusCounts).toEqual({ covered: 89, 'needs-review': 22, unresolved: 0 });
    expect(reviewItems.map((item) => item.eventId)).toEqual(reviewIds);

    reviewItems.forEach((item) => {
      expect(item.sourceComplete, item.eventId).toBe(true);
      expect(item.sourceIds.length, item.eventId).toBeGreaterThan(0);
      expect(item.unresolvedReferenceIds, item.eventId).toEqual({
        people: [], places: [], polities: [], relatedEvents: [], sources: [],
      });
      expect(item.needsReviewChecks, item.eventId).toContain('timePrecision');
      expect(item.needsReviewChecks, item.eventId).toEqual(
        expect.arrayContaining(['timePrecision']),
      );
      expect(item.needsReviewChecks.every((check) => check === 'timePrecision' || check === 'uncertaintyNote'), item.eventId)
        .toBe(true);
      expect(['approximate', 'range'], item.eventId).toContain(item.timePrecision);
      expect(reviewBoundaryReasons[item.eventId as keyof typeof reviewBoundaryReasons], item.eventId)
        .toBeDefined();
    });
  });

  it('does not treat narrative enrichment as evidence for an exact year or a missing closure edge', () => {
    const report = buildEventDetailCoverageReport();
    const reviewItems = report.items.filter((item) => item.status === 'needs-review');

    expect(reviewItems.every((item) => item.timePrecisionStatus === 'needs-review')).toBe(true);
    expect(reviewItems.every((item) => item.missingChecks.length === 0)).toBe(true);
    expect(reviewItems.every((item) => item.unresolvedReferenceIds.people.length === 0)).toBe(true);
    expect(reviewItems.every((item) => item.unresolvedReferenceIds.places.length === 0)).toBe(true);
    expect(reviewItems.every((item) => item.unresolvedReferenceIds.polities.length === 0)).toBe(true);
    expect(reviewItems.every((item) => item.unresolvedReferenceIds.relatedEvents.length === 0)).toBe(true);
  });
});
