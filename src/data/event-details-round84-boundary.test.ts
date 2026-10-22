import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';

// 第84轮只允许在“事件定义本身有明确单点年代、且现有来源可直接支撑”时升级
// datePrecision。当前这批 needs-review 条目均是形成约年、传统纪年或跨年过程；
// 详情叙事的增加不能替代年代证据，因此保留在复核区。
const reviewBoundaryIds = [
  'an-lushan-rebellion',
  'cheng-han-founded',
  'chu-han-contention',
  'chu-warring-founded-eighth-batch',
  'dali-founded',
  'eastern-zhou-founded-eighth-batch',
  'former-liang-founded',
  'goguryeo-founded',
  'qi-warring-founded-eighth-batch',
  'qin-state-founded-eighth-batch',
  'shang-founded-eighth-batch',
  'silla-founded',
  'southern-ming-founded',
  'tibetan-founded',
  'tuyuhun-founded',
  'western-liang-state-founded',
  'western-liao-founded',
  'western-zhou-founded-eighth-batch',
  'xia-early-founded-eighth-batch',
  'xiongnu-founded',
  'yan-warring-founded-eighth-batch',
  'zhou-conquest',
] as const;

describe('event details eighty-fourth batch boundary audit', () => {
  it('keeps all current review-boundary events outside covered without a dual-evidence upgrade', () => {
    const report = buildEventDetailCoverageReport();
    const reviewItems = report.items.filter((item) => item.status === 'needs-review');

    expect(report.statusCounts).toEqual({ covered: 90, 'needs-review': 22, unresolved: 0 });
    expect(reviewItems.map((item) => item.eventId)).toEqual([...reviewBoundaryIds].sort());

    reviewItems.forEach((item) => {
      expect(item.sourceComplete, item.eventId).toBe(true);
      expect(item.sourceIds.length, item.eventId).toBeGreaterThan(0);
      expect(item.unresolvedReferenceIds, item.eventId).toEqual({
        people: [], places: [], polities: [], relatedEvents: [], sources: [],
      });
      expect(['approximate', 'range'], item.eventId).toContain(item.timePrecision);
      expect(item.timePrecisionStatus, item.eventId).toBe('needs-review');
      expect(item.needsReviewChecks, item.eventId).toContain('timePrecision');
    });
  });

  it('documents why narrative enrichment alone cannot close this round', () => {
    const report = buildEventDetailCoverageReport();
    const precisionGaps = report.items.filter((item) => (
      item.status === 'needs-review' && item.needsReviewChecks.includes('timePrecision')
    ));

    expect(precisionGaps).toHaveLength(22);
    expect(precisionGaps.every((item) => item.sourceComplete)).toBe(true);
    expect(precisionGaps.every((item) => item.timePrecision === 'approximate' || item.timePrecision === 'range')).toBe(true);
  });
});
