import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { sourceNotes } from './sources';

const expectedClaims = {
  'claim-ji-chang-participated-zhou-conquest-fortyfourth': ['ji-chang', 'zhou-conquest', -1050, -1047],
  'claim-zhou-wu-participated-zhou-conquest-fortyfourth': ['zhou-wu', 'zhou-conquest', -1046, -1046],
  'claim-wang-mang-participated-xin-founded-fortyfourth': ['wang-mang', 'xin-founded', 9, 9],
  'claim-liu-xuan-participated-gengshi-founded-fortyfourth': ['liu-xuan', 'gengshi-founded', 23, 25],
  'claim-liu-xiu-participated-gengshi-founded-fortyfourth': ['liu-xiu', 'gengshi-founded', 23, 25],
  'claim-yu-wen-tai-participated-western-wei-founded-fortyfourth': ['yu-wen-tai', 'western-wei-founded', 534, 540],
  'claim-fu-jian-participated-former-qin-founded-fortyfourth': ['fu-jian', 'former-qin-founded', 351, 357],
  'claim-yao-chang-participated-later-qin-founded-fortyfourth': ['yao-chang', 'later-qin-founded', 383, 394],
  'claim-liu-bang-participated-chu-han-contention-fortyfourth': ['liu-bang', 'chu-han-contention', -206, -202],
  'claim-han-xin-participated-chu-han-contention-fortyfourth': ['han-xin', 'chu-han-contention', -205, -202],
  'claim-xiao-he-participated-chu-han-contention-fortyfourth': ['xiao-he', 'chu-han-contention', -206, -202],
  'claim-sima-yan-participated-jin-unification-fortyfourth': ['sima-yan', 'jin-unification', 280, 280],
  'claim-li-yuan-participated-tang-founded-fortyfourth': ['li-yuan', 'tang-founded', 617, 618],
  'claim-li-shimin-participated-tang-founded-fortyfourth': ['li-shimin', 'tang-founded', 617, 626],
  'claim-li-cunxu-participated-five-dynasties-fortyfourth': ['li-cunxu', 'five-dynasties', 907, 907],
} as const;

describe('forty-fourth batch high-confidence participated-in claims', () => {
  it('adds the selected existing event participants as explicit event edges', () => {
    for (const [claimId, [subjectId, objectId, validFrom, validTo]] of Object.entries(expectedClaims)) {
      expect(claims.find((claim) => claim.id === claimId), claimId).toMatchObject({
        subjectId,
        predicate: 'participated-in',
        objectId,
        validFrom,
        validTo,
        datePrecision: expect.any(String),
        perspective: 'person',
        evidenceType: expect.stringMatching(/^(explicit-record|cross-checked)$/),
        confidence: 'high',
      });
    }
  });

  it('keeps every new edge bounded to an existing participant and source', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const eventIds = new Set(events.map((event) => event.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const entityIds = new Set([...peopleIds, ...eventIds]);
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fortyfourth'));

    expect(batchClaims).toHaveLength(Object.keys(expectedClaims).length);
    expect(validateClaims(batchClaims, entityIds)).toEqual([]);
    for (const claim of batchClaims) {
      const detail = eventDetails.find((candidate) => candidate.eventId === claim.objectId);
      expect(peopleIds.has(claim.subjectId), claim.id).toBe(true);
      expect(eventIds.has(claim.objectId ?? ''), claim.id).toBe(true);
      expect(detail?.participants.some((participant) => participant.personId === claim.subjectId), claim.id).toBe(true);
      expect(claim.sourceIds.length, claim.id).toBeGreaterThan(0);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
    }
  });
});
