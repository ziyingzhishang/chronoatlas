import { describe, expect, it } from 'vitest';
import { claimsAtYear, claimsForEntity, validateClaims } from './claims';
import type { HistoricalClaim } from './types';

const claims: HistoricalClaim[] = [
  { id:'c1', subjectId:'tang', predicate:'capital-of', objectId:'changan', validFrom:618, validTo:907, datePrecision:'range', perspective:'polity', evidenceType:'cross-checked', confidence:'high', sourceIds:['source'] },
  { id:'c2', subjectId:'taizong', predicate:'ruled', objectId:'tang', validFrom:626, validTo:649, datePrecision:'range', perspective:'person', evidenceType:'explicit-record', confidence:'high', sourceIds:['source'] },
];

describe('historical claims', () => {
  it('filters claims by entity, year and perspective', () => {
    expect(claimsForEntity(claims, 'tang', { year: 700, perspective: 'polity' }).map(claim => claim.id)).toEqual(['c1']);
    expect(claimsAtYear(claims, 630).map(claim => claim.id)).toEqual(['c1', 'c2']);
  });

  it('reports dangling entities, invalid ranges and missing evidence', () => {
    const issues = validateClaims([
      ...claims,
      { ...claims[0], id:'bad-id', objectId:'missing', validFrom:900, validTo:800, sourceIds:[], perspective:undefined as never },
    ], new Set(['tang','changan','taizong']));
    expect(issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ claimId:'bad-id', code:'dangling-entity' }),
      expect.objectContaining({ claimId:'bad-id', code:'invalid-range' }),
      expect.objectContaining({ claimId:'bad-id', code:'missing-source' }),
      expect.objectContaining({ claimId:'bad-id', code:'missing-perspective' }),
    ]));
  });
});
