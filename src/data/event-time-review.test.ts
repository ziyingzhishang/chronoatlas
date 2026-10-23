import { describe, expect, it } from 'vitest';
import { eventTimeReview, reviewEventTimeCoverage } from './event-time-review';

const expectedEventIds = [
  'xia-early-founded-eighth-batch',
  'shang-founded-eighth-batch',
  'zhou-conquest',
  'western-zhou-founded-eighth-batch',
  'eastern-zhou-founded-eighth-batch',
  'qin-state-founded-eighth-batch',
  'chu-warring-founded-eighth-batch',
  'yan-warring-founded-eighth-batch',
  'qi-warring-founded-eighth-batch',
  'xiongnu-founded',
  'chu-han-contention',
  'silla-founded',
  'goguryeo-founded',
  'cheng-han-founded',
  'tuyuhun-founded',
  'former-liang-founded',
  'western-liang-state-founded',
  'tibetan-founded',
  'an-lushan-rebellion',
  'xuanzang-at-ximing-658',
  'dali-founded',
  'western-liao-founded',
  'southern-ming-founded',
] as const;

describe('event time evidence review', () => {
  it('covers the 26 currently non-precise events without inventing a date', () => {
    expect(eventTimeReview.map((entry) => entry.eventId)).toEqual([...expectedEventIds]);

    const report = reviewEventTimeCoverage();

    expect(report.isComplete).toBe(true);
    expect(report.totalReviewed).toBe(23);
    expect(report.missingEventIds).toEqual([]);
    expect(report.missingDetailEventIds).toEqual([]);
    expect(report.sourceMismatches).toEqual([]);
    expect(report.precisionMismatches).toEqual([]);
    expect(report.statusCounts).toEqual({ confirmed: 3, approximate: 20, unknown: 0 });
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
      sourceIds: ['china-chronology'],
      status: 'approximate',
      timelineStrategy: 'approximate-marker',
    });
    expect(approximate?.explanation).toContain('形成');
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
