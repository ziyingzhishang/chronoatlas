import { describe, expect, it } from 'vitest';
import type { HistoricalClaim } from '../domain/types';
import { getPersonDetail } from './person-details';
import { groupPersonRelationships } from '../domain/relationships';

const relationClaim = (overrides: Partial<HistoricalClaim>): HistoricalClaim => ({
  id: 'relation',
  subjectId: 'li-shimin',
  predicate: 'related-to',
  objectId: 'li-yuan',
  validFrom: 618,
  validTo: 626,
  datePrecision: 'range',
  perspective: 'person',
  evidenceType: 'cross-checked',
  confidence: 'medium',
  sourceIds: ['zizhi-tongjian'],
  ...overrides,
});

describe('person details', () => {
  it('provides a sourced Chang’an biography, offices, key events, and uncertainty note', () => {
    const detail = getPersonDetail('li-shimin');

    expect(detail?.biography).toContain('长安');
    expect(detail?.offices.some((office) => office.title.includes('皇帝'))).toBe(true);
    expect(detail?.offices.some((office) => office.polityId === 'tang')).toBe(true);
    expect(detail?.keyEvents).toContain('tang-founded-changan');
    expect(detail?.sourceIds.length).toBeGreaterThan(0);
    expect(detail?.uncertaintyNote).toBeTruthy();
  });

  it('returns no record for a person outside the curated detail set', () => {
    expect(getPersonDetail('unknown-person')).toBeUndefined();
  });

  it('groups directional family, court, alliance, and opposition relations by active year', () => {
    const claims = [
      relationClaim({ id: 'parent', predicate: 'parent-of', objectId: 'li-yuan' }),
      relationClaim({ id: 'served', predicate: 'served', objectId: 'li-yuan' }),
      relationClaim({ id: 'ally', predicate: 'ally-of', objectId: 'li-yuan' }),
      relationClaim({ id: 'enemy', predicate: 'enemy-of', objectId: 'wang-mang', validFrom: 620, validTo: 621 }),
      relationClaim({ id: 'expired', predicate: 'appointed', objectId: 'li-yuan', validFrom: 500, validTo: 550 }),
    ];

    const grouped = groupPersonRelationships('li-shimin', 620, claims);

    expect(grouped['parent-of'].map((relation) => relation.claim.id)).toEqual(['parent']);
    expect(grouped.served.map((relation) => relation.claim.id)).toEqual(['served']);
    expect(grouped['ally-of'].map((relation) => relation.claim.id)).toEqual(['ally']);
    expect(grouped['enemy-of'].map((relation) => relation.claim.id)).toEqual(['enemy']);
    expect(grouped.appointed).toEqual([]);
    expect(grouped['enemy-of'][0]?.claim.predicate).toBe('enemy-of');
  });
});
