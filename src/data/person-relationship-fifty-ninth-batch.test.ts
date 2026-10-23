import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';

const expectedRelations = {
  'claim-sun-quan-ruled-wu-fiftyninth': ['sun-quan', 'ruled', 'wu_three', 229, 252, ['zizhi-tongjian', 'china-chronology']],
  'claim-han-qian-ruled-han-warring-fiftyninth': ['han-qian', 'ruled', 'han_warring', -408, -400, ['zizhi-tongjian', 'china-chronology']],
  'claim-wei-wenhou-ruled-wei-warring-fiftyninth': ['wei-wenhou', 'ruled', 'wei_warring', -445, -396, ['zizhi-tongjian', 'china-chronology']],
  'claim-zhao-liehou-ruled-zhao-warring-fiftyninth': ['zhao-liehou', 'ruled', 'zhao_warring', -408, -400, ['zizhi-tongjian', 'china-chronology']],
  'claim-jumong-ruled-goguryeo-fiftyninth': ['jumong', 'ruled', 'goguryeo', -37, -19, ['zizhi-tongjian', 'china-chronology']],
} as const;

describe('fifty-ninth batch high-confidence governance relationships', () => {
  it('records the five directly evidenced ruler directions and periods', () => {
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

  it('keeps every new governance edge resolvable and source-backed', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fiftyninth'));

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
    expect(report.requiredMissingByCategory.governance).toHaveLength(33);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(133);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(83);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(10);
    for (const personId of ['sun-quan', 'han-qian', 'wei-wenhou', 'zhao-liehou', 'jumong']) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('governance');
    }
  });
});
