import { describe, expect, it } from 'vitest';
import { claims } from '../data/claims';
import { findPersonRelationships, groupPersonRelationships } from './relationships';

describe('person relationships', () => {
  it('returns time-scoped relations for a person', () => {
    const result = findPersonRelationships('li-shimin', 640, claims);
    expect(result.map((relation) => relation.claim.id)).toEqual([
      'claim-li-shimin-ruled-tang',
      'claim-wei-zheng-ally-li-shimin-seventysixth',
      'claim-wei-zheng-served-li-shimin',
      'claim-li-shimin-parent-li-zhi-fiftyfourth',
      'claim-li-zhi-child-li-shimin-fiftyfourth',
      'claim-songtsen-gampo-enemy-li-shimin-ninetyfourth',
      'claim-songtsen-gampo-related-li-shimin',
    ]);
    expect(result[0]?.kind).toBe('person-polity');
  });

  it('groups person relations and ignores inactive claims', () => {
    const grouped = groupPersonRelationships('li-yuan', 618, claims);
    expect(grouped['person-polity'].map((relation) => relation.claim.id)).toEqual(['claim-li-yuan-founded-tang']);
    expect(grouped['person-heritage']).toEqual([]);
  });

  it('includes incoming kinship claims with a normalized direction for the selected person', () => {
    const result = findPersonRelationships('child', 100, [{
      id: 'parent-child',
      subjectId: 'parent',
      predicate: 'parent-of',
      objectId: 'child',
      validFrom: 90,
      validTo: 110,
      datePrecision: 'range',
      perspective: 'person',
      evidenceType: 'explicit-record',
      confidence: 'high',
      sourceIds: ['source'],
    }]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      claim: { id: 'parent-child', subjectId: 'child', objectId: 'parent', predicate: 'child-of' },
      direction: 'incoming',
    });
  });
});
