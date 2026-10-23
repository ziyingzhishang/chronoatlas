import { describe, expect, it } from 'vitest';

import { changanEvents } from './changan-study';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { sourceNotes } from './sources';

const reviewBoundary = [
  { personId: 'huo-qubing', eventIds: ['changan-han-capital'] },
  { personId: 'zhang-qian', eventIds: ['changan-han-capital'] },
  { personId: 'ban-gu', eventIds: ['changan-han-capital'] },
  { personId: 'li-zhi', eventIds: ['daming-palace-built'] },
  { personId: 'yuan-hong', eventIds: ['northern-wei-founded'] },
  { personId: 'tuoba-tao', eventIds: ['northern-wei-founded'] },
  { personId: 'yuwen-yong', eventIds: [] },
  { personId: 'zhao-wuling', eventIds: [] },
  { personId: 'tufa-wugu', eventIds: [] },
  { personId: 'mongke', eventIds: ['mongol-founded'] },
] as const;

const eventCatalog = [...events, ...changanEvents];
const peopleIds = new Set(people.map((person) => person.id));
const sourceIds = new Set(sourceNotes.map((source) => source.id));

describe('eighty-fourth batch event-participation boundary audit', () => {
  it('audits all ten current gaps against an event node, participant field and source', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.eventParticipation).toEqual(
      reviewBoundary.map(({ personId }) => personId),
    );

    for (const { personId, eventIds } of reviewBoundary) {
      const person = people.find((candidate) => candidate.id === personId);
      expect(person, personId).toBeDefined();

      const participantClaims = claims.filter((claim) => (
        claim.subjectId === personId
        && claim.predicate === 'participated-in'
      ));
      expect(participantClaims, personId).toEqual([]);

      for (const eventId of eventIds) {
        const event = eventCatalog.find((candidate) => candidate.id === eventId);
        const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
        const participant = detail?.participants.find((candidate) => candidate.personId === personId);
        const endpointSourceIds = [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])];

        expect(event, `${personId}:${eventId} event node`).toBeDefined();
        expect(endpointSourceIds.length, `${personId}:${eventId} source list`).toBeGreaterThan(0);
        expect(endpointSourceIds.every((sourceId) => sourceIds.has(sourceId)), `${personId}:${eventId} source refs`).toBe(true);
        expect(participant, `${personId}:${eventId} participant field`).toBeUndefined();
      }

      const coverage = report.byPersonId[personId].categories.eventParticipation;
      expect(coverage.status, personId).toBe('missing');
      expect(coverage.evidenceIds, personId).toEqual([]);
      expect(coverage.relatedIds, personId).toEqual([]);
    }
  });

  it('does not mistake a person detail navigation link for a verified event participation edge', () => {
    const detailOnlyPeople = ['huo-qubing', 'zhang-qian', 'ban-gu', 'li-zhi', 'yuan-hong', 'tuoba-tao', 'mongke'];

    for (const personId of detailOnlyPeople) {
      expect(peopleIds.has(personId), personId).toBe(true);
      expect(claims.some((claim) => (
        claim.subjectId === personId && claim.predicate === 'participated-in'
      )), personId).toBe(false);
    }
  });
});
