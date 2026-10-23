import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { events } from './events';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';

const expectedRelations = {
  'claim-gao-yun-enemy-feng-ba-fiftythird': ['gao-yun', 'enemy-of', 'feng-ba', 409, 409],
  'claim-li-xiong-ruled-cheng-han-fiftythird': ['li-xiong', 'ruled', 'cheng_han', 306, 334],
  'claim-yang-xingmi-ruled-yang-wu-fiftythird': ['yang-xingmi', 'ruled', 'wu_ten', 902, 905],
  'claim-qian-liu-ruled-wuyue-fiftythird': ['qian-liu', 'ruled', 'wuyue', 907, 932],
  'claim-sima-yan-ruled-western-jin-fiftythird': ['sima-yan', 'ruled', 'jin_western', 265, 290],
} as const;

describe('fifty-third batch high-confidence person relationships', () => {
  it('records only directly evidenced directions and ranges', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo]] of Object.entries(expectedRelations)) {
      expect(claims.find((claim) => claim.id === claimId), claimId).toMatchObject({
        subjectId, predicate, objectId, validFrom, validTo,
        perspective: 'person', evidenceType: expect.stringMatching(/^(explicit-record|cross-checked)$/), confidence: 'high',
      });
    }
  });

  it('keeps every new relation resolvable, source-backed, and time-valid', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fiftythird'));
    expect(batchClaims).toHaveLength(Object.keys(expectedRelations).length);
    expect(validateClaims(batchClaims, new Set([...peopleIds, ...polityIds, ...eventIds]))).toEqual([]);
    for (const claim of batchClaims) {
      expect(peopleIds.has(claim.subjectId), claim.id).toBe(true);
      expect(claim.objectId && (peopleIds.has(claim.objectId) || polityIds.has(claim.objectId)), claim.id).toBe(true);
      expect(claim.sourceIds.length, claim.id).toBeGreaterThan(0);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
    }
  });

  it('closes only the directly evidenced required gaps', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.byPersonId['gao-yun'].requiredMissingCategoryKeys).not.toContain('allianceConflict');
    expect(report.byPersonId['feng-ba'].requiredMissingCategoryKeys).not.toContain('allianceConflict');
    expect(report.byPersonId['li-xiong'].requiredMissingCategoryKeys).not.toContain('governance');
    expect(report.byPersonId['yang-xingmi'].requiredMissingCategoryKeys).not.toContain('governance');
    expect(report.byPersonId['qian-liu'].requiredMissingCategoryKeys).not.toContain('governance');
    expect(report.byPersonId['sima-yan'].requiredMissingCategoryKeys).not.toContain('governance');
    expect(report.requiredMissingByCategory.governance).toHaveLength(32);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(120);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(86);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(13);
  });
});
