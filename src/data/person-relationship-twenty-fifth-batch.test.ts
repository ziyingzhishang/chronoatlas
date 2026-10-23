import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { events } from './events';
import { getPersonDetail } from './person-details';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const selectedPeople = [
  'han-kangzi',
  'zhao-xiangzi',
  'wei-huanzi',
  'qi-we-wang',
  'chu-we-wang',
  'yan-zhaowang',
  'qin-xiangong',
] as const;

const expectedEventRelations = [
  ['han-kangzi', 'participated-in', 'partition-jin'],
  ['zhao-xiangzi', 'participated-in', 'partition-jin'],
  ['wei-huanzi', 'participated-in', 'partition-jin'],
  ['qi-we-wang', 'participated-in', 'qi-warring-founded-eighth-batch'],
  ['chu-we-wang', 'participated-in', 'chu-warring-founded-eighth-batch'],
  ['yan-zhaowang', 'participated-in', 'yan-warring-founded-eighth-batch'],
  ['qin-xiangong', 'participated-in', 'qin-state-founded-eighth-batch'],
] as const;

const expectedPersonRelations = [
  ['han-kangzi', 'related-to', 'wei-huanzi'],
  ['zhao-xiangzi', 'ally-of', 'han-kangzi'],
  ['wei-huanzi', 'ally-of', 'zhao-xiangzi'],
  ['qi-we-wang', 'related-to', 'chu-we-wang'],
  ['chu-we-wang', 'related-to', 'qi-we-wang'],
  ['yan-zhaowang', 'related-to', 'qi-we-wang'],
  ['qin-xiaogong', 'related-to', 'qi-we-wang'],
] as const;

describe('twenty-fifth-batch historical people closure', () => {
  it('provides sourced detail closure for seven people selected from participant gaps', () => {
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const eventIds = new Set(events.map((event) => event.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    expect(selectedPeople).toHaveLength(7);
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
      expect(detail?.keyEvents.length).toBeGreaterThan(0);
      expect(detail?.keyEvents.every((eventId) => eventIds.has(eventId))).toBe(true);
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
      expect(detail?.uncertaintyNote).toBeTruthy();
    }
  });

  it('adds one complete event relation for every selected person', () => {
    const entityIds = new Set([...people.map((person) => person.id), ...events.map((event) => event.id)]);
    const eventIds = new Set(events.map((event) => event.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const [subjectId, predicate, objectId] of expectedEventRelations) {
      const matching = claims.filter((claim) => claim.subjectId === subjectId
        && claim.predicate === predicate
        && claim.objectId === objectId);
      expect(matching, `${subjectId} ${predicate} ${objectId}`).toHaveLength(1);
      const claim = matching[0];
      expect(eventIds.has(claim.objectId ?? '')).toBe(true);
      expect(claim.perspective).toBe('person');
      expect(claim.validFrom).toEqual(expect.any(Number));
      expect(claim.validTo).toEqual(expect.any(Number));
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
      expect(['low', 'medium', 'high']).toContain(claim.confidence);
      expect(claim.sourceIds.length).toBeGreaterThan(0);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
      expect(claim.uncertaintyNote).toBeTruthy();
    }

    const batchClaims = claims.filter((claim) => expectedEventRelations.some(([subjectId, predicate, objectId]) =>
      claim.subjectId === subjectId && claim.predicate === predicate && claim.objectId === objectId));
    expect(validateClaims(batchClaims, entityIds)).toEqual([]);
  });

  it('adds one complete resolvable person relation for every selected person', () => {
    const entityIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const [subjectId, predicate, objectId] of expectedPersonRelations) {
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

    const batchClaims = claims.filter((claim) => expectedPersonRelations.some(([subjectId, predicate, objectId]) =>
      claim.subjectId === subjectId && claim.predicate === predicate && claim.objectId === objectId));
    expect(validateClaims(batchClaims, entityIds)).toEqual([]);
  });
});
