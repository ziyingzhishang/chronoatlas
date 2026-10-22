import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const targetParticipants = {
  'liu-yu-captures-changan': ['liu-yu'],
  'western-wei-changan': ['yu-wen-tai'],
  'northern-zhou-changan': ['yu-wen-tai'],
  'qing-enters-pass': ['dorgon'],
  'liu-song-founded': ['liu-yu'],
  'western-liao-founded': ['yelu-dashi'],
  'republic-founded': ['sun-yat-sen'],
  'prc-founded': ['mao-zedong'],
} as const;

const boundaryEventId = 'former-liang-founded';
const peopleIds = new Set(people.map((person) => person.id));
const polityIds = new Set(polities.map((polity) => polity.id));
const eventIds = new Set([...events.map((event) => event.id), ...eventDetails.map((detail) => detail.eventId)]);
const sourceIds = new Set(sourceNotes.map((source) => source.id));

describe('event details twenty-ninth batch', () => {
  it('closes eight selected participant gaps using existing person endpoints', () => {
    const missingParticipantIds = new Set(
      auditKnowledgeCoverage().tasks
        .filter((task) => task.taskKind === 'event-participant-missing')
        .map((task) => task.entityId),
    );

    Object.keys(targetParticipants).forEach((eventId) => {
      expect(missingParticipantIds.has(eventId), eventId).toBe(false);
    });
  });

  it('records resolvable graph metadata, roles, phases, sources, and uncertainty', () => {
    Object.entries(targetParticipants).forEach(([eventId, expectedPeople]) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
      expect(detail, eventId).toBeDefined();
      expect(detail?.participants.map((participant) => participant.personId), eventId).toEqual(expectedPeople);
      expect(detail?.phases?.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote?.trim(), eventId).toBeTruthy();

      detail?.participants.forEach((participant) => {
        expect(peopleIds.has(participant.personId), `${eventId} -> ${participant.personId}`).toBe(true);
        expect(participant.role.trim(), `${eventId} -> ${participant.personId}`).not.toBe('');
        expect(participant.note?.trim(), `${eventId} -> ${participant.personId}`).not.toBe('');
      });
      detail?.polityIds.forEach((polityId) => expect(polityIds.has(polityId), `${eventId} -> ${polityId}`).toBe(true));
      detail?.relatedEventIds.forEach((relatedEventId) => expect(eventIds.has(relatedEventId), `${eventId} -> ${relatedEventId}`).toBe(true));
      detail?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${eventId} -> ${sourceId}`).toBe(true));
    });
  });

  it('keeps the former Liang founder boundary while recording its stage-aware endpoints', () => {
    const missingParticipantIds = new Set(
      auditKnowledgeCoverage().tasks
        .filter((task) => task.taskKind === 'event-participant-missing')
        .map((task) => task.entityId),
    );

    expect(missingParticipantIds.has(boundaryEventId)).toBe(false);
    expect(eventDetails.find((detail) => detail.eventId === boundaryEventId)?.participants.map((participant) => participant.personId))
      .toEqual(['zhang-gui', 'zhang-shi', 'zhang-mao']);
  });
});
