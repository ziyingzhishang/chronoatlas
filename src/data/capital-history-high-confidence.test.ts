import { describe, expect, it } from 'vitest';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';

const targetPolityIds = [
  'song_northern',
  'song_south',
  'western_xia',
  'jin_jurchen',
  'yuan',
  'ming',
  'qing',
  'republic',
  'prc',
  'northern_yuan',
] as const;

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);

describe('high-confidence capital history coverage', () => {
  it('does not keep directory or unresolved political-center placeholders', () => {
    const report = getCapitalCoverageReport();

    for (const polityId of targetPolityIds) {
      const polity = report.polities.find((item) => item.polityId === polityId);
      expect(polity?.placeholderRecordIds, polityId).toEqual([]);
      expect(recordsFor(polityId).every((record) => (
        !record.notes?.includes('目录首都')
        && !record.notes?.includes('未细分政治中心')
      )), polityId).toBe(true);
    }
  });

  it('preserves the source-backed time slices and political-center roles', () => {
    expect(recordsFor('song_northern')).toMatchObject([
      { placeId: 'kaifeng', validFrom: 960, validTo: 1127, role: 'primary', status: 'formal', confidence: 'high' },
    ]);
    expect(recordsFor('song_south')).toMatchObject([
      { placeId: 'linan', validFrom: 1127, validTo: 1279, role: 'de_facto', status: 'actual', confidence: 'high' },
    ]);
    expect(recordsFor('western_xia')).toMatchObject([
      { placeId: 'xingqing', validFrom: 1038, validTo: 1227, role: 'primary', status: 'formal', confidence: 'high' },
    ]);
    expect(recordsFor('jin_jurchen').map(({ placeId, validFrom, validTo }) => ({ placeId, validFrom, validTo }))).toEqual([
      { placeId: 'huining', validFrom: 1115, validTo: 1153 },
      { placeId: 'jin_zhongdu', validFrom: 1153, validTo: 1214 },
      { placeId: 'kaifeng', validFrom: 1214, validTo: 1234 },
    ]);
    expect(recordsFor('yuan')).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'shangdu', role: 'primary', validFrom: 1271, validTo: 1273 }),
      expect.objectContaining({ placeId: 'shangdu', role: 'secondary', validFrom: 1274, validTo: 1364 }),
      expect.objectContaining({ placeId: 'dadu', role: 'primary', validFrom: 1271, validTo: 1271 }),
      expect.objectContaining({ placeId: 'dadu', role: 'primary', validFrom: 1272, validTo: 1368 }),
    ]));
    expect(recordsFor('ming').map(({ placeId, validFrom, validTo, role }) => ({ placeId, validFrom, validTo, role }))).toEqual([
      { placeId: 'yingtian', validFrom: 1368, validTo: 1420, role: 'primary' },
      { placeId: 'beijing', validFrom: 1421, validTo: 1644, role: 'primary' },
      { placeId: 'yingtian', validFrom: 1421, validTo: 1644, role: 'secondary' },
    ]);
    expect(recordsFor('qing')).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'shengjing', validFrom: 1636, validTo: 1644 }),
      expect.objectContaining({ placeId: 'beijing', validFrom: 1644, validTo: 1912 }),
    ]));
    expect(recordsFor('republic')).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'beijing', validFrom: 1912, validTo: 1927 }),
      expect.objectContaining({ placeId: 'yingtian', validFrom: 1928, validTo: 1937 }),
      expect.objectContaining({ placeId: 'chongqing', validFrom: 1938, validTo: 1945, role: 'temporary', status: 'actual' }),
      expect.objectContaining({ placeId: 'yingtian', validFrom: 1946, validTo: 1949 }),
    ]));
    expect(recordsFor('prc')).toMatchObject([
      { placeId: 'beijing', validFrom: 1949, validTo: 2026, role: 'primary', status: 'formal', confidence: 'high' },
    ]);
  });

  it('keeps Northern Yuan as an explicitly uncertain mobile center', () => {
    expect(recordsFor('northern_yuan')).toMatchObject([
      {
        placeId: 'beiyuan_core',
        validFrom: 1368,
        validTo: 1635,
        role: 'mobile_court',
        status: 'uncertain',
        confidence: 'low',
      },
    ]);
    expect(recordsFor('northern_yuan')[0].notes).toContain('没有单一固定都城');
  });
});
