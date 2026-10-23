import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-li-zhi-ally-wu-zhao-seventyeighth': ['li-zhi', 'ally-of', 'wu-zhao', 655, 683, ['zizhi-tongjian']],
  'claim-liu-zhiyuan-ally-shi-jingtang-seventyeighth': ['liu-zhiyuan', 'ally-of', 'shi-jingtang', 936, 942, ['zizhi-tongjian']],
  'claim-meng-zhixiang-ally-li-cunxu-seventyeighth': ['meng-zhixiang', 'ally-of', 'li-cunxu', 923, 926, ['zizhi-tongjian']],
  'claim-wang-shenzhi-ally-zhu-wen-seventyeighth': ['wang-shenzhi', 'ally-of', 'zhu-wen', 909, 912, ['zizhi-tongjian']],
  'claim-liu-yin-ally-zhu-wen-seventyeighth': ['liu-yin', 'ally-of', 'zhu-wen', 907, 911, ['zizhi-tongjian']],
  'claim-ma-yin-ally-zhu-wen-seventyeighth': ['ma-yin', 'ally-of', 'zhu-wen', 907, 912, ['zizhi-tongjian']],
} as const;

describe('seventy-eighth batch high-confidence alliance relationships', () => {
  it('records only source-backed cooperation with bounded dates', () => {
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
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-seventyeighth'));

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

  it('closes only evidenced alliance gaps and leaves kinship and event gaps unchanged', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.governance).toHaveLength(33);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(109);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(72);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(9);
    for (const personId of ['li-zhi', 'wu-zhao', 'liu-zhiyuan', 'shi-jingtang', 'meng-zhixiang', 'li-cunxu', 'wang-shenzhi', 'liu-yin', 'ma-yin']) {
      expect(report.byPersonId[personId].categories.allianceConflict.status, personId).toBe('covered');
    }
  });
});
