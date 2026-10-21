import { describe, expect, it } from 'vitest';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);

describe('tenth-batch unresolved capital quality audit', () => {
  it('splits Turkic political-center records by historically distinct khaganate phases', () => {
    const records = recordsFor('turkic');

    expect(records).toHaveLength(2);
    expect(records.map(({ validFrom, validTo }) => [validFrom, validTo])).toEqual([
      [552, 630],
      [682, 744],
    ]);
    expect(records.every((record) => record.placeId === 'uhtuken')).toBe(true);
    expect(records.every((record) => record.role === 'mobile_court')).toBe(true);
    expect(records.every((record) => record.status !== 'formal')).toBe(true);
  });

  it('keeps Tuyuhun as one unresolved candidate because its stage boundary is not safely locatable', () => {
    const records = recordsFor('tuyuhun');

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ placeId: 'tuyuhun_core', role: 'disputed', status: 'uncertain' });
    expect(records[0].notes).toContain('不能确认全期固定首都');
  });

  it('keeps Northern Yuan as one regional mobile-court record because its multiple courts cannot be safely localized by phase', () => {
    const records = recordsFor('northern_yuan');

    expect(records).toHaveLength(1);
    expect(records.every((record) => record.placeId === 'beiyuan_core')).toBe(true);
    expect(records.every((record) => record.role === 'mobile_court')).toBe(true);
    expect(records.every((record) => record.status === 'uncertain')).toBe(true);
    expect(records[0].notes).toContain('多个汗廷阶段');
  });

  it('keeps evidence-limited cases unqualified and fully contextualized', () => {
    const report = new Map(getCapitalCoverageReport().polities.map((item) => [item.polityId, item]));
    const unresolvedIds = ['xiongnu', 'xia_early', 'shang', 'western_qin', 'ming_southern'];

    for (const polityId of unresolvedIds) {
      const records = recordsFor(polityId);
      expect(report.get(polityId)?.qualified, polityId).toBe(false);
      expect(records.every((record) => record.sourceIds.length > 0), polityId).toBe(true);
      expect(records.every((record) => record.notes && record.notes.length >= 20), polityId).toBe(true);
      expect(records.every((record) => !(record.role === 'primary' && record.status === 'formal')), polityId).toBe(true);
    }
  });
});
