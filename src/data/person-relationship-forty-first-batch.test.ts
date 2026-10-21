import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-liu-bei-served-cao-cao-fortyfirst': ['liu-bei', 'served', 'cao-cao', 199, 200],
  'claim-cao-cao-appointed-liu-bei-fortyfirst': ['cao-cao', 'appointed', 'liu-bei', 199, 200],
  'claim-an-lushan-served-li-longji-fortyfirst': ['an-lushan', 'served', 'li-longji', 732, 755],
  'claim-li-longji-appointed-an-lushan-fortyfirst': ['li-longji', 'appointed', 'an-lushan', 732, 755],
  'claim-yu-wen-tai-enemy-gao-huan-fortyfirst': ['yu-wen-tai', 'enemy-of', 'gao-huan', 534, 547],
  'claim-liu-yilong-succeeded-liu-yu-fortyfirst': ['liu-yilong', 'succeeded', 'liu-yu', 424, 424],
  'claim-chen-xu-succeeded-chen-qian-fortyfirst': ['chen-xu', 'succeeded', 'chen-qian', 566, 566],
  'claim-yelu-yilie-succeeded-yelu-dashi-fortyfirst': ['yelu-yilie', 'succeeded', 'yelu-dashi', 1163, 1163],
  'claim-dorgon-served-shunzhi-fortyfirst': ['dorgon', 'served', 'shunzhi', 1644, 1650],
  'claim-liu-xiu-enemy-wang-mang-fortyfirst': ['liu-xiu', 'enemy-of', 'wang-mang', 23, 25],
} as const;

describe('forty-first batch high-confidence person relationships', () => {
  it('adds the approved relationship directions and time ranges', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo]] of Object.entries(expectedRelations)) {
      const claim = claims.find((item) => item.id === claimId);
      expect(claim, claimId).toBeDefined();
      expect(claim).toMatchObject({
        subjectId,
        predicate,
        objectId,
        validFrom,
        validTo,
        perspective: 'person',
        confidence: 'high',
      });
    }
  });

  it('keeps every new claim source-backed, explicit, and resolvable', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fortyfirst'));

    expect(batchClaims).toHaveLength(Object.keys(expectedRelations).length);
    expect(validateClaims(batchClaims, peopleIds)).toEqual([]);
    for (const claim of batchClaims) {
      expect(['explicit-record', 'cross-checked']).toContain(claim.evidenceType);
      expect(claim.sourceIds.length, claim.id).toBeGreaterThan(0);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
    }
  });
});
