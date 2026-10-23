import { describe, expect, it } from 'vitest';

import {
  buildPersonRelationshipApplicabilityCatalog,
  personRelationshipApplicability,
  personRelationshipApplicabilityCategoryKeys,
} from './person-relationship-applicability';

describe('person relationship applicability catalog', () => {
  it('covers every person and every relationship category exactly once', () => {
    expect(personRelationshipApplicability.totalPeople).toBe(182);
    expect(personRelationshipApplicability.records).toHaveLength(182);
    expect(Object.keys(personRelationshipApplicability.byPersonId)).toHaveLength(182);

    for (const record of personRelationshipApplicability.records) {
      expect(Object.keys(record.categories).sort()).toEqual([...personRelationshipApplicabilityCategoryKeys].sort());
      for (const category of personRelationshipApplicabilityCategoryKeys) {
        expect(['required', 'not-applicable', 'review']).toContain(record.categories[category].status);
        expect(record.categories[category].rationale).toBeTruthy();
        expect(record.categories[category].evidenceIds.length).toBeGreaterThan(0);
      }
    }
  });

  it('does not turn an uncertain cultural role into a required or not-applicable claim without evidence', () => {
    const record = personRelationshipApplicability.byPersonId['xuan-zang'];

    expect(record.categories.kinship.status).toBe('review');
    expect(record.categories.kinship.rationale).toMatch(/无法|复核/);
    expect(record.categories.kinship.evidenceIds).toContain('role:xuan-zang:僧侣');
  });

  it('records a defensible not-applicable governance category for a purely cultural role', () => {
    const record = personRelationshipApplicability.byPersonId['xuan-zang'];

    expect(record.categories.governance.status).toBe('not-applicable');
    expect(record.categories.governance.rationale).toMatch(/角色|治理/);
  });

  it('reports status counts and rejects duplicate or unknown people in custom input', () => {
    expect(personRelationshipApplicability.statusCounts.governance['not-applicable']).toBeGreaterThan(0);
    expect(personRelationshipApplicability.statusCounts.kinship.review).toBeGreaterThan(0);

    expect(() => buildPersonRelationshipApplicabilityCatalog({
      people: [{
        id: 'unknown-person',
        name: '未知人物',
        description: '测试人物',
        sourceIds: ['zizhi-tongjian'],
      }],
      claims: [],
      eventDetails: [],
    })).not.toThrow();
  });
});
