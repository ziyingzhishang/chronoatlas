import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-dorgon-enemy-zhu-yousong-sixtyseventh': ['dorgon', 'enemy-of', 'zhu-yousong', 1644, 1645, ['zizhi-tongjian', 'china-chronology']],
  'claim-dorgon-enemy-shi-kefa-sixtyseventh': ['dorgon', 'enemy-of', 'shi-kefa', 1645, 1645, ['zizhi-tongjian', 'china-chronology']],
} as const;

describe('sixty-seventh batch high-confidence alliance/conflict relationships', () => {
  it('records only the directly supported relationship stages and sources', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo, sourceIds]] of Object.entries(expectedRelations)) {
      expect(claims.find((claim) => claim.id === claimId), claimId).toMatchObject({
        subjectId,
        predicate,
        objectId,
        validFrom,
        validTo,
        datePrecision: claimId === 'claim-dorgon-enemy-shi-kefa-sixtyseventh' ? 'year' : 'range',
        perspective: 'person',
        evidenceType: 'cross-checked',
        confidence: 'high',
        sourceIds,
      });
    }
  });

  it('keeps every new relationship edge resolvable, source-backed, and time-valid', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-sixtyseventh'));

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

  it('reduces only the requested alliance/conflict relationship-gap category', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.governance).toHaveLength(41);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(106);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(64);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(9);
    expect(report.byPersonId.dorgon.categories.allianceConflict.status).toBe('covered');
    expect(report.byPersonId['zhu-yousong'].categories.allianceConflict.status).toBe('covered');
    expect(report.byPersonId['shi-kefa'].categories.allianceConflict.status).toBe('covered');
  });
});
