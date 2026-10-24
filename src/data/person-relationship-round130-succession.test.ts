import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { personDetails } from './person-details';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { sourceNotes } from './sources';

const expectedRelations = [
  {
    claimId: 'claim-li-jing-succeeded-li-bian-round130',
    subjectId: 'li-jing',
    objectId: 'li-bian',
    validFrom: 943,
    sourceIds: ['song-history-nantang', 'palace-museum-li-jing'],
  },
  {
    claimId: 'claim-li-yu-succeeded-li-jing-round130',
    subjectId: 'li-yu',
    objectId: 'li-jing',
    validFrom: 961,
    sourceIds: ['song-history-nantang', 'palace-museum-li-jing'],
  },
  {
    claimId: 'claim-liu-sheng-succeeded-liu-yan-round130',
    subjectId: 'liu-sheng',
    objectId: 'liu-yan',
    validFrom: 943,
    sourceIds: ['zizhi-tongjian', 'china-chronology'],
  },
  {
    claimId: 'claim-geluofeng-succeeded-piluo-ge-round130',
    subjectId: 'geluofeng',
    objectId: 'piluo-ge',
    validFrom: 748,
    sourceIds: ['zizhi-tongjian', 'china-chronology'],
  },
] as const;

describe('round 130 succession relationship coverage', () => {
  it('records four sourced person-to-person succession edges', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const expected of expectedRelations) {
      const claim = claims.find((item) => item.id === expected.claimId);

      expect(claim, expected.claimId).toMatchObject({
        subjectId: expected.subjectId,
        predicate: 'succeeded',
        objectId: expected.objectId,
        validFrom: expected.validFrom,
        validTo: expected.validFrom,
        datePrecision: 'year',
        perspective: 'person',
        evidenceType: 'explicit-record',
        confidence: 'high',
      });
      expect(peopleIds.has(expected.subjectId), expected.claimId).toBe(true);
      expect(peopleIds.has(expected.objectId), expected.claimId).toBe(true);
      expect(claim?.sourceIds).toEqual(expect.arrayContaining(Array.from(expected.sourceIds)));
      expect(claim?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), expected.claimId).toBe(true);
      expect(claim?.uncertaintyNote?.trim(), expected.claimId).toBeTruthy();
    }

    const relationClaims = claims.filter((claim) => expectedRelations.some((expected) => expected.claimId === claim.id));
    expect(validateClaims(relationClaims, peopleIds)).toEqual([]);

    const coverage = buildPersonRelationshipCoverageReport();
    for (const expected of expectedRelations) {
      expect(coverage.byPersonId[expected.subjectId].categories.governance.status, expected.claimId).toBe('covered');
    }
  });

  it('aligns each succession edge with sourced office intervals and the relevant event record', () => {
    for (const [subjectId, predecessorId, year] of [
      ['li-jing', 'li-bian', 943],
      ['li-yu', 'li-jing', 961],
      ['liu-sheng', 'liu-yan', 943],
      ['geluofeng', 'piluo-ge', 748],
    ] as const) {
      const subject = personDetails.find((detail) => detail.personId === subjectId);
      const predecessor = personDetails.find((detail) => detail.personId === predecessorId);
      const subjectOffice = subject?.offices.find((office) => office.polityId === subject?.offices[0]?.polityId);
      const predecessorOffice = predecessor?.offices.find((office) => office.polityId === subjectOffice?.polityId && office.validTo === year)
        ?? predecessor?.offices.find((office) => office.polityId === subjectOffice?.polityId);

      expect(subjectOffice, subjectId).toBeDefined();
      expect(predecessorOffice, predecessorId).toBeDefined();
      expect(subjectOffice?.validFrom, subjectId).toBe(year);
      expect(predecessorOffice?.validTo, predecessorId).toBeGreaterThanOrEqual(year - 1);
      expect(predecessorOffice?.validTo, predecessorId).toBeLessThanOrEqual(year);

      const claim = claims.find((item) => item.id === `claim-${subjectId}-succeeded-${predecessorId}-round130`);
      expect(claim?.sourceIds.some((sourceId) => subjectOffice?.sourceIds.includes(sourceId)), subjectId).toBe(true);
      expect(claim?.sourceIds.some((sourceId) => predecessorOffice?.sourceIds.includes(sourceId)), predecessorId).toBe(true);
    }
  });
});
