import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-feng-sufo-ally-feng-ba-seventyseventh': ['feng-sufo', 'ally-of', 'feng-ba', 409, 415, ['zizhi-tongjian', 'china-chronology']],
  'claim-hou-andu-ally-chen-baxian-seventyseventh': ['hou-andu', 'ally-of', 'chen-baxian', 552, 559, ['zizhi-tongjian', 'china-chronology']],
} as const;

describe('seventy-seventh batch high-confidence alliance relationships', () => {
  it('records only directly supported cooperation with bounded dates', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo, sourceIds]] of Object.entries(expectedRelations)) {
      expect(claims.find((claim) => claim.id === claimId), claimId).toMatchObject({
        subjectId,
        predicate,
        objectId,
        validFrom,
        validTo,
        datePrecision: 'range',
        perspective: 'person',
        evidenceType: 'cross-checked',
        confidence: 'high',
        sourceIds,
      });
    }
  });

  it('keeps every new alliance edge resolvable, source-backed, and time-valid', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-seventyseventh'));

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

  it('closes only the evidenced alliance gaps and leaves kinship and event gaps unchanged', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.governance).toHaveLength(33);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(131);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(83);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(10);
    expect(report.byPersonId['feng-sufo'].categories.allianceConflict.status).toBe('covered');
    expect(report.byPersonId['hou-andu'].categories.allianceConflict.status).toBe('covered');
  });
});
