import { describe, expect, it } from 'vitest';
import { eventTimeReview, reviewEventTimeCoverage } from './event-time-review';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const expectedEventIds = [
  'xia-early-founded-eighth-batch',
  'shang-founded-eighth-batch',
  'zhou-conquest',
  'western-zhou-founded-eighth-batch',
  'eastern-zhou-founded-eighth-batch',
  'eastern-wei-ended-550',
  'northern-qi-ended-577',
  'northern-zhou-ended-581',
  'western-wei-ended-557',
  'qin-state-founded-eighth-batch',
  'chu-warring-founded-eighth-batch',
  'yan-warring-founded-eighth-batch',
  'qi-warring-founded-eighth-batch',
  'xiongnu-founded',
  'chu-han-contention',
  'silla-founded',
  'silla-tang-war-670-676',
  'goguryeo-founded',
  'cheng-han-founded',
  'tuyuhun-founded',
  'former-liang-founded',
  'changan-former-qin',
  'western-liang-state-founded',
  'tibetan-founded',
  'tibetan-yalong-center',
  'tibetan-ended-842',
  'an-lushan-rebellion',
  'xuanzang-at-ximing-658',
  'shangyang-palace-built',
  'daming-palace-built',
  'dali-founded',
  'southern-liang-founded-397',
  'southern-liang-moves-ledu',
  'mongol-karakorum-fixed-center',
  'yuan-shangdu-built',
  'western-liao-founded',
  'western-liao-emperor-1132',
  'western-liao-ended-1218',
  'western-xia-ended-1227',
  'jin-ended-1234',
  'southern-song-ended-1279',
  'dali-ended-1253',
  'nanzhao-ended-902',
  'southern-yan-ended-410',
  'southern-liang-ended-414',
  'former-zhao-ended-329',
  'cheng-han-ended-347',
  'former-yan-ended-370',
  'former-qin-ended-394',
  'northern-liang-ended-439',
  'southern-ming-founded',
  'hongguang-nanjing-founded',
  'longwu-fuzhou-founded',
  'shaowu-guangzhou-founded',
  'yongli-zhaoqing-founded',
  'zhao-wuling-reforms-307',
  'republic-chongqing-wartime-center',
  'southern-chen-ended-589',
  'northern-han-ended-979',
  'min-ended-945',
  'jingnan-ended-963',
  'ma-chu-ended-951',
  'liao-ended-1125',
  'northern-wei-ended-534',
] as const;

