import { describe, expect, it } from 'vitest';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';

const targetPolityIds = ['zhou_eastern', 'wu_zhou', 'zhou_later'] as const;
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

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);

describe('sixth-batch capital history audit', () => {
  it('qualifies every fixed-capital placeholder selected by the dynamic audit', () => {
    const report = getCapitalCoverageReport();

    for (const polityId of targetPolityIds) {
      const coverage = report.polities.find((polity) => polity.polityId === polityId);
      expect(coverage?.qualified, polityId).toBe(true);
      expect(coverage?.missingPlaceIds, polityId).toEqual([]);
      expect(coverage?.noSourceRecordIds, polityId).toEqual([]);
      expect(coverage?.noTimeRecordIds, polityId).toEqual([]);
      expect(coverage?.placeholderRecordIds, polityId).toEqual([]);
      expect(coverage?.uncertainRecordIds, polityId).toEqual([]);
    }
  });

  it('records modern place context and bounded source-backed terms', () => {
    expect(recordsFor('zhou_eastern')).toEqual([
      expect.objectContaining({
        placeId: 'luoyang', validFrom: -770, validTo: -256,
        role: 'primary', status: 'formal', confidence: 'high',
      }),
    ]);
    expect(recordsFor('wu_zhou')).toEqual([
      expect.objectContaining({
        placeId: 'luoyang', validFrom: 690, validTo: 705,
        role: 'primary', status: 'formal', confidence: 'high',
      }),
    ]);
    expect(recordsFor('zhou_later')).toEqual([
      expect.objectContaining({
        placeId: 'kaifeng', validFrom: 951, validTo: 960,
        role: 'primary', status: 'formal', confidence: 'high',
      }),
    ]);

    for (const polityId of targetPolityIds) {
      for (const record of recordsFor(polityId)) {
        expect(record.sourceIds.length, polityId).toBeGreaterThan(0);
        expect(Number.isFinite(record.validFrom), polityId).toBe(true);
        expect(Number.isFinite(record.validTo), polityId).toBe(true);
        expect(record.notes, polityId).toBeTruthy();
      }
    }
  });

  it('keeps unresolved mobile, disputed, or specialist-research items explicit', () => {
    const report = getCapitalCoverageReport();
    expect(report.summary.qualifiedPolities).toBe(79);
    expect(report.polities.filter((polity) => !polity.qualified).map((polity) => polity.polityId))
      .toEqual(researchPolityIds);

    for (const polityId of researchPolityIds) {
      expect(report.polities.find((polity) => polity.polityId === polityId)?.qualified, polityId).toBe(false);
    }
  });
});
