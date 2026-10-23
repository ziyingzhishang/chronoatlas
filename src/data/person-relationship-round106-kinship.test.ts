import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { personDetails } from './person-details';

const directKinship = new Set([
  'parent-of',
  'child-of',
  'grandparent-of',
  'grandchild-of',
  'sibling-of',
  'spouse-of',
]);

function hasDirectKinship(left: string, right: string): boolean {
  return claims.some((claim) => directKinship.has(claim.predicate)
    && ((claim.subjectId === left && claim.objectId === right)
      || (claim.subjectId === right && claim.objectId === left)));
}

describe('round 106 kinship boundary audit', () => {
  it('does not promote unnamed or indirect family candidates into direct kinship claims', () => {
    const peopleIds = new Set(people.map((person) => person.id));

    expect(peopleIds.has('huhanye')).toBe(true);
    expect(people.find((person) => person.id === 'huhanye')?.aliases).toContain('郅支单于之兄');
    expect(peopleIds.has('zhizhi-chanyu')).toBe(false);

    expect(personDetails.find((detail) => detail.personId === 'wang-shenzhi')?.biography).toContain('兄长');
    expect(hasDirectKinship('wang-shenzhi', 'wang-chao')).toBe(false);
    expect(peopleIds.has('wang-chao')).toBe(false);

    for (const [left, right] of [
      ['wei-huanzi', 'wei-wenhou'],
      ['sima-yan', 'sima-rui'],
      ['gao-yun', 'feng-ba'],
    ] as const) {
      expect(peopleIds.has(left), left).toBe(true);
      expect(peopleIds.has(right), right).toBe(true);
      expect(hasDirectKinship(left, right), `${left}-${right}`).toBe(false);
    }
  });

  it('keeps the required kinship baseline unchanged and adds no round106 kinship claims', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(claims.filter((claim) => claim.id.includes('round106') && directKinship.has(claim.predicate))).toEqual([]);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(113);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(84);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(13);
  });
});
