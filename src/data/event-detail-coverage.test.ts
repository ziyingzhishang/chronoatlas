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
  it('enriches the sixty-third batch without upgrading uncertain time precision', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const batchIds = [
      'an-lushan-rebellion',
      'chu-han-contention',
      'cheng-han-founded',
      'former-liang-founded',
      'xiongnu-founded',
    ];

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
    for (const eventId of batchIds) {
      const event = eventsById.get(eventId)!;
      const detail = detailsById.get(eventId)!;
      expect(report.needsReviewEventIds).toContain(eventId);
      expect(detail.phases?.length ?? 0).toBeGreaterThanOrEqual(4);
      expect(detail.participants.length).toBeGreaterThan(0);
      expect(detail.locationIds.length).toBeGreaterThan(0);
      expect(detail.polityIds.length).toBeGreaterThan(0);
      expect(detail.relatedEventIds.length).toBeGreaterThan(0);
      expect(detail.sourceIds.length).toBeGreaterThan(0);
      expect(report.items.find((item) => item.eventId === eventId)?.sourceComplete).toBe(true);
      expect(report.items.find((item) => item.eventId === eventId)?.unresolvedReferenceIds).toEqual({
        people: [], places: [], polities: [], relatedEvents: [], sources: [],
      });
      expect(event.datePrecision).toBe(['an-lushan-rebellion', 'chu-han-contention', 'eastern-jin'].includes(eventId) ? 'range' : 'approximate');
    }

    expect(detailsById.get('an-lushan-rebellion')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '灵武即位与反攻组织', startYear: 756 }),
    ]));
    expect(detailsById.get('chu-han-contention')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '鸿门宴与分封秩序', startYear: -206 }),
    ]));
    expect(detailsById.get('eastern-jin')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '建康制度化', startYear: 317 }),
    ]));
    expect(detailsById.get('cheng-han-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '成都称帝阶段', startYear: 306 }),
    ]));
    expect(detailsById.get('former-liang-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '河西交通承接', startYear: 320 }),
    ]));
    expect(detailsById.get('xiongnu-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '单于庭移动政治中心', startYear: -209 }),
    ]));
  });

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
    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
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

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
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

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
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
    expect(detailsById.get('cheng-han-founded')?.relatedEventIds).toEqual([
      'eastern-jin', 'former-zhao-founded',
    ]);
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
      'xia-early-founded-eighth-batch': ['shang-founded-eighth-batch', 'zhou-conquest'],
      'shang-founded-eighth-batch': ['zhou-conquest', 'western-zhou-founded-eighth-batch'],
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

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
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
    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
  });

  it('enriches the fifty-fifth batch without upgrading approximate or range precision', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const selectedIds = [
      'an-lushan-rebellion',
      'southern-ming-founded',
      'western-liao-founded',
      'xiongnu-founded',
      'tuyuhun-founded',
    ];

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
    expect(eventsById.get('an-lushan-rebellion')?.datePrecision).toBe('range');
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
    expect(detailsById.get('xiongnu-founded')?.relatedEventIds).toEqual(['han-imperial-accession', 'chu-han-contention']);
    expect(detailsById.get('tuyuhun-founded')?.relatedEventIds).toEqual(['western-jin-founded']);
  });

  it('enriches the fifty-sixth high-evidence batch without changing date precision', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const selectedIds = [
      'an-lushan-rebellion',
      'chu-han-contention',
      'tibetan-founded',
      'western-liao-founded',
      'dali-founded',
    ];

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
    expect(eventsById.get('an-lushan-rebellion')?.datePrecision).toBe('range');
    expect(eventsById.get('chu-han-contention')?.datePrecision).toBe('range');
    expect(eventsById.get('tibetan-founded')?.datePrecision).toBe('approximate');
    expect(eventsById.get('western-liao-founded')?.datePrecision).toBe('approximate');
    expect(eventsById.get('dali-founded')?.datePrecision).toBe('approximate');

    for (const eventId of selectedIds) {
      expect(detailsById.get(eventId)?.causes.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detailsById.get(eventId)?.consequences.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detailsById.get(eventId)?.phases?.length ?? 0, eventId).toBeGreaterThanOrEqual(3);
      expect(detailsById.get(eventId)?.locationIds.length, eventId).toBeGreaterThan(0);
      expect(detailsById.get(eventId)?.polityIds.length, eventId).toBeGreaterThan(0);
      expect(detailsById.get(eventId)?.relatedEventIds.length, eventId).toBeGreaterThan(0);
      expect(detailsById.get(eventId)?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(report.needsReviewEventIds, eventId).toContain(eventId);
    }

    expect(detailsById.get('an-lushan-rebellion')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '战后藩镇延续', startYear: 763 }),
    ]));
    expect(detailsById.get('chu-han-contention')?.locationIds).toEqual(expect.arrayContaining([
      'sishui-northbank',
    ]));
    expect(detailsById.get('eastern-jin')?.relatedEventIds).toEqual(expect.arrayContaining([
      'western-jin-founded',
    ]));
    expect(detailsById.get('tibetan-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '高原核心整合', startYear: 618 }),
    ]));
    expect(detailsById.get('western-liao-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '巴拉沙衮政治中心', startYear: 1132 }),
    ]));
    expect(detailsById.get('dali-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '洱海核心整合', startYear: 937 }),
    ]));
  });

  it('enriches the fifty-seventh batch with cross-node phases without upgrading date precision', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const selectedIds = [
      'cheng-han-founded',
      'former-liang-founded',
      'southern-ming-founded',
      'western-liao-founded',
      'dali-founded',
      'xiongnu-founded',
    ];

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
    for (const eventId of selectedIds) {
      const event = eventsById.get(eventId);
      const detail = detailsById.get(eventId);
      expect(event?.datePrecision, eventId).toBeOneOf(['approximate', 'range']);
      expect(detail?.causes.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.consequences.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.phases?.length ?? 0, eventId).toBeGreaterThanOrEqual(4);
      expect(detail?.participants.length, eventId).toBeGreaterThan(0);
      expect(detail?.locationIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.polityIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.relatedEventIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(report.needsReviewEventIds, eventId).toContain(eventId);
    }

    expect(detailsById.get('cheng-han-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '成都与巴蜀通道整合', startYear: 306 }),
    ]));
    expect(detailsById.get('former-liang-founded')?.relatedEventIds).toEqual(expect.arrayContaining([
      'western-jin-founded',
    ]));
    expect(detailsById.get('southern-ming-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '东南抗清阶段', startYear: 1645 }),
    ]));
    expect(detailsById.get('western-liao-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '称帝与建都阶段', startYear: 1132 }),
    ]));
    expect(detailsById.get('dali-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '羊苴咩城政治中心', startYear: 937 }),
    ]));
    expect(detailsById.get('xiongnu-founded')?.relatedEventIds).toEqual(expect.arrayContaining([
      'chu-han-contention',
    ]));
  });

  it('enriches the fifty-eighth batch of Warring States nodes without rewriting the traditional date', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const selectedIds = [
      'chu-warring-founded-eighth-batch',
      'yan-warring-founded-eighth-batch',
      'qi-warring-founded-eighth-batch',
    ];

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
    for (const eventId of selectedIds) {
      const event = eventsById.get(eventId);
      const detail = detailsById.get(eventId);
      expect(event?.datePrecision, eventId).toBe('approximate');
      expect(event?.verification, eventId).toBe('partial');
      expect(detail?.participants.length, eventId).toBeGreaterThan(0);
      expect(detail?.polityIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.locationIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.causes.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.consequences.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.phases?.length ?? 0, eventId).toBeGreaterThanOrEqual(4);
      expect(detail?.sourceIds, eventId).toEqual(expect.arrayContaining(['zizhi-tongjian', 'china-chronology']));
      expect(detail?.relatedEventIds, eventId).toContain('partition-jin');
      expect(report.needsReviewEventIds, eventId).toContain(eventId);
    }

    expect(detailsById.get('han-warring-founded-eighth-batch')?.relatedEventIds).toEqual([
      'partition-jin', 'zhao-warring-founded-eighth-batch', 'wei-warring-founded-eighth-batch',
    ]);
    expect(detailsById.get('zhao-warring-founded-eighth-batch')?.relatedEventIds).toEqual([
      'partition-jin', 'han-warring-founded-eighth-batch', 'wei-warring-founded-eighth-batch',
    ]);
    expect(detailsById.get('wei-warring-founded-eighth-batch')?.relatedEventIds).toEqual([
      'partition-jin', 'han-warring-founded-eighth-batch', 'zhao-warring-founded-eighth-batch',
    ]);
    expect(detailsById.get('chu-warring-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '诸侯格局重组', startYear: -403 }),
    ]));
    expect(detailsById.get('yan-warring-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '诸侯格局重组', startYear: -403 }),
    ]));
    expect(detailsById.get('qi-warring-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '诸侯格局重组', startYear: -403 }),
    ]));
  });

  it('enriches the fifty-ninth batch of early-dynasty anchor nodes without upgrading date precision', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const selectedIds = [
      'xia-early-founded-eighth-batch',
      'shang-founded-eighth-batch',
      'zhou-conquest',
      'western-zhou-founded-eighth-batch',
      'eastern-zhou-founded-eighth-batch',
      'qin-state-founded-eighth-batch',
    ];

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
    for (const eventId of selectedIds) {
      const event = eventsById.get(eventId);
      const detail = detailsById.get(eventId);
      expect(event?.datePrecision, eventId).toBe('approximate');
      expect(detail?.participants.length, eventId).toBeGreaterThan(0);
      expect(detail?.polityIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.phases?.length ?? 0, eventId).toBeGreaterThanOrEqual(4);
      expect(detail?.locationIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.relatedEventIds.length, eventId).toBeGreaterThan(1);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(report.needsReviewEventIds, eventId).toContain(eventId);
    }

    expect(detailsById.get('xia-early-founded-eighth-batch')?.relatedEventIds).toEqual([
      'shang-founded-eighth-batch', 'zhou-conquest',
    ]);
    expect(detailsById.get('shang-founded-eighth-batch')?.relatedEventIds).toEqual([
      'zhou-conquest', 'western-zhou-founded-eighth-batch',
    ]);
    expect(detailsById.get('western-zhou-founded-eighth-batch')?.relatedEventIds).toEqual([
      'zhou-conquest', 'eastern-zhou-founded-eighth-batch',
    ]);
    expect(detailsById.get('eastern-zhou-founded-eighth-batch')?.relatedEventIds).toEqual([
      'zhou-eastward', 'partition-jin', 'qin-unification',
    ]);
    expect(detailsById.get('qin-state-founded-eighth-batch')?.relatedEventIds).toEqual([
      'zhou-eastward', 'partition-jin', 'qin-unification',
    ]);
  });

  it('enriches the sixtieth batch of high-evidence regional formation nodes without upgrading date precision', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const selectedIds = [
      'western-liang-state-founded',
      'former-liang-founded',
      'cheng-han-founded',
      'goguryeo-founded',
      'silla-founded',
      'tibetan-founded',
    ];

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
    for (const eventId of selectedIds) {
      const event = eventsById.get(eventId);
      const detail = detailsById.get(eventId);
      expect(event?.datePrecision, eventId).toBe('approximate');
      expect(detail?.participants.length, eventId).toBeGreaterThan(0);
      expect(detail?.polityIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.locationIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.causes.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.consequences.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.phases?.length ?? 0, eventId).toBeGreaterThanOrEqual(4);
      expect(detail?.relatedEventIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(report.needsReviewEventIds, eventId).toContain(eventId);
    }

    expect(detailsById.get('western-liang-state-founded')?.locationIds).toEqual([
      'dunhuang', 'jiuquan', 'liangzhou',
    ]);
    expect(detailsById.get('western-liang-state-founded')?.relatedEventIds).toEqual([
      'former-liang-founded', 'later-liang-founded', 'northern-liang-founded',
    ]);
    expect(detailsById.get('former-liang-founded')?.relatedEventIds).toEqual(expect.arrayContaining([
      'western-liang-state-founded',
    ]));
    expect(detailsById.get('cheng-han-founded')?.relatedEventIds).toEqual(expect.arrayContaining([
      'former-zhao-founded',
    ]));
    expect(detailsById.get('goguryeo-founded')?.locationIds).toEqual([
      'wunvshan', 'guonei',
    ]);
    expect(detailsById.get('silla-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '金城王统承接', startYear: 4 }),
    ]));
    expect(detailsById.get('tibetan-founded')?.locationIds).toEqual([
      'yalong', 'luosie',
    ]);
  });

  it('enriches the sixty-first batch with source-backed narrative anchors without upgrading approximate dates', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const batchIds = [
      'western-liao-founded',
      'dali-founded',
      'southern-ming-founded',
      'xiongnu-founded',
    ];

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
    for (const eventId of batchIds) {
      const event = eventsById.get(eventId);
      const detail = detailsById.get(eventId);
      expect(event?.datePrecision, eventId).toBe('approximate');
      expect(event?.verification, eventId).toBe('partial');
      expect(detail?.causes.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.consequences.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.phases?.length ?? 0, eventId).toBeGreaterThanOrEqual(4);
      expect(detail?.participants.length, eventId).toBeGreaterThan(0);
      expect(detail?.locationIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.polityIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.relatedEventIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(report.needsReviewEventIds, eventId).toContain(eventId);
    }

    expect(detailsById.get('western-liao-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '七河流域政治中心制度化' }),
    ]));
    expect(detailsById.get('dali-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '段氏王权承接' }),
    ]));
    expect(detailsById.get('southern-ming-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '弘光南京阶段' }),
    ]));
    expect(detailsById.get('xiongnu-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '白登之后边疆秩序' }),
    ]));
    expect(detailsById.get('han-warring-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '新郑政治中心承接' }),
    ]));
    expect(detailsById.get('zhao-warring-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '邯郸政治中心承接' }),
    ]));
  });

  it('enriches the sixty-second batch with source-backed phase and network anchors without upgrading approximate dates', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const batchIds = [
      'zhou-conquest',
      'western-zhou-founded-eighth-batch',
      'eastern-zhou-founded-eighth-batch',
      'qin-state-founded-eighth-batch',
      'former-liang-founded',
      'tuyuhun-founded',
    ];

    for (const eventId of batchIds) {
      const event = eventsById.get(eventId);
      const detail = detailsById.get(eventId);
      expect(event?.datePrecision, eventId).toBe('approximate');
      expect(detail?.participants.length, eventId).toBeGreaterThan(0);
      expect(detail?.locationIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.polityIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.relatedEventIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.phases?.length ?? 0, eventId).toBeGreaterThanOrEqual(5);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(report.needsReviewEventIds, eventId).toContain(eventId);
    }

    expect(detailsById.get('zhou-conquest')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '丰镐王畿承接' }),
    ]));
    expect(detailsById.get('western-zhou-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '丰镐—洛邑秩序展开' }),
    ]));
    expect(detailsById.get('eastern-zhou-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '洛邑王畿承接' }),
    ]));
    expect(detailsById.get('qin-state-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '雍城阶段承接' }),
    ]));
    expect(detailsById.get('former-liang-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '姑臧—酒泉走廊治理' }),
    ]));
    expect(detailsById.get('tuyuhun-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '伏俟城后期参照' }),
    ]));
  });

  it('enriches the sixty-fourth batch with source-backed succession phases without upgrading approximate dates', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const batchIds = [
      'goguryeo-founded',
      'silla-founded',
      'tibetan-founded',
    ];

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
    for (const eventId of batchIds) {
      const event = eventsById.get(eventId);
      const detail = detailsById.get(eventId);
      expect(event?.datePrecision, eventId).toBe('approximate');
      expect(event?.verification, eventId).toBe('partial');
      expect(detail?.participants.length, eventId).toBeGreaterThan(0);
      expect(detail?.causes.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.consequences.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.phases?.length ?? 0, eventId).toBeGreaterThanOrEqual(5);
      expect(detail?.locationIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.polityIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.relatedEventIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(report.needsReviewEventIds, eventId).toContain(eventId);
      expect(report.items.find((item) => item.eventId === eventId)?.sourceComplete, eventId).toBe(true);
      expect(report.items.find((item) => item.eventId === eventId)?.unresolvedReferenceIds, eventId).toEqual({
        people: [], places: [], polities: [], relatedEvents: [], sources: [],
      });
    }

    expect(detailsById.get('goguryeo-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '朱蒙后王统承接', startYear: -19, endYear: 18 }),
    ]));
    expect(detailsById.get('silla-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '南解王统承接', startYear: -4, endYear: 24 }),
    ]));
    expect(detailsById.get('tibetan-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '唐蕃关系展开', startYear: 641, endYear: 650 }),
    ]));
    expect(detailsById.get('han-warring-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '韩景侯承接', startYear: -408, endYear: -400 }),
    ]));
    expect(detailsById.get('wei-warring-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '魏文侯早期经营', startYear: -445, endYear: -396 }),
    ]));
    expect(detailsById.get('zhao-warring-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '赵烈侯承接', startYear: -408, endYear: -400 }),
    ]));
  });

  it('enriches the sixty-fifth batch with source-backed political and archaeological phases without upgrading approximate dates', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const batchIds = [
      'chu-warring-founded-eighth-batch',
      'qi-warring-founded-eighth-batch',
      'yan-warring-founded-eighth-batch',
      'western-liang-state-founded',
      'xia-early-founded-eighth-batch',
      'shang-founded-eighth-batch',
    ];

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
    for (const eventId of batchIds) {
      const event = eventsById.get(eventId);
      const detail = detailsById.get(eventId);
      expect(event?.datePrecision, eventId).toBe('approximate');
      expect(event?.verification, eventId).toBe('partial');
      expect(detail?.causes.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.consequences.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.phases?.length ?? 0, eventId).toBeGreaterThanOrEqual(5);
      expect(detail?.participants.length, eventId).toBeGreaterThan(0);
      expect(detail?.locationIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.polityIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.relatedEventIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(report.needsReviewEventIds, eventId).toContain(eventId);
      expect(report.items.find((item) => item.eventId === eventId)?.sourceComplete, eventId).toBe(true);
      expect(report.items.find((item) => item.eventId === eventId)?.unresolvedReferenceIds, eventId).toEqual({
        people: [], places: [], polities: [], relatedEvents: [], sources: [],
      });
    }

    expect(detailsById.get('chu-warring-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '楚威王强国阶段', startYear: -350, endYear: -300 }),
    ]));
    expect(detailsById.get('qi-warring-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '齐威王整顿与强国阶段', startYear: -350, endYear: -300 }),
    ]));
    expect(detailsById.get('yan-warring-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '燕昭王重建阶段', startYear: -350, endYear: -300 }),
    ]));
    expect(detailsById.get('western-liang-state-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '敦煌—酒泉交通承接', startYear: 400, endYear: 420 }),
    ]));
    expect(detailsById.get('xia-early-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '二里头考古参照', startYear: -2070, endYear: -1600 }),
    ]));
    expect(detailsById.get('shang-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '二里头—早商文化参照', startYear: -1600, endYear: -1500 }),
    ]));
  });

  it('enriches the sixty-sixth batch with source-backed succession, institutional, and continuity anchors', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const batchIds = [
      'silla-founded',
      'zhou-conquest',
      'western-zhou-founded-eighth-batch',
      'qin-state-founded-eighth-batch',
      'former-liang-founded',
      'cheng-han-founded',
    ];

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
    for (const eventId of batchIds) {
      expect(eventsById.get(eventId)?.datePrecision, eventId).toBe('approximate');
      expect(eventsById.get(eventId)?.verification, eventId).toBe('partial');
      expect(report.needsReviewEventIds, eventId).toContain(eventId);
      expect(report.items.find((item) => item.eventId === eventId)?.sourceComplete, eventId).toBe(true);
      expect(report.items.find((item) => item.eventId === eventId)?.unresolvedReferenceIds, eventId).toEqual({
        people: [], places: [], polities: [], relatedEvents: [], sources: [],
      });
    }

    expect(detailsById.get('silla-founded')?.sourceIds).toContain('silla-periodization');
    expect(detailsById.get('silla-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '内物王时期王权与对外关系', startYear: 356, endYear: 377 }),
    ]));
    expect(detailsById.get('zhou-conquest')?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'zhou-gong-dan' }),
    ]));
    expect(detailsById.get('zhou-conquest')?.sourceIds).toEqual(expect.arrayContaining([
      'western-zhou-national-museum', 'western-zhou-epic',
    ]));
    expect(detailsById.get('western-zhou-founded-eighth-batch')?.sourceIds).toEqual(expect.arrayContaining([
      'western-zhou-national-museum', 'western-zhou-epic',
    ]));
    expect(detailsById.get('western-zhou-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '早期封邦建国的器物证据', startYear: -1046, endYear: -1000 }),
    ]));
    expect(detailsById.get('qin-state-founded-eighth-batch')?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'qin-xiaogong' }),
    ]));
    expect(detailsById.get('qin-state-founded-eighth-batch')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '商鞅变法与军政重整', startYear: -361, endYear: -338 }),
    ]));
    expect(detailsById.get('former-liang-founded')?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'zhang-mao' }),
    ]));
    expect(detailsById.get('former-liang-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '张茂承接阶段', startYear: 320, endYear: 324 }),
    ]));
    expect(detailsById.get('cheng-han-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '李雄统治延续', startYear: 310, endYear: 334 }),
    ]));
  });

  it('enriches the sixty-seventh batch with source-backed transition and continuity anchors', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const batchIds = [
      'an-lushan-rebellion',
      'chu-han-contention',
      'goguryeo-founded',
      'silla-founded',
      'western-zhou-founded-eighth-batch',
    ];

    expect(report.statusCounts).toEqual({ covered: 91, 'needs-review': 22, unresolved: 0 });
    for (const eventId of batchIds) {
      expect(eventsById.get(eventId)?.datePrecision, eventId).toMatch(/^(approximate|range)$/);
      expect(report.needsReviewEventIds, eventId).toContain(eventId);
      expect(report.items.find((item) => item.eventId === eventId)?.sourceComplete, eventId).toBe(true);
      expect(report.items.find((item) => item.eventId === eventId)?.unresolvedReferenceIds, eventId).toEqual({
        people: [], places: [], polities: [], relatedEvents: [], sources: [],
      });
      expect(detailsById.get(eventId)?.participants.length, eventId).toBeGreaterThan(0);
    }

    expect(detailsById.get('an-lushan-rebellion')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '两京收复与战局转折', startYear: 757, endYear: 758 }),
    ]));
    expect(detailsById.get('chu-han-contention')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '关中后方与汉军重整', startYear: -205, endYear: -204 }),
    ]));
    expect(detailsById.get('eastern-jin')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '江东军政承接', startYear: 317, endYear: 323 }),
    ]));
    expect(detailsById.get('goguryeo-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '国内城体系后的区域竞争', startYear: 100, endYear: 200 }),
    ]));
    expect(detailsById.get('silla-founded')?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '四世纪后期对外关系转折', startYear: 377, endYear: 382 }),
    ]));
    expect(detailsById.get('western-zhou-founded-eighth-batch')?.consequences).toContain(
      '铭文所见的册封与赏赐显示的是王室与封国关系，不等于周王室直接行政边界。',
    );
  });
});
