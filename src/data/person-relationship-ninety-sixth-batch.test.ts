import { describe, expect, it } from 'vitest';

import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { claims } from './claims';
import { people } from './people';

describe('ninety-sixth batch person relationship audit', () => {
  it('records the current required gap baseline', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.totalPeople).toBe(194);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(109);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(79);
  });

  it('does not upgrade ambiguous kinship candidates into direct family edges', () => {
    const report = buildPersonRelationshipCoverageReport();
    const peopleIds = new Set(people.map((person) => person.id));
    const directKinship = new Set(['parent-of', 'child-of', 'grandparent-of', 'grandchild-of', 'sibling-of', 'spouse-of']);

    for (const [left, right] of [['yuan-hong', 'tuoba-tao'], ['wei-huanzi', 'wei-wenhou']] as const) {
      expect(peopleIds.has(left), left).toBe(true);
      expect(peopleIds.has(right), right).toBe(true);
      expect(report.byPersonId[left].requiredMissingCategoryKeys, left).toContain('kinship');
      expect(claims.some((claim) => (
        directKinship.has(claim.predicate)
        && ((claim.subjectId === left && claim.objectId === right) || (claim.subjectId === right && claim.objectId === left))
      )), `${left}-${right}`).toBe(false);
    }
  });

  it('does not convert shared military or family context into alliance claims', () => {
    const report = buildPersonRelationshipCoverageReport();
    const alliance = new Set(['ally-of', 'enemy-of']);
    for (const [left, right] of [['li-gang', 'zong-ze'], ['liu-yan', 'liu-yin']] as const) {
      expect(report.byPersonId[left].requiredMissingCategoryKeys, left).toContain('allianceConflict');
      expect(claims.some((claim) => (
        alliance.has(claim.predicate)
        && ((claim.subjectId === left && claim.objectId === right) || (claim.subjectId === right && claim.objectId === left))
      )), `${left}-${right}`).toBe(false);
    }
  });
});
