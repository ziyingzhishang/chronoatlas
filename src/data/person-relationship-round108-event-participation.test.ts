import { describe, expect, it } from 'vitest';

import { changanEvents } from './changan-study';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { sourceNotes } from './sources';

const reviewGaps = [
  { personId: 'huo-qubing', eventIds: ['changan-han-capital'] },
  { personId: 'zhang-qian', eventIds: ['changan-han-capital'] },
  { personId: 'ban-gu', eventIds: ['changan-han-capital'] },
  { personId: 'li-zhi', eventIds: ['daming-palace-built'] },
  { personId: 'yuan-hong', eventIds: ['northern-wei-founded'] },
  { personId: 'chai-rong', eventIds: ['zhou-later-founded'] },
  { personId: 'yuwen-yong', eventIds: [] },
  { personId: 'qin-mugong', eventIds: [] },
  { personId: 'seondeok-silla', eventIds: [] },
  { personId: 'jindeok-silla', eventIds: [] },
  { personId: 'sinmun-silla', eventIds: [] },
] as const;

const eventCatalog = [...events, ...changanEvents];
const eventById = new Map(eventCatalog.map((event) => [event.id, event]));
const peopleById = new Map(people.map((person) => [person.id, person]));
const sourceIdSet = new Set(sourceNotes.map((source) => source.id));

function overlapsLife(personId: string, eventId: string): boolean {
  const person = peopleById.get(personId);
  const event = eventById.get(eventId);
  if (!person || !event) return false;
  if (person.birthYear !== undefined && (event.endYear ?? event.year) < person.birthYear) return false;
  if (person.deathYear !== undefined && event.year > person.deathYear) return false;
  return true;
}

function sharedSourceIds(personId: string, eventId: string, detailSourceIds: string[]): string[] {
  const person = peopleById.get(personId);
  const event = eventById.get(eventId);
  if (!person || !event) return [];
  return person.sourceIds.filter((sourceId) => (
    event.sourceIds.includes(sourceId)
    && detailSourceIds.includes(sourceId)
    && sourceIdSet.has(sourceId)
  ));
}

function qualifiedExistingCandidates() {
  return eventDetails.flatMap((detail) => detail.participants.flatMap((participant) => {
    const gap = reviewGaps.find((item) => item.personId === participant.personId);
    const event = eventById.get(detail.eventId);
    if (!gap || !event || !overlapsLife(participant.personId, detail.eventId)) return [];
    const sharedSources = sharedSourceIds(participant.personId, detail.eventId, detail.sourceIds);
    if (sharedSources.length === 0 || participant.relationType === 'contextual') return [];
    return [{ personId: participant.personId, eventId: detail.eventId, sharedSources }];
  }));
}

describe('round one hundred eight event-participation evidence audit', () => {
  it('rejects contextual participant fields without a shared source as safe integration evidence', () => {
    const liZhiRecords = eventDetails.flatMap((detail) => detail.participants
      .filter((participant) => participant.personId === 'li-zhi')
      .map((participant) => ({
        eventId: detail.eventId,
        relationType: participant.relationType,
        overlapsLife: overlapsLife('li-zhi', detail.eventId),
        sharedSourceIds: sharedSourceIds('li-zhi', detail.eventId, detail.sourceIds),
      })));

    expect(liZhiRecords).toEqual([
      { eventId: 'ximing-temple-built', relationType: 'contextual', overlapsLife: true, sharedSourceIds: [] },
      { eventId: 'shangyang-palace-built', relationType: 'contextual', overlapsLife: true, sharedSourceIds: [] },
      { eventId: 'shangyang-palace-completed-679', relationType: 'contextual', overlapsLife: true, sharedSourceIds: [] },
    ]);
    expect(qualifiedExistingCandidates()).toEqual([]);
  });

  it('keeps the eleven round-104 gaps unresolved until every evidence contract passes', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.eventParticipation).toEqual(
      reviewGaps.map(({ personId }) => personId),
    );
    expect(reviewGaps).toHaveLength(11);

    for (const { personId, eventIds } of reviewGaps) {
      expect(peopleById.has(personId), `${personId}: person endpoint`).toBe(true);
      expect(claims.some((claim) => claim.subjectId === personId && claim.predicate === 'participated-in'), `${personId}: no participation claim`).toBe(false);

      for (const eventId of eventIds) {
        const event = eventById.get(eventId);
        const detail = eventDetails.find((item) => item.eventId === eventId);
        expect(event, `${personId}:${eventId}: event endpoint`).toBeDefined();
        expect(detail, `${personId}:${eventId}: detail endpoint`).toBeDefined();
        expect(detail?.participants.some((item) => item.personId === personId), `${personId}:${eventId}: direct participant`).toBe(false);
        const bornAfterEvent = ['huo-qubing', 'ban-gu', 'yuan-hong', 'tuoba-tao', 'mongke'].includes(personId);
        expect(overlapsLife(personId, eventId), `${personId}:${eventId}: life overlap`).toBe(!bornAfterEvent);
        expect(event?.sourceIds.every((sourceId) => sourceIdSet.has(sourceId)), `${personId}:${eventId}: event sources`).toBe(true);
        expect(detail?.sourceIds.every((sourceId) => sourceIdSet.has(sourceId)), `${personId}:${eventId}: detail sources`).toBe(true);
      }

      expect(report.byPersonId[personId].categories.eventParticipation.status, `${personId}: coverage status`).toBe('missing');
      expect(report.byPersonId[personId].categories.eventParticipation.evidence.every((item) => item.kind === 'role'), `${personId}: evidence`).toBe(true);
      expect(report.byPersonId[personId].categories.eventParticipation.relatedIds, `${personId}: related events`).toEqual([]);
    }
  });
});

