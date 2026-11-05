import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getCapitalCoverageReport } from './capital-coverage';

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);

describe('sixteenth-batch capital evidence review', () => {
  it('splits the Mongol polity into an early political-center stage and the attested formal Karakorum stage', () => {
    expect(recordsFor('mongol')).toEqual(expect.arrayContaining([
      expect.objectContaining({
        placeId: 'mongol_karakorum',
        validFrom: 1206,
        validTo: 1234,
        role: 'de_facto',
        status: 'actual',
        confidence: 'medium',
      }),
      expect.objectContaining({
        placeId: 'mongol_karakorum',
        validFrom: 1235,
        validTo: 1260,
        role: 'primary',
        status: 'formal',
        confidence: 'high',
      }),
    ]));
  });

  it('does not infer a post-1260 fixed capital for the Mongol polity from Karakorum alone', () => {
    const post1260 = recordsFor('mongol').filter((record) => record.validFrom > 1260);
    expect(post1260).toEqual([]);
    expect(recordsFor('mongol').every((record) => record.notes?.includes('第十六轮首都证据复核'))).toBe(true);
  });

  it('preserves the 90-polity audit and fourteen unresolved evidence boundaries', () => {
    const report = getCapitalCoverageReport();
    expect(report.summary.totalPolities).toBe(90);
    expect(report.summary.qualifiedPolities).toBe(75);
    expect(report.summary.gapPolityIds).toEqual(expect.arrayContaining([
      'xiongnu',
      'yan_warring',
      'later_yan',
      'western_yan',
      'tuyuhun',
      'xia_early',
      'shang',
      'qin_state',
      'western_qin',
      'western_liang',
      'northern_yuan',
      'ming_southern',
      'turkic',
      'jin_hedong',
      'silla',
    ]));
    expect(report.summary.gapPolityIds).toHaveLength(15);
  });
});
