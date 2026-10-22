import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { events } from './events';
import { people } from './people';
import { personDetails } from './person-details';
import { polities } from './polities';
import { sourceNotes } from './sources';

const targetPeople = {
  'zhang-gui': { polityId: 'former_liang', eventIds: ['former-liang-founded'] },
  'zhang-shi': { polityId: 'former_liang', eventIds: ['former-liang-founded'] },
  'qifu-gangui': { polityId: 'western_qin', eventIds: ['western-qin-founded'] },
  'wang-sengbian': { polityId: 'liang_southern', eventIds: ['southern-chen-founded'] },
  'li-gang': { polityId: 'song_northern', eventIds: ['song-southward'] },
  'zong-ze': { polityId: 'song_south', eventIds: ['song-southward'] },
  'zhang-jun': { polityId: 'song_south', eventIds: ['song-southward'] },
  'gao-hongtu': { polityId: 'ming_southern', eventIds: ['southern-ming-founded'] },
} as const;

describe('thirty-first batch historical people and relationships', () => {
  it('adds complete people and detail records for priority event gaps', () => {
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const detailById = new Map(personDetails.map((detail) => [detail.personId, detail]));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    Object.entries(targetPeople).forEach(([personId, expected]) => {
      const person = peopleById.get(personId);
      const detail = detailById.get(personId);

      expect(person, personId).toBeDefined();
      expect(person?.description.trim(), personId).not.toBe('');
      expect(person?.roles?.length, personId).toBeGreaterThan(0);
      expect(person?.polityIds, personId).toContain(expected.polityId);
      expect(person?.sourceIds.length, personId).toBeGreaterThan(0);
      person?.polityIds?.forEach((polityId) => expect(polityIds.has(polityId), `${personId} -> ${polityId}`).toBe(true));
      person?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${personId} -> ${sourceId}`).toBe(true));

      expect(detail, personId).toBeDefined();
      expect(detail?.biography.trim(), personId).not.toBe('');
      expect(detail?.keyEvents, personId).toEqual(expect.arrayContaining([...expected.eventIds]));
      expect(detail?.sourceIds.length, personId).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote?.trim(), personId).toBeTruthy();
      detail?.keyEvents.forEach((eventId) => expect(eventIds.has(eventId), `${personId} -> ${eventId}`).toBe(true));
      detail?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${personId} -> ${sourceId}`).toBe(true));
    });
  });

  it('records resolvable event and person relations with time and evidence boundaries', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const targetIds = new Set(Object.keys(targetPeople));
    const targetClaims = claims.filter((claim) => targetIds.has(claim.subjectId));

    Object.entries(targetPeople).forEach(([personId, expected]) => {
      const eventClaim = targetClaims.find(
        (claim) => claim.subjectId === personId && (expected.eventIds as readonly string[]).includes(claim.objectId ?? ''),
      );
      const personClaim = targetClaims.find(
        (claim) => claim.subjectId === personId && claim.objectId !== undefined && peopleIds.has(claim.objectId),
      );

      expect(eventClaim, `${personId} event claim`).toBeDefined();
      expect(personClaim, `${personId} person relation`).toBeDefined();
    });

    targetClaims.forEach((claim) => {
      expect(claim.sourceIds.length, claim.id).toBeGreaterThan(0);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      claim.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${claim.id} -> ${sourceId}`).toBe(true));
      if (claim.predicate === 'participated-in') {
        expect(eventIds.has(claim.objectId ?? ''), `${claim.id} -> ${claim.objectId}`).toBe(true);
      } else if (claim.predicate === 'founded' || claim.predicate === 'ruled') {
        expect(polityIds.has(claim.objectId ?? ''), `${claim.id} -> ${claim.objectId}`).toBe(true);
      } else {
        expect(peopleIds.has(claim.objectId ?? ''), `${claim.id} -> ${claim.objectId}`).toBe(true);
      }
      expect(claim.datePrecision).toBeDefined();
      expect(claim.evidenceType).toBeDefined();
    });
  });
});
