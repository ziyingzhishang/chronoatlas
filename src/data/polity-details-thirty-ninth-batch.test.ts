import { describe, expect, it } from 'vitest';
import { buildPolityDetailCoverageReport } from './polity-detail-coverage';
import { getPolityDetail } from './polity-details';

const batchPolityIds = [
  'chu_warring', 'later_jin', 'silla', 'song_northern', 'song_south',
  'southern_liang', 'southern_yan', 'wei_warring', 'wu_zhou', 'xia_early',
  'xin', 'xiongnu', 'yan_warring', 'zhao_warring', 'zhou_eastern',
] as const;

describe('第三十九批政权详情', () => {
  it('closes every polity listed as uncovered by the current coverage report', () => {
    const report = buildPolityDetailCoverageReport();
    expect(report.uncoveredPolityIds).toEqual([]);
    expect(report.coveredPolityIds).toEqual(expect.arrayContaining([...batchPolityIds]));
  });

  it('uses only resolvable catalog associations and preserves required detail fields', () => {
    const report = buildPolityDetailCoverageReport();
    for (const polityId of batchPolityIds) {
      const detail = getPolityDetail(polityId);
      const item = report.items.find((candidate) => candidate.polityId === polityId);
      expect(detail).toBeDefined();
      expect(item?.unresolvedReferenceIds).toEqual({ people: [], events: [], heritage: [], capital: [], claims: [] });
      expect(detail?.perspectiveSummary.length).toBeGreaterThan(0);
      expect(detail?.foundationProcess.length).toBeGreaterThan(0);
      expect(detail?.turningPoints.length).toBeGreaterThan(0);
      expect(detail?.capitalPhases.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote.length).toBeGreaterThan(0);
    }
  });

  it('marks disputed, mobile, traditional and transitional cases explicitly', () => {
    expect(getPolityDetail('xia_early')?.uncertaintyNote).toContain('约年');
    expect(getPolityDetail('xiongnu')?.uncertaintyNote).toContain('移动');
    expect(getPolityDetail('later_jin')?.uncertaintyNote).toContain('改国号');
    expect(getPolityDetail('zhou_eastern')?.uncertaintyNote).toContain('王室');
  });
});
