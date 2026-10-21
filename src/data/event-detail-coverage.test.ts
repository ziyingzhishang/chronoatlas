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
    expect(report.orphanDetailEventIds).toContain('court-moves-luoyang');
    expect(report.orphanDetailEventIds.length).toBeGreaterThan(0);
    expect(report.items.every((item) => item.eventId.length > 0)).toBe(true);
  });

  it('classifies every orphan detail as a city-history auxiliary record', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });

    expect(report.orphanDetails).toHaveLength(report.orphanDetailEventIds.length);
    expect(report.orphanDetails).toHaveLength(20);
    expect(report.orphanDetails.every((item) => item.kind === 'city-history-auxiliary')).toBe(true);
    expect(report.orphanDetails.find((item) => item.eventId === 'daxing-capital')?.rationale)
      .toContain('城市');
  });

  it('closes the first high-value exact-year event detail batch without unresolved records', () => {
    const report = buildEventDetailCoverageReport({ catalog: baseCatalog });

    expect(report.unresolvedEventIds).toEqual([]);
    expect(report.statusCounts).toEqual({ covered: 42, 'needs-review': 57, unresolved: 0 });
    expect(report.coveredEventIds).toEqual(expect.arrayContaining([
      'northern-wei-founded',
      'former-qin-founded',
      'later-liang-founded',
      'jurchen-jin-founded',
      'southern-tang-founded',
    ]));
  });
});
