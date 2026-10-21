import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { events } from './events';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-yao-xing-ruled-later-qin-fortyseventh': ['yao-xing', 'ruled', 'later_qin', 394, 416],
  'claim-wang-jian-ruled-former-shu-fortyseventh': ['wang-jian', 'ruled', 'former_shu', 907, 918],
  'claim-li-yuanhao-ruled-western-xia-fortyseventh': ['li-yuanhao', 'ruled', 'western_xia', 1038, 1048],
  'claim-liu-yan-ruled-southern-han-fortyseventh': ['liu-yan', 'ruled', 'southern_han', 917, 942],
  'claim-liu-min-ruled-northern-han-fortyseventh': ['liu-min', 'ruled', 'northern_han', 951, 954],
  'claim-shunzhi-participated-qing-enters-pass-fortyseventh': ['shunzhi', 'participated-in', 'qing-enters-pass', 1644, 1644],
  'claim-mongke-ruled-mongol-fortyseventh': ['mongke', 'ruled', 'mongol', 1251, 1259],
} as const;

describe('forty-seventh batch high-confidence person relationships', () => {
  it('adds only the selected sourced relationship directions and ranges', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo]] of Object.entries(expectedRelations)) {
      expect(claims.find((claim) => claim.id === claimId), claimId).toMatchObject({
        subjectId, predicate, objectId, validFrom, validTo,
        perspective: 'person', evidenceType: expect.stringMatching(/^(explicit-record|cross-checked)$/), confidence: 'high',
      });
    }
  });

  it('keeps every new relation resolvable and source-backed', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fortyseventh'));
    expect(batchClaims).toHaveLength(Object.keys(expectedRelations).length);
    expect(validateClaims(batchClaims, new Set([...peopleIds, ...polityIds, ...eventIds]))).toEqual([]);
    for (const claim of batchClaims) {
      expect(peopleIds.has(claim.subjectId), claim.id).toBe(true);
      expect(claim.objectId && (peopleIds.has(claim.objectId) || polityIds.has(claim.objectId) || eventIds.has(claim.objectId)), claim.id).toBe(true);
      expect(claim.sourceIds.length, claim.id).toBeGreaterThan(0);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
    }
  });

  it('closes the selected required governance and event-participation gaps', () => {
    const report = buildPersonRelationshipCoverageReport();
    for (const personId of ['yao-xing', 'wang-jian', 'li-yuanhao', 'liu-yan', 'liu-min', 'mongke']) {
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('governance');
    }
    expect(report.byPersonId.shunzhi.requiredMissingCategoryKeys).not.toContain('eventParticipation');
  });
});
