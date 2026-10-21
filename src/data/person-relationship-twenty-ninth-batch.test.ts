import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { events } from './events';
import { getPersonDetail } from './person-details';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const selectedPeople = [
  'yuri-goguryeo',
  'naemul-isageum',
  'istemi',
  'tridu-songtsen',
  'feng-hong',
  'murong-chao',
  'yelu-yilie',
  'liu-muzi',
] as const;

const expectedEventRelations = [
  ['yuri-goguryeo', 'participated-in', 'goguryeo-founded'],
  ['naemul-isageum', 'participated-in', 'silla-founded'],
  ['istemi', 'participated-in', 'turkic-founded'],
  ['tridu-songtsen', 'participated-in', 'tibetan-founded'],
  ['feng-hong', 'participated-in', 'northern-yan-founded'],
  ['murong-chao', 'participated-in', 'southern-yan-founded'],
  ['yelu-yilie', 'participated-in', 'western-liao-founded'],
  ['liu-muzi', 'participated-in', 'liu-song-founded'],
] as const;

const expectedPersonRelations = [
  ['yuri-goguryeo', 'related-to', 'jumong'],
  ['naemul-isageum', 'related-to', 'namhae-chachaung'],
  ['istemi', 'sibling-of', 'asina-tumen'],
  ['tridu-songtsen', 'related-to', 'songtsen-gampo'],
  ['feng-hong', 'sibling-of', 'feng-ba'],
  ['murong-chao', 'related-to', 'murong-de'],
  ['yelu-yilie', 'child-of', 'yelu-dashi'],
  ['liu-muzi', 'served', 'liu-yu'],
] as const;

describe('twenty-ninth-batch historical people closure', () => {
  it('provides complete resolvable records for eight people selected from participant gaps', () => {
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const eventIds = new Set(events.map((event) => event.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    expect(selectedPeople).toHaveLength(8);
    for (const personId of selectedPeople) {
      const person = peopleById.get(personId);
      const detail = getPersonDetail(personId);

      expect(person, `${personId} base record`).toBeDefined();
      expect(person?.description, personId).toBeTruthy();
      expect(person?.roles?.length, personId).toBeGreaterThan(0);
      expect(person?.polityIds?.length, personId).toBeGreaterThan(0);
      expect(person?.polityIds?.every((polityId) => polityIds.has(polityId)), personId).toBe(true);
      expect(person?.sourceIds.length, personId).toBeGreaterThan(0);
      expect(person?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), personId).toBe(true);

      expect(detail, `${personId} detail record`).toBeDefined();
      expect(detail?.biography, personId).toBeTruthy();
      expect(detail?.offices.length, personId).toBeGreaterThan(0);
      expect(detail?.keyEvents.length, personId).toBeGreaterThan(0);
      expect(detail?.keyEvents.every((eventId) => eventIds.has(eventId)), personId).toBe(true);
      expect(detail?.sourceIds.length, personId).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), personId).toBe(true);
      expect(detail?.uncertaintyNote, personId).toBeTruthy();
    }
  });

  it('provides one complete event relation for every selected person', () => {
    const entityIds = new Set([...people.map((person) => person.id), ...events.map((event) => event.id)]);
    const eventIds = new Set(events.map((event) => event.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const [subjectId, predicate, objectId] of expectedEventRelations) {
      const matching = claims.filter((claim) => claim.subjectId === subjectId
        && claim.predicate === predicate
        && claim.objectId === objectId);
      expect(matching, `${subjectId} ${predicate} ${objectId}`).toHaveLength(1);
      const claim = matching[0];
      expect(eventIds.has(claim.objectId ?? ''), objectId).toBe(true);
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

  it('provides one complete resolvable person relation for every selected person', () => {
    const personIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const [subjectId, predicate, objectId] of expectedPersonRelations) {
      const matching = claims.filter((claim) => claim.subjectId === subjectId
        && claim.predicate === predicate
        && claim.objectId === objectId);
      expect(matching, `${subjectId} ${predicate} ${objectId}`).toHaveLength(1);
      const claim = matching[0];
      expect(personIds.has(claim.subjectId), subjectId).toBe(true);
      expect(personIds.has(claim.objectId ?? ''), objectId).toBe(true);
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
    expect(validateClaims(batchClaims, personIds)).toEqual([]);
  });
});
