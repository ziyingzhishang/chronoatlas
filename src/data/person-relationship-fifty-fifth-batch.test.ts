import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-cao-cao-participated-three-kingdoms-fiftyfifth': ['cao-cao', 'three-kingdoms', 220, 220],
  'claim-liu-bei-participated-three-kingdoms-fiftyfifth': ['liu-bei', 'three-kingdoms', 221, 221],
  'claim-sun-quan-participated-three-kingdoms-fiftyfifth': ['sun-quan', 'three-kingdoms', 222, 222],
  'claim-yang-jian-participated-sui-unification-fiftyfifth': ['yang-jian', 'sui-unification', 589, 589],
  'claim-zhu-wen-participated-five-dynasties-fiftyfifth': ['zhu-wen', 'five-dynasties', 907, 907],
} as const;

describe('fifty-fifth batch high-confidence event participation relationships', () => {
  it('records only directly evidenced event participation directions and years', () => {
    for (const [claimId, [subjectId, objectId, validFrom, validTo]] of Object.entries(expectedRelations)) {
      expect(claims.find((claim) => claim.id === claimId), claimId).toMatchObject({
        subjectId,
        predicate: 'participated-in',
        objectId,
        validFrom,
        validTo,
        datePrecision: 'year',
        perspective: 'person',
        evidenceType: expect.stringMatching(/^(explicit-record|cross-checked)$/),
        confidence: 'high',
      });
    }
  });

  it('keeps every new edge resolvable, source-backed, and aligned with event details', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const eventIds = new Set(events.map((event) => event.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fiftyfifth'));

    expect(batchClaims).toHaveLength(Object.keys(expectedRelations).length);
    expect(validateClaims(batchClaims, new Set([...peopleIds, ...eventIds]))).toEqual([]);
    for (const claim of batchClaims) {
      const detail = eventDetails.find((candidate) => candidate.eventId === claim.objectId);
      expect(peopleIds.has(claim.subjectId), claim.id).toBe(true);
      expect(eventIds.has(claim.objectId ?? ''), claim.id).toBe(true);
      expect(detail?.sourceIds.length, claim.id).toBeGreaterThan(0);
      expect(detail?.participants.some((participant) => participant.personId === claim.subjectId), claim.id).toBe(true);
      expect(claim.sourceIds.length, claim.id).toBeGreaterThan(0);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
    }
  });
});
