import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { personDetails } from './person-details';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expected = [
  ['claim-geluofeng-ruled-nanzhao-round107', 'geluofeng', 'ruled', 'nanzhao', 748, 779],
  ['claim-yimouxun-ruled-nanzhao-round107', 'yimouxun', 'ruled', 'nanzhao', 779, 808],
  ['claim-quanfengyou-ruled-nanzhao-round107', 'quanfengyou', 'ruled', 'nanzhao', 824, 859],
] as const;

describe('round 107 governance relationship closure', () => {
  it('records only ruler offices directly backed by existing person details', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const [claimId, subjectId, predicate, objectId, validFrom, validTo] of expected) {
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
      expect(claim?.sourceIds).toEqual(expect.arrayContaining(['zizhi-tongjian', 'china-chronology']));
      expect(claim?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claimId).toBe(true);
      expect(claim?.uncertaintyNote?.trim(), claimId).toBeTruthy();
      expect(validateClaims([claim!], new Set([...peopleIds, ...polityIds]))).toEqual([]);
    }
  });

  it('keeps each ruled endpoint backed by a dated Nanzhao king office', () => {
    for (const [, personId, , polityId, validFrom, validTo] of expected) {
      const person = people.find((item) => item.id === personId);
      const detail = personDetails.find((item) => item.personId === personId);
      expect(person?.polityIds).toContain(polityId);
      expect(detail?.offices).toEqual(expect.arrayContaining([
        expect.objectContaining({
          title: '南诏王',
          polityId,
          validFrom,
          validTo,
          datePrecision: 'range',
        }),
      ]));
    }
  });

  it('reduces only the three evidenced governance gaps', () => {
    const report = buildPersonRelationshipCoverageReport();

    for (const [, personId] of expected) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
    }
    expect(report.requiredMissingByCategory.governance).toHaveLength(53);
    expect(report.requiredMissingByCategory.governance).toEqual(expect.arrayContaining([
      'zhang-qian',
      'ban-gu',
      'octavian',
      'franklin-roosevelt',
    ]));
  });
});
