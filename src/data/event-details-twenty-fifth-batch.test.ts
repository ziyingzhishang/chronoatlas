import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const targetParticipants = {
  'later-zhao-founded': ['shi-le'],
  'former-yan-founded': ['murong-huang'],
  'later-liang-founded': ['lv-guang'],
  'southern-tang-founded': ['li-bian'],
  'northern-liang-founded': ['duan-ye', 'juqu-mengxun'],
  'southern-han-founded': ['liu-yan'],
  'jingnan-founded': ['gao-jixing'],
  'western-liang-state-founded': ['li-hao'],
} as const;

const peopleById = new Map(people.map((person) => [person.id, person]));
const polityIds = new Set(polities.map((polity) => polity.id));
const eventIds = new Set(events.map((event) => event.id));
const sourceIds = new Set(sourceNotes.map((source) => source.id));

describe('event details twenty-fifth batch', () => {
  it('closes participant coverage for ten selected polity-establishment events', () => {
    const tasks = auditKnowledgeCoverage().tasks;
    const missingParticipantTasks = new Set(
      tasks
        .filter((task) => task.taskKind === 'event-participant-missing')
        .map((task) => task.entityId),
    );

    Object.keys(targetParticipants).forEach((eventId) => {
      expect(missingParticipantTasks.has(eventId), eventId).toBe(false);
    });
  });

  it('uses existing person endpoints and preserves all graph references', () => {
    Object.entries(targetParticipants).forEach(([eventId, expectedPeople]) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
      expect(detail, eventId).toBeDefined();
      expect(detail?.participants.map((participant) => participant.personId)).toEqual(expectedPeople);
      expect(detail?.phases?.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);

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
});
