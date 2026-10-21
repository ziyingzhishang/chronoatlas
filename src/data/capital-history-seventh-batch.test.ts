import { describe, expect, it } from 'vitest';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);

const researchPolityIds = [
  'xiongnu',
  'tuyuhun',
  'turkic',
  'xia_early',
  'shang',
  'western_qin',
  'northern_yuan',
  'ming_southern',
] as const;

describe('seventh-batch capital history audit', () => {
  it('replaces Xin dynasty directory placeholder with a source-backed Chang’an term', () => {
    expect(recordsFor('xin')).toEqual([
      expect.objectContaining({
        placeId: 'changan',
        validFrom: 9,
        validTo: 23,
        role: 'primary',
        status: 'formal',
        confidence: 'high',
      }),
    ]);

    const coverage = getCapitalCoverageReport().polities.find((item) => item.polityId === 'xin');
    expect(coverage).toMatchObject({
      missingPlaceIds: [],
      noSourceRecordIds: [],
      noTimeRecordIds: [],
      placeholderRecordIds: [],
      uncertainRecordIds: [],
      qualified: true,
    });
    expect(recordsFor('xin')[0].notes).toContain('西安市');
  });

  it('keeps mobile, disputed, approximate, and multi-centre cases explicitly unresolved', () => {
    const report = getCapitalCoverageReport();
    const byId = new Map(report.polities.map((item) => [item.polityId, item]));

    for (const polityId of researchPolityIds) {
      const records = recordsFor(polityId);
      const coverage = byId.get(polityId);

      expect(records.length, polityId).toBeGreaterThan(0);
      expect(coverage?.missingPlaceIds, polityId).toEqual([]);
      expect(coverage?.noSourceRecordIds, polityId).toEqual([]);
      expect(coverage?.noTimeRecordIds, polityId).toEqual([]);
      expect(coverage?.placeholderRecordIds, polityId).toEqual([]);
      expect(coverage?.qualified, polityId).toBe(false);
      expect(records.every((record) => record.sourceIds.length > 0), polityId).toBe(true);
      expect(records.every((record) => record.notes), polityId).toBe(true);
    }

    expect(byId.get('xiongnu')).toMatchObject({ hasMobileCenterCoverage: true });
    expect(byId.get('turkic')).toMatchObject({ hasMobileCenterCoverage: true });
    expect(byId.get('northern_yuan')).toMatchObject({ hasMobileCenterCoverage: true });
    expect(byId.get('tuyuhun')?.uncertainRecordIds).toEqual(['tuyuhun:0']);
    expect(byId.get('xia_early')?.uncertainRecordIds).toEqual(['xia_early:0']);
    expect(byId.get('shang')?.uncertainRecordIds).toEqual(['shang:0']);
    expect(recordsFor('ming_southern').some((record) => record.status === 'actual')).toBe(true);
  });
});
