import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-he-lian-bo-bo-ruled-xia-sixtyfirst': ['heliAN-bobo', 'ruled', 'xia', 407, 425, ['zizhi-tongjian']],
  'claim-duan-siping-ruled-dali-sixtyfirst': ['duan-siping', 'ruled', 'dali', 937, 944, ['china-chronology']],
  'claim-qifu-guoren-ruled-western-qin-sixtyfirst': ['qifu-guoren', 'ruled', 'western_qin', 385, 388, ['zizhi-tongjian', 'china-chronology']],
  'claim-yelu-dashi-ruled-western-liao-sixtyfirst': ['yelu-dashi', 'ruled', 'western_liao', 1124, 1143, ['china-chronology']],
  'claim-park-hyeokgeose-ruled-silla-sixtyfirst': ['park-hyeokgeose', 'ruled', 'silla', -57, 4, ['silla-encykorea', 'silla-samguksagi-db']],
} as const;

describe('sixty-first batch high-confidence governance relationships', () => {
  it('records the five directly evidenced ruler directions and periods', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo, sourceIds]] of Object.entries(expectedRelations)) {
      expect(claims.find((claim) => claim.id === claimId), claimId).toMatchObject({
        subjectId,
        predicate,
        objectId,
        validFrom,
        validTo,
        datePrecision: subjectId === 'park-hyeokgeose' ? 'approximate' : 'range',
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
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-sixtyfirst'));

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
    expect(report.requiredMissingByCategory.kinship).toHaveLength(102);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(63);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(9);
    for (const personId of ['heliAN-bobo', 'duan-siping', 'qifu-guoren', 'yelu-dashi', 'park-hyeokgeose']) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('governance');
    }
  });
});
