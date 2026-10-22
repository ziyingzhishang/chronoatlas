import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { events } from './events';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-yao-chang-enemy-fu-jian-fortyeighth': ['yao-chang', 'enemy-of', 'fu-jian', 383, 384],
  'claim-jamukha-participated-mongol-founded-fortyeighth': ['jamukha', 'participated-in', 'mongol-founded', 1189, 1201],
} as const;

describe('forty-eighth batch high-confidence person relationships', () => {
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
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fortyeighth'));
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

  it('closes only the selected applicable gaps', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.byPersonId['yao-chang'].requiredMissingCategoryKeys).not.toContain('allianceConflict');
    expect(report.byPersonId.jamukha.requiredMissingCategoryKeys).not.toContain('eventParticipation');
    expect(report.byPersonId['chen-xu'].requiredMissingCategoryKeys).toContain('kinship');
    expect(report.requiredMissingByCategory).toMatchObject({
      governance: expect.arrayContaining([]),
      kinship: expect.any(Array),
      allianceConflict: expect.any(Array),
      eventParticipation: expect.any(Array),
    });
    expect(report.requiredMissingByCategory.governance).toHaveLength(82);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(109);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(106);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(11);
    expect(report.needsSupplementPersonIds).toHaveLength(156);
  });
});
