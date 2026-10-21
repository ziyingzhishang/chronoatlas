import { describe, expect, it } from 'vitest';
import { polities } from './polities';
import { getCapitalCoverageReport } from './capital-coverage';

describe('capital coverage report', () => {
  it('reports every polity and the overall qualification rate', () => {
    const report = getCapitalCoverageReport();

    expect(report.polities).toHaveLength(polities.length);
    expect(report.summary.totalPolities).toBe(polities.length);
    expect(report.summary.qualifiedPolities).toBe(
      report.polities.filter((polity) => polity.qualified).length,
    );
    expect(report.summary.qualificationRate).toBe(
      report.summary.qualifiedPolities / report.summary.totalPolities,
    );
    expect(report.summary.gapPolityIds).toEqual(
      report.polities.filter((polity) => !polity.qualified).map((polity) => polity.polityId),
    );
  });

  it('exposes record-level source, time, place, placeholder, and uncertainty gaps', () => {
    const report = getCapitalCoverageReport();
    const xiongnu = report.polities.find((polity) => polity.polityId === 'xiongnu');
    const xin = report.polities.find((polity) => polity.polityId === 'xin');

    expect(xiongnu).toMatchObject({
      recordCount: 1,
      uncertainRecordIds: expect.arrayContaining(['xiongnu:0']),
      hasMobileCenterCoverage: true,
      qualified: false,
    });
    expect(xin?.placeholderRecordIds).toEqual([]);
    expect(xin?.qualified).toBe(true);
  });

  it('distinguishes migration, overlapping multi-capital, and mobile-center coverage', () => {
    const report = getCapitalCoverageReport();
    const byId = new Map(report.polities.map((polity) => [polity.polityId, polity]));

    expect(byId.get('wei_northern')).toMatchObject({
      hasMigrationCoverage: true,
      hasMultiCapitalCoverage: false,
    });
    expect(byId.get('yuan')).toMatchObject({
      hasMigrationCoverage: false,
      hasMultiCapitalCoverage: true,
    });
    expect(byId.get('turkic')).toMatchObject({
      hasMobileCenterCoverage: true,
    });
  });

  it('has no unresolved place references after safe data corrections', () => {
    const report = getCapitalCoverageReport();

    expect(report.polities.flatMap((polity) => polity.missingPlaceIds)).toEqual([]);
  });
});
