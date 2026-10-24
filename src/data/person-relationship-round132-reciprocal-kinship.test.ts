import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { personDetails } from './person-details';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { sourceNotes } from './sources';

const expectedRelations = [
  {
    claimId: 'claim-li-shimin-child-li-yuan-round132',
    subjectId: 'li-shimin',
    predicate: 'child-of',
    objectId: 'li-yuan',
    validFrom: 598,
    validTo: 635,
    datePrecision: 'range',
    sourceIds: ['zizhi-tongjian'],
  },
  {
    claimId: 'claim-hongtaiji-child-nurhaci-round132',
    subjectId: 'hongtaiji',
    predicate: 'child-of',
    objectId: 'nurhaci',
    validFrom: 1592,
    validTo: 1626,
    datePrecision: 'range',
    sourceIds: ['china-chronology'],
  },
  {
    claimId: 'claim-shunzhi-child-hongtaiji-round132',
    subjectId: 'shunzhi',
    predicate: 'child-of',
    objectId: 'hongtaiji',
    validFrom: 1638,
    validTo: 1643,
    datePrecision: 'range',
    sourceIds: ['china-chronology'],
  },
] as const;

describe('round 132 reciprocal kinship relationship coverage', () => {
  it('records source-backed reciprocal edges for existing kinship facts', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const detailIds = new Set(personDetails.map((detail) => detail.personId));

    for (const expected of expectedRelations) {
      const claim = claims.find((item) => item.id === expected.claimId);

      expect(claim, expected.claimId).toMatchObject({
        subjectId: expected.subjectId,
        predicate: expected.predicate,
        objectId: expected.objectId,
        validFrom: expected.validFrom,
        validTo: expected.validTo,
        datePrecision: expected.datePrecision,
        perspective: 'person',
        evidenceType: 'explicit-record',
        confidence: 'high',
      });
      expect(peopleIds.has(expected.subjectId), expected.claimId).toBe(true);
      expect(peopleIds.has(expected.objectId), expected.claimId).toBe(true);
      expect(detailIds.has(expected.subjectId), expected.claimId).toBe(true);
      expect(detailIds.has(expected.objectId), expected.claimId).toBe(true);
      expect(claim?.sourceIds).toEqual(expect.arrayContaining([...expected.sourceIds]));
      expect(claim?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), expected.claimId).toBe(true);
      expect(claim?.uncertaintyNote?.trim(), expected.claimId).toBeTruthy();
    }

    const roundClaims = claims.filter((claim) => expectedRelations.some((expected) => expected.claimId === claim.id));
    expect(roundClaims).toHaveLength(expectedRelations.length);
    expect(validateClaims(roundClaims, peopleIds)).toEqual([]);
  });

  it('preserves the frozen required-gap baseline because every pair already had a direct kinship edge', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.kinship).toHaveLength(169);
    for (const personId of ['li-shimin', 'li-yuan', 'hongtaiji', 'nurhaci', 'shunzhi']) {
      expect(report.byPersonId[personId].categories.kinship.status, personId).toBe('covered');
    }
  });
});
