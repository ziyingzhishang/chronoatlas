import { describe, expect, it } from 'vitest';
import { getChanganCoverageReport } from './changan-coverage';

describe('Chang’an coverage report', () => {
  it('reports current counts, targets, and shortfalls from the existing pilot data', () => {
    const report = getChanganCoverageReport();

    expect(report.counts).toEqual({
      polityStages: 9,
      people: 8,
      events: 10,
      heritage: 10,
    });
    expect(report.targets).toEqual({
      polityStages: 15,
      people: 30,
      events: 30,
      heritage: 20,
    });
    expect(report.shortfalls).toEqual({
      polityStages: 6,
      people: 22,
      events: 20,
      heritage: 10,
    });
  });

  it('calculates source coverage and explicitly lists nodes needing review', () => {
    const report = getChanganCoverageReport();

    expect(report.sourceCoverage).toEqual({
      total: 37,
      covered: 37,
      rate: 1,
      missingNodeIds: [],
    });
    expect(report.reviewItems).toEqual([
      expect.objectContaining({ type: 'person', id: 'wang-mang', reason: 'missing-time' }),
      expect.objectContaining({ type: 'person', id: 'liu-yao', reason: 'missing-time' }),
    ]);
  });

  it('separates data-quality review items from quantity gaps', () => {
    const report = getChanganCoverageReport();

    expect(report.gapList).toEqual([
      { type: 'polityStages', target: 15, current: 9, shortfall: 6 },
      { type: 'people', target: 30, current: 8, shortfall: 22 },
      { type: 'events', target: 30, current: 10, shortfall: 20 },
      { type: 'heritage', target: 20, current: 10, shortfall: 10 },
    ]);
  });
});
