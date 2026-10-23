import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { personDetails } from './person-details';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expected = [
  ['claim-tufa-wugu-ruled-southern-liang-round105', 'tufa-wugu', 'ruled', 'southern_liang', 397, 399, ['zizhi-tongjian']],
  ['claim-yuan-shanjian-ruled-eastern-wei-round105', 'yuan-shanjian', 'ruled', 'wei_eastern', 534, 550, ['zizhi-tongjian', 'china-chronology']],
  ['claim-yuri-goguryeo-ruled-goguryeo-round105', 'yuri-goguryeo', 'ruled', 'goguryeo', -19, 18, ['china-chronology']],
] as const;

describe('round 105 governance relationship closure', () => {
  it('records only governance edges directly supported by existing offices', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const [claimId, subjectId, predicate, objectId, validFrom, validTo, requiredSources] of expected) {
      const claim = claims.find((item) => item.id === claimId);
      expect(claim).toMatchObject({
        subjectId,
        predicate,
        objectId,
        validFrom,
        validTo,
        datePrecision: 'range',
        perspective: 'person',
        evidenceType: 'explicit-record',
        confidence: 'high',
      });
      expect(claim?.sourceIds).toEqual(expect.arrayContaining([...requiredSources]));
      expect(claim?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claimId).toBe(true);
      expect(claim?.uncertaintyNote?.trim(), claimId).toBeTruthy();
      expect(validateClaims([claim!], new Set([...peopleIds, ...polityIds]))).toEqual([]);
    }
  });

  it('keeps the selected endpoints backed by person-detail offices', () => {
    for (const [, personId, , polityId] of expected) {
      const person = people.find((item) => item.id === personId);
      const detail = personDetails.find((item) => item.personId === personId);
      expect(person?.polityIds).toContain(polityId);
      expect(detail?.offices).toEqual(expect.arrayContaining([
        expect.objectContaining({ polityId }),
      ]));
    }
  });

  it('reduces only the three evidenced governance gaps and preserves the remaining boundary', () => {
    const report = buildPersonRelationshipCoverageReport();

    for (const [, personId] of expected) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
    }
    expect(report.requiredMissingByCategory.governance).toHaveLength(25);
    expect(report.requiredMissingByCategory.governance).toEqual(expect.arrayContaining([
      'zhang-qian',
      'ban-gu',
      'octavian',
      'franklin-roosevelt',
    ]));
  });
});
