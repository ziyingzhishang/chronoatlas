import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getPolityDetail } from './polity-details';
import { places } from './places';
import { sourceById } from './sources';

const eventById = (id: string) => events.find((event) => event.id === id);
const detailById = (id: string) => eventDetails.find((detail) => detail.eventId === id);

describe('辽五京城市事件闭环', () => {
  it('为东京、南京、中京、西京提供独立城市事件与现代地名', () => {
    const cases = [
      ['liao-dongping-established', 'liao_dongjing', '辽阳市'],
      ['liao-dongdan-nanjing', 'liao_dongjing', '辽阳市'],
      ['liao-dongjing-established', 'liao_dongjing', '辽阳市'],
      ['liao-nanjing-established', 'liao_nanjing', '北京市'],
      ['liao-zhongjing-built', 'liao_zhongjing', '宁城县大明镇一带'],
      ['liao-xijing-established', 'liao_xijing', '大同市'],
    ] as const;

    for (const [eventId, placeId, modernName] of cases) {
      const event = eventById(eventId);
      const detail = detailById(eventId);
      const place = places.find((item) => item.id === placeId);

      expect(event, eventId).toBeDefined();
      expect(event?.placeId, eventId).toBe(placeId);
      expect(detail?.polityIds, eventId).toContain('khitan');
      expect(detail?.locationIds, eventId).toContain(placeId);
      expect(place?.modernName, eventId).toBe(modernName);
      expect(event?.sourceIds.every((sourceId) => sourceById[sourceId]), eventId).toBe(true);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), eventId).toBe(true);
    }
  });

  it('保留辽五京设置的阶段性年代，而不是把所有城市压成辽建国年份', () => {
    expect(eventById('liao-dongping-established')).toMatchObject({ year: 919, datePrecision: 'year' });
    expect(eventById('liao-dongdan-nanjing')).toMatchObject({ year: 928, datePrecision: 'year' });
    expect(eventById('liao-dongjing-established')).toMatchObject({ year: 938, datePrecision: 'year' });
    expect(eventById('liao-nanjing-established')).toMatchObject({ year: 938, datePrecision: 'year' });
    expect(eventById('liao-zhongjing-built')).toMatchObject({ year: 1007, datePrecision: 'year' });
    expect(eventById('liao-xijing-established')).toMatchObject({ year: 1044, datePrecision: 'year' });
  });

  it('把四个城市事件接入辽政权详情', () => {
    const polity = getPolityDetail('khitan');
    for (const eventId of ['liao-dongping-established', 'liao-dongdan-nanjing', 'liao-dongjing-established', 'liao-nanjing-established', 'liao-zhongjing-built', 'liao-xijing-established']) {
      expect(polity?.eventIds, eventId).toContain(eventId);
    }
  });

  it('为新增辽代关键人物保留可解析的亲属关系', () => {
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'yelu-abaoji', predicate: 'parent-of', objectId: 'yelu-deguang', sourceIds: ['liao-imperial-genealogy'] }),
      expect.objectContaining({ subjectId: 'shengzong-liao', predicate: 'parent-of', objectId: 'xingzong-liao', sourceIds: ['liao-imperial-genealogy'] }),
    ]));
  });

  it('不把辽代人物错误挂接到先秦两汉事件', () => {
    const unrelatedEventIds = [
      'zhou-fenghao-capital',
      'han-changan-new-city',
      'gengshi-enters-changan',
      'dong-zhuo-changan',
      'eastern-han-restores-changan',
    ];
    for (const eventId of unrelatedEventIds) {
      expect(detailById(eventId)?.participants, eventId).toEqual([]);
    }
  });
});
