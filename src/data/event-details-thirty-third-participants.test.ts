import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { people } from './people';
import { personDetails } from './person-details';
import { claims } from './claims';
import { sourceById } from './sources';

const expectedParticipants = {
  'augustus-principate': ['octavian'],
  'constantinople-1453': ['constantine-xi', 'mehmed-ii'],
  'columbus-caribbean': ['christopher-columbus', 'guacanagari'],
  'peace-westphalia': ['oxenstierna', 'trauttmansdorff', 'chigi'],
  'un-founded': ['franklin-roosevelt', 'harry-truman', 'edward-stettinius'],
} as const;

describe('thirty-third batch event participant closure', () => {
  it('records the evidence-bounded participant endpoints for all five global events', () => {
    Object.entries(expectedParticipants).forEach(([eventId, expectedPeople]) => {
      expect(eventDetails.find((detail) => detail.eventId === eventId)?.participants.map((participant) => participant.personId), eventId)
        .toEqual(expectedPeople);
    });
  });

  it('keeps every new endpoint, detail, event claim, and source resolvable', () => {
    const personIds = new Set(people.map((person) => person.id));
    const detailIds = new Set(personDetails.map((detail) => detail.personId));
    const eventClaims = claims.filter((claim) => Object.keys(expectedParticipants).includes(claim.objectId ?? ''));

    Object.values(expectedParticipants).flat().forEach((personId) => {
      expect(personIds.has(personId), personId).toBe(true);
      expect(detailIds.has(personId), personId).toBe(true);
      expect(eventClaims.some((claim) => claim.subjectId === personId), personId).toBe(true);
    });

    Object.entries(expectedParticipants).forEach(([eventId]) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), eventId).toBe(true);
      expect(detail?.uncertaintyNote?.trim(), eventId).toBeTruthy();
      detail?.participants.forEach((participant) => {
        expect(participant.role.trim(), `${eventId}:${participant.personId}`).not.toBe('');
        expect(participant.note?.trim(), `${eventId}:${participant.personId}`).not.toBe('');
      });
    });
  });

  it('exposes sourced person-to-person context without inventing direct contact', () => {
    const relationshipPairs = [
      ['mehmed-ii', 'constantine-xi'],
      ['christopher-columbus', 'guacanagari'],
      ['oxenstierna', 'trauttmansdorff'],
      ['franklin-roosevelt', 'harry-truman'],
      ['harry-truman', 'edward-stettinius'],
    ];

    relationshipPairs.forEach(([subjectId, objectId]) => {
      expect(claims.some((claim) => claim.subjectId === subjectId && claim.objectId === objectId), `${subjectId}->${objectId}`).toBe(true);
    });
  });
});
