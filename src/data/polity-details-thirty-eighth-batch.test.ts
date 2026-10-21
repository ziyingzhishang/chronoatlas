import { describe, expect, it } from 'vitest';
import { buildPolityDetailCoverageReport } from './polity-detail-coverage';
import { getPolityDetail } from './polity-details';

const batchPolityIds = [
  'former_liang',
  'former_qin',
  'gengshi',
  'goguryeo',
  'han_warring',
  'ming_southern',
  'mongol',
  'northern_yuan',
  'republic',
  'prc',
  'qi_warring',
  'qin_state',
  'shang',
  'zhou_western',
] as const;

describe('第三十八批政权详情', () => {
  it('covers every requested polity except the already-covered Later Jin', () => {
    const report = buildPolityDetailCoverageReport();

    expect(batchPolityIds.every((polityId) => report.coveredPolityIds.includes(polityId))).toBe(true);
    expect(report.coveredPolityIds).toContain('jin_later');
  });

  it('uses only resolvable existing associations for each new detail', () => {
    const report = buildPolityDetailCoverageReport();

    for (const polityId of batchPolityIds) {
      const detail = getPolityDetail(polityId);
      const item = report.items.find((candidate) => candidate.polityId === polityId);

      expect(detail).toBeDefined();
      expect(item?.unresolvedReferenceIds).toEqual({ people: [], events: [], heritage: [], capital: [], claims: [] });
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote.length).toBeGreaterThan(0);
    }
  });

  it('preserves evidence boundaries for mobile or multi-stage political centers', () => {
    expect(getPolityDetail('ming_southern')?.uncertaintyNote).toContain('多个');
    expect(getPolityDetail('mongol')?.uncertaintyNote).toContain('移动');
    expect(getPolityDetail('northern_yuan')?.uncertaintyNote).toContain('唯一');
    expect(getPolityDetail('shang')?.uncertaintyNote).toContain('迁都');
  });
});
