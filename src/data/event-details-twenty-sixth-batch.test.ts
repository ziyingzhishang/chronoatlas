import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const targetParticipants = {
  'han-warring-founded-eighth-batch': ['han-kangzi', 'han-qian'],
  'zhao-warring-founded-eighth-batch': ['zhao-xiangzi', 'zhao-liehou'],
  'wei-warring-founded-eighth-batch': ['wei-huanzi', 'wei-wenhou'],
  'chu-warring-founded-eighth-batch': ['chu-we-wang'],
  'yan-warring-founded-eighth-batch': ['yan-zhaowang'],
  'qi-warring-founded-eighth-batch': ['qi-we-wang'],
  'partition-jin': ['han-kangzi', 'zhao-xiangzi', 'wei-huanzi', 'han-qian', 'zhao-liehou', 'wei-wenhou'],
} as const;

const peopleById = new Map(people.map((person) => [person.id, person]));
const polityIds = new Set(polities.map((polity) => polity.id));
const eventIds = new Set(events.map((event) => event.id));
const sourceIds = new Set(sourceNotes.map((source) => source.id));

describe('event details twenty-sixth batch', () => {
  it('closes the selected Warring States participant gaps', () => {
    const missingParticipantTasks = new Set(
      auditKnowledgeCoverage().tasks
        .filter((task) => task.taskKind === 'event-participant-missing')
        .map((task) => task.entityId),
    );

    Object.keys(targetParticipants).forEach((eventId) => {
      expect(missingParticipantTasks.has(eventId), eventId).toBe(false);
    });
  });

  it('uses resolvable people and complete graph metadata without inventing Jin-partition endpoints', () => {
    Object.entries(targetParticipants).forEach(([eventId, expectedPeople]) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
      expect(detail, eventId).toBeDefined();
      expect(detail?.participants.map((participant) => participant.personId)).toEqual(expectedPeople);
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
});
