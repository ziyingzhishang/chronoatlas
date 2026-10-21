import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { events } from './events';
import { getPersonDetail } from './person-details';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const selectedPeople = [
  'hongtaiji',
  'mao-zedong',
  'nurhaci',
  'shunzhi',
  'sun-yat-sen',
  'temujin',
] as const;

const expectedRelations = [
  ['temujin', 'ally-of', 'jamukha'],
  ['nurhaci', 'parent-of', 'hongtaiji'],
  ['hongtaiji', 'parent-of', 'shunzhi'],
  ['shunzhi', 'succeeded', 'hongtaiji'],
  ['sun-yat-sen', 'related-to', 'mao-zedong'],
  ['mao-zedong', 'related-to', 'sun-yat-sen'],
] as const;

describe('fifteenth-batch historical people closure', () => {
  it('provides a sourced detail closure for every newly added person', () => {
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
      expect(detail?.keyEvents.length).toBeGreaterThan(0);
      expect(detail?.keyEvents.every((eventId) => eventIds.has(eventId))).toBe(true);
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
      expect(detail?.uncertaintyNote).toBeTruthy();
    }
  });

  it('adds one complete, directional, resolvable person-to-person relation per selected person', () => {
    const entityIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    expect(selectedPeople).toHaveLength(6);
    expect(expectedRelations.every(([subjectId]) => selectedPeople.includes(subjectId as typeof selectedPeople[number]))).toBe(true);

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
});
