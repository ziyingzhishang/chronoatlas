import { describe, expect, it } from 'vitest';

import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { sourceNotes } from './sources';

const residualEventIds = [
  'changan-han-capital',
  'changan-gengshi',
  'white-horse-temple-founded',
  'changan-former-qin',
  'daming-palace-built',
  'tang-changan-end',
] as const;

const participantAdditions = {
  'changan-gengshi': 'liu-xiu',
  'tang-changan-end': 'zhu-wen',
} as const;

const eventById = new Map(events.map((event) => [event.id, event]));
const detailById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
const personById = new Map(people.map((person) => [person.id, person]));
const sourceIds = new Set(sourceNotes.map((source) => source.id));

function overlapsLife(personId: string, eventId: string): boolean {
  const person = personById.get(personId);
  const event = eventById.get(eventId);
  if (!person || !event) return false;
  if (person.birthYear !== undefined && event.year < person.birthYear) return false;
  if (person.deathYear !== undefined && event.year > person.deathYear) return false;
  return true;
}

describe('2026-10-23 residual knowledge task audit', () => {
  it('keeps only directly supported participant additions', () => {
    Object.entries(participantAdditions).forEach(([eventId, personId]) => {
      const event = eventById.get(eventId)!;
      const detail = detailById.get(eventId)!;
      const person = personById.get(personId)!;
      const sharedSources = person.sourceIds.filter((sourceId) => (
        event.sourceIds.includes(sourceId)
        && detail.sourceIds.includes(sourceId)
        && sourceIds.has(sourceId)
      ));
      const participant = detail.participants.find((candidate) => candidate.personId === personId);

      expect(participant, `${eventId} -> ${personId}`).toBeDefined();
      expect(sharedSources, `${eventId} -> ${personId}`).toContain('zizhi-tongjian');
      expect(overlapsLife(personId, eventId), `${eventId} -> ${personId}`).toBe(true);
      expect(participant?.role.trim(), `${eventId} -> ${personId}`).toBeTruthy();
      expect(participant?.note?.trim(), `${eventId} -> ${personId}`).toBeTruthy();
    });
  });

  it('closes only the three supported event tasks and records the five remaining boundaries', () => {
    const report = auditKnowledgeCoverage();
    const taskKeys = new Set(report.tasks.map((task) => `${task.taskKind}:${task.entityId}`));

    expect(taskKeys.has('event-participant-missing:changan-gengshi')).toBe(false);
    expect(taskKeys.has('event-participant-missing:changan-han-capital')).toBe(false);
    expect(taskKeys.has('event-participant-missing:tang-changan-end')).toBe(false);

    expect([...taskKeys].sort()).toEqual([
      'event-participant-missing:changan-former-qin',
      'event-participant-missing:daming-palace-built',
      'event-participant-missing:white-horse-temple-founded',
      'person-person-relationship-missing:tufa-wugu',
      'polity-heritage-missing:southern_liang',
    ]);
  });
});
