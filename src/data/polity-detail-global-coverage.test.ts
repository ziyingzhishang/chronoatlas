import { describe, expect, it } from 'vitest';
import { buildPolityDetailCoverageReport } from './polity-detail-coverage';

describe('全局政权详情覆盖', () => {
  it('covers all 87 polities with aligned knowledge status and complete sources', () => {
    const report = buildPolityDetailCoverageReport();

    expect(report.totalPolities).toBe(87);
    expect(report.items).toHaveLength(87);
    expect(report.uncoveredPolityIds).toEqual([]);
    expect(report.detailCoverageRate).toBe(1);
    expect(report.knowledgeStatusMismatches).toEqual([]);
    expect(report.sourceCompletePolityIds).toHaveLength(87);
    expect(report.sourceCoverageRate).toBe(1);
    expect(report.items.every((item) => item.sourceComplete)).toBe(true);
    expect(report.items.every((item) => item.sourceIds.length > 0)).toBe(true);
  });
});
