import { describe, expect, it } from 'vitest';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);

describe('second-batch capital history coverage', () => {
  it('covers the high-confidence fixed-capital polities in this batch', () => {
    const report = getCapitalCoverageReport();
    const targetPolityIds = [
      'jin_western',
      'wei_northern',
      'qi_southern',
      'chen_southern',
      'former_shu',
      'later_shu',
      'northern_han',
      'khitan',
    ];

    for (const polityId of targetPolityIds) {
      expect(report.polities.find((polity) => polity.polityId === polityId)?.qualified, polityId).toBe(true);
    }
  });

  it('records the Western Jin capital transition from Luoyang to Chang’an', () => {
    expect(recordsFor('jin_western')).toEqual([
      expect.objectContaining({
        placeId: 'luoyang',
        validFrom: 265,
        validTo: 311,
        role: 'primary',
        status: 'formal',
        confidence: 'high',
      }),
      expect.objectContaining({
        placeId: 'changan',
        validFrom: 312,
        validTo: 316,
        role: 'primary',
        status: 'actual',
        confidence: 'high',
      }),
    ]);
  });

  it('records the fixed capitals of the Southern Dynasties and Shu-Han successor states', () => {
    expect(recordsFor('qi_southern')).toEqual([
      expect.objectContaining({ placeId: 'jiankang', validFrom: 479, validTo: 502, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('chen_southern')).toEqual([
      expect.objectContaining({ placeId: 'jiankang', validFrom: 557, validTo: 589, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('former_shu')).toEqual([
      expect.objectContaining({ placeId: 'chengdu', validFrom: 907, validTo: 925, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('later_shu')).toEqual([
      expect.objectContaining({ placeId: 'chengdu', validFrom: 934, validTo: 965, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
    expect(recordsFor('northern_han')).toEqual([
      expect.objectContaining({ placeId: 'taiyuan', validFrom: 951, validTo: 979, role: 'primary', status: 'formal', confidence: 'high' }),
    ]);
  });

  it('preserves the existing multi-capital Northern Wei and Liao records', () => {
    expect(recordsFor('wei_northern').map(({ placeId, validFrom, validTo }) => ({ placeId, validFrom, validTo }))).toEqual([
      { placeId: 'pingcheng', validFrom: 386, validTo: 494 },
      { placeId: 'luoyang', validFrom: 495, validTo: 534 },
    ]);
    expect(recordsFor('khitan').map(({ placeId, validFrom, validTo }) => ({ placeId, validFrom, validTo }))).toEqual([
      { placeId: 'liao_shangjing', validFrom: 916, validTo: 1125 },
      { placeId: 'liao_dongjing', validFrom: 916, validTo: 1125 },
      { placeId: 'liao_nanjing', validFrom: 916, validTo: 1125 },
      { placeId: 'liao_zhongjing', validFrom: 1007, validTo: 1125 },
      { placeId: 'liao_xijing', validFrom: 916, validTo: 1125 },
    ]);
  });
});
