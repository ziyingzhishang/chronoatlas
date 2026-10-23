import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-qin-shi-huang-ally-meng-tian-seventyfifth': ['qin-shi-huang', 'ally-of', 'meng-tian', -214, -210, ['zizhi-tongjian']],
  'claim-liu-bingzhong-ally-kublai-seventyfifth': ['liu-bingzhong', 'ally-of', 'kublai', 1260, 1271, ['yuan-li-bingzhong', 'yuan-nationalities-history']],
} as const;

describe('seventy-fifth batch high-confidence alliance relationships', () => {
  it('records directly supported cooperation with bounded dates', () => {
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

  it('keeps the new alliance edges resolvable, source-backed, and time-valid', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-seventyfifth'));

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

    expect(report.requiredMissingByCategory.governance).toHaveLength(32);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(122);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(84);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(11);
    expect(report.byPersonId['qin-shi-huang'].categories.allianceConflict.status).toBe('covered');
    expect(report.byPersonId['meng-tian'].categories.allianceConflict.status).toBe('covered');
    expect(report.byPersonId['liu-bingzhong'].categories.allianceConflict.status).toBe('covered');
    expect(report.byPersonId['kublai'].categories.allianceConflict.status).toBe('covered');
  });
});
