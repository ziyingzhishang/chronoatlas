import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-gao-yang-enemy-yuan-shanjian-seventyninth': ['gao-yang', 'enemy-of', 'yuan-shanjian', 550, 550, ['zizhi-tongjian', 'china-chronology']],
  'claim-chen-baxian-ally-xiao-yan-seventyninth': ['chen-baxian', 'ally-of', 'xiao-yan', 540, 549, ['zizhi-tongjian']],
  'claim-shunzhi-ally-dorgon-seventyninth': ['shunzhi', 'ally-of', 'dorgon', 1644, 1650, ['zizhi-tongjian', 'china-chronology']],
  'claim-asina-tumen-ally-istemi-seventyninth': ['asina-tumen', 'ally-of', 'istemi', 552, 553, ['turkic-history-db', 'china-chronology']],
  'claim-yuwen-yong-enemy-chen-xu-seventyninth': ['yuwen-yong', 'enemy-of', 'chen-xu', 569, 578, ['zizhi-tongjian', 'china-chronology']],
} as const;

describe('seventy-ninth batch high-confidence alliance/conflict relationships', () => {
  it('records only source-backed cooperation or conflict with bounded dates', () => {
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
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-seventyninth'));

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

  it('closes only the evidenced alliance/conflict gaps and leaves kinship and event gaps unchanged', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.governance).toHaveLength(33);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(138);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(83);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(11);
    for (const personId of ['gao-yang', 'yuan-shanjian', 'xiao-yan', 'chen-baxian', 'shunzhi', 'dorgon', 'asina-tumen', 'istemi', 'yuwen-yong', 'chen-xu']) {
      expect(report.byPersonId[personId].categories.allianceConflict.status, personId).toBe('covered');
    }
  });
});
