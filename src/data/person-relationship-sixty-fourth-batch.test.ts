import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-songtsen-gampo-ruled-tibetan-empire-sixtyfourth': ['songtsen-gampo', 'ruled', 'tibetan_empire', 629, 650, ['zizhi-tongjian', 'china-chronology']],
  'claim-piluo-ge-ruled-nanzhao-sixtyfourth': ['piluo-ge', 'ruled', 'nanzhao', 728, 748, ['zizhi-tongjian', 'china-chronology']],
  'claim-juqu-mengxun-ruled-northern-liang-sixtyfourth': ['juqu-mengxun', 'ruled', 'northern_liang', 401, 433, ['zizhi-tongjian', 'china-chronology']],
  'claim-tuoba-si-ruled-northern-wei-sixtyfourth': ['tuoba-si', 'ruled', 'wei_northern', 409, 423, ['zizhi-tongjian', 'china-chronology']],
  'claim-yelu-yilie-ruled-western-liao-sixtyfourth': ['yelu-yilie', 'ruled', 'western_liao', 1150, 1163, ['china-chronology', 'liaoshi-vol30-yelu-dashi', 'iranica-qara-ketay']],
} as const;

describe('sixty-fourth batch high-confidence governance relationships', () => {
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
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-sixtyfourth'));

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

    expect(report.requiredMissingByCategory.governance).toHaveLength(26);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(110);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(73);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(10);
    for (const personId of ['songtsen-gampo', 'piluo-ge', 'juqu-mengxun', 'tuoba-si', 'yelu-yilie']) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('governance');
    }
  });
});
