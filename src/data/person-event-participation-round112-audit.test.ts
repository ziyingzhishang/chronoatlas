import { describe, expect, it } from 'vitest';

import { changanEvents } from './changan-study';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { sourceNotes } from './sources';

const currentGaps = [
  { personId: 'huo-qubing', eventIds: ['changan-han-capital'] },
  { personId: 'zhang-qian', eventIds: ['changan-han-capital'] },
  { personId: 'ban-gu', eventIds: ['changan-han-capital'] },
  { personId: 'yuan-hong', eventIds: ['northern-wei-founded'] },
  { personId: 'chai-rong', eventIds: ['zhou-later-founded'] },
  { personId: 'ma-xiguang', eventIds: [] },
  { personId: 'ma-xie', eventIds: [] },
  { personId: 'qin-mugong', eventIds: [] },
  { personId: 'gao-baorong', eventIds: [] },
  { personId: 'gao-baoxu', eventIds: [] },
  { personId: 'liu-sheng', eventIds: [] },
  { personId: 'zhizhi-chanyu', eventIds: [] },
  { personId: 'dou-xian', eventIds: [] },
  { personId: 'seondeok-silla', eventIds: [] },
  { personId: 'jindeok-silla', eventIds: [] },
  { personId: 'sinmun-silla', eventIds: [] },
  { personId: 'qapaghan', eventIds: [] },
  { personId: 'bilge-khagan', eventIds: [] },
  { personId: 'kul-tegin', eventIds: [] },
  { personId: 'bayanchur', eventIds: [] },
  { personId: 'wang-yenxi', eventIds: [] },
  { personId: 'yeon-gaesomun', eventIds: [] },
  { personId: 'yeon-namsaeng', eventIds: [] },
] as const;

const eventCatalog = [...events, ...changanEvents];
const eventById = new Map(eventCatalog.map((event) => [event.id, event]));
const peopleById = new Map(people.map((person) => [person.id, person]));
const sourceIdSet = new Set(sourceNotes.map((source) => source.id));
const gapPersonIds = new Set<string>(currentGaps.map(({ personId }) => personId));

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
      if (!participant.role.trim() || !participant.note?.trim()) return [];
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

describe('round one hundred twelve event-participation expert audit', () => {
  it('keeps all current event-participation gaps closed without a complete evidence chain', () => {
    const gapPersonIdsFromClaims = new Set(
      claims
        .filter((claim) => claim.predicate === 'participated-in')
        .map((claim) => claim.subjectId),
    );

    expect(currentGaps).toHaveLength(23);
    expect([...gapPersonIdsFromClaims].filter((personId) => gapPersonIds.has(personId))).toEqual([]);
    expect(qualifiedCandidates()).toEqual([]);

    for (const { personId, eventIds } of currentGaps) {
      expect(peopleById.has(personId), `${personId}: person endpoint`).toBe(true);

      const records = eventDetails.flatMap((detail) => detail.participants
        .filter((participant) => participant.personId === personId)
        .map((participant) => ({ detail, participant })));
      expect(records.every(({ participant }) => participant.relationType === 'contextual'), `${personId}: no inferred direct role`).toBe(true);

      for (const eventId of eventIds) {
        const event = eventById.get(eventId);
        const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
        expect(event, `${personId}:${eventId}: event endpoint`).toBeDefined();
        expect(detail, `${personId}:${eventId}: detail endpoint`).toBeDefined();
        expect(detail?.participants.some((participant) => participant.personId === personId),
          `${personId}:${eventId}: participant field`).toBe(false);
        expect(event?.sourceIds.every((sourceId) => sourceIdSet.has(sourceId)), `${personId}:${eventId}: event sources`).toBe(true);
        expect(detail?.sourceIds.every((sourceId) => sourceIdSet.has(sourceId)), `${personId}:${eventId}: detail sources`).toBe(true);
      }
    }
  });

  it('does not upgrade contextual records, succession, polity membership, or heritage association', () => {
    const contextualRecords = eventDetails.flatMap((detail) => detail.participants
      .filter((participant) => gapPersonIds.has(participant.personId))
      .map((participant) => ({ eventId: detail.eventId, personId: participant.personId, relationType: participant.relationType })));

    expect(contextualRecords).toEqual([
      { eventId: 'turkic-ended-744', personId: 'bayanchur', relationType: 'contextual' },
      { eventId: 'ma-chu-ended-951', personId: 'ma-xie', relationType: 'contextual' },
      { eventId: 'qin-state-founded-eighth-batch', personId: 'qin-mugong', relationType: 'contextual' },
    ]);
  });
});
