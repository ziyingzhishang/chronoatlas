import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const targetIds = [
  'han-warring-founded-eighth-batch',
  'wei-warring-founded-eighth-batch',
  'zhao-warring-founded-eighth-batch',
  'eastern-jin',
] as const;

const expectedSources = {
  'han-warring-founded-eighth-batch': 'zizhi-tongjian-vol1-three-jin',
  'wei-warring-founded-eighth-batch': 'zizhi-tongjian-vol1-three-jin',
  'zhao-warring-founded-eighth-batch': 'zizhi-tongjian-vol1-three-jin',
  'eastern-jin': 'zizhi-tongjian-vol90-eastern-jin',
} as const;

describe('event details round ninety-first batch', () => {
  it('closes four source-backed polity-perspective events with exact primary nodes', () => {
    const report = buildEventDetailCoverageReport();
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const detailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));

    expect(report.statusCounts).toEqual({ covered: 123, 'needs-review': 39, unresolved: 0 });
    for (const eventId of targetIds) {
      const event = eventsById.get(eventId)!;
      const detail = detailsById.get(eventId)!;
      const sourceId = expectedSources[eventId];

      expect(report.coveredEventIds).toContain(eventId);
      expect(event.datePrecision, eventId).toBe('year');
      expect(event.verification, eventId).toBe('checked');
      expect(event.placeId, eventId).toBeTruthy();
      expect(event.sourceIds, eventId).toContain(sourceId);
      expect(detail.sourceIds, eventId).toContain(sourceId);
      expect(sourceById[sourceId], eventId).toBeDefined();
      expect(detail.participants.length, eventId).toBeGreaterThan(0);
      expect(detail.locationIds.length, eventId).toBeGreaterThan(0);
      expect(detail.polityIds.length, eventId).toBe(1);
      expect(detail.relatedEventIds.length, eventId).toBeGreaterThan(0);
      expect(detail.causes.length, eventId).toBeGreaterThan(0);
      expect(detail.consequences.length, eventId).toBeGreaterThan(0);
      expect(detail.phases?.length, eventId).toBeGreaterThanOrEqual(3);
      expect(detail.uncertaintyNote, eventId).toMatch(/后续|阶段|范围|控制|分期/);
      expect(report.items.find((item) => item.eventId === eventId)?.unresolvedReferenceIds, eventId).toEqual({
        people: [], places: [], polities: [], relatedEvents: [], sources: [],
      });
    }
  });

  it('keeps the Eastern Jin foundation node distinct from its 318 imperial accession phase', () => {
    const event = events.find((candidate) => candidate.id === 'eastern-jin')!;
    const detail = eventDetails.find((candidate) => candidate.eventId === 'eastern-jin')!;

    expect(event.year).toBe(317);
    expect(event.endYear).toBe(318);
    expect(detail.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '建康制度化', startYear: 317 }),
      expect.objectContaining({ startYear: 318 }),
    ]));
  });
});
