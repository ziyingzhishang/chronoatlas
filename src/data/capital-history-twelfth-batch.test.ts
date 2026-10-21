import { describe, expect, it } from 'vitest';
import { sourceById } from './sources';
import { places } from './places';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';

const unresolvedIds = [
  'xiongnu',
  'tuyuhun',
  'xia_early',
  'shang',
  'western_qin',
  'northern_yuan',
  'ming_southern',
  'turkic',
] as const;

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);
const placeById = new Map(places.map((place) => [place.id, place]));

describe('twelfth-batch final unresolved capital evidence audit', () => {
  it('keeps all eight final cases source-backed and modern-place traceable', () => {
    for (const polityId of unresolvedIds) {
      const records = recordsFor(polityId);
      expect(records, polityId).not.toHaveLength(0);

      for (const record of records) {
        expect(placeById.has(record.placeId), `${polityId}:${record.placeId}`).toBe(true);
        expect(record.sourceIds.length, `${polityId}:${record.placeId}`).toBeGreaterThan(0);
        expect(record.sourceIds.every((sourceId) => sourceById[sourceId]), `${polityId}:${record.placeId}`).toBe(true);
        expect(placeById.get(record.placeId)?.modernName, `${polityId}:${record.placeId}`).toBeTruthy();
        expect(record.notes, `${polityId}:${record.placeId}`).toContain('最终证据复核');
      }
    }
  });

  it('does not promote any unresolved case to a fixed formal capital without sufficient evidence', () => {
    const report = new Map(getCapitalCoverageReport().polities.map((item) => [item.polityId, item]));

    for (const polityId of unresolvedIds) {
      expect(report.get(polityId)?.qualified, polityId).toBe(false);
      expect(recordsFor(polityId).some((record) => record.role === 'primary' && record.status === 'formal'), polityId).toBe(false);
    }
  });

  it('preserves the final historical classification for mobile, candidate, stage-based, and evidence-limited cases', () => {
    expect(recordsFor('xiongnu').every((record) => record.role === 'mobile_court')).toBe(true);
    expect(recordsFor('turkic').every((record) => record.role === 'mobile_court')).toBe(true);
    expect(recordsFor('northern_yuan').every((record) => record.role === 'mobile_court')).toBe(true);
    expect(recordsFor('tuyuhun').every((record) => record.role === 'disputed')).toBe(true);
    expect(recordsFor('xia_early').every((record) => record.role === 'disputed')).toBe(true);
    expect(recordsFor('shang').every((record) => record.role === 'disputed')).toBe(true);
    expect(recordsFor('western_qin').some((record) => record.role === 'de_facto')).toBe(true);
    expect(recordsFor('ming_southern').every((record) => record.status === 'actual')).toBe(true);
  });
});
