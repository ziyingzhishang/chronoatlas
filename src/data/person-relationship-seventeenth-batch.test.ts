import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { events } from './events';
import { getPersonDetail } from './person-details';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const selectedPeople = ['cao-cao', 'liu-bei', 'sun-quan'] as const;

const expectedRelations = [
  ['cao-cao', 'enemy-of', 'liu-bei'],
  ['liu-bei', 'enemy-of', 'cao-cao'],
  ['cao-cao', 'enemy-of', 'sun-quan'],
  ['sun-quan', 'enemy-of', 'cao-cao'],
  ['liu-bei', 'ally-of', 'sun-quan'],
  ['sun-quan', 'ally-of', 'liu-bei'],
] as const;

describe('seventeenth-batch core Three Kingdoms people', () => {
  it('provides a complete, sourced person and detail record for each core figure', () => {
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const eventIds = new Set(events.map((event) => event.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const personId of selectedPeople) {
      const person = peopleById.get(personId);
      const detail = getPersonDetail(personId);

      expect(person, `${personId} base record`).toBeDefined();
      expect(person?.description).toBeTruthy();
      expect(person?.roles?.length).toBeGreaterThan(0);
      expect(person?.polityIds?.length).toBeGreaterThan(0);
      expect(person?.polityIds?.every((polityId) => polityIds.has(polityId))).toBe(true);
      expect(person?.sourceIds.length).toBeGreaterThan(0);
      expect(person?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);

      expect(detail, `${personId} detail record`).toBeDefined();
      expect(detail?.biography).toBeTruthy();
      expect(detail?.offices.length).toBeGreaterThan(0);
      expect(detail?.offices.some((office) => office.polityId && polityIds.has(office.polityId))).toBe(true);
      expect(detail?.keyEvents).toEqual(expect.arrayContaining(['red-cliffs', 'three-kingdoms']));
      expect(detail?.keyEvents.every((eventId) => eventIds.has(eventId))).toBe(true);
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
      expect(detail?.uncertaintyNote).toBeTruthy();
    }
  });

  it('adds directional, dated, sourced person relations with resolvable endpoints', () => {
    const entityIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const [subjectId, predicate, objectId] of expectedRelations) {
      const matching = claims.filter((claim) => claim.subjectId === subjectId
        && claim.predicate === predicate
        && claim.objectId === objectId);
      expect(matching, `${subjectId} ${predicate} ${objectId}`).toHaveLength(1);

      const claim = matching[0];
      expect(entityIds.has(claim.subjectId)).toBe(true);
      expect(entityIds.has(claim.objectId ?? '')).toBe(true);
      expect(claim.perspective).toBe('person');
      expect(claim.validFrom).toEqual(expect.any(Number));
      expect(claim.validTo).toEqual(expect.any(Number));
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
      expect(['low', 'medium', 'high']).toContain(claim.confidence);
      expect(claim.sourceIds.length).toBeGreaterThan(0);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
      expect(claim.uncertaintyNote).toBeTruthy();
    }

    const batchClaims = claims.filter((claim) => expectedRelations.some(([subjectId, predicate, objectId]) =>
      claim.subjectId === subjectId && claim.predicate === predicate && claim.objectId === objectId));
    expect(validateClaims(batchClaims, entityIds)).toEqual([]);
  });

  it('connects the three figures to existing Three Kingdoms event IDs for later detail closure', () => {
    const eventClaims = claims.filter((claim) => selectedPeople.includes(claim.subjectId as typeof selectedPeople[number])
      && claim.predicate === 'participated-in'
      && ['red-cliffs', 'three-kingdoms'].includes(claim.objectId ?? ''));

    expect(eventClaims.length).toBeGreaterThanOrEqual(3);
    expect(eventClaims.every((claim) => claim.perspective === 'person')).toBe(true);
    expect(eventClaims.every((claim) => claim.sourceIds.length > 0)).toBe(true);
    expect(eventClaims.every((claim) => claim.uncertaintyNote)).toBe(true);
  });
});
