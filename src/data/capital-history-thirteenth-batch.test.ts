import { describe, expect, it } from 'vitest';
import { places } from './places';
import { sourceById } from './sources';
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

const placeById = new Map(places.map((place) => [place.id, place]));

describe('thirteenth-batch unresolved capital evidence quality', () => {
  it('makes every unresolved record explain its modern place and role in the narrative', () => {
    for (const polityId of unresolvedIds) {
      const records = capitalHistory.filter((record) => record.polityId === polityId);
      expect(records, polityId).not.toHaveLength(0);

      for (const record of records) {
        const place = placeById.get(record.placeId);
        expect(place, `${polityId}:${record.placeId}`).toBeDefined();
        expect(record.notes, `${polityId}:${record.placeId}`).toContain('第十三轮证据复核');
        expect(record.notes, `${polityId}:${record.placeId}`).toContain(`现代对应：${place!.modernName}`);
        expect(record.notes, `${polityId}:${record.placeId}`).toContain(`角色：${record.role}`);
        expect(record.sourceIds.every((sourceId) => sourceById[sourceId]), `${polityId}:${record.placeId}`).toBe(true);
      }
    }
  });

  it('keeps the eight cases non-formal and preserves their cautious classifications', () => {
    const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);

    for (const polityId of unresolvedIds) {
      expect(recordsFor(polityId).some((record) => record.role === 'primary' && record.status === 'formal'), polityId).toBe(false);
    }
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
