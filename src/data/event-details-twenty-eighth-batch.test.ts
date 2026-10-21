import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const targetParticipants = {
  'northern-wei-founded': ['tuoba-gui'],
  'southern-qi-founded': ['xiao-daocheng'],
  'northern-qi-founded': ['gao-yang'],
  'mongol-founded': ['temujin'],
} as const;

const boundaryEventId = 'southern-chen-founded';
const peopleById = new Map(people.map((person) => [person.id, person]));
const polityIds = new Set(polities.map((polity) => polity.id));
const eventIds = new Set([...events.map((event) => event.id), ...eventDetails.map((detail) => detail.eventId)]);
const sourceIds = new Set(sourceNotes.map((source) => source.id));

describe('event details twenty-eighth batch', () => {
  it('closes four selected participant gaps with existing person endpoints', () => {
    const missingParticipantIds = new Set(
      auditKnowledgeCoverage().tasks
        .filter((task) => task.taskKind === 'event-participant-missing')
        .map((task) => task.entityId),
    );

    Object.keys(targetParticipants).forEach((eventId) => {
      expect(missingParticipantIds.has(eventId), eventId).toBe(false);
    });
  });

  it('records complete graph metadata and explicit roles for the selected events', () => {
    Object.entries(targetParticipants).forEach(([eventId, expectedPeople]) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
      expect(detail, eventId).toBeDefined();
      expect(detail?.participants.map((participant) => participant.personId), eventId).toEqual(expectedPeople);
      expect(detail?.phases?.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote?.trim(), eventId).toBeTruthy();

      detail?.participants.forEach((participant) => {
        expect(peopleById.has(participant.personId), `${eventId} -> ${participant.personId}`).toBe(true);
        expect(participant.role.trim(), `${eventId} -> ${participant.personId}`).not.toBe('');
        expect(participant.note?.trim(), `${eventId} -> ${participant.personId}`).not.toBe('');
      });
      detail?.polityIds.forEach((polityId) => expect(polityIds.has(polityId), `${eventId} -> ${polityId}`).toBe(true));
      detail?.relatedEventIds.forEach((relatedEventId) => expect(eventIds.has(relatedEventId), `${eventId} -> ${relatedEventId}`).toBe(true));
      detail?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${eventId} -> ${sourceId}`).toBe(true));
    });
  });

  it('keeps the Southern Chen boundary when the founder endpoint is not catalogued', () => {
    const missingParticipantIds = new Set(
      auditKnowledgeCoverage().tasks
        .filter((task) => task.taskKind === 'event-participant-missing')
        .map((task) => task.entityId),
    );

    expect(missingParticipantIds.has(boundaryEventId)).toBe(true);
    expect(eventDetails.find((detail) => detail.eventId === boundaryEventId)?.participants).toEqual([]);
  });
});
