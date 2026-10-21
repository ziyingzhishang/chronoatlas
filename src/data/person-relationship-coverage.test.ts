import { describe, expect, it } from 'vitest';

import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';

describe('person relationship coverage audit', () => {
  it('audits all 170 people and keeps key relationship categories separate', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.totalPeople).toBe(170);
    expect(report.records).toHaveLength(170);
    expect(report.byPersonId['li-shimin'].categories.governance.status).toBe('covered');
    expect(report.byPersonId['li-shimin'].categories.kinship.status).toBe('covered');
    expect(report.byPersonId['li-shimin'].categories.allianceConflict.status).toBe('covered');
    expect(report.byPersonId['li-shimin'].categories.eventParticipation.status).toBe('covered');
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
});
