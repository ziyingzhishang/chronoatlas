import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { people } from './people';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { sourceNotes } from './sources';

const directKinshipPredicates = new Set([
  'parent-of',
  'child-of',
  'grandparent-of',
  'grandchild-of',
  'sibling-of',
  'spouse-of',
]);

const sourceIds = new Set(sourceNotes.map((source) => source.id));
const peopleById = new Map(people.map((person) => [person.id, person]));

function pairClaims(left: string, right: string) {
  return claims.filter((claim) => (
    (claim.subjectId === left && claim.objectId === right)
      || (claim.subjectId === right && claim.objectId === left)
  ));
}

function sharedSourceIds(left: string, right: string): string[] {
  const leftSources = new Set(peopleById.get(left)?.sourceIds ?? []);
  return (peopleById.get(right)?.sourceIds ?? []).filter((sourceId) => leftSources.has(sourceId));
}

describe('round 111 kinship required-gap boundary audit', () => {
  it('keeps the current required kinship baseline and adds no production claims', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.kinship).toHaveLength(142);
    expect(claims.filter((claim) => claim.id.includes('round111') && directKinshipPredicates.has(claim.predicate))).toEqual([]);
  });

  it('rejects unnamed endpoints before treating family wording as a direct edge', () => {
    const report = buildPersonRelationshipCoverageReport();

    for (const [personId, missingEndpointId] of [
      ['wang-shenzhi', 'wang-chao'],
      ['huhanye', 'zhizhi-chanyu'],
    ] as const) {
      expect(report.requiredMissingByCategory.kinship, personId).toContain(personId);
      expect(peopleById.has(personId), personId).toBe(true);
      expect(peopleById.has(missingEndpointId), `${personId}: endpoint`).toBe(false);
      expect(pairClaims(personId, missingEndpointId), `${personId}: pair claims`).toEqual([]);
      expect(claims.some((claim) => (
        (claim.subjectId === personId || claim.objectId === personId)
          && directKinshipPredicates.has(claim.predicate)
      )), `${personId}: direct kinship`).toBe(false);
    }
  });

  it('keeps named family-context pairs out of direct kinship when the relation remains broad or unsupported', () => {
    const report = buildPersonRelationshipCoverageReport();
    const cases = [
      {
        missingPersonId: 'chen-baxian',
        left: 'chen-xu',
        right: 'chen-baxian',
        note: '宗室亲属',
      },
      {
        missingPersonId: 'murong-chao',
        left: 'murong-chao',
        right: 'murong-de',
        note: '侄辈',
      },
      {
        missingPersonId: 'qifu-guoren',
        left: 'qifu-gangui',
        right: 'qifu-guoren',
        note: '早期部族亲属',
      },
    ] as const;

    for (const boundary of cases) {
      expect(report.requiredMissingByCategory.kinship, boundary.missingPersonId)
        .toContain(boundary.missingPersonId);
      expect(peopleById.has(boundary.left), `${boundary.left}: endpoint`).toBe(true);
      expect(peopleById.has(boundary.right), `${boundary.right}: endpoint`).toBe(true);

      const relationClaims = pairClaims(boundary.left, boundary.right);
      expect(relationClaims.length, `${boundary.left}-${boundary.right}: claims`).toBeGreaterThan(0);
      const sharedSources = sharedSourceIds(boundary.left, boundary.right);
      expect(sharedSources.length, `${boundary.left}-${boundary.right}: shared sources`).toBeGreaterThan(0);
      expect(relationClaims.every((claim) => claim.sourceIds.some((sourceId) => sharedSources.includes(sourceId))),
        `${boundary.left}-${boundary.right}: claim uses shared source`).toBe(true);

      const broadClaims = relationClaims.filter((claim) => claim.predicate === 'related-to');
      expect(broadClaims.length, `${boundary.left}-${boundary.right}: broad claim`).toBeGreaterThan(0);

      for (const claim of broadClaims) {
        expect(claim.predicate, claim.id).toBe('related-to');
        expect(claim.validFrom, claim.id).toBeDefined();
        expect(claim.validTo, claim.id).toBeDefined();
        expect(claim.validFrom!, claim.id).toBeLessThanOrEqual(claim.validTo!);
        expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
        expect(claim.uncertaintyNote, claim.id).toContain(boundary.note);
      }

      expect(relationClaims.some((claim) => directKinshipPredicates.has(claim.predicate)),
        `${boundary.left}-${boundary.right}: direct kinship`).toBe(false);
    }
  });
});
