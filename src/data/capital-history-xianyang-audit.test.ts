import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { events } from './events';
import { places } from './places';
import { sourceById } from './sources';

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);
const xianyangRecordFor = (polityId: string) => capitalHistory.find((record) => record.polityId === polityId && record.placeId === 'xianyang');
const eventById = (eventId: string) => events.find((event) => event.id === eventId);
const overlaps = (from: number, to: number, year: number) => from <= year && year <= to;

describe('Xianyang capital-history audit', () => {
  it('keeps Qin State and the Qin Empire as separate, high-confidence formal-capital phases', () => {
    expect(xianyangRecordFor('qin_state')).toEqual(expect.objectContaining({
      polityId: 'qin_state', placeId: 'xianyang', validFrom: -350, validTo: -222,
      role: 'primary', status: 'formal', confidence: 'high',
    }));
    expect(xianyangRecordFor('qin')).toEqual(expect.objectContaining({
      polityId: 'qin', placeId: 'xianyang', validFrom: -221, validTo: -206,
      role: 'primary', status: 'formal', confidence: 'high',
    }));
  });

  it('aligns Xianyang capital records with the attested relocation, imperial, and Chu-Han transition events', () => {
    const qinState = xianyangRecordFor('qin_state')!;
    const qinEmpire = xianyangRecordFor('qin')!;
    const relocation = eventById('qin-xianyang-capital');
    const imperialCenter = eventById('qin-xianyang-unification');
    const chuHan = eventById('chu-han-contention');

    expect(relocation).toEqual(expect.objectContaining({ year: -350, placeId: 'xianyang' }));
    expect(imperialCenter).toEqual(expect.objectContaining({ year: -221, placeId: 'xianyang' }));
    expect(chuHan).toEqual(expect.objectContaining({ year: -206, endYear: -202, placeId: 'xianyang' }));
    expect(overlaps(qinState.validFrom, qinState.validTo, relocation!.year!)).toBe(true);
    expect(overlaps(qinEmpire.validFrom, qinEmpire.validTo, imperialCenter!.year!)).toBe(true);
    expect(overlaps(qinEmpire.validFrom, qinEmpire.validTo, chuHan!.year!)).toBe(true);
    expect(qinEmpire.validTo).toBe(-206);
    expect(recordsFor('qin_state').every((record) => record.validTo < qinEmpire.validFrom)).toBe(true);
    for (const event of [relocation, imperialCenter, chuHan]) {
      expect(event?.sourceIds).toContain('zizhi-tongjian');
      expect(event?.references?.length).toBeGreaterThan(0);
      expect(event?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    }
  });

  it('resolves Xianyang modern geography and all capital-history citations', () => {
    const place = places.find((item) => item.id === 'xianyang');
    const records = [xianyangRecordFor('qin_state')!, xianyangRecordFor('qin')!];
    const requiredSourceIds = ['capital-history-reference', 'zizhi-tongjian', 'modern-geography-reference'];

    expect(place).toEqual(expect.objectContaining({ id: 'xianyang', modernName: '咸阳市' }));
    expect(place?.sourceIds).toEqual(expect.arrayContaining(['zizhi-tongjian', 'modern-geography-reference']));
    for (const record of records) {
      expect(record.notes).toContain('咸阳市');
      expect(record.notes).toContain('正式都城');
      expect(record.sourceIds).toEqual(expect.arrayContaining(requiredSourceIds));
      expect(record.sourceIds.every((sourceId) => sourceById[sourceId]), record.polityId).toBe(true);
    }
  });
});
