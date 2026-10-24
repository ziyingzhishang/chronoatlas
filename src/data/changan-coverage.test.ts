import { describe, expect, it } from 'vitest';
import { getChanganCoverageReport } from './changan-coverage';

describe('Chang’an coverage report', () => {
  it('reports current counts, targets, and shortfalls from the existing pilot data', () => {
    const report = getChanganCoverageReport();

    expect(report.counts).toEqual({
      polityStages: 17,
      people: 49,
      events: 30,
      heritage: 27,
    });
    expect(report.targets).toEqual({
      polityStages: 15,
      people: 30,
      events: 30,
      heritage: 20,
    });
    expect(report.shortfalls).toEqual({
      polityStages: 0,
      people: 0,
      events: 0,
      heritage: 0,
    });
  });

  it('calculates source coverage and explicitly lists nodes needing review', () => {
    const report = getChanganCoverageReport();

    expect(report.sourceCoverage).toEqual({
      total: 123,
      covered: 123,
      rate: 1,
      missingNodeIds: [],
    });
    expect(report.reviewItems.length).toBeGreaterThan(0);
    expect(report.reviewItems.every((item) => item.reason === 'missing-time')).toBe(true);
  });

  it('separates data-quality review items from quantity gaps', () => {
    const report = getChanganCoverageReport();

    expect(report.gapList).toEqual([
      { type: 'polityStages', target: 15, current: 17, shortfall: 0 },
      { type: 'people', target: 30, current: 49, shortfall: 0 },
      { type: 'events', target: 30, current: 30, shortfall: 0 },
      { type: 'heritage', target: 20, current: 27, shortfall: 0 },
    ]);
  });
});
