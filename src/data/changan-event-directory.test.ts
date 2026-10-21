import { describe, expect, it } from 'vitest';
import { changanEvents } from './changan-study';
import { eventDetails } from './event-details';

describe('Chang’an event directory expansion', () => {
  it('contains at least thirty sourced, located, verified events', () => {
    expect(changanEvents.length).toBeGreaterThanOrEqual(30);

    for (const event of changanEvents) {
      expect(Number.isFinite(event.year)).toBe(true);
      expect(event.placeId).toBeTruthy();
      expect(event.sourceIds.length).toBeGreaterThan(0);
      expect(event.summary).toBeTruthy();
      expect(event.verification).toMatch(/^(checked|partial)$/);
    }
  });

  it('keeps a detailed evidence trail for every newly catalogued event', () => {
    const detailByEventId = new Map(eventDetails.map((detail) => [detail.eventId, detail]));

    for (const event of changanEvents.slice(10)) {
      const detail = detailByEventId.get(event.id);
      expect(detail, `missing detail for ${event.id}`).toBeDefined();
      expect(detail?.causes.length).toBeGreaterThan(0);
      expect(detail?.phases?.length).toBeGreaterThan(0);
      expect(detail?.consequences.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote).toBeTruthy();
    }
  });
});
