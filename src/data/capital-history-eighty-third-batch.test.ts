import { describe, expect, it } from 'vitest';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';
import { sourceById } from './sources';

const unresolvedIds = [
  'yan_warring',
  'later_yan',
  'western_yan',
  'xiongnu',
  'tuyuhun',
  'turkic',
  'xia_early',
  'shang',
  'qin_state',
  'western_qin',
  'western_liang',
  'northern_yuan',
  'ming_southern',
  'jin_hedong',
  'silla',
] as const;

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);

describe('eighty-third-batch capital evidence boundary audit', () => {
  it('keeps all fourteen unresolved cases reproducibly outside qualified coverage', () => {
    const report = getCapitalCoverageReport();

    expect(report.summary.totalPolities).toBe(90);
    expect(report.summary.qualifiedPolities).toBe(75);
    expect(report.summary.gapPolityIds).toEqual(expect.arrayContaining([...unresolvedIds]));
    expect(report.summary.gapPolityIds).toHaveLength(unresolvedIds.length);

    for (const polityId of unresolvedIds) {
      const item = report.polities.find((polity) => polity.polityId === polityId);
      expect(item?.qualified, polityId).toBe(false);
      expect(item?.uncertainRecordIds.length, polityId).toBeGreaterThan(0);
    }
  });

  it('preserves each case boundary without promoting a disputed stage to a formal capital', () => {
    const mobileCases = ['xiongnu', 'turkic', 'northern_yuan'];
    const disputedCases = ['tuyuhun', 'xia_early', 'shang'];

    for (const polityId of mobileCases) {
      const records = recordsFor(polityId);
      expect(records.length, polityId).toBeGreaterThan(0);
      expect(records.every((record) => record.role === 'mobile_court'), polityId).toBe(true);
      expect(records.every((record) => record.status !== 'formal'), polityId).toBe(true);
    }

    for (const polityId of disputedCases) {
      const records = recordsFor(polityId);
      expect(records.length, polityId).toBeGreaterThan(0);
      expect(records.every((record) => record.role === 'disputed'), polityId).toBe(true);
      expect(records.every((record) => record.status === 'uncertain'), polityId).toBe(true);
      expect(records.every((record) => record.confidence === 'low'), polityId).toBe(true);
    }

    expect(recordsFor('western_qin')).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'fuhan', validFrom: 412, validTo: 431, role: 'primary', status: 'actual', confidence: 'low' }),
    ]));
    expect(recordsFor('western_qin').some((record) => record.confidence === 'low')).toBe(true);
    expect(recordsFor('ming_southern').every((record) => record.status === 'actual')).toBe(true);
    expect(recordsFor('ming_southern').every((record) => record.role !== 'primary' || record.status !== 'formal')).toBe(true);
    expect(recordsFor('silla')).toEqual(expect.arrayContaining([
      expect.objectContaining({placeId:'wolseong_silla',validFrom:101,validTo:377,role:'disputed',status:'uncertain',confidence:'low'}),
    ]));
  });

  it('requires every unresolved record to remain source-backed and modern-place traceable', () => {
    for (const polityId of unresolvedIds) {
      for (const record of recordsFor(polityId)) {
        expect(record.sourceIds.length, `${polityId}:${record.placeId}`).toBeGreaterThan(0);
        expect(record.sourceIds.every((sourceId) => sourceById[sourceId]), `${polityId}:${record.placeId}`).toBe(true);
        expect(record.notes, `${polityId}:${record.placeId}`).toBeTruthy();
        expect(Number.isFinite(record.validFrom), `${polityId}:${record.placeId}`).toBe(true);
        expect(Number.isFinite(record.validTo), `${polityId}:${record.placeId}`).toBe(true);
      }
    }
  });
});
