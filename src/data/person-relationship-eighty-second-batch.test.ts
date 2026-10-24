import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';

const eventParticipationReviewBoundary = [
  'huo-qubing',
  'zhang-qian',
  'ban-gu',
  'li-zhi',
  'yuan-hong',
  'chai-rong',
  'ma-xiguang',
  'ma-xie',
  'qin-mugong',
  'gao-baorong',
  'gao-baoxu',
  'liu-sheng',
  'seondeok-silla',
  'jindeok-silla',
  'sinmun-silla',
  'wang-yenxi',
] as const;

describe('eighty-second batch relationship audit', () => {
  it('freezes the current four-category gap boundary', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.governance).toHaveLength(37);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(151);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(94);
    expect(report.requiredMissingByCategory.eventParticipation).toEqual(eventParticipationReviewBoundary);
  });

  it('keeps event-participation candidates in review until an event endpoint is evidenced', () => {
    const report = buildPersonRelationshipCoverageReport();

    for (const personId of eventParticipationReviewBoundary) {
      const coverage = report.byPersonId[personId].categories.eventParticipation;
      expect(coverage.status, personId).toBe('missing');
      expect(coverage.evidence.every((item) => item.kind === 'role'), personId).toBe(true);
      expect(coverage.relatedIds, personId).toEqual([]);
    }
  });

  it('does not treat low-confidence cross-period indexes as relationship evidence', () => {
    const report = buildPersonRelationshipCoverageReport();

    for (const personId of ['yuan-hong', 'zhao-wuling', 'murong-tuyuhun', 'duan-siping', 'li-yuanhao']) {
      expect(report.byPersonId[personId].categories.kinship.status, personId).toBe('missing');
      expect(report.byPersonId[personId].categories.allianceConflict.status, personId).toBe('missing');
    }
  });

  it('keeps the claim catalog free of duplicate relationship records', () => {
    const claimIds = claims.map((claim) => claim.id);
    expect(new Set(claimIds).size).toBe(claimIds.length);
  });
});
