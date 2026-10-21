import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { events } from './events';
import { getPersonDetail } from './person-details';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const selectedPeople = {
  'zhang-mao': { polityId: 'former_liang', eventId: 'former-liang-founded', relation: ['child-of', 'zhang-gui'] },
  'qifu-chipan': { polityId: 'western_qin', eventId: 'western-qin-founded', relation: ['child-of', 'qifu-gangui'] },
  'feng-sufo': { polityId: 'northern_yan', eventId: 'northern-yan-founded', relation: ['sibling-of', 'feng-ba'] },
  'hou-andu': { polityId: 'chen_southern', eventId: 'southern-chen-founded', relation: ['served', 'chen-baxian'] },
  'chen-qian': { polityId: 'chen_southern', eventId: 'southern-chen-founded', relation: ['succeeded', 'chen-baxian'] },
  'yimouxun': { polityId: 'nanzhao', eventId: 'nanzhao-founded', relation: ['child-of', 'geluofeng'] },
  'quanfengyou': { polityId: 'nanzhao', eventId: 'nanzhao-founded', relation: ['succeeded', 'yimouxun'] },
} as const;

describe('thirty-second batch historical people closure', () => {
  it('provides complete, sourced detail for seven priority participant endpoints', () => {
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const eventIds = new Set(events.map((event) => event.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    expect(Object.keys(selectedPeople)).toHaveLength(7);
    for (const [personId, expected] of Object.entries(selectedPeople)) {
      const person = peopleById.get(personId);
      const detail = getPersonDetail(personId);

      expect(person, `${personId} base record`).toBeDefined();
      expect(person?.description.trim(), personId).not.toBe('');
      expect(person?.roles?.length, personId).toBeGreaterThan(0);
      expect(person?.polityIds, personId).toContain(expected.polityId);
      expect(person?.polityIds?.every((polityId) => polityIds.has(polityId)), personId).toBe(true);
      expect(person?.sourceIds.length, personId).toBeGreaterThan(0);
      expect(person?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), personId).toBe(true);

      expect(detail, `${personId} detail record`).toBeDefined();
      expect(detail?.biography.trim(), personId).not.toBe('');
      expect(detail?.offices.length, personId).toBeGreaterThan(0);
      expect(detail?.keyEvents, personId).toContain(expected.eventId);
      expect(detail?.keyEvents.every((eventId) => eventIds.has(eventId)), personId).toBe(true);
      expect(detail?.sourceIds.length, personId).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), personId).toBe(true);
      expect(detail?.uncertaintyNote?.trim(), personId).toBeTruthy();
    }
  });

  it('provides one resolvable event claim and one resolvable person relation per endpoint', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const eventIds = new Set(events.map((event) => event.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const entityIds = new Set([...peopleIds, ...eventIds]);
    const selectedIds = new Set(Object.keys(selectedPeople));

    for (const [personId, expected] of Object.entries(selectedPeople)) {
      const eventClaim = claims.find((claim) => claim.subjectId === personId
        && claim.predicate === 'participated-in' && claim.objectId === expected.eventId);
      const personClaim = claims.find((claim) => claim.subjectId === personId
        && claim.predicate === expected.relation[0] && claim.objectId === expected.relation[1]);

      expect(eventClaim, `${personId} event claim`).toBeDefined();
      expect(personClaim, `${personId} person relation`).toBeDefined();
    }

    const batchClaims = claims.filter((claim) => selectedIds.has(claim.subjectId)
      && (claim.predicate === 'participated-in' || claim.objectId !== undefined));
    batchClaims.forEach((claim) => {
      expect(claim.sourceIds.length, claim.id).toBeGreaterThan(0);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(claim.perspective, claim.id).toBe('person');
      expect(claim.validFrom, claim.id).toEqual(expect.any(Number));
      expect(claim.validTo, claim.id).toEqual(expect.any(Number));
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
      expect(entityIds.has(claim.subjectId), claim.id).toBe(true);
      expect(entityIds.has(claim.objectId ?? ''), `${claim.id} -> ${claim.objectId}`).toBe(true);
    });

    expect(validateClaims(batchClaims, entityIds)).toEqual([]);
  });
});
