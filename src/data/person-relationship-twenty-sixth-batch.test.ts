import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { getPersonDetail } from './person-details';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const selected = {
  'asina-tumen': 'turkic-founded',
  'qifu-guoren': 'western-qin-founded',
  'gao-yun': 'northern-yan-founded',
  'gao-yang': 'northern-qi-founded',
  'gao-huan': 'eastern-wei-founded',
  dorgon: 'qing-enters-pass',
  mongke: 'mongol-founded',
  geluofeng: 'nanzhao-founded',
} as const;

const directEventRelations = [
  ['asina-tumen', 'participated-in', 'turkic-founded'],
  ['qifu-guoren', 'participated-in', 'western-qin-founded'],
  ['gao-yun', 'participated-in', 'northern-yan-founded'],
  ['gao-yang', 'participated-in', 'northern-qi-founded'],
  ['gao-huan', 'participated-in', 'eastern-wei-founded'],
  ['dorgon', 'participated-in', 'qing-enters-pass'],
] as const;

const personRelations = [
  ['asina-tumen', 'related-to', 'modu-chanyu'],
  ['qifu-guoren', 'enemy-of', 'fu-jian'],
  ['gao-yun', 'related-to', 'feng-ba'],
  ['gao-yang', 'child-of', 'gao-huan'],
  ['gao-huan', 'parent-of', 'gao-yang'],
  ['dorgon', 'sibling-of', 'shunzhi'],
  ['mongke', 'sibling-of', 'kublai'],
  ['geluofeng', 'child-of', 'piluo-ge'],
] as const;

describe('twenty-sixth-batch historical people closure', () => {
  it('provides complete resolvable records for the audited eight-person batch', () => {
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const eventIds = new Set(eventDetails.map((detail) => detail.eventId));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    expect(Object.keys(selected)).toHaveLength(8);
    for (const [personId, eventId] of Object.entries(selected)) {
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
      expect(detail?.keyEvents, personId).toContain(eventId);
      expect(detail?.keyEvents.every((keyEventId) => eventIds.has(keyEventId)), personId).toBe(true);
      expect(detail?.sourceIds.length, personId).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), personId).toBe(true);
      expect(detail?.uncertaintyNote, personId).toBeTruthy();
      detail?.offices.forEach((office) => office.sourceIds.forEach((sourceId) => {
        expect(sourceIds.has(sourceId), `${personId} office -> ${sourceId}`).toBe(true);
      }));
    }
  });

  it('provides sourced event relations for every direct event participant', () => {
    const entityIds = new Set([...people.map((person) => person.id), ...eventDetails.map((detail) => detail.eventId)]);
    const eventIds = new Set(eventDetails.map((detail) => detail.eventId));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const [subjectId, predicate, objectId] of directEventRelations) {
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

    const batchClaims = claims.filter((claim) => directEventRelations.some(([subjectId, predicate, objectId]) => (
      claim.subjectId === subjectId && claim.predicate === predicate && claim.objectId === objectId
    )));
    expect(validateClaims(batchClaims, entityIds)).toEqual([]);
  });

  it('provides one sourced and resolvable person relation for every selected person', () => {
    const personIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const [subjectId, predicate, objectId] of personRelations) {
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

    const batchClaims = claims.filter((claim) => personRelations.some(([subjectId, predicate, objectId]) => (
      claim.subjectId === subjectId && claim.predicate === predicate && claim.objectId === objectId
    )));
    expect(validateClaims(batchClaims, personIds)).toEqual([]);
  });
});
