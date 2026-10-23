import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-zhang-shi-ruled-former-liang-sixtythird': ['zhang-shi', 'ruled', 'former_liang', 314, 320, ['zizhi-tongjian', 'china-chronology']],
  'claim-zhang-mao-ruled-former-liang-sixtythird': ['zhang-mao', 'ruled', 'former_liang', 320, 324, ['zizhi-tongjian', 'china-chronology']],
  'claim-qifu-chipan-ruled-western-qin-sixtythird': ['qifu-chipan', 'ruled', 'western_qin', 412, 428, ['zizhi-tongjian', 'china-chronology']],
  'claim-murong-chao-ruled-southern-yan-sixtythird': ['murong-chao', 'ruled', 'southern_yan', 405, 410, ['zizhi-tongjian', 'china-chronology']],
  'claim-chen-qian-ruled-southern-chen-sixtythird': ['chen-qian', 'ruled', 'chen_southern', 559, 566, ['zizhi-tongjian', 'china-chronology']],
} as const;

describe('sixty-third batch high-confidence governance relationships', () => {
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

  it('keeps every new governance edge resolvable and source-backed', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-sixtythird'));

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

    expect(report.requiredMissingByCategory.governance).toHaveLength(24);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(109);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(71);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(11);
    for (const personId of ['zhang-shi', 'zhang-mao', 'qifu-chipan', 'murong-chao', 'chen-qian']) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('governance');
    }
  });
});
