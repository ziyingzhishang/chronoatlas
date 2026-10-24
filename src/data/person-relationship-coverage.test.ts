import { describe, expect, it } from 'vitest';

import { eventDetails } from './event-details';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';

describe('person relationship coverage audit', () => {
  it('audits all people and keeps key relationship categories separate', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.totalPeople).toBe(270);
    expect(report.records).toHaveLength(270);
    expect(report.byPersonId['li-shimin'].categories.governance.status).toBe('covered');
    expect(report.byPersonId['li-shimin'].categories.kinship.status).toBe('covered');
    expect(report.byPersonId['li-shimin'].categories.allianceConflict.status).toBe('covered');
    expect(report.byPersonId['li-shimin'].categories.eventParticipation.status).toBe('covered');
  });

  it('exposes the evidence type and stable evidence id for each covered category', () => {
    const report = buildPersonRelationshipCoverageReport();
    const liShimin = report.byPersonId['li-shimin'];
    const xuanZang = report.byPersonId['xuan-zang'];

    expect(liShimin.categories.governance.evidence).toContainEqual({
      kind: 'claim',
      id: 'claim-li-shimin-ruled-tang',
      evidenceId: 'claim:claim-li-shimin-ruled-tang',
    });
    expect(xuanZang.categories.eventParticipation.evidence).toContainEqual({
      kind: 'event-detail',
      id: 'xuanzang-at-ximing-658',
      evidenceId: 'event-detail:xuanzang-at-ximing-658',
    });
  });

  it('does not call a person complete when only a generic relation is present', () => {
    const report = buildPersonRelationshipCoverageReport();
    const banGu = report.byPersonId['ban-gu'];

    expect(banGu.genericOnly).toBe(true);
    expect(banGu.reachable).toBe(true);
    expect(banGu.complete).toBe(false);
    expect(banGu.missingCategoryKeys).toEqual([
      'governance',
      'kinship',
      'allianceConflict',
      'eventParticipation',
    ]);
    expect(report.genericOnlyPersonIds).toContain('ban-gu');
    expect(report.knowledgeRelationshipCoveredButIncompletePersonIds).toContain('ban-gu');
  });

  it('reports explicit not-applicable categories separately from missing categories', () => {
    const report = buildPersonRelationshipCoverageReport({
      notApplicableByPersonId: {
        'ban-gu': ['eventParticipation'],
      },
    });
    const banGu = report.byPersonId['ban-gu'];

    expect(banGu.categories.eventParticipation.status).toBe('not-applicable');
    expect(banGu.notApplicableCategoryKeys).toEqual(['eventParticipation']);
    expect(banGu.missingCategoryKeys).toEqual([
      'governance',
      'kinship',
      'allianceConflict',
    ]);
    expect(report.notApplicableByCategory.eventParticipation).toContain('ban-gu');
    expect(report.missingByCategory.eventParticipation).not.toContain('ban-gu');
  });

  it('exposes the existing knowledge-coverage task and status for every person', () => {
    const report = buildPersonRelationshipCoverageReport();
    const auditedPerson = report.byPersonId['ban-gu'];

    expect(auditedPerson.knowledgeRelationshipStatus).toMatch(
      /^(covered|relationship-missing|not-applicable|data-missing|source-missing|uncertain)$/,
    );
    expect(report.knowledgeTaskPersonIds).toEqual(
      report.records.filter((record) => record.knowledgeTask).map((record) => record.personId),
    );
  });

  it('uses the default applicability directory to separate required gaps from review items', () => {
    const report = buildPersonRelationshipCoverageReport();
    const xuanzang = report.byPersonId['xuan-zang'];
    const banGu = report.byPersonId['ban-gu'];

    expect(xuanzang.categories.governance.applicabilityStatus).toBe('not-applicable');
    expect(xuanzang.categories.governance.status).toBe('not-applicable');
    expect(report.requiredMissingByCategory.governance).not.toContain('xuan-zang');
    expect(report.needsSupplementPersonIds).not.toContain('xuan-zang');
    expect(report.needsReviewPersonIds).toContain('xuan-zang');

    expect(banGu.requiredMissingCategoryKeys).toContain('governance');
    expect(report.needsSupplementPersonIds).toContain('ban-gu');
  });

  it('reports per-category applicability counts and excludes not-applicable entries from coverage denominators', () => {
    const report = buildPersonRelationshipCoverageReport();
    const governance = report.coverageByCategory.governance;
    const counts = report.applicabilityStatusCounts.governance;

    expect(counts.required + counts['not-applicable'] + counts.review).toBe(270);
    expect(governance.totalPeople).toBe(270);
    expect(governance.notApplicable).toBe(counts['not-applicable']);
    expect(governance.coverageRate).toBeGreaterThanOrEqual(0);
    expect(governance.coverageRate).toBeLessThanOrEqual(1);
  });

  it('keeps contextual Ximing Temple power association separate from Li Zhi event participation', () => {
    const report = buildPersonRelationshipCoverageReport();
    const liZhi = report.byPersonId['li-zhi'];
    const ximingDetail = eventDetails.find((detail) => detail.eventId === 'ximing-temple-built');

    expect(ximingDetail?.participants).toContainEqual(expect.objectContaining({
      personId: 'li-zhi',
      relationType: 'contextual',
    }));
    expect(liZhi.categories.eventParticipation).toMatchObject({
      status: 'covered',
      relatedIds: ['tuyuhun-ended-663'],
    });
    expect(liZhi.categories.eventParticipation.evidence.filter((item) => item.kind === 'event-detail')).toEqual([expect.objectContaining({ evidenceId: 'event-detail:tuyuhun-ended-663' })]);
    expect(report.requiredMissingByCategory.eventParticipation).not.toContain('li-zhi');
    expect(liZhi.categories.eventParticipation.relatedIds).toContain('tuyuhun-ended-663');
    expect(liZhi.categories.eventParticipation.relatedIds).not.toContain('ximing-temple-built');

    const xuanZang = report.byPersonId['xuan-zang'];
    expect(xuanZang.categories.eventParticipation.relatedIds).toContain('xuanzang-at-ximing-658');
    expect(xuanZang.categories.eventParticipation.relatedIds).not.toContain('ximing-temple-built');
  });
});
