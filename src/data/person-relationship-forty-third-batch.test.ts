import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { events } from './events';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-wang-mang-ruled-xin-fortythird': ['wang-mang', 'ruled', 'xin', 9, 23],
  'claim-liu-yao-ruled-former-zhao-fortythird': ['liu-yao', 'ruled', 'former_zhao', 318, 329],
  'claim-yao-chang-ruled-later-qin-fortythird': ['yao-chang', 'ruled', 'later_qin', 384, 393],
  'claim-yang-jian-ruled-sui-fortythird': ['yang-jian', 'ruled', 'sui', 581, 604],
  'claim-xiao-daocheng-ruled-southern-qi-fortythird': ['xiao-daocheng', 'ruled', 'qi_southern', 479, 482],
  'claim-zhu-wen-ruled-later-liang-fortythird': ['zhu-wen', 'ruled', 'liang_later', 907, 912],
  'claim-yelu-abaoji-ruled-khitan-fortythird': ['yelu-abaoji', 'ruled', 'khitan', 916, 926],
  'claim-liu-zhiyuan-ruled-later-han-fortythird': ['liu-zhiyuan', 'ruled', 'han_later', 947, 948],
  'claim-zhou-wu-sibling-zhou-gong-dan-fortythird': ['zhou-wu', 'sibling-of', 'zhou-gong-dan', -1046, -1043],
  'claim-liu-xiu-participated-eastern-han-fortythird': ['liu-xiu', 'participated-in', 'han-eastern-founded', 25, 25],
  'claim-chen-baxian-participated-southern-chen-fortythird': ['chen-baxian', 'participated-in', 'southern-chen-founded', 557, 559],
  'claim-wang-wei-participated-an-lushan-fortythird': ['wang-wei', 'participated-in', 'an-lushan-rebellion', 755, 756],
  'claim-du-fu-participated-an-lushan-fortythird': ['du-fu', 'participated-in', 'an-lushan-rebellion', 755, 763],
  'claim-wu-zhao-participated-wu-zhou-fortythird': ['wu-zhao', 'participated-in', 'wu-zhou-founded', 690, 690],
  'claim-yu-wen-tai-ruled-western-wei-fortythird': ['yu-wen-tai', 'ruled', 'wei_western', 535, 556],
} as const;

describe('forty-third batch high-confidence person relationships', () => {
  it('adds the required relationship directions and time ranges', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo]] of Object.entries(expectedRelations)) {
      const claim = claims.find((item) => item.id === claimId);
      expect(claim, claimId).toBeDefined();
      expect(claim).toMatchObject({ subjectId, predicate, objectId, validFrom, validTo, perspective: 'person', confidence: 'high' });
    }
  });

  it('keeps all new claims source-backed, precise, and resolvable', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fortythird'));

    expect(batchClaims).toHaveLength(Object.keys(expectedRelations).length);
    const entityIds = new Set([...peopleIds, ...polityIds, ...eventIds]);
    expect(validateClaims(batchClaims, entityIds)).toEqual([]);
    for (const claim of batchClaims) {
      expect(['served', 'appointed', 'succeeded', 'ruled', 'parent-of', 'child-of', 'sibling-of', 'spouse-of', 'participated-in']).toContain(claim.predicate);
      expect(['explicit-record', 'cross-checked']).toContain(claim.evidenceType);
      expect(claim.datePrecision).toBeDefined();
      expect(claim.sourceIds.length, claim.id).toBeGreaterThan(0);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
    }
  });

  it('closes the selected required coverage categories', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.byPersonId['wang-mang'].requiredMissingCategoryKeys).not.toContain('governance');
    expect(report.byPersonId['liu-yao'].requiredMissingCategoryKeys).not.toContain('governance');
    expect(report.byPersonId['yao-chang'].requiredMissingCategoryKeys).not.toContain('governance');
    expect(report.byPersonId['yang-jian'].requiredMissingCategoryKeys).not.toContain('governance');
    expect(report.byPersonId['xiao-daocheng'].requiredMissingCategoryKeys).not.toContain('governance');
    expect(report.byPersonId['zhu-wen'].requiredMissingCategoryKeys).not.toContain('governance');
    expect(report.byPersonId['yelu-abaoji'].requiredMissingCategoryKeys).not.toContain('governance');
    expect(report.byPersonId['liu-zhiyuan'].requiredMissingCategoryKeys).not.toContain('governance');
    expect(report.byPersonId['zhou-wu'].requiredMissingCategoryKeys).not.toContain('kinship');
    expect(report.byPersonId['liu-xiu'].requiredMissingCategoryKeys).not.toContain('eventParticipation');
    expect(report.byPersonId['chen-baxian'].requiredMissingCategoryKeys).not.toContain('eventParticipation');
    expect(report.byPersonId['wang-wei'].requiredMissingCategoryKeys).not.toContain('eventParticipation');
    expect(report.byPersonId['du-fu'].requiredMissingCategoryKeys).not.toContain('eventParticipation');
    expect(report.byPersonId['wu-zhao'].requiredMissingCategoryKeys).not.toContain('eventParticipation');
    expect(report.byPersonId['yu-wen-tai'].requiredMissingCategoryKeys).not.toContain('governance');
  });
});
