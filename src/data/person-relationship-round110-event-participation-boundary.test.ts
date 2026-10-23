import { describe, expect, it } from 'vitest';

import { changanEvents } from './changan-study';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { sourceNotes } from './sources';

const reviewGaps = [
  { personId: 'huo-qubing', eventIds: ['changan-han-capital'] },
  { personId: 'zhang-qian', eventIds: ['changan-han-capital'] },
  { personId: 'ban-gu', eventIds: ['changan-han-capital'] },
  { personId: 'li-zhi', eventIds: ['daming-palace-built'] },
  { personId: 'yuan-hong', eventIds: ['northern-wei-founded'] },
  { personId: 'tuoba-tao', eventIds: ['northern-wei-founded'] },
  { personId: 'yuwen-yong', eventIds: [] },
  { personId: 'mongke', eventIds: ['mongol-founded'] },
] as const;

const eventCatalog = [...events, ...changanEvents];
const eventById = new Map(eventCatalog.map((event) => [event.id, event]));
const peopleById = new Map(people.map((person) => [person.id, person]));
const sourceIdSet = new Set(sourceNotes.map((source) => source.id));
const gapPersonIds = new Set<string>(reviewGaps.map(({ personId }) => personId));

function overlapsLife(personId: string, eventId: string): boolean {
  const person = peopleById.get(personId);
  const event = eventById.get(eventId);
  if (!person || !event) return false;
  if (person.birthYear !== undefined && (event.endYear ?? event.year) < person.birthYear) return false;
  if (person.deathYear !== undefined && event.year > person.deathYear) return false;
  return true;
}

function qualifiedCandidates() {
  return eventDetails.flatMap((detail) => {
    const event = eventById.get(detail.eventId);
    if (!event) return [];

    return detail.participants.flatMap((participant) => {
      if (!gapPersonIds.has(participant.personId) || participant.relationType === 'contextual') return [];
      if (!overlapsLife(participant.personId, event.id)) return [];

      const person = peopleById.get(participant.personId);
      const sharedSourceIds = person?.sourceIds.filter((sourceId) => (
        event.sourceIds.includes(sourceId)
        && detail.sourceIds.includes(sourceId)
        && sourceIdSet.has(sourceId)
      )) ?? [];
      return sharedSourceIds.length > 0
        ? [{ personId: participant.personId, eventId: event.id, sharedSourceIds }]
        : [];
    });
  });
}

describe('round one hundred ten event-participation boundary audit', () => {
  it('finds no gap that satisfies direct role, time, endpoint, and shared-source evidence', () => {
    expect(qualifiedCandidates()).toEqual([]);

    for (const { personId, eventIds } of reviewGaps) {
      expect(peopleById.has(personId), `${personId}: person endpoint`).toBe(true);
      expect(claims.some((claim) => (
        claim.subjectId === personId && claim.predicate === 'participated-in'
      )), `${personId}: participation claim`).toBe(false);

      for (const eventId of eventIds) {
        const event = eventById.get(eventId);
        const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
        expect(event, `${personId}:${eventId}: event endpoint`).toBeDefined();
        expect(detail, `${personId}:${eventId}: detail endpoint`).toBeDefined();
        expect(detail?.participants.some((participant) => participant.personId === personId),
          `${personId}:${eventId}: participant field`).toBe(false);
      }
    }
  });

  it('keeps contextual and temporally incompatible records out of the candidate set', () => {
    const liZhiRecords = eventDetails.flatMap((detail) => detail.participants
      .filter((participant) => participant.personId === 'li-zhi')
      .map((participant) => ({
        eventId: detail.eventId,
        relationType: participant.relationType,
      })));

    expect(liZhiRecords).toEqual([
      { eventId: 'ximing-temple-built', relationType: 'contextual' },
      { eventId: 'shangyang-palace-built', relationType: 'contextual' },
      { eventId: 'shangyang-palace-completed-679', relationType: 'contextual' },
    ]);

    for (const [personId, eventId] of [
      ['yuan-hong', 'northern-wei-founded'],
      ['tuoba-tao', 'northern-wei-founded'],
      ['mongke', 'mongol-founded'],
    ] as const) {
      expect(peopleById.get(personId)?.birthYear, `${personId}: birth year`)
        .toBeGreaterThan(eventById.get(eventId)!.year);
    }

    for (const personId of ['yuwen-yong']) {
      expect(eventDetails.some((detail) => detail.participants.some((participant) => (
        participant.personId === personId
      ))), `${personId}: direct event-detail candidate`).toBe(false);
    }
  });
});
