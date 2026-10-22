import { describe, expect, it } from 'vitest';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';
import { places } from './places';
import { sourceById } from './sources';

const evidenceBoundaryPolityIds = [
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

describe('ninetieth-batch capital and city record audit', () => {
  it('keeps all eight unresolved cases outside qualified coverage for an explicit evidence reason', () => {
    const report = getCapitalCoverageReport();

    expect(report.summary.qualifiedPolities).toBe(79);
    expect(report.summary.gapPolityIds).toEqual([...evidenceBoundaryPolityIds]);

    for (const polityId of evidenceBoundaryPolityIds) {
      const item = report.polities.find((polity) => polity.polityId === polityId);
      expect(item?.qualified, polityId).toBe(false);
      expect(item?.uncertainRecordIds.length, polityId).toBeGreaterThan(0);
      expect(recordsFor(polityId), polityId).not.toHaveLength(0);
      expect(recordsFor(polityId).every((record) => record.notes && record.notes.length >= 20), polityId).toBe(true);
    }

    expect(recordsFor('xiongnu').every((record) => record.role === 'mobile_court')).toBe(true);
    expect(recordsFor('turkic').every((record) => record.role === 'mobile_court')).toBe(true);
    expect(recordsFor('northern_yuan').every((record) => record.role === 'mobile_court')).toBe(true);
    expect(recordsFor('tuyuhun')[0].role).toBe('disputed');
    expect(recordsFor('xia_early')[0].role).toBe('disputed');
    expect(recordsFor('shang')[0].role).toBe('disputed');
    expect(recordsFor('western_qin').some((record) => record.confidence === 'low')).toBe(true);
    expect(recordsFor('ming_southern').some((record) => record.confidence === 'low')).toBe(true);
  });

  it('requires every qualified polity and every existing capital record to remain source-backed and place-resolvable', () => {
    const report = getCapitalCoverageReport();
    const placeIds = new Set(places.map((place) => place.id));

    for (const item of report.polities.filter((polity) => polity.qualified)) {
      expect(recordsFor(item.polityId), item.polityId).not.toHaveLength(0);
    }

    for (const record of capitalHistory) {
      expect(placeIds.has(record.placeId), `${record.polityId}:${record.placeId}`).toBe(true);
      expect(record.sourceIds.length, `${record.polityId}:${record.placeId}`).toBeGreaterThan(0);
      expect(record.sourceIds.every((sourceId) => sourceById[sourceId]), `${record.polityId}:${record.placeId}`).toBe(true);
      expect(Number.isFinite(record.validFrom) && Number.isFinite(record.validTo), `${record.polityId}:${record.placeId}`).toBe(true);
      expect(record.validFrom).toBeLessThanOrEqual(record.validTo);
    }
  });

  it('does not promote a disputed archaeological or composite record by adding a proxy city', () => {
    for (const polityId of ['xia_early', 'shang', 'tuyuhun', 'western_qin', 'ming_southern']) {
      expect(recordsFor(polityId).every((record) => record.role !== 'primary' || record.status !== 'formal'), polityId).toBe(true);
    }

    expect(recordsFor('xia_early')[0].notes).toContain('不能等同为已证实的夏代固定首都');
    expect(recordsFor('shang')[0].notes).toContain('不把二里头视为商代固定首都');
    expect(recordsFor('western_qin')[1].notes).toContain('不能把代理坐标当作枹罕精确定位');
    expect(recordsFor('ming_southern')[2].notes).toContain('政权并立');
  });
});
