import { describe, expect, it } from 'vitest';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);

describe('third-batch capital history coverage', () => {
  it('qualifies the high-confidence Eastern Jin and Northern/Southern Dynasties gaps', () => {
    const report = getCapitalCoverageReport();
    const targetPolityIds = ['jin_eastern', 'liang_southern', 'wei_eastern', 'wei_western', 'qi_northern'];

    for (const polityId of targetPolityIds) {
      expect(report.polities.find((polity) => polity.polityId === polityId)?.qualified, polityId).toBe(true);
    }
  });

  it('records fixed capitals and the Southern Liang political-center transition', () => {
    expect(recordsFor('jin_eastern')).toEqual([
      expect.objectContaining({
        placeId: 'jiankang', validFrom: 317, validTo: 420,
        role: 'primary', status: 'formal', confidence: 'high',
      }),
    ]);
    expect(recordsFor('wei_eastern')).toEqual([
      expect.objectContaining({
        placeId: 'ye', validFrom: 534, validTo: 550,
        role: 'primary', status: 'formal', confidence: 'high',
      }),
    ]);
    expect(recordsFor('wei_western')).toEqual([
      expect.objectContaining({
        placeId: 'changan', validFrom: 535, validTo: 557,
        role: 'primary', status: 'formal', confidence: 'high',
      }),
    ]);
    expect(recordsFor('qi_northern')).toEqual([
      expect.objectContaining({
        placeId: 'ye', validFrom: 550, validTo: 577,
        role: 'primary', status: 'formal', confidence: 'high',
      }),
    ]);
    expect(recordsFor('liang_southern').map(({ placeId, validFrom, validTo, role, status }) => ({
      placeId, validFrom, validTo, role, status,
    }))).toEqual([
      { placeId: 'jiankang', validFrom: 502, validTo: 551, role: 'primary', status: 'formal' },
      { placeId: 'jiangling', validFrom: 552, validTo: 554, role: 'primary', status: 'actual' },
      { placeId: 'jiankang', validFrom: 555, validTo: 557, role: 'primary', status: 'actual' },
    ]);
  });

  it('keeps every third-batch record source-backed, time-bounded, and free of duplicate slices', () => {
    const report = getCapitalCoverageReport();
    const targetPolityIds = ['jin_eastern', 'liang_southern', 'wei_eastern', 'wei_western', 'qi_northern'];
    const seen = new Set<string>();

    for (const polityId of targetPolityIds) {
      const coverage = report.polities.find((polity) => polity.polityId === polityId);
      expect(coverage?.missingPlaceIds, polityId).toEqual([]);
      expect(coverage?.noSourceRecordIds, polityId).toEqual([]);
      expect(coverage?.noTimeRecordIds, polityId).toEqual([]);
      expect(coverage?.placeholderRecordIds, polityId).toEqual([]);

      for (const record of recordsFor(polityId)) {
        const key = `${record.polityId}:${record.placeId}:${record.validFrom}:${record.validTo}`;
        expect(seen.has(key), key).toBe(false);
        seen.add(key);
      }
    }
  });
});
