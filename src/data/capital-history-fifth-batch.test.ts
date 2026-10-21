import { describe, expect, it } from 'vitest';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';

const priorityPolityIds = [
  'qin',
  'han_eastern',
  'wei_three',
  'shu_three',
  'wu_three',
  'song_southern',
  'zhou_northern',
  'han_later',
] as const;

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);

describe('fifth-batch capital history coverage', () => {
  it('qualifies every priority polity that is still a capital-coverage gap', () => {
    const report = getCapitalCoverageReport();
    const gaps = report.polities
      .filter((polity) => priorityPolityIds.includes(polity.polityId as (typeof priorityPolityIds)[number]))
      .filter((polity) => !polity.qualified)
      .map((polity) => polity.polityId);

    expect(gaps).toHaveLength(0);
    expect(report.summary.qualifiedPolities).toBe(75);
  });

  it('records the historically attested fixed capitals for all selected polities', () => {
    expect(recordsFor('qin')).toEqual([
      expect.objectContaining({ placeId: 'xianyang', validFrom: -221, validTo: -206, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('han_eastern')).toEqual([
      expect.objectContaining({ placeId: 'luoyang', validFrom: 25, validTo: 220, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('wei_three')).toEqual([
      expect.objectContaining({ placeId: 'luoyang', validFrom: 220, validTo: 265, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('shu_three')).toEqual([
      expect.objectContaining({ placeId: 'chengdu', validFrom: 221, validTo: 263, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('wu_three')).toEqual([
      expect.objectContaining({ placeId: 'jiankang', validFrom: 222, validTo: 280, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('song_southern')).toEqual([
      expect.objectContaining({ placeId: 'jiankang', validFrom: 420, validTo: 479, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('zhou_northern')).toEqual([
      expect.objectContaining({ placeId: 'changan', validFrom: 557, validTo: 581, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('han_later')).toEqual([
      expect.objectContaining({ placeId: 'kaifeng', validFrom: 947, validTo: 951, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
  });

  it('keeps every fifth-batch record source-backed, bounded, and free of placeholders or uncertainty', () => {
    const report = getCapitalCoverageReport();

    for (const polityId of priorityPolityIds) {
      const coverage = report.polities.find((polity) => polity.polityId === polityId);
      expect(coverage?.missingPlaceIds, polityId).toEqual([]);
      expect(coverage?.noSourceRecordIds, polityId).toEqual([]);
      expect(coverage?.noTimeRecordIds, polityId).toEqual([]);
      expect(coverage?.placeholderRecordIds, polityId).toEqual([]);
      expect(coverage?.uncertainRecordIds, polityId).toEqual([]);
    }
  });
});
