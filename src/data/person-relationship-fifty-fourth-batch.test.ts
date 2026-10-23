import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { polities } from './polities';
import { events } from './events';
import { sourceNotes } from './sources';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';

const expectedRelations = {
  'claim-li-shimin-parent-li-zhi-fiftyfourth': ['li-shimin', 'parent-of', 'li-zhi', 628, 649],
  'claim-li-zhi-child-li-shimin-fiftyfourth': ['li-zhi', 'child-of', 'li-shimin', 628, 683],
  'claim-li-zhi-parent-li-longji-fiftyfourth': ['li-zhi', 'parent-of', 'li-longji', 628, 683],
  'claim-li-longji-child-li-zhi-fiftyfourth': ['li-longji', 'child-of', 'li-zhi', 685, 762],
  'claim-yao-xing-child-yao-chang-fiftyfourth': ['yao-xing', 'child-of', 'yao-chang', 366, 416],
} as const;

describe('fifty-fourth batch high-confidence kinship relationships', () => {
  it('records only directly evidenced directions and ranges', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo]] of Object.entries(expectedRelations)) {
      expect(claims.find((claim) => claim.id === claimId), claimId).toMatchObject({
        subjectId, predicate, objectId, validFrom, validTo,
        perspective: 'person', evidenceType: 'explicit-record', confidence: 'high',
      });
    }
  });

  it('keeps each new relation resolvable, source-backed, and time-valid', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fiftyfourth'));
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

  it('reduces only the directly evidenced kinship gaps', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.byPersonId['li-zhi'].requiredMissingCategoryKeys).not.toContain('kinship');
    expect(report.byPersonId['yao-xing'].requiredMissingCategoryKeys).not.toContain('kinship');
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(12);
  });
});
