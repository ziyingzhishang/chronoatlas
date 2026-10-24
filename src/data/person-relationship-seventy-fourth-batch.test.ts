import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-ji-chang-ally-zhou-wu-seventyfourth': ['ji-chang', 'ally-of', 'zhou-wu', -1050, -1047, ['china-chronology', 'western-zhou-national-museum']],
} as const;

describe('seventy-fourth batch high-confidence alliance relationships', () => {
  it('records the directly supported pre-conquest Western Zhou cooperation with bounded dates', () => {
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

  it('keeps the new alliance edge resolvable, source-backed, and time-valid', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-seventyfourth'));

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

  it('closes only the evidenced alliance gap and leaves kinship and event gaps unchanged', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.governance).toHaveLength(37);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(142);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(89);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(17);
    expect(report.byPersonId['ji-chang'].categories.allianceConflict.status).toBe('covered');
    expect(report.byPersonId['zhou-wu'].categories.allianceConflict.status).toBe('covered');
    expect(report.byPersonId['ji-chang'].categories.kinship.status).toBe('covered');
    expect(report.byPersonId['zhou-wu'].categories.eventParticipation.status).toBe('covered');
  });
});
