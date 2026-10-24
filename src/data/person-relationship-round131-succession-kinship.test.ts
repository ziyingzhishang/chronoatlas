import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { personDetails } from './person-details';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { sourceNotes } from './sources';

const expectedRelations = [
  {
    claimId: 'claim-taizong-song-succeeded-zhao-kuangyin-round131',
    subjectId: 'taizong-song',
    predicate: 'succeeded',
    objectId: 'zhao-kuangyin',
    validFrom: 976,
    sourceIds: ['zizhi-tongjian', 'china-chronology'],
  },
  {
    claimId: 'claim-li-yuan-succeeded-yang-you-round131',
    subjectId: 'li-yuan',
    predicate: 'succeeded',
    objectId: 'yang-you',
    validFrom: 618,
    sourceIds: ['zizhi-tongjian'],
  },
] as const;

describe('round 131 succession relationship coverage', () => {
  it('records two sourced person-to-person succession edges without upgrading a polity edge', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const expected of expectedRelations) {
      const claim = claims.find((item) => item.id === expected.claimId);

      expect(claim, expected.claimId).toMatchObject({
        subjectId: expected.subjectId,
        predicate: expected.predicate,
        objectId: expected.objectId,
        perspective: 'person',
        evidenceType: 'explicit-record',
        confidence: 'high',
      });
      expect(claim?.validFrom, expected.claimId).toBe(expected.validFrom);
      expect(claim?.validTo, expected.claimId).toBe(expected.validFrom);
      expect(claim?.datePrecision, expected.claimId).toBe('year');
      expect(peopleIds.has(expected.subjectId), expected.claimId).toBe(true);
      expect(peopleIds.has(expected.objectId), expected.claimId).toBe(true);
      expect(claim?.sourceIds).toEqual(expect.arrayContaining(Array.from(expected.sourceIds)));
      expect(claim?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), expected.claimId).toBe(true);
      expect(claim?.uncertaintyNote?.trim(), expected.claimId).toBeTruthy();
    }

    const relationClaims = claims.filter((claim) => expectedRelations.some((expected) => expected.claimId === claim.id));
    expect(validateClaims(relationClaims, peopleIds)).toEqual([]);

    const coverage = buildPersonRelationshipCoverageReport();
    expect(coverage.byPersonId['taizong-song'].categories.governance.status).toBe('covered');
    expect(coverage.byPersonId['li-yuan'].categories.governance.status).toBe('covered');
  });

  it('aligns succession edges with existing office intervals and preserves the existing inverse claim', () => {
    const pairs = [
      ['taizong-song', 'zhao-kuangyin', 976],
      ['li-yuan', 'yang-you', 618],
    ] as const;

    for (const [subjectId, predecessorId, year] of pairs) {
      const subject = personDetails.find((detail) => detail.personId === subjectId);
      const predecessor = personDetails.find((detail) => detail.personId === predecessorId);
      const subjectOffice = subject?.offices.find((office) => office.polityId === subject?.offices[0]?.polityId);
      const predecessorOffice = predecessor?.offices.find((office) => office.validTo === year)
        ?? predecessor?.offices.find((office) => office.validTo !== undefined && office.validTo <= year);

      expect(subjectOffice, subjectId).toBeDefined();
      expect(predecessorOffice, predecessorId).toBeDefined();
      expect(subjectOffice?.validFrom, subjectId).toBe(year);
      expect(predecessorOffice?.validTo, predecessorId).toBeLessThanOrEqual(year);
      expect(predecessorOffice?.validTo, predecessorId).toBeGreaterThanOrEqual(year - 1);
    }

    expect(claims).toContainEqual(expect.objectContaining({
      id: 'claim-yang-you-succeeded-by-li-yuan',
      subjectId: 'yang-you',
      predicate: 'succeeded-by',
      objectId: 'li-yuan',
      validFrom: 618,
      validTo: 618,
    }));
  });
});
