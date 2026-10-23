import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-wei-zheng-ally-li-shimin-seventysixth': ['wei-zheng', 'ally-of', 'li-shimin', 626, 643, ['zizhi-tongjian']],
  'claim-lv-guang-ally-fu-jian-seventysixth': ['lv-guang', 'ally-of', 'fu-jian', 366, 383, ['zizhi-tongjian']],
  'claim-liu-muzi-ally-liu-yu-seventysixth': ['liu-muzi', 'ally-of', 'liu-yu', 400, 417, ['zizhi-tongjian', 'china-chronology']],
  'claim-zhang-jun-ally-zhao-gou-seventysixth': ['zhang-jun', 'ally-of', 'zhao-gou', 1127, 1135, ['zizhi-tongjian', 'china-chronology']],
  'claim-bayan-ally-kublai-seventysixth': ['bayan', 'ally-of', 'kublai', 1274, 1279, ['yuan-nationalities-history', 'yuan-goryeo-records']],
} as const;

describe('seventy-sixth batch high-confidence alliance relationships', () => {
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
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-seventysixth'));

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

    expect(report.requiredMissingByCategory.governance).toHaveLength(26);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(110);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(73);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(10);
    for (const personId of ['wei-zheng', 'lv-guang', 'fu-jian', 'liu-muzi', 'liu-yu', 'zhang-jun', 'zhao-gou', 'bayan', 'kublai']) {
      expect(report.byPersonId[personId].categories.allianceConflict.status, personId).toBe('covered');
    }
  });
});
