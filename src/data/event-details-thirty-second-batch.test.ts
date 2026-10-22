import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { polities } from './polities';
import { sourceById } from './sources';

const targetParticipants = {
  'former-liang-founded': ['zhang-gui', 'zhang-shi', 'zhang-mao'],
  'western-qin-founded': ['qifu-guoren', 'qifu-gangui'],
  'southern-yan-founded': ['murong-de', 'murong-chao'],
  'northern-yan-founded': ['gao-yun', 'feng-ba', 'feng-hong'],
  'southern-chen-founded': ['chen-xu'],
  'nanzhao-founded': ['piluo-ge', 'geluofeng'],
} as const;

const peopleIds = new Set(people.map((person) => person.id));
const polityIds = new Set(polities.map((polity) => polity.id));
const eventIds = new Set([...events.map((event) => event.id), ...eventDetails.map((detail) => detail.eventId)]);

describe('event details thirty-second batch', () => {
  it('closes six evidence-supported participant gaps with current person endpoints', () => {
    const missingParticipantIds = new Set(
      auditKnowledgeCoverage().tasks
        .filter((task) => task.taskKind === 'event-participant-missing')
        .map((task) => task.entityId),
    );

    Object.keys(targetParticipants).forEach((eventId) => {
      expect(missingParticipantIds.has(eventId), eventId).toBe(false);
    });
  });

  it('preserves stage-aware roles and resolvable graph metadata', () => {
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
      detail?.relatedEventIds.forEach((relatedEventId) => {
        expect(eventIds.has(relatedEventId), `${eventId} -> ${relatedEventId}`).toBe(true);
      });
      detail?.sourceIds.forEach((sourceId) => {
        expect(sourceById[sourceId], `${eventId} -> ${sourceId}`).toBeDefined();
      });
    });
  });

  it('labels Southern Chen as a successor-stage endpoint rather than inventing its founder', () => {
    const participant = eventDetails
      .find((detail) => detail.eventId === 'southern-chen-founded')
      ?.participants.find((candidate) => candidate.personId === 'chen-xu');

    expect(participant?.role).toContain('后期');
    expect(participant?.note).toContain('陈霸先');
  });
});
