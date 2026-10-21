import { describe, expect, it } from 'vitest';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';

const targetPolityIds = [
  'cheng_han',
  'former_qin',
  'later_qin',
  'xia',
  'northern_liang',
  'liang_later',
  'tang_later',
  'jin_later',
] as const;

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);

describe('fourth-batch capital history coverage', () => {
  it('qualifies the selected high-confidence Sixteen Kingdoms and Five Dynasties polities', () => {
    const report = getCapitalCoverageReport();

    expect(report.summary.totalPolities).toBe(87);
    expect(report.summary.qualifiedPolities).toBe(79);
    expect(report.summary.gapPolityIds).not.toEqual(expect.arrayContaining([...targetPolityIds]));

    for (const polityId of targetPolityIds) {
      expect(report.polities.find((polity) => polity.polityId === polityId)?.qualified, polityId).toBe(true);
    }
  });

  it('records fixed capitals and the Northern Liang migration without unresolved placeholders', () => {
    expect(recordsFor('cheng_han')).toEqual([
      expect.objectContaining({ placeId: 'chengdu', validFrom: 304, validTo: 347, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('former_qin')).toEqual([
      expect.objectContaining({ placeId: 'changan', validFrom: 351, validTo: 394, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('later_qin')).toEqual([
      expect.objectContaining({ placeId: 'changan', validFrom: 384, validTo: 417, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('xia')).toEqual([
      expect.objectContaining({ placeId: 'zhitong', validFrom: 413, validTo: 431, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('northern_liang').map(({ placeId, validFrom, validTo }) => ({ placeId, validFrom, validTo }))).toEqual([
      { placeId: 'zhangye', validFrom: 397, validTo: 400 },
      { placeId: 'guzang', validFrom: 401, validTo: 439 },
    ]);
    expect(recordsFor('liang_later')).toEqual([
      expect.objectContaining({ placeId: 'kaifeng', validFrom: 907, validTo: 923, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('tang_later')).toEqual([
      expect.objectContaining({ placeId: 'luoyang', validFrom: 923, validTo: 936, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('jin_later')).toEqual([
      expect.objectContaining({ placeId: 'kaifeng', validFrom: 936, validTo: 947, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
  });

  it('keeps every fourth-batch record source-backed, bounded, and free of placeholders or uncertainty', () => {
    const report = getCapitalCoverageReport();

    for (const polityId of targetPolityIds) {
      const coverage = report.polities.find((polity) => polity.polityId === polityId);
      expect(coverage?.missingPlaceIds, polityId).toEqual([]);
      expect(coverage?.noSourceRecordIds, polityId).toEqual([]);
      expect(coverage?.noTimeRecordIds, polityId).toEqual([]);
      expect(coverage?.placeholderRecordIds, polityId).toEqual([]);
      expect(coverage?.uncertainRecordIds, polityId).toEqual([]);
    }
  });
});
