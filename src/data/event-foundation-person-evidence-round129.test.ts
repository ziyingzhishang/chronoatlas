import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { personDetails } from './person-details';
import { sourceNotes } from './sources';

const targets = [
  { eventId: 'southern-qi-founded', personId: 'xiao-daocheng', year: 479 },
  { eventId: 'shu-han-founded', personId: 'liu-bei', year: 221 },
  { eventId: 'wu-three-founded', personId: 'sun-quan', year: 229 },
] as const;

const claimIds = [
  'claim-xiao-daocheng-participated-southern-qi-founded-round129',
  'claim-liu-bei-participated-shu-han-founded-round129',
  'claim-sun-quan-participated-wu-three-founded-round129',
] as const;

describe('round 129 foundation event person-evidence closure', () => {
  it('keeps each selected foundation event connected to an existing person detail', () => {
    const eventById = new Map(events.map((event) => [event.id, event]));
    const detailById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const personById = new Map(people.map((person) => [person.id, person]));
    const personDetailById = new Map(personDetails.map((detail) => [detail.personId, detail]));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const target of targets) {
      const event = eventById.get(target.eventId);
      const detail = detailById.get(target.eventId);
      const person = personById.get(target.personId);
      const personDetail = personDetailById.get(target.personId);

      expect(event, target.eventId).toMatchObject({ year: target.year, category: '政权建立／更替' });
      expect(detail?.participants, target.eventId).toEqual(expect.arrayContaining([
        expect.objectContaining({ personId: target.personId }),
      ]));
      expect(detail?.polityIds.length, target.eventId).toBeGreaterThan(0);
      expect(person, target.personId).toBeDefined();
      expect(personDetail, target.personId).toBeDefined();
      expect(event?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), target.eventId).toBe(true);
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), target.eventId).toBe(true);
      expect(person?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), target.personId).toBe(true);
      expect(personDetail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), target.personId).toBe(true);
    }
  });

  it('adds one explicit, source-resolvable participation claim for each selected event', () => {
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const eventIds = new Set(events.map((event) => event.id));
    const personIds = new Set(people.map((person) => person.id));

    for (const [index, target] of targets.entries()) {
      const claim = claims.find((candidate) => candidate.id === claimIds[index]);

      expect(claim, claimIds[index]).toMatchObject({
        subjectId: target.personId,
        predicate: 'participated-in',
        objectId: target.eventId,
        validFrom: target.year,
        validTo: target.year,
        datePrecision: 'year',
        evidenceType: 'explicit-record',
        confidence: 'high',
      });
      expect(personIds.has(claim?.subjectId ?? ''), claimIds[index]).toBe(true);
      expect(eventIds.has(claim?.objectId ?? ''), claimIds[index]).toBe(true);
      expect(claim?.sourceIds.length, claimIds[index]).toBeGreaterThan(0);
      expect(claim?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claimIds[index]).toBe(true);
      expect(claim?.uncertaintyNote?.trim(), claimIds[index]).toBeTruthy();
    }
  });

  it('does not infer unrelated successors or city-only context as foundation participants', () => {
    const targetEventIds = new Set<string>(targets.map((target) => target.eventId));
    const targetPersonIds = new Set<string>(targets.map((target) => target.personId));

    expect(claims.some((claim) => (
      claim.predicate === 'participated-in'
      && targetEventIds.has(claim.objectId ?? '')
      && !targetPersonIds.has(claim.subjectId)
    ))).toBe(false);
  });
});
