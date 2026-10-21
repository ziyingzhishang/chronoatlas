import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { places } from './places';
import { sourceNotes } from './sources';

const resolvedLocation = {
  'song-founded': ['kaifeng'],
} as const;

describe('twenty-fourth-batch event location closure', () => {
  it('closes the Northern Song location gap using the existing Kaifeng place', () => {
    const report = auditKnowledgeCoverage();
    const missingLocationIds = new Set(
      report.tasks
        .filter((task) => task.taskKind === 'event-location-missing')
        .map((task) => task.entityId),
    );

    expect(missingLocationIds.has('song-founded')).toBe(false);
    expect(eventDetails.find((detail) => detail.eventId === 'song-founded')?.locationIds)
      .toEqual(resolvedLocation['song-founded']);
  });

  it('resolves every event, source, and selected place reference', () => {
    const eventIds = new Set(events.map((event) => event.id));
    const placeIds = new Set(places.map((place) => place.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const targetEventIds = Object.keys(resolvedLocation);

    targetEventIds.forEach((eventId) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(eventIds.has(eventId), eventId).toBe(true);
      expect(detail, eventId).toBeDefined();
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      detail?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${eventId} -> ${sourceId}`).toBe(true));
      detail?.locationIds.forEach((placeId) => expect(placeIds.has(placeId), `${eventId} -> ${placeId}`).toBe(true));
    });
  });
});
