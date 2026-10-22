import { describe, expect, it } from 'vitest';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';
import { sourceById } from './sources';

const unresolvedIds = [
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

describe('eighty-third-batch capital evidence boundary audit', () => {
  it('keeps the eight unresolved cases reproducibly outside qualified coverage', () => {
    const report = getCapitalCoverageReport();

    expect(report.summary.totalPolities).toBe(87);
    expect(report.summary.qualifiedPolities).toBe(79);
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

    expect(recordsFor('western_qin').some((record) => record.role === 'de_facto' && record.status === 'actual')).toBe(true);
    expect(recordsFor('western_qin').some((record) => record.confidence === 'low')).toBe(true);
    expect(recordsFor('ming_southern').every((record) => record.status === 'actual')).toBe(true);
    expect(recordsFor('ming_southern').every((record) => record.role !== 'primary' || record.status !== 'formal')).toBe(true);
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
