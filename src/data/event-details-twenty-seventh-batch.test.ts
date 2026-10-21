import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';

const targetParticipants = {
  'dali-founded': ['duan-siping'],
  'yang-wu-founded': ['yang-xingmi'],
  'wuyue-founded': ['qian-liu'],
  'min-founded': ['wang-shenzhi'],
  'ma-chu-founded': ['ma-yin'],
  'zhou-later-founded': ['guo-wei'],
  'northern-han-founded': ['liu-zhiyuan'],
  'yuan-founded': ['kublai', 'liu-bingzhong', 'bayan'],
  'ming-founded': ['zhu-yuanzhang'],
  'northern-yuan-founded': ['toghon-temur'],
} as const;

const peopleById = new Map(people.map((person) => [person.id, person]));
const polityIds = new Set(polities.map((polity) => polity.id));
const eventIds = new Set(events.map((event) => event.id));
const sourceIds = new Set(sourceNotes.map((source) => source.id));

describe('event details twenty-seventh batch', () => {
  it('closes ten selected participant gaps using existing person endpoints', () => {
    const missingParticipantIds = new Set(
      auditKnowledgeCoverage().tasks
        .filter((task) => task.taskKind === 'event-participant-missing')
        .map((task) => task.entityId),
    );

    Object.keys(targetParticipants).forEach((eventId) => {
      expect(missingParticipantIds.has(eventId), eventId).toBe(false);
    });
  });

  it('preserves complete event graph metadata and explicit participant roles', () => {
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

  it('keeps the Xiongnu boundary when no reliable person endpoint exists in this batch', () => {
    const missingParticipantIds = new Set(
      auditKnowledgeCoverage().tasks
        .filter((task) => task.taskKind === 'event-participant-missing')
        .map((task) => task.entityId),
    );

    expect(missingParticipantIds.has('xiongnu-founded')).toBe(true);
    expect(eventDetails.find((detail) => detail.eventId === 'xiongnu-founded')?.participants).toEqual([]);
  });
});
