import { describe, expect, it } from 'vitest';
import { events } from './events';
import { eventDetails } from './event-details';
import { heritageDetails } from './heritage-details';
import { buildHeritageDetailCoverageReport } from './heritage-detail-coverage';
import { sourceNotes } from './sources';

const reviewHeritageIds = [
  'big-wild-goose-pagoda',
  'qinglong-temple-site',
  'xian-beilin',
  'xiao-yan-ta',
  'ximing-temple-site',
] as const;

describe('round one hundred four Xuanzang heritage event boundary audit', () => {
  it('keeps the missing endpoint explicit when the current catalog cannot define one shared event', () => {
    const report = buildHeritageDetailCoverageReport();
    const eventIds = new Set(events.map((event) => event.id));
    const eventDetailIds = new Set(eventDetails.map((detail) => detail.eventId));

    expect(eventIds.has('xuanzang-translations')).toBe(false);
    expect(eventDetailIds.has('xuanzang-translations')).toBe(false);
    expect(report.needsReviewHeritageIds).toEqual([...reviewHeritageIds]);

    for (const heritageId of reviewHeritageIds) {
      const detail = heritageDetails.find((item) => item.heritageId === heritageId);
      expect(detail, heritageId).toBeDefined();
      expect(detail?.associatedEvents, heritageId).toEqual(['tang-founded', 'xuanzang-translations']);
      expect(detail?.uncertaintyNote, heritageId).toContain('统一译经事件端点');
      expect(detail?.uncertaintyNote, heritageId).toContain('不把建筑年代拼接为译经事件');
    }
  });

  it('verifies that existing evidence is insufficient for a shared translation event', () => {
    const relevantSourceIds = new Set(
      heritageDetails
        .filter((detail) => reviewHeritageIds.includes(detail.heritageId as (typeof reviewHeritageIds)[number]))
        .flatMap((detail) => detail.sourceIds),
    );
    const relevantSources = sourceNotes.filter((source) => relevantSourceIds.has(source.id));

    expect(relevantSources.length).toBeGreaterThan(0);
    expect(relevantSources.some((source) => /统一起止|五个遗产|阶段链/.test(`${source.scope}${source.note}`))).toBe(false);
    const existingAssociatedEventIds = new Set(
      heritageDetails
        .filter((detail) => reviewHeritageIds.includes(detail.heritageId as (typeof reviewHeritageIds)[number]))
        .flatMap((detail) => detail.associatedEvents),
    );
    expect([...existingAssociatedEventIds]).toEqual(['tang-founded', 'xuanzang-translations']);
    expect(events.filter((event) => existingAssociatedEventIds.has(event.id))).toHaveLength(1);
    expect(events.find((event) => event.id === 'tang-founded')?.id).toBe('tang-founded');
  });
});
