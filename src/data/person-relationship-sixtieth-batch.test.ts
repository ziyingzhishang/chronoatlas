import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';

const expectedRelations = {
  'claim-murong-huang-ruled-former-yan-sixtieth': ['murong-huang', 'ruled', 'former_yan', 337, 348, ['zizhi-tongjian', 'china-chronology']],
  'claim-shi-le-ruled-later-zhao-sixtieth': ['shi-le', 'ruled', 'later_zhao', 319, 333, ['zizhi-tongjian', 'china-chronology']],
  'claim-murong-de-ruled-southern-yan-sixtieth': ['murong-de', 'ruled', 'southern_yan', 398, 405, ['zizhi-tongjian', 'china-chronology']],
  'claim-feng-ba-ruled-northern-yan-sixtieth': ['feng-ba', 'ruled', 'northern_yan', 409, 430, ['zizhi-tongjian', 'china-chronology']],
  'claim-li-bian-ruled-southern-tang-sixtieth': ['li-bian', 'ruled', 'southern_tang', 937, 943, ['zizhi-tongjian', 'china-chronology']],
} as const;

describe('sixtieth batch high-confidence governance relationships', () => {
  it('records directly evidenced ruler directions, periods, and sources', () => {
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

  it('keeps every new governance edge resolvable, source-backed, and time-valid', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-sixtieth'));

    expect(batchClaims).toHaveLength(Object.keys(expectedRelations).length);
    expect(validateClaims(batchClaims, new Set([...peopleIds, ...polityIds]))).toEqual([]);
    for (const claim of batchClaims) {
      expect(peopleIds.has(claim.subjectId), claim.id).toBe(true);
      expect(polityIds.has(claim.objectId ?? ''), claim.id).toBe(true);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
    }
  });

  it('reduces only the five governance gaps and leaves other categories unchanged', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.requiredMissingByCategory.governance).toHaveLength(31);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(115);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(85);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(13);
    for (const personId of ['murong-huang', 'shi-le', 'murong-de', 'feng-ba', 'li-bian']) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('governance');
    }
  });
});
