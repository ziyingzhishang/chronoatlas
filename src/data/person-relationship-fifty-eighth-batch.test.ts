import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';

const expectedRelations = {
  'claim-gao-yang-ruled-northern-qi-fiftyeighth': ['gao-yang', 'ruled', 'qi_northern', 550, 559, 'zizhi-tongjian'],
  'claim-tuoba-gui-ruled-northern-wei-fiftyeighth': ['tuoba-gui', 'ruled', 'wei_northern', 386, 409, 'zizhi-tongjian'],
  'claim-wanyan-aguda-ruled-jin-fiftyeighth': ['wanyan-aguda', 'ruled', 'jin_jurchen', 1115, 1123, 'zizhi-tongjian'],
  'claim-modu-ruled-xiongnu-fiftyeighth': ['modu-chanyu', 'ruled', 'xiongnu', -209, -174, 'zizhi-tongjian'],
  'claim-temujin-ruled-mongol-fiftyeighth': ['temujin', 'ruled', 'mongol', 1206, 1227, 'china-chronology'],
} as const;

describe('fifty-eighth batch high-confidence governance relationships', () => {
  it('records directly evidenced rulers, dates, directions, and sources', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo, sourceId]] of Object.entries(expectedRelations)) {
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
        sourceIds: [sourceId],
      });
    }
  });

  it('keeps every new edge resolvable, source-backed, and time-valid', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fiftyeighth'));

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

  it('reduces only the five directly evidenced governance gaps', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.requiredMissingByCategory.governance).toHaveLength(36);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(139);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(89);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(17);
    for (const personId of ['gao-yang', 'tuoba-gui', 'wanyan-aguda', 'modu-chanyu', 'temujin']) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('governance');
    }
  });
});
