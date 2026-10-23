import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';

const expectedRelations = {
  'claim-daemusin-ruled-goguryeo-fiftyseventh': ['daemusin', 'ruled', 'goguryeo', 18, 44, ['china-chronology']],
  'claim-namhae-ruled-silla-fiftyseventh': ['namhae-chachaung', 'ruled', 'silla', 4, 24, ['silla-encykorea', 'silla-samguksagi-db']],
  'claim-naemul-ruled-silla-fiftyseventh': ['naemul-isageum', 'ruled', 'silla', 356, 402, ['silla-encykorea', 'silla-samguksagi-db', 'silla-periodization']],
  'claim-tridu-ruled-tibetan-fiftyseventh': ['tridu-songtsen', 'ruled', 'tibetan_empire', 755, 797, ['china-chronology']],
  'claim-wang-sengbian-enemy-chen-baxian-fiftyseventh': ['wang-sengbian', 'enemy-of', 'chen-baxian', 555, 555, ['zizhi-tongjian', 'china-chronology']],
} as const;

describe('fifty-seventh batch high-confidence person relationships', () => {
  it('records only directly evidenced directions, dates, and sources', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo, sourceIds]] of Object.entries(expectedRelations)) {
      expect(claims.find((claim) => claim.id === claimId), claimId).toMatchObject({
        subjectId,
        predicate,
        objectId,
        validFrom,
        validTo,
        datePrecision: validFrom === validTo ? 'year' : 'range',
        perspective: 'person',
        evidenceType: 'explicit-record',
        confidence: 'high',
        sourceIds,
      });
    }
  });

  it('keeps every new edge resolvable, source-backed, and time-valid', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fiftyseventh'));

    expect(batchClaims).toHaveLength(Object.keys(expectedRelations).length);
    expect(validateClaims(batchClaims, new Set([...peopleIds, ...polityIds]))).toEqual([]);
    for (const claim of batchClaims) {
      expect(peopleIds.has(claim.subjectId), claim.id).toBe(true);
      expect(peopleIds.has(claim.objectId ?? '') || polityIds.has(claim.objectId ?? ''), claim.id).toBe(true);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
    }
  });

  it('reduces only the directly evidenced coverage gaps', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.requiredMissingByCategory.governance).toHaveLength(33);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(84);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(124);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(11);
    for (const personId of ['daemusin', 'namhae-chachaung', 'naemul-isageum', 'tridu-songtsen']) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('governance');
    }
    expect(report.byPersonId['wang-sengbian'].categories.allianceConflict.status).toBe('covered');
  });
});
