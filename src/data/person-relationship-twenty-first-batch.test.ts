import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { events } from './events';
import { getPersonDetail } from './person-details';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const selectedPeople = [
  'han-qian',
  'wei-wenhou',
  'zhao-liehou',
  'jumong',
  'park-hyeokgeose',
  'murong-tuyuhun',
] as const;

const expectedRelations = [
  ['han-qian', 'participated-in', 'han-warring-founded-eighth-batch'],
  ['wei-wenhou', 'participated-in', 'wei-warring-founded-eighth-batch'],
  ['zhao-liehou', 'participated-in', 'zhao-warring-founded-eighth-batch'],
  ['jumong', 'participated-in', 'goguryeo-founded'],
  ['park-hyeokgeose', 'participated-in', 'silla-founded'],
  ['murong-tuyuhun', 'participated-in', 'tuyuhun-founded'],
] as const;

const expectedPersonRelations = [
  ['han-qian', 'related-to', 'wei-wenhou'],
  ['wei-wenhou', 'related-to', 'zhao-liehou'],
  ['zhao-liehou', 'related-to', 'wei-wenhou'],
  ['jumong', 'related-to', 'park-hyeokgeose'],
  ['park-hyeokgeose', 'related-to', 'jumong'],
  ['murong-tuyuhun', 'related-to', 'murong-chui'],
] as const;

describe('twenty-first-batch historical people closure', () => {
  it('provides sourced details for six people selected from participant gaps', () => {
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const eventIds = new Set(events.map((event) => event.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    expect(selectedPeople).toHaveLength(6);
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

  it('adds one directional, dated, sourced event relation for every selected person', () => {
    const entityIds = new Set([...people.map((person) => person.id), ...events.map((event) => event.id)]);
    const eventIds = new Set(events.map((event) => event.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const [subjectId, predicate, objectId] of expectedRelations) {
      const matching = claims.filter((claim) => claim.subjectId === subjectId
        && claim.predicate === predicate
        && claim.objectId === objectId);
      expect(matching, `${subjectId} ${predicate} ${objectId}`).toHaveLength(1);

      const claim = matching[0];
      expect(selectedPeople).toContain(claim.subjectId as typeof selectedPeople[number]);
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

    const batchClaims = claims.filter((claim) => expectedRelations.some(([subjectId, predicate, objectId]) =>
      claim.subjectId === subjectId && claim.predicate === predicate && claim.objectId === objectId));
    expect(validateClaims(batchClaims, entityIds)).toEqual([]);
  });

  it('keeps one explicit person-to-person research edge for every selected person', () => {
    for (const [subjectId, predicate, objectId] of expectedPersonRelations) {
      const claim = claims.find((candidate) => candidate.subjectId === subjectId
        && candidate.predicate === predicate
        && candidate.objectId === objectId);
      expect(claim, `${subjectId} ${predicate} ${objectId}`).toBeDefined();
      expect(claim?.perspective).toBe('person');
      expect(claim?.validFrom).toEqual(expect.any(Number));
      expect(claim?.validTo).toEqual(expect.any(Number));
      expect(claim?.sourceIds.length).toBeGreaterThan(0);
      expect(claim?.uncertaintyNote).toBeTruthy();
    }
  });
});
