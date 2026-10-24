import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';

describe('round 103 Goguryeo governance relationships', () => {
  it('records the two source-backed rulers without conflating the 427 migration event', () => {
    const expected = [
      ['claim-gwanggaeto-ruled-goguryeo-round103', 'gwanggaeto', 391, 413],
      ['claim-jangsu-goguryeo-ruled-goguryeo-round103', 'jangsu-goguryeo', 413, 491],
    ] as const;
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const [claimId, personId, validFrom, validTo] of expected) {
      const claim = claims.find((item) => item.id === claimId);
      expect(claim).toMatchObject({
        subjectId: personId, predicate: 'ruled', objectId: 'goguryeo', validFrom, validTo,
        datePrecision: 'range', evidenceType: 'explicit-record', confidence: 'high',
      });
      expect(validateClaims([claim!], new Set([...peopleIds, ...polityIds]))).toEqual([]);
      expect(claim!.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    }

    const migration = claims.find((claim) => claim.subjectId === 'jangsu-goguryeo' && claim.predicate === 'participated-in' && claim.objectId === 'goguryeo-moves-pyongyang');
    expect(migration).toBeUndefined();
  });

  it('closes the governance category for both newly introduced city-view people', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.byPersonId.gwanggaeto.categories.governance.status).toBe('covered');
    expect(report.byPersonId['jangsu-goguryeo'].categories.governance.status).toBe('covered');
    expect(report.requiredMissingByCategory.governance).toHaveLength(53);
  });
});
