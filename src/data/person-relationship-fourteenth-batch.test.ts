import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageAssets } from './heritage';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { people } from './people';
import { polities } from './polities';
import { places } from './places';
import { sourceNotes } from './sources';

const expectedRelations = [
  ['qin-shi-huang', 'participated-in', 'qin-unification'],
  ['liu-bang', 'participated-in', 'han-imperial-accession'],
  ['yang-jian', 'participated-in', 'sui-founded'],
  ['wu-zhao', 'participated-in', 'wu-zhou-founded'],
  ['an-lushan', 'participated-in', 'an-lushan-rebellion'],
  ['li-longji', 'participated-in', 'an-lushan-rebellion'],
] as const;

const batchClaimIds = new Set([
  'claim-yang-jian-ruled-sui-fortythird',
  'claim-wu-zhao-participated-wu-zhou-fortythird',
  'claim-qin-shi-huang-participated-qin-unification',
  'claim-liu-bang-participated-han-imperial-accession',
  'claim-yang-jian-participated-sui-founded',
  'claim-wu-zhao-participated-wu-zhou-founded',
  'claim-an-lushan-participated-an-lushan-rebellion',
  'claim-li-longji-participated-an-lushan-rebellion',
]);

function relation(subjectId: string, predicate: string, objectId: string) {
  return claims.find((claim) => claim.subjectId === subjectId
    && claim.predicate === predicate
    && claim.objectId === objectId);
}

describe('fourteenth-batch historical people relationship selection', () => {
  it('selects six priority people whose event edges are still absent', () => {
    const eventIds = new Set(events.map((event) => event.id));
    const selectedPeople = new Set(expectedRelations.map(([subjectId]) => subjectId));
    const selectedEventIds = new Set(expectedRelations.map(([, , eventId]) => eventId));

    expect(selectedPeople.size).toBe(6);
    expect([...selectedPeople].every((personId) => people.some((person) => person.id === personId))).toBe(true);
    expect([...selectedEventIds].every((eventId) => eventIds.has(eventId))).toBe(true);
    expect(expectedRelations.every(([subjectId, predicate, objectId]) => !claims
      .filter((claim) => !batchClaimIds.has(claim.id))
      .some((claim) => claim.subjectId === subjectId
        && claim.predicate === predicate
        && claim.objectId === objectId))).toBe(true);

    for (const eventId of selectedEventIds) {
      expect(eventDetails.find((detail) => detail.eventId === eventId)).toBeDefined();
    }
  });

  it('adds directed, dated, sourced, confidence-rated person-event claims for every selected person', () => {
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    for (const [subjectId, predicate, objectId] of expectedRelations) {
      const claim = relation(subjectId, predicate, objectId);
      expect(claim, `${subjectId} ${predicate} ${objectId}`).toBeDefined();
      expect(claim?.perspective).toBe('person');
      expect(claim?.validFrom).toEqual(expect.any(Number));
      expect(claim?.validTo).toEqual(expect.any(Number));
      expect(claim?.validFrom).toBeLessThanOrEqual(claim?.validTo ?? Number.NaN);
      expect(['low', 'medium', 'high']).toContain(claim?.confidence);
      expect(claim?.sourceIds.length).toBeGreaterThan(0);
      expect(claim?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
      expect(claim?.uncertaintyNote).toBeTruthy();
    }
  });

  it('keeps every new relation endpoint resolvable and coverage-valid', () => {
    const entityIds = new Set([
      ...polities.map((polity) => polity.id),
      ...people.map((person) => person.id),
      ...events.map((event) => event.id),
      ...heritageAssets.map((asset) => asset.id),
      ...places.map((place) => place.id),
    ]);
    expect(validateClaims(claims, entityIds)).toEqual([]);

    const report = auditKnowledgeCoverage();
    for (const [subjectId] of expectedRelations) {
      expect(report.byKey[`person:${subjectId}`]?.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({ dimension: 'relationship', status: 'covered' }),
      ]));
    }
  });
});
