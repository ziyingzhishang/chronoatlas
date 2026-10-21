import { describe, expect, it } from 'vitest';
import { places } from './places';
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
];

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);
const placeById = new Map(places.map((place) => [place.id, place]));

describe('eleventh-batch unresolved capital evidence audit', () => {
  it('keeps every unresolved polity traceable to a modern place or region', () => {
    for (const polityId of unresolvedIds) {
      const records = recordsFor(polityId);

      expect(records, polityId).not.toHaveLength(0);
      for (const record of records) {
        const place = placeById.get(record.placeId);
        expect(place, `${polityId}:${record.placeId}`).toBeDefined();
        expect(place?.modernName, `${polityId}:${record.placeId}`).toBeTruthy();
        expect(record.notes, `${polityId}:${record.placeId}`).toMatch(/现代|今/);
        expect(record.sourceIds, `${polityId}:${record.placeId}`).not.toHaveLength(0);
      }
    }
  });

  it('preserves unresolved semantics instead of promoting an uncertain record to a formal capital', () => {
    for (const polityId of unresolvedIds) {
      expect(
        recordsFor(polityId).every((record) => !(record.role === 'primary' && record.status === 'formal')),
        polityId,
      ).toBe(true);
    }

    expect(recordsFor('xiongnu').every((record) => record.role === 'mobile_court')).toBe(true);
    expect(recordsFor('turkic').map((record) => [record.validFrom, record.validTo])).toEqual([
      [552, 630],
      [682, 744],
    ]);
    expect(recordsFor('tuyuhun').every((record) => record.role === 'disputed')).toBe(true);
    expect(recordsFor('xia_early').every((record) => record.role === 'disputed')).toBe(true);
    expect(recordsFor('shang').every((record) => record.role === 'disputed')).toBe(true);
    expect(recordsFor('western_qin').some((record) => record.role === 'de_facto')).toBe(true);
    expect(recordsFor('northern_yuan').every((record) => record.role === 'mobile_court')).toBe(true);
    expect(recordsFor('ming_southern').every((record) => record.status === 'actual')).toBe(true);
  });
});
