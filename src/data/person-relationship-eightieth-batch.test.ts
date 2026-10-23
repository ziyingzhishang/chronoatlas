import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-wang-wei-ally-li-longji-eightieth': ['wang-wei', 'ally-of', 'li-longji', 721, 755, ['zizhi-tongjian']],
  'claim-li-hao-ally-lv-guang-eightieth': ['li-hao', 'ally-of', 'lv-guang', 397, 400, ['zizhi-tongjian']],
  'claim-gao-jixing-ally-zhu-wen-eightieth': ['gao-jixing', 'ally-of', 'zhu-wen', 907, 912, ['zizhi-tongjian']],
  'claim-gao-hongtu-ally-zhu-yousong-eightieth': ['gao-hongtu', 'ally-of', 'zhu-yousong', 1644, 1645, ['china-chronology']],
  'claim-harry-truman-ally-edward-stettinius-eightieth': ['harry-truman', 'ally-of', 'edward-stettinius', 1945, 1945, ['un-charter-treaty', 'un-history-official']],
} as const;

describe('eightieth batch high-confidence alliance relationships', () => {
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

  it('keeps every new relationship edge resolvable, source-backed, and time-valid', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-eightieth'));

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

    expect(report.requiredMissingByCategory.governance).toHaveLength(31);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(116);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(85);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(13);
    for (const personId of ['wang-wei', 'li-hao', 'gao-jixing', 'gao-hongtu', 'harry-truman', 'edward-stettinius']) {
      expect(report.byPersonId[personId].categories.allianceConflict.status, personId).toBe('covered');
    }
  });
});
