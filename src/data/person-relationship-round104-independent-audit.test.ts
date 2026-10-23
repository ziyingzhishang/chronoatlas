import { describe, expect, it } from 'vitest';

import { changanEvents } from './changan-study';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';

const decisions = [
  { personId: 'fu-jian', eventIds: ['former-qin-founded'], kind: 'temporal-or-context-boundary' },
  { personId: 'huo-qubing', eventIds: ['changan-han-capital'], kind: 'temporal-or-context-boundary' },
  { personId: 'zhang-qian', eventIds: ['changan-han-capital'], kind: 'no-direct-role' },
  { personId: 'ban-gu', eventIds: ['changan-han-capital'], kind: 'temporal-or-context-boundary' },
  { personId: 'li-zhi', eventIds: ['daming-palace-built'], kind: 'no-direct-role' },
  { personId: 'yuan-hong', eventIds: ['northern-wei-founded'], kind: 'born-after-event' },
  { personId: 'tuoba-tao', eventIds: ['northern-wei-founded'], kind: 'born-after-event' },
  { personId: 'yuwen-yong', eventIds: [], kind: 'no-event-candidate' },
  { personId: 'zhao-wuling', eventIds: [], kind: 'no-event-candidate' },
  { personId: 'tufa-wugu', eventIds: [], kind: 'no-event-candidate' },
  { personId: 'mongke', eventIds: ['mongol-founded'], kind: 'born-after-event' },
] as const;

const eventCatalog = [...events, ...changanEvents];
const peopleById = new Map(people.map((person) => [person.id, person]));

describe('round 104 independent event-participation audit', () => {
  it('keeps all ten decisions explicitly unfilled and aligned with the coverage report', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.eventParticipation).toEqual(
      decisions.map(({ personId }) => personId),
    );

    for (const decision of decisions) {
      expect(decision.kind.length, `${decision.personId}: decision boundary`).toBeGreaterThan(0);
      expect(report.byPersonId[decision.personId].categories.eventParticipation.status, decision.personId)
        .toBe('missing');
      expect(report.byPersonId[decision.personId].categories.eventParticipation.evidence.every((item) => item.kind === 'role'), decision.personId)
        .toBe(true);
      expect(claims.some((claim) => (
        claim.subjectId === decision.personId && claim.predicate === 'participated-in'
      )), `${decision.personId}: participation claim`).toBe(false);

      for (const eventId of decision.eventIds) {
        const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
        expect(detail, `${decision.personId}:${eventId} detail`).toBeDefined();
        expect(detail?.participants.some((participant) => participant.personId === decision.personId),
          `${decision.personId}:${eventId} participant field`).toBe(false);
      }
    }
  });

  it('rejects later-generation and same-context inference as direct participation evidence', () => {
    const temporalCases = [
      ['yuan-hong', 'northern-wei-founded'],
      ['tuoba-tao', 'northern-wei-founded'],
      ['mongke', 'mongol-founded'],
    ] as const;

    for (const [personId, eventId] of temporalCases) {
      const person = peopleById.get(personId)!;
      const event = eventCatalog.find((candidate) => candidate.id === eventId)!;
      expect(person.birthYear, `${personId}: birth year`).toBeGreaterThan(event.year);
    }

    for (const personId of ['yuwen-yong', 'zhao-wuling', 'tufa-wugu']) {
      expect(eventDetails.some((detail) => detail.participants.some((participant) => (
        participant.personId === personId
      ))), `${personId}: no direct event-detail candidate`).toBe(false);
    }

    expect(eventDetails.find((detail) => detail.eventId === 'daming-palace-built')?.participants)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ personId: 'li-shimin', relationType: 'direct' }),
        expect.objectContaining({ personId: 'li-yuan', relationType: 'contextual' }),
      ]));
    expect(eventDetails.find((detail) => detail.eventId === 'changan-han-capital')?.participants)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ personId: 'liu-bang', relationType: 'direct' }),
        expect.objectContaining({ personId: 'xiao-he', relationType: 'contextual' }),
      ]));
  });
});
