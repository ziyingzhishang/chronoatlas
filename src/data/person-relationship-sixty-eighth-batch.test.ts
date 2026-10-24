import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-chen-xu-sibling-chen-qian-sixtyeighth': ['chen-xu', 'sibling-of', 'chen-qian', 530, 566, ['zizhi-tongjian', 'china-chronology']],
} as const;

describe('sixty-eighth batch high-confidence kinship relationships', () => {
  it('records the directly supported sibling relationship with its bounded period and sources', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo, sourceIds]] of Object.entries(expectedRelations)) {
      expect(claims.find((claim) => claim.id === claimId), claimId).toMatchObject({
        subjectId,
        predicate,
        objectId,
        validFrom,
        validTo,
        datePrecision: 'range',
        perspective: 'person',
        evidenceType: 'explicit-record',
        confidence: 'high',
        sourceIds,
      });
    }
  });

  it('keeps the new kinship edge resolvable, source-backed, and time-valid', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-sixtyeighth'));

    expect(batchClaims).toHaveLength(Object.keys(expectedRelations).length);
    expect(validateClaims(batchClaims, new Set([...peopleIds, ...polityIds]))).toEqual([]);
    for (const claim of batchClaims) {
      expect(peopleIds.has(claim.subjectId), claim.id).toBe(true);
      expect(peopleIds.has(claim.objectId ?? ''), claim.id).toBe(true);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
    }
  });

  it('closes only the directly evidenced kinship gap and leaves alliance/conflict gaps unchanged', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.governance).toHaveLength(34);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(139);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(87);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(15);
    expect(report.byPersonId['chen-xu'].categories.kinship.status).toBe('covered');
    expect(report.byPersonId['chen-qian'].categories.kinship.status).toBe('covered');
    expect(report.byPersonId['chen-xu'].categories.allianceConflict.status).toBe('covered');
    expect(report.byPersonId['chen-qian'].categories.allianceConflict.status).toBe('covered');
  });
});
