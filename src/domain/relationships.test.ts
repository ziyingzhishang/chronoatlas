import { describe, expect, it } from 'vitest';
import { claims } from '../data/claims';
import { findPersonRelationships, groupPersonRelationships } from './relationships';

describe('person relationships', () => {
  it('returns time-scoped relations for a person', () => {
    const result = findPersonRelationships('li-shimin', 640, claims);
    expect(result.map((relation) => relation.claim.id)).toEqual(['claim-li-shimin-ruled-tang']);
    expect(result[0]?.kind).toBe('person-polity');
  });

  it('groups person relations and ignores inactive claims', () => {
    const grouped = groupPersonRelationships('li-yuan', 618, claims);
    expect(grouped['person-polity'].map((relation) => relation.claim.id)).toEqual(['claim-li-yuan-founded-tang']);
    expect(grouped['person-heritage']).toEqual([]);
  });
});
