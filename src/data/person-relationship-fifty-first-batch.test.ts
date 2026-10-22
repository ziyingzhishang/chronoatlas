import { describe, expect, it } from 'vitest';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { events } from './events';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-liu-min-sibling-liu-zhiyuan-fiftyfirst': ['liu-min', 'sibling-of', 'liu-zhiyuan', 895, 948],
  'claim-liu-zhiyuan-sibling-liu-min-fiftyfirst': ['liu-zhiyuan', 'sibling-of', 'liu-min', 895, 948],
} as const;

describe('fifty-first batch high-confidence person relationships', () => {
  it('adds only the explicitly sourced sibling directions and range', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo]] of Object.entries(expectedRelations)) {
      expect(claims.find((claim) => claim.id === claimId), claimId).toMatchObject({
        subjectId, predicate, objectId, validFrom, validTo,
        perspective: 'person', evidenceType: 'explicit-record', confidence: 'high',
      });
    }
  });

  it('keeps every new relation resolvable and source-backed', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fiftyfirst'));
    expect(batchClaims).toHaveLength(Object.keys(expectedRelations).length);
    expect(validateClaims(batchClaims, new Set([...peopleIds, ...polityIds, ...eventIds]))).toEqual([]);
    for (const claim of batchClaims) {
      expect(peopleIds.has(claim.subjectId), claim.id).toBe(true);
      expect(claim.objectId && peopleIds.has(claim.objectId), claim.id).toBe(true);
      expect(claim.sourceIds.length, claim.id).toBeGreaterThan(0);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
    }
  });

  it('closes the directly evidenced kinship gaps without changing unrelated categories', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.byPersonId['liu-min'].requiredMissingCategoryKeys).not.toContain('kinship');
    expect(report.byPersonId['liu-zhiyuan'].requiredMissingCategoryKeys).not.toContain('kinship');
    expect(report.requiredMissingByCategory.kinship).toHaveLength(109);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(108);
  });
});
