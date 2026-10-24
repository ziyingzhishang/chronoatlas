import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const cases = [
  {
    eventId: 'silla-tang-war-670-676',
    year: 670,
    endYear: 676,
    datePrecision: 'range',
    sourceIds: ['silla-unification-wars-official', 'silla-encykorea'],
    phase: { startYear: 670, endYear: 676 },
  },
  {
    eventId: 'southern-liang-moves-ledu',
    year: 399,
    endYear: 402,
    datePrecision: 'approximate',
    sourceIds: ['jinshu-vol126-tufa-wugu', 'capital-history-reference'],
    phase: { startYear: 399, endYear: 402 },
  },
  {
    eventId: 'daming-palace-built',
    year: 634,
    endYear: 663,
    datePrecision: 'approximate',
    sourceIds: ['zizhi-tongjian', 'tanghuiyao-vol30-daming-palace', 'modern-geography-reference'],
    phase: { startYear: 662, endYear: 663 },
  },
  {
    eventId: 'mongol-karakorum-fixed-center',
    year: 1235,
    endYear: 1260,
    datePrecision: 'approximate',
    sourceIds: ['china-chronology', 'capital-history-reference', 'modern-geography-reference'],
    phase: { startYear: 1235, endYear: 1260 },
  },
  {
    eventId: 'yuan-shangdu-built',
    year: 1256,
    endYear: 1271,
    datePrecision: 'approximate',
    sourceIds: ['yuan-nationalities-history', 'yuan-li-bingzhong', 'capital-history-reference'],
    phase: { startYear: 1256, endYear: 1271 },
  },
  {
    eventId: 'northern-wei-ended-534',
    year: 534,
    endYear: 535,
    datePrecision: 'approximate',
    sourceIds: ['zizhi-tongjian', 'china-chronology', 'modern-geography-reference'],
    phase: { startYear: 534, endYear: 535 },
  },
] as const;

describe('round 133 event time evidence convergence', () => {
  it.each(cases)('$eventId keeps the evidenced time range and source trail', (item) => {
    const event = events.find((candidate) => candidate.id === item.eventId);
    const detail = eventDetails.find((candidate) => candidate.eventId === item.eventId);
    const timeGap = auditKnowledgeCoverage().gaps.find((gap) => (
      gap.entityType === 'event'
      && gap.entityId === item.eventId
      && gap.dimension === 'time'
    ));

    expect(event).toMatchObject({
      year: item.year,
      endYear: item.endYear,
      datePrecision: item.datePrecision,
      sourceIds: item.sourceIds,
    });
    expect(detail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining(item.phase),
    ]));
    expect(detail?.sourceIds).toEqual(expect.arrayContaining([...item.sourceIds]));
    expect(item.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    expect(timeGap).toMatchObject({ kind: 'uncertain' });
  });
});
