import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { personDetails } from './person-details';
import { sourceNotes } from './sources';

const expectedRelations = [
  {
    claimId: 'claim-gao-baoxu-succeeded-gao-baorong-round128',
    subjectId: 'gao-baoxu',
    predicate: 'succeeded',
    objectId: 'gao-baorong',
    validFrom: 960,
    validTo: 960,
    evidenceType: 'explicit-record',
    confidence: 'high',
  },
  {
    claimId: 'claim-gao-jichong-succeeded-gao-baoxu-round128',
    subjectId: 'gao-jichong',
    predicate: 'succeeded',
    objectId: 'gao-baoxu',
    validFrom: 962,
    validTo: 962,
    evidenceType: 'explicit-record',
    confidence: 'high',
  },
  {
    claimId: 'claim-gao-baoxu-sibling-gao-jichong-round128',
    subjectId: 'gao-baoxu',
    predicate: 'sibling-of',
    objectId: 'gao-jichong',
    evidenceType: 'cross-checked',
    confidence: 'medium',
  },
] as const;

describe('round 128 Jingnan succession relationship coverage', () => {
  it('records the missing succession chain and reverse kinship navigation', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const expected of expectedRelations) {
      const claim = claims.find((item) => item.id === expected.claimId);
      const { claimId: _claimId, ...claimShape } = expected;

      expect(claim, expected.claimId).toMatchObject(claimShape);
      expect(claim?.perspective, expected.claimId).toBe('person');
      expect(peopleIds.has(expected.subjectId), expected.claimId).toBe(true);
      expect(peopleIds.has(expected.objectId), expected.claimId).toBe(true);
      expect(claim?.sourceIds.length, expected.claimId).toBeGreaterThan(0);
      expect(claim?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), expected.claimId).toBe(true);
      expect(claim?.uncertaintyNote?.trim(), expected.claimId).toBeTruthy();
      if (expected.predicate === 'sibling-of') {
        expect(claim?.validFrom, expected.claimId).toBeUndefined();
        expect(claim?.validTo, expected.claimId).toBeUndefined();
      }
    }

    const relationClaims = claims.filter((claim) => expectedRelations.some((expected) => expected.claimId === claim.id));
    expect(validateClaims(relationClaims, peopleIds)).toEqual([]);
  });

  it('aligns each succession edge with the existing sourced office intervals', () => {
    for (const [personId, predecessorId, year] of [
      ['gao-baoxu', 'gao-baorong', 960],
      ['gao-jichong', 'gao-baoxu', 962],
    ] as const) {
      const detail = personDetails.find((item) => item.personId === personId);
      const predecessor = personDetails.find((item) => item.personId === predecessorId);
      const office = detail?.offices.find((item) => item.polityId === 'jingnan');
      const predecessorOffice = predecessor?.offices.find((item) => item.polityId === 'jingnan');

      expect(office, personId).toBeDefined();
      expect(predecessorOffice, predecessorId).toBeDefined();
      expect(office?.validFrom, personId).toBe(year);
      expect(predecessorOffice?.validTo, predecessorId).toBe(year);
      expect(office?.sourceIds).toEqual(expect.arrayContaining(predecessorOffice?.sourceIds ?? []));
    }
  });
});
