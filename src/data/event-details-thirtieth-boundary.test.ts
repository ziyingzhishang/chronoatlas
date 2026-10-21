import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { personDetails } from './person-details';
import { sourceNotes } from './sources';

const expectedParticipants = {
  'xiongnu-founded': ['modu-chanyu', 'huhanye'],
  'silla-founded': ['park-hyeokgeose', 'namhae-chachaung', 'naemul-isageum'],
  'goguryeo-founded': ['jumong', 'daemusin', 'yuri-goguryeo'],
  'tuyuhun-founded': ['murong-tuyuhun'],
  'tibetan-founded': ['songtsen-gampo', 'namri-songtsen', 'tridu-songtsen'],
  'turkic-founded': ['asina-tumen', 'istemi'],
} as const;

const eventIds = new Set(events.map((event) => event.id));
const peopleById = new Map(people.map((person) => [person.id, person]));
const personDetailsById = new Map(personDetails.map((detail) => [detail.personId, detail]));
const sourceIds = new Set(sourceNotes.map((source) => source.id));

describe('event details thirtieth batch evidence boundaries', () => {
  it('records the now-resolvable participant endpoints for all six frozen events', () => {
    Object.entries(expectedParticipants).forEach(([eventId, participantIds]) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
      expect(detail, eventId).toBeDefined();
      expect(detail?.participants.map((participant) => participant.personId), eventId).toEqual(participantIds);
    });
  });

  it('keeps every participant resolvable and distinguishes later phases from original founders', () => {
    Object.entries(expectedParticipants).forEach(([eventId, participantIds]) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
      expect(detail?.phases?.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote?.trim(), eventId).toBeTruthy();
      detail?.participants.forEach((participant) => {
        expect(peopleById.has(participant.personId), `${eventId} -> ${participant.personId}`).toBe(true);
        expect(personDetailsById.has(participant.personId), `${eventId} -> ${participant.personId}`).toBe(true);
        expect(participant.role.trim(), `${eventId} -> ${participant.personId}`).not.toBe('');
        expect(participant.note?.trim(), `${eventId} -> ${participant.personId}`).not.toBe('');
      });
      expect(participantIds.length).toBeGreaterThan(0);
      detail?.relatedEventIds.forEach((relatedEventId) => expect(eventIds.has(relatedEventId), `${eventId} -> ${relatedEventId}`).toBe(true));
      detail?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${eventId} -> ${sourceId}`).toBe(true));
    });
  });
});
