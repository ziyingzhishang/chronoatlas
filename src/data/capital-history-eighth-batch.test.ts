import { describe, expect, it } from 'vitest';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);

describe('eighth-batch unresolved capital audit', () => {
  it('classifies mobile-court polities without promoting them to fixed capitals', () => {
    const report = new Map(getCapitalCoverageReport().polities.map((item) => [item.polityId, item]));

    for (const polityId of ['xiongnu', 'turkic', 'northern_yuan']) {
      const records = recordsFor(polityId);
      expect(records, polityId).not.toHaveLength(0);
      expect(records.some((record) => record.role === 'mobile_court'), polityId).toBe(true);
      expect(report.get(polityId)?.qualified, polityId).toBe(false);
      expect(records.every((record) => record.notes?.includes('移动') || record.notes?.includes('汗廷')), polityId).toBe(true);
    }
  });

  it('keeps debated and composite cases explicit instead of treating a reference point as a formal capital', () => {
    const report = new Map(getCapitalCoverageReport().polities.map((item) => [item.polityId, item]));

    expect(recordsFor('tuyuhun')[0]).toMatchObject({ role: 'disputed', status: 'uncertain' });
    expect(recordsFor('xia_early')[0]).toMatchObject({ role: 'disputed', status: 'uncertain' });
    expect(recordsFor('shang')[0]).toMatchObject({ role: 'disputed', status: 'uncertain' });
    expect(recordsFor('western_qin').some((record) => record.status === 'actual')).toBe(true);
    expect(recordsFor('ming_southern').every((record) => record.status === 'actual')).toBe(true);

    for (const polityId of ['tuyuhun', 'xia_early', 'shang', 'western_qin', 'ming_southern']) {
      expect(report.get(polityId)?.qualified, polityId).toBe(false);
      expect(recordsFor(polityId).every((record) => record.notes), polityId).toBe(true);
    }
  });

  it('documents the evidence boundary and modern-place decision for all eight targets', () => {
    const targetIds = [
      'xiongnu', 'tuyuhun', 'turkic', 'xia_early',
      'shang', 'western_qin', 'northern_yuan', 'ming_southern',
    ];

    for (const polityId of targetIds) {
      const records = recordsFor(polityId);
      expect(records, polityId).not.toHaveLength(0);
      expect(records.every((record) => record.sourceIds.length > 0), polityId).toBe(true);
      expect(records.every((record) => Number.isFinite(record.validFrom) && Number.isFinite(record.validTo)), polityId).toBe(true);
      expect(records.every((record) => record.notes && record.notes.length >= 20), polityId).toBe(true);
      expect(records.every((record) => !(record.role === 'primary' && record.status === 'formal')), polityId).toBe(true);
    }

    expect(recordsFor('tuyuhun')[0].notes).toContain('不能确认全期固定首都');
    expect(recordsFor('xia_early')[0].notes).toContain('考古文化与夏王朝及都城的对应');
    expect(recordsFor('shang')[0].notes).toContain('多次迁都传统');
    expect(recordsFor('western_qin').every((record) => record.notes?.includes('固定首都'))).toBe(true);
    expect(recordsFor('northern_yuan')[0].notes).toContain('多个汗廷阶段');
    expect(recordsFor('ming_southern')[0].notes).toContain('多个政权阶段构成');
    expect(recordsFor('ming_southern').map((record) => record.placeId)).toEqual(['yingtian', 'fuzhou', 'guangzhou', 'zhaoqing']);
  });
});
