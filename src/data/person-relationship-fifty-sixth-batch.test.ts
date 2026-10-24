import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';

const expectedRelations = {
  'claim-nurhaci-ruled-later-jin-fiftysixth': ['nurhaci', 'ruled', 'later_jin', 1616, 1626, 'china-chronology'],
  'claim-hongtaiji-ruled-qing-fiftysixth': ['hongtaiji', 'ruled', 'qing', 1636, 1643, 'china-chronology'],
  'claim-shunzhi-ruled-qing-fiftysixth': ['shunzhi', 'ruled', 'qing', 1643, 1661, 'china-chronology'],
  'claim-zhao-kuangyin-ruled-northern-song-fiftysixth': ['zhao-kuangyin', 'ruled', 'song_northern', 960, 976, 'zizhi-tongjian'],
  'claim-zhao-gou-ruled-southern-song-fiftysixth': ['zhao-gou', 'ruled', 'song_south', 1127, 1162, 'zizhi-tongjian'],
} as const;

describe('fifty-sixth batch high-confidence governance relationships', () => {
  it('records only directly evidenced rulers, dates, directions, and sources', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo, sourceId]] of Object.entries(expectedRelations)) {
      expect(claims.find((claim) => claim.id === claimId), claimId).toMatchObject({
        subjectId,
        predicate,
        objectId,
        validFrom,
        validTo,
        datePrecision: 'range',
        perspective: 'person',
        evidenceType: 'explicit-record',
        confidence: 'high',
        sourceIds: [sourceId],
      });
    }
  });

  it('keeps every new edge resolvable, source-backed, and time-valid', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fiftysixth'));

    expect(batchClaims).toHaveLength(Object.keys(expectedRelations).length);
    expect(validateClaims(batchClaims, new Set([...peopleIds, ...polityIds]))).toEqual([]);
    for (const claim of batchClaims) {
      expect(peopleIds.has(claim.subjectId), claim.id).toBe(true);
      expect(polityIds.has(claim.objectId ?? ''), claim.id).toBe(true);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
    }
  });

  it('reduces only the directly evidenced governance gaps', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.requiredMissingByCategory.governance).toHaveLength(40);
    for (const personId of ['nurhaci', 'hongtaiji', 'shunzhi', 'zhao-kuangyin', 'zhao-gou']) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('governance');
    }
  });
});
