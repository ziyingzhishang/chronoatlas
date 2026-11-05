import { describe, expect, it } from 'vitest';
import { buildPolityDetailCoverageReport } from './polity-detail-coverage';

describe('全局政权详情覆盖', () => {
  it('audits all 89 polities while keeping Western Yan association gaps explicit', () => {
    const report = buildPolityDetailCoverageReport();

    expect(report.totalPolities).toBe(89);
    expect(report.items).toHaveLength(89);
    expect(report.uncoveredPolityIds).toEqual(['western_yan']);
    expect(report.detailCoverageRate).toBe(88 / 89);
    expect(report.knowledgeStatusMismatches).toEqual([]);
    expect(report.sourceCompletePolityIds).toHaveLength(89);
    expect(report.sourceCoverageRate).toBe(1);
    expect(report.items.every((item) => item.sourceComplete)).toBe(true);
    expect(report.items.every((item) => item.sourceIds.length > 0)).toBe(true);
  });
});
