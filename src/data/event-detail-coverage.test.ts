import { describe, expect, it } from 'vitest';
import type { KnowledgeCoverageCatalog } from './knowledge-coverage';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageAssets } from './heritage';
import { heritageDetails } from './heritage-details';
import { people } from './people';
import { personDetails } from './person-details';
import { places } from './places';
import { polities } from './polities';
import { polityDetails } from './polity-details';
import { sourceNotes } from './sources';

const baseCatalog: KnowledgeCoverageCatalog = {
  polities,
  people,
  events,
  eventDetails,
  heritageAssets,
  heritageDetails,
  personDetails,
  polityDetails,
  claims,
  sourceNotes,
  places,
};

const fixtureEvent = {
  id: 'fixture-event',
  year: 100,
  title: '测试事件',
  summary: '测试事件摘要',
  sourceIds: ['fixture-source'],
  datePrecision: 'approximate' as const,
};

const fixtureCatalog: KnowledgeCoverageCatalog = {
  ...baseCatalog,
  events: [fixtureEvent],
  eventDetails: [{
    eventId: 'fixture-event',
    participants: [{ personId: 'missing-person', role: '待核人物' }],
    polityIds: ['missing-polity'],
    causes: ['测试原因'],
    consequences: ['测试结果'],
    phases: [{ label: '测试阶段', summary: '测试阶段摘要', startYear: 100, endYear: 101 }],
    locationIds: ['missing-place'],
    relatedEventIds: ['missing-related-event'],
    sourceIds: ['missing-detail-source'],
  }],
  sourceNotes: [],
};

