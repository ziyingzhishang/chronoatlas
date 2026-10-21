import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { people } from './people';
import { personDetails } from './person-details';
import { polities } from './polities';
import { sourceNotes } from './sources';

const selected = {
  'li-bian': 'southern-tang-founded',
  'liu-yan': 'southern-han-founded',
  'yelu-dashi': 'western-liao-founded',
  kublai: 'yuan-founded',
  'liu-bingzhong': 'yuan-founded',
  'zhu-yuanzhang': 'ming-founded',
  'toghon-temur': 'northern-yuan-founded',
  bayan: 'song-southward',
} as const;

describe('twenty-fourth-batch historical people closure', () => {
  it('adds eight selected people with complete identity and source records', () => {
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    Object.keys(selected).forEach((personId) => {
      const person = peopleById.get(personId);
      expect(person, personId).toBeDefined();
      expect(person?.description, personId).toBeTruthy();
      expect(person?.roles?.length, personId).toBeGreaterThan(0);
      expect(person?.polityIds?.length, personId).toBeGreaterThan(0);
      expect(person?.sourceIds.length, personId).toBeGreaterThan(0);
      person?.polityIds?.forEach((polityId) => expect(polityIds.has(polityId), `${personId} -> ${polityId}`).toBe(true));
      person?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${personId} -> ${sourceId}`).toBe(true));
    });
  });

  it('provides a detailed record and key event for every selected person', () => {
    const detailById = new Map(personDetails.map((detail) => [detail.personId, detail]));
    const eventIds = new Set(eventDetails.map((detail) => detail.eventId));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    Object.entries(selected).forEach(([personId, eventId]) => {
      const detail = detailById.get(personId);
      expect(detail, personId).toBeDefined();
      expect(detail?.biography, personId).toBeTruthy();
      expect(detail?.offices.length, personId).toBeGreaterThan(0);
      expect(detail?.keyEvents, personId).toContain(eventId);
      expect(detail?.sourceIds.length, personId).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote, personId).toBeTruthy();
      expect(eventIds.has(eventId), `${personId} -> ${eventId}`).toBe(true);
      detail?.offices.forEach((office) => office.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${personId} office -> ${sourceId}`).toBe(true)));
    });
  });

  it('connects each selected person to the existing event and to another resolvable person', () => {
    const personIds = new Set(people.map((person) => person.id));
    const eventIds = new Set(eventDetails.map((detail) => detail.eventId));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    Object.entries(selected).forEach(([personId, eventId]) => {
      const eventClaim = claims.find((claim) => claim.subjectId === personId && claim.predicate === 'participated-in' && claim.objectId === eventId);
      expect(eventClaim, `${personId} -> ${eventId}`).toBeDefined();
      expect(eventIds.has(eventClaim?.objectId ?? ''), personId).toBe(true);
      expect(eventClaim?.sourceIds.length, personId).toBeGreaterThan(0);
      eventClaim?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${personId} event -> ${sourceId}`).toBe(true));

      const relation = claims.find((claim) => (
        claim.subjectId === personId
        && claim.objectId
        && claim.objectId !== eventId
        && claim.predicate !== 'participated-in'
      ));
      expect(relation, `${personId} relationship`).toBeDefined();
      expect(personIds.has(relation?.objectId ?? ''), `${personId} -> ${relation?.objectId}`).toBe(true);
      expect(relation?.sourceIds.length, `${personId} relationship source`).toBeGreaterThan(0);
    });
  });

  it('keeps this batch within the people, details, and claims data boundary', () => {
    expect(selected).toEqual({
      'li-bian': 'southern-tang-founded',
      'liu-yan': 'southern-han-founded',
      'yelu-dashi': 'western-liao-founded',
      kublai: 'yuan-founded',
      'liu-bingzhong': 'yuan-founded',
      'zhu-yuanzhang': 'ming-founded',
      'toghon-temur': 'northern-yuan-founded',
      bayan: 'song-southward',
    });
  });
});
