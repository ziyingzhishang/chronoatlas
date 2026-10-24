import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-zhu-yuanzhang-ruled-ming-sixtysecond': ['zhu-yuanzhang', 'ruled', 'ming', 1368, 1398, ['china-chronology']],
  'claim-gao-yun-ruled-northern-yan-sixtysecond': ['gao-yun', 'ruled', 'northern_yan', 407, 409, ['zizhi-tongjian', 'china-chronology']],
  'claim-feng-hong-ruled-northern-yan-sixtysecond': ['feng-hong', 'ruled', 'northern_yan', 430, 436, ['zizhi-tongjian', 'china-chronology']],
  'claim-qifu-gangui-ruled-western-qin-sixtysecond': ['qifu-gangui', 'ruled', 'western_qin', 388, 400, ['zizhi-tongjian', 'china-chronology']],
  'claim-huhanye-ruled-xiongnu-sixtysecond': ['huhanye', 'ruled', 'xiongnu', -58, -31, ['zizhi-tongjian', 'china-chronology']],
} as const;

describe('sixty-second batch high-confidence governance relationships', () => {
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
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-sixtysecond'));

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

    expect(report.requiredMissingByCategory.governance).toHaveLength(36);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(139);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(89);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(17);
    for (const personId of ['zhu-yuanzhang', 'gao-yun', 'feng-hong', 'qifu-gangui', 'huhanye']) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('governance');
    }
  });
});
