import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { people } from './people';
import { personDetails } from './person-details';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { sourceNotes } from './sources';

const candidates = [
  { personId: 'feng-sufo', counterpartId: 'feng-ba', polityId: 'northern_yan', validFrom: 409, validTo: 415 },
] as const;

const sourceIds = new Set(sourceNotes.map((source) => source.id));

describe('round 127 governance relationship coverage', () => {
  it('closes only the three directly supported governance gaps', () => {
    const report = buildPersonRelationshipCoverageReport();

    for (const candidate of candidates) {
      expect(report.requiredMissingByCategory.governance, candidate.personId)
        .not.toContain(candidate.personId);
    }
  });

  it('requires each governance edge to match a sourced person-detail office interval', () => {
    for (const candidate of candidates) {
      const detail = personDetails.find((item) => item.personId === candidate.personId);
      const office = detail?.offices.find((item) => item.polityId === candidate.polityId);
      const claim = claims.find((item) => (
        item.subjectId === candidate.personId
        && item.predicate === 'served'
        && item.objectId === candidate.counterpartId
      ));

      expect(office, candidate.personId).toBeDefined();
      expect(people.some((person) => person.id === candidate.counterpartId), candidate.personId).toBe(true);
      expect(office?.validFrom, candidate.personId).toBe(candidate.validFrom);
      expect(office?.validTo, candidate.personId).toBe(candidate.validTo);
      expect(claim, candidate.personId).toBeDefined();
      expect(claim?.validFrom, candidate.personId).toBe(candidate.validFrom);
      expect(claim?.validTo, candidate.personId).toBe(candidate.validTo);
      expect(claim?.datePrecision, candidate.personId).toBe('range');
      expect(claim?.sourceIds, candidate.personId).toEqual(expect.arrayContaining(office?.sourceIds ?? []));
      expect(claim?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), candidate.personId).toBe(true);
      expect(claim?.uncertaintyNote, candidate.personId).toContain('效力');
    }
  });

  it('does not upgrade broad same-network context into governance edges', () => {
    const report = buildPersonRelationshipCoverageReport();

    for (const personId of ['du-fu', 'li-gang'] as const) {
      expect(report.requiredMissingByCategory.governance, personId).toContain(personId);
      expect(claims.some((claim) => (
        claim.subjectId === personId
        && claim.predicate === 'served'
        && claim.objectId !== undefined
      )), `${personId}: unsupported served edge`).toBe(false);
    }
  });
});
