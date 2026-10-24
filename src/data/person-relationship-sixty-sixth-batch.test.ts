import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-kublai-grandchild-temujin-sixtysixth': ['kublai', 'grandchild-of', 'temujin', 1215, 1227, ['yuan-nationalities-history', 'china-chronology']],
  'claim-murong-chao-enemy-liu-yu-sixtysixth': ['murong-chao', 'enemy-of', 'liu-yu', 410, 410, ['zizhi-tongjian', 'china-chronology']],
  'claim-tuoba-tao-enemy-feng-hong-sixtysixth': ['tuoba-tao', 'enemy-of', 'feng-hong', 436, 436, ['zizhi-tongjian', 'china-chronology']],
} as const;

describe('sixty-sixth batch high-confidence kinship and alliance/conflict relationships', () => {
  it('records only the directly supported relationship stages and sources', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo, sourceIds]] of Object.entries(expectedRelations)) {
      expect(claims.find((claim) => claim.id === claimId), claimId).toMatchObject({
        subjectId,
        predicate,
        objectId,
        validFrom,
        validTo,
        datePrecision: claimId === 'claim-kublai-grandchild-temujin-sixtysixth' ? 'range' : 'year',
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
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-sixtysixth'));

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

  it('reduces only the two requested relationship-gap categories', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.governance).toHaveLength(33);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(139);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(84);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(11);
    expect(report.byPersonId.temujin.categories.kinship.status).toBe('covered');
    expect(report.byPersonId['murong-chao'].categories.allianceConflict.status).toBe('covered');
    expect(report.byPersonId['tuoba-tao'].categories.allianceConflict.status).toBe('covered');
    expect(report.byPersonId['feng-hong'].categories.allianceConflict.status).toBe('covered');
  });
});