describe('event detail coverage audit', () => {
  it('audits every event independently of knowledge coverage task counts', () => {
    const report = buildEventDetailCoverageReport({ catalog: {
      ...baseCatalog,
      events: [fixtureEvent],
      eventDetails: [],
      sourceNotes: [],
    } });

    expect(report.totalEvents).toBe(1);
    expect(report.items).toHaveLength(1);
    expect(report.unresolvedEventIds).toEqual(['fixture-event']);
    expect(report.items[0].status).toBe('unresolved');
    expect(report.items[0].missingChecks).toContain('detail');
    expect(report.coverageRate).toBe(0);
    expect(report.items[0].knowledgeTaskCount).toBeGreaterThanOrEqual(0);
  });

  it('separates unresolved references from review-worthy approximate time', () => {
    const report = buildEventDetailCoverageReport({ catalog: fixtureCatalog });
    const item = report.items[0];

    expect(item.status).toBe('unresolved');
    expect(item.needsReviewChecks).toContain('timePrecision');
    expect(item.unresolvedReferenceIds).toEqual({
      people: ['missing-person'],
      places: ['missing-place'],
      polities: ['missing-polity'],
      relatedEvents: ['missing-related-event'],
      sources: ['fixture-source', 'missing-detail-source'],
    });
    expect(item.missingChecks).toEqual(expect.arrayContaining([
      'participants',
      'locations',
      'polities',
      'relatedEvents',
      'sources',
      'uncertaintyNote',
    ]));
  });

  it('reports complete records as covered and exposes aggregate status lists', () => {
    const detail = eventDetails.find((candidate) => candidate.eventId === 'xin-founded')!;
    const event = events.find((candidate) => candidate.id === 'xin-founded')!;
    const report = buildEventDetailCoverageReport({ catalog: {
      ...baseCatalog,
      events: [event],
      eventDetails: [{ ...detail, relatedEventIds: ['xin-founded'] }],
    } });

    expect(report.coveredEventIds).toEqual(['xin-founded']);
    expect(report.needsReviewEventIds).toEqual([]);
    expect(report.unresolvedEventIds).toEqual([]);
    expect(report.coverageRate).toBe(1);
    expect(report.items[0].narrativeComplete).toBe(true);
    expect(report.items[0].sourceComplete).toBe(true);
  });

  it('audits the complete event catalog without orphan detail records', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });

    expect(report.totalEvents).toBe(events.length);
    expect(report.items.map((item) => item.eventId)).toEqual(events.map((event) => event.id).sort());
    expect(report.orphanDetailEventIds).toContain('dong-zhuo-changan');
    expect(report.orphanDetailEventIds.length).toBeGreaterThan(0);
    expect(report.items.every((item) => item.eventId.length > 0)).toBe(true);
  });

  it('classifies every orphan detail as a city-history auxiliary record', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });

    expect(report.orphanDetails).toHaveLength(report.orphanDetailEventIds.length);
    expect(report.orphanDetails).toHaveLength(14);
    expect(report.orphanDetails.every((item) => item.kind === 'city-history-auxiliary')).toBe(true);
    expect(report.orphanDetails.find((item) => item.eventId === 'han-changan-new-city')?.rationale)
      .toContain('城市');
  });

  it('closes the forty-ninth batch of exact-year, source-backed event details', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });

    expect(report.unresolvedEventIds).toEqual([]);
    expect(report.statusCounts).toEqual({ covered: 79, 'needs-review': 26, unresolved: 0 });
    expect(report.coveredEventIds).toEqual(expect.arrayContaining([
      'northern-wei-founded',
      'former-qin-founded',
      'later-liang-founded',
      'jurchen-jin-founded',
      'southern-tang-founded',
      'southern-song-founded',
      'later-jin-founded',
      'qing-founded',
      'qing-enters-pass',
      'republic-founded',
      'wuyue-founded',
      'min-founded',
      'ma-chu-founded',
      'gengshi-founded',
      'former-zhao-founded',
      'song-southward',
      'yang-wu-founded',
    ]));
  });

  it('closes the fiftieth batch while preserving later title and capital phases', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const exactYearIds = [
      'former-yan-founded',
      'later-yan-founded',
      'later-qin-founded',
      'southern-yan-founded',
      'western-qin-founded',
      'northern-liang-founded',
    ];

    for (const eventId of exactYearIds) {
      expect(eventsById.get(eventId)?.datePrecision).toBe('year');
      expect(eventsById.get(eventId)?.verification).toBe('checked');
      expect(detailsById.get(eventId)?.sourceIds).toContain('zizhi-tongjian');
      expect(report.coveredEventIds).toContain(eventId);
    }

    expect(detailsById.get('later-yan-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '称帝与扩张', startYear: 386 }),
    ]));
    expect(detailsById.get('later-qin-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '长安控制', startYear: 386 }),
    ]));
    expect(detailsById.get('northern-liang-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '姑臧阶段', startYear: 401 }),
    ]));
    expect(report.orphanDetailEventIds).toHaveLength(14);
  });

  it('closes the fifty-first batch of source-backed turning points without erasing phase uncertainty', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const batchIds = [
      'northern-yan-founded',
      'xia-sixteen-states-founded-eighth-batch',
      'nanzhao-founded',
      'jingnan-founded',
      'mongol-founded',
      'northern-yuan-founded',
    ];

    expect(report.statusCounts).toEqual({ covered: 79, 'needs-review': 26, unresolved: 0 });
    for (const eventId of batchIds) {
      expect(eventsById.get(eventId)?.datePrecision).toBe('year');
      expect(eventsById.get(eventId)?.verification).toBe('checked');
      expect(detailsById.get(eventId)?.sourceIds.length).toBeGreaterThan(0);
      expect(detailsById.get(eventId)?.polityIds.length).toBeGreaterThan(0);
      expect(detailsById.get(eventId)?.relatedEventIds.length).toBeGreaterThan(0);
      expect(report.coveredEventIds).toContain(eventId);
    }

    expect(detailsById.get('northern-yan-founded')?.uncertaintyNote).toContain('407年与409年');
    expect(detailsById.get('mongol-founded')?.uncertaintyNote).toContain('不代表');
    expect(detailsById.get('northern-yuan-founded')?.uncertaintyNote).toContain('史学分期差异');
  });

  it('promotes the fifty-second batch of source-backed capital and city-history nodes', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const batchIds = [
      'qin-xianyang-capital',
      'qin-xianyang-unification',
      'eastern-han-moves-luoyang',
      'daxing-capital',
      'court-moves-luoyang',
      'xuanwu-gate',
    ];

    expect(report.statusCounts).toEqual({ covered: 79, 'needs-review': 26, unresolved: 0 });
    for (const eventId of batchIds) {
      expect(eventsById.get(eventId)?.datePrecision).toBe('year');
      expect(eventsById.get(eventId)?.verification).toBe('checked');
      expect(detailsById.get(eventId)?.sourceIds.length).toBeGreaterThan(0);
      expect(detailsById.get(eventId)?.locationIds.length).toBeGreaterThan(0);
      expect(detailsById.get(eventId)?.polityIds.length).toBeGreaterThan(0);
      expect(report.coveredEventIds).toContain(eventId);
    }

    expect(report.orphanDetailEventIds).toHaveLength(14);
    expect(report.orphanDetailEventIds).not.toEqual(expect.arrayContaining(batchIds));
  });

  it('closes the forty-seventh batch key links without changing orphan classification', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));

    expect(detailsById.get('zhou-conquest')?.polityIds).toEqual(['shang', 'zhou_western']);
    expect(detailsById.get('cheng-han-founded')?.relatedEventIds).toEqual(['eastern-jin']);
    expect(detailsById.get('former-yan-founded')?.relatedEventIds).toEqual([
      'later-yan-founded',
      'northern-yan-founded',
    ]);
    expect(detailsById.get('southern-song-founded')?.relatedEventIds).toEqual([
      'northern-song-founded',
      'song-southward',
    ]);
    expect(detailsById.get('song-founded')?.polityIds).toEqual(['song_northern']);

    expect(report.coveredEventIds).toEqual(expect.arrayContaining([
      'song-founded',
    ]));
    expect(report.orphanDetailEventIds).toHaveLength(14);
    expect(report.orphanDetails.every((item) => item.kind === 'city-history-auxiliary')).toBe(true);
  });

  it('closes the fifty-third batch of source-backed early polity links without upgrading approximate dates', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const expectedLinks: Record<string, string[]> = {
      'xia-early-founded-eighth-batch': ['shang-founded-eighth-batch'],
      'shang-founded-eighth-batch': ['zhou-conquest'],
      'goguryeo-founded': ['silla-founded'],
      'silla-founded': ['goguryeo-founded'],
      'tibetan-founded': ['tang-founded'],
      'turkic-founded': ['tang-founded'],
    };

    for (const [eventId, relatedEventIds] of Object.entries(expectedLinks)) {
      const expectedPrecision = eventId === 'turkic-founded' ? 'year' : 'approximate';
      expect(eventsById.get(eventId)?.datePrecision, eventId).toBe(expectedPrecision);
      expect(detailsById.get(eventId)?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(detailsById.get(eventId)?.relatedEventIds, eventId).toEqual(relatedEventIds);
      expect(report.items.find((item) => item.eventId === eventId)?.sourceComplete, eventId).toBe(true);
      if (expectedPrecision === 'approximate') {
        expect(report.needsReviewEventIds, eventId).toContain(eventId);
      } else {
        expect(report.coveredEventIds, eventId).toContain(eventId);
      }
    }

    expect(report.statusCounts).toEqual({ covered: 79, 'needs-review': 26, unresolved: 0 });
  });

  it('closes the fifty-fourth batch of source-backed standalone world events without inventing links', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const batchIds = [
      'augustus-principate',
      'constantinople-1453',
      'columbus-caribbean',
      'peace-westphalia',
      'un-founded',
    ];

    for (const eventId of batchIds) {
      const item = report.items.find((candidate) => candidate.eventId === eventId);
      expect(item, eventId).toMatchObject({
        status: 'covered',
        sourceComplete: true,
        timePrecisionStatus: 'confirmed',
        polityIds: [],
        relatedEventIds: [],
      });
      expect(item?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(item?.locationIds.length, eventId).toBeGreaterThan(0);
      expect(item?.participantIds.length, eventId).toBeGreaterThan(0);
    }

    expect(report.coveredEventIds).toEqual(expect.arrayContaining(batchIds));
    expect(report.statusCounts).toEqual({ covered: 79, 'needs-review': 26, unresolved: 0 });
  });

  it('enriches the fifty-fifth batch without upgrading approximate or range precision', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const selectedIds = [
      'an-lushan-rebellion',
      'eastern-jin',
      'southern-ming-founded',
      'western-liao-founded',
      'xiongnu-founded',
      'tuyuhun-founded',
    ];

    expect(report.statusCounts).toEqual({ covered: 79, 'needs-review': 26, unresolved: 0 });
    expect(eventsById.get('an-lushan-rebellion')?.datePrecision).toBe('range');
    expect(eventsById.get('eastern-jin')?.datePrecision).toBe('range');
    for (const eventId of selectedIds) {
      expect(eventsById.get(eventId)?.datePrecision, eventId).toBeOneOf(['range', 'approximate']);
      expect(detailsById.get(eventId)?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(detailsById.get(eventId)?.locationIds.length, eventId).toBeGreaterThan(0);
      expect(report.needsReviewEventIds, eventId).toContain(eventId);
    }

    expect(detailsById.get('an-lushan-rebellion')?.locationIds).toEqual([
      'youzhou', 'luoyang', 'changan',
    ]);
    expect(detailsById.get('eastern-jin')?.locationIds).toEqual(['luoyang', 'jiankang']);
    expect(detailsById.get('southern-ming-founded')?.locationIds).toEqual(['yingtian', 'yangzhou']);
    expect(detailsById.get('western-liao-founded')?.relatedEventIds).toEqual([
      'liao-founded', 'jurchen-jin-founded',
    ]);
    expect(detailsById.get('xiongnu-founded')?.relatedEventIds).toEqual(['han-imperial-accession']);
    expect(detailsById.get('tuyuhun-founded')?.relatedEventIds).toEqual(['western-jin-founded']);
  });
});