describe('event time evidence review', () => {
  it('covers the reviewed event-time set without inventing a date', () => {
    expect(eventTimeReview.map((entry) => entry.eventId)).toEqual([...expectedEventIds]);

    const report = reviewEventTimeCoverage();

    expect(report.isComplete).toBe(true);
    expect(report.totalReviewed).toBe(64);
    expect(report.missingEventIds).toEqual([]);
    expect(report.missingDetailEventIds).toEqual([]);
    expect(report.sourceMismatches).toEqual([]);
    expect(report.precisionMismatches).toEqual([]);
    expect(report.statusCounts).toEqual({ confirmed: 29, approximate: 35, unknown: 0 });
  });

  it('derives evidence sources and precision from the existing detail and event records', () => {
    const report = reviewEventTimeCoverage();
    const range = report.records.find((record) => record.eventId === 'an-lushan-rebellion');
    const approximate = report.records.find((record) => record.eventId === 'dali-founded');

    expect(range).toMatchObject({
      datePrecision: 'range',
      sourceIds: ['zizhi-tongjian'],
      status: 'confirmed',
      timelineStrategy: 'range-band',
    });
    expect(approximate).toMatchObject({
      datePrecision: 'approximate',
      sourceIds: [
        'china-chronology',
        'dali-diancai-record',
        'dali-history-research-nopss',
        'dali-duan-siping-official',
        'dali-yangjumei-mct',
        'dali-cambridge-governance',
      ],
      status: 'approximate',
      timelineStrategy: 'approximate-marker',
    });
    expect(approximate?.explanation).toContain('形成');
  });

  it('models 304 as the exact Cheng Han formation node without moving the 306 imperial phase', () => {
    const record = reviewEventTimeCoverage().records.find((item) => item.eventId === 'cheng-han-founded');
    const event = events.find((item) => item.id === 'cheng-han-founded');
    const detail = eventDetails.find((item) => item.eventId === 'cheng-han-founded');

    expect(record).toMatchObject({
      year: 304,
      datePrecision: 'year',
      expectedPrecision: 'year',
      status: 'confirmed',
      timelineStrategy: 'year-marker',
    });
    expect(record?.explanation).toContain('即成都王位');
    expect(record?.explanation).toContain('306年称帝');
    expect(record?.explanation).toContain('整个巴蜀');
    expect(event?.sourceIds).toContain('zizhi-tongjian-vol85-cheng-han');
    expect(detail?.sourceIds).toContain('zizhi-tongjian-vol85-cheng-han');
    expect(sourceById['zizhi-tongjian-vol85-cheng-han']).toBeDefined();
  });

  it('models 400 as the exact Western Liang foundation node and keeps 405 relocation separate', () => {
    const record = reviewEventTimeCoverage().records.find((item) => item.eventId === 'western-liang-state-founded');
    const event = events.find((item) => item.id === 'western-liang-state-founded');
    const detail = eventDetails.find((item) => item.eventId === 'western-liang-state-founded');

    expect(record).toMatchObject({
      year: 400,
      datePrecision: 'year',
      expectedPrecision: 'year',
      status: 'confirmed',
      timelineStrategy: 'year-marker',
    });
    expect(record?.explanation).toContain('400年');
    expect(record?.explanation).toContain('405年迁居酒泉');
    expect(event?.placeId).toBe('dunhuang');
    expect(event?.sourceIds).toEqual(expect.arrayContaining([
      'jinshu-vol87-li-hao', 'zizhi-tongjian-vol111-western-liang',
    ]));
    expect(detail?.sourceIds).toEqual(expect.arrayContaining([
      'jinshu-vol87-li-hao', 'zizhi-tongjian-vol111-western-liang',
    ]));
    expect(sourceById['jinshu-vol87-li-hao']).toBeDefined();
    expect(sourceById['zizhi-tongjian-vol111-western-liang']).toBeDefined();
  });

  it('keeps traditional dates, continuous works, and formation processes approximate', () => {
    const report = reviewEventTimeCoverage();
    const cases = [
      {
        eventId: 'xia-early-founded-eighth-batch',
        detailText: '传统纪年',
        expectedPhase: undefined,
      },
      {
        eventId: 'zhou-conquest',
        detailText: '连续过程',
        expectedPhase: { startYear: -1046, endYear: -1043 },
      },
      {
        eventId: 'dali-founded',
        detailText: '形成',
        expectedPhase: undefined,
      },
    ] as const;

    for (const item of cases) {
      const record = report.records.find((candidate) => candidate.eventId === item.eventId);
      const detail = eventDetails.find((candidate) => candidate.eventId === item.eventId);
      const event = events.find((candidate) => candidate.id === item.eventId);

      expect(record, item.eventId).toMatchObject({
        status: 'approximate',
        expectedPrecision: 'approximate',
        datePrecision: 'approximate',
        timelineStrategy: 'approximate-marker',
      });
      expect(record?.explanation, item.eventId).toContain(item.detailText);
      expect(event?.verification, item.eventId).toBe('partial');
      expect(detail?.uncertaintyNote, item.eventId).toBeTruthy();
      if (item.expectedPhase) {
        expect(detail?.phases, item.eventId).toEqual(expect.arrayContaining([
          expect.objectContaining(item.expectedPhase),
        ]));
      }
    }
  });

  it('reports missing entries, missing detail, and evidence drift for an injected catalog', () => {
    const report = reviewEventTimeCoverage({ reviewEntries: eventTimeReview, events: [], eventDetails: [] });

    expect(report.isComplete).toBe(false);
    expect(report.missingEventIds).toContain('xia-early-founded-eighth-batch');
    expect(report.missingDetailEventIds).toContain('xia-early-founded-eighth-batch');

    const driftReport = reviewEventTimeCoverage({
      reviewEntries: [eventTimeReview[0]],
      events: [{ id: 'xia-early-founded-eighth-batch', year: -2070, title: '夏', summary: '', sourceIds: ['china-chronology'], datePrecision: 'year' }],
      eventDetails: [],
    });
    expect(driftReport.precisionMismatches).toEqual([
      expect.objectContaining({ eventId: 'xia-early-founded-eighth-batch', expected: 'approximate', actual: 'year' }),
    ]);
  });
});
