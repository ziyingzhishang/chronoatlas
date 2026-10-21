import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { places } from './places';
import { sourceNotes } from './sources';

const targetLocations = {
  'han-imperial-accession': ['sishui-northbank'],
  'augustus-principate': ['rome'],
  'constantinople-1453': ['constantinople'],
  'columbus-caribbean': ['guanahani'],
  'peace-westphalia': ['munster', 'osnabruck'],
  'un-founded': ['san-francisco'],
} as const;

describe('event details thirty-third batch location closure', () => {
  it('closes the six requested event-location gaps', () => {
    const missingLocationIds = new Set(
      auditKnowledgeCoverage().tasks
        .filter((task) => task.taskKind === 'event-location-missing')
        .map((task) => task.entityId),
    );

    Object.keys(targetLocations).forEach((eventId) => {
      expect(missingLocationIds.has(eventId), eventId).toBe(false);
    });
  });

  it('keeps event places distinct from impact areas and preserves uncertainty', () => {
    const guanahani = places.find((place) => place.id === 'guanahani');
    const westphalia = eventDetails.find((detail) => detail.eventId === 'peace-westphalia');
    const accession = eventDetails.find((detail) => detail.eventId === 'han-imperial-accession');

    expect(guanahani?.mappingStatus).toBe('debated');
    expect(guanahani?.modernName).toContain('巴哈马');
    expect(westphalia?.locationIds).toEqual(['munster', 'osnabruck']);
    expect(westphalia?.uncertaintyNote).toContain('谈判地');
    expect(accession?.uncertaintyNote).toContain('定陶');
  });

  it('resolves every event, place, and source reference', () => {
    const eventIds = new Set(events.map((event) => event.id));
    const placeIds = new Set(places.map((place) => place.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    Object.entries(targetLocations).forEach(([eventId, expectedPlaceIds]) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(eventIds.has(eventId), eventId).toBe(true);
      expect(detail?.locationIds, eventId).toEqual(expectedPlaceIds);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      detail?.locationIds.forEach((placeId) => expect(placeIds.has(placeId), `${eventId} -> ${placeId}`).toBe(true));
      detail?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${eventId} -> ${sourceId}`).toBe(true));
    });
  });
});
