import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { sourceNotes } from './sources';

const directPredicates = new Set([
  'parent-of',
  'child-of',
  'grandparent-of',
  'grandchild-of',
  'sibling-of',
  'spouse-of',
  'teacher-of',
  'student-of',
  'served',
  'appointed',
  'ally-of',
  'enemy-of',
  'founded',
  'ruled',
  'succeeded',
  'participated-in',
  'commissioned',
]);
const kinshipPredicates = new Set([
  'parent-of', 'child-of', 'grandparent-of', 'grandchild-of', 'sibling-of', 'spouse-of',
]);

const boundaryPairs = [
  {
    left: 'sima-yan',
    right: 'sima-rui',
    allowedPredicate: 'related-to',
    reason: '现有资料只支持司马氏皇室跨代相关，不能从同姓与政权承接升级为直接亲属或联盟关系。',
  },
] as const;

describe('round 110 person relationship boundary audit', () => {
  it('keeps the current relationship coverage baseline unchanged', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.kinship).toEqual(expect.any(Array));
    expect(report.requiredMissingByCategory.allianceConflict).toEqual(expect.any(Array));
    expect(report.requiredMissingByCategory.governance).toEqual(expect.any(Array));
    expect(report.requiredMissingByCategory.eventParticipation).toEqual(expect.any(Array));
  });

  it('does not upgrade cross-generation related-to evidence into a direct relationship', () => {
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const boundary of boundaryPairs) {
      const left = peopleById.get(boundary.left);
      const right = peopleById.get(boundary.right);
      expect(left, `${boundary.left}: person endpoint`).toBeDefined();
      expect(right, `${boundary.right}: person endpoint`).toBeDefined();
      expect(left?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), `${boundary.left}: sources`).toBe(true);
      expect(right?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), `${boundary.right}: sources`).toBe(true);

      const pairClaims = claims.filter((claim) => (
        ((claim.subjectId === boundary.left && claim.objectId === boundary.right)
          || (claim.subjectId === boundary.right && claim.objectId === boundary.left))
      ));
      expect(pairClaims.length).toBeGreaterThan(0);
      expect(pairClaims.every((claim) => claim.predicate === boundary.allowedPredicate)).toBe(true);
      expect(pairClaims.some((claim) => directPredicates.has(claim.predicate))).toBe(false);
      expect(boundary.reason.trim()).toBeTruthy();
    }
  });

  it('keeps endpoint-missing family clues out of production relationship claims', () => {
    const wangShenzhi = people.find((person) => person.id === 'wang-shenzhi');
    const huhanye = people.find((person) => person.id === 'huhanye');

    expect(wangShenzhi?.description).toContain('兄长');
    expect(huhanye?.aliases).toContain('郅支单于之兄');
    expect(people.some((person) => person.name === '郅支单于')).toBe(false);
    expect(claims.some((claim) => (
      (claim.subjectId === 'wang-shenzhi' || claim.objectId === 'wang-shenzhi')
      && claim.predicate === 'sibling-of'
    ))).toBe(false);
    expect(claims.some((claim) => (
      (claim.subjectId === 'huhanye' || claim.objectId === 'huhanye')
      && kinshipPredicates.has(claim.predicate)
    ))).toBe(false);
  });
});
