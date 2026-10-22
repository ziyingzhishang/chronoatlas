import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { events } from './events';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-wu-zhao-grandparent-li-longji-fiftysecond': ['wu-zhao', 'grandparent-of', 'li-longji', 685, 705],
  'claim-li-longji-grandchild-wu-zhao-fiftysecond': ['li-longji', 'grandchild-of', 'wu-zhao', 685, 705],
  'claim-liu-xuan-enemy-wang-mang-fiftysecond': ['liu-xuan', 'enemy-of', 'wang-mang', 23, 24],
  'claim-esen-participated-northern-yuan-fiftysecond': ['esen-taishi', 'participated-in', 'northern-yuan-founded', 1453, 1455],
  'claim-tuotuobuhua-participated-northern-yuan-fiftysecond': ['tuotuobuhua', 'participated-in', 'northern-yuan-founded', 1453, 1457],
} as const;

describe('fifty-second batch high-confidence person relationships', () => {
  it('records only the directly sourced relationship directions and ranges', () => {
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
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fiftysecond'));
    expect(batchClaims).toHaveLength(Object.keys(expectedRelations).length);
    expect(validateClaims(batchClaims, new Set([...peopleIds, ...polityIds, ...eventIds]))).toEqual([]);
    for (const claim of batchClaims) {
      expect(peopleIds.has(claim.subjectId), claim.id).toBe(true);
      expect(claim.objectId && (peopleIds.has(claim.objectId) || eventIds.has(claim.objectId)), claim.id).toBe(true);
      expect(claim.sourceIds.length, claim.id).toBeGreaterThan(0);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
    }
  });

  it('reduces only the directly evidenced required gaps', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.byPersonId['li-longji'].requiredMissingCategoryKeys).not.toContain('kinship');
    expect(report.byPersonId['liu-xuan'].requiredMissingCategoryKeys).not.toContain('allianceConflict');
    expect(report.byPersonId['esen-taishi'].requiredMissingCategoryKeys).not.toContain('eventParticipation');
    expect(report.byPersonId.tuotuobuhua.requiredMissingCategoryKeys).not.toContain('eventParticipation');
    expect(report.requiredMissingByCategory.governance).toHaveLength(41);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(106);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(93);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(9);
    expect(report.needsSupplementPersonIds).toHaveLength(146);
  });
});
